import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";
import { auth as firebaseAuth, signInWithEmailAndPassword, checkActionCode, applyActionCode } from "@/lib/firebase";
import { cookies } from "next/headers";

class EmailNotVerifiedError extends CredentialsSignin {
    code = "EmailNotVerified";
}


async function getUser(email: string) {
    try {
        const user = await db.user.findUnique({ where: { email } });
        return user;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        throw new Error("Failed to fetch user.");
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email().optional(), password: z.string().min(6).optional(), oobCode: z.string().optional() })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password, oobCode } = parsedCredentials.data;
                    
                    // Handle passwordless login via Firebase Verification Link
                    if (oobCode) {
                        try {
                            // Validate the oobCode
                            const info = await checkActionCode(firebaseAuth, oobCode);
                            const userEmail = info.data.email;
                            if (!userEmail) return null;
                            
                            // Mark email as verified in Firebase
                            await applyActionCode(firebaseAuth, oobCode);
                            
                            // Retrieve user data
                            const user = await getUser(userEmail);
                            if (!user) return null;

                            if (user.status === "REJECTED" || user.status === "SUSPENDED") {
                                console.warn(`Blocked login attempt for ${userEmail} with status ${user.status}`);
                                return null;
                            }
                            
                            return {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                role: user.role,
                                status: user.status
                            };
                        } catch (error) {
                            console.error("Firebase verify oobCode error:", error);
                            return null;
                        }
                    }

                    if (!email || !password) return null;
                    
                    try {
                        // Authenticate with Firebase
                        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
                        const firebaseUser = userCredential.user;

                        if (!firebaseUser.emailVerified) {
                            throw new EmailNotVerifiedError();
                        }
                        
                        // Get user data from Firestore
                        const user = await getUser(email);
                        if (!user) return null;

                        if (user.status === "REJECTED" || user.status === "SUSPENDED") {
                            console.warn(`Blocked login attempt for ${email} with status ${user.status}`);
                            return null;
                        }

                        try {
                            await db.systemLog.create({
                                action: "USER_LOGIN",
                                description: `User verified login: ${email}`,
                                userId: user.id,
                                createdAt: new Date().toISOString()
                            });
                        } catch (e) {
                            console.error("Failed to log login", e);
                        }
                        
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            status: user.status
                        };
                    } catch (error: any) {
                        // FALLBACK: Check Prisma Database if Firebase fails (for users who set password later via dashboard)
                        const user = await getUser(email);
                        if (user && user.password) {
                            const bcrypt = require("bcryptjs");
                            const isMatch = await bcrypt.compare(password, user.password);
                            if (isMatch) {
                                if (user.status === "REJECTED" || user.status === "SUSPENDED") {
                                    return null;
                                }
                                return {
                                    id: user.id,
                                    email: user.email,
                                    name: user.name,
                                    role: user.role,
                                    status: user.status
                                };
                            }
                        }
                        
                        console.error("Firebase/Prisma auth error:", error);
                        console.log("Invalid credentials");
                        return null;
                    }
                }
                console.log("Invalid credentials");
                return null;
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }) {
            // Handle Google OAuth sign in
            if (account?.provider === "google" && user.email) {
                try {
                    // Check if user exists with this email
                    const existingUser = await db.user.findUnique({
                        where: { email: user.email }
                    });

                    if (existingUser) {
                        // Link Google account to existing user
                        if (existingUser.status === "REJECTED" || existingUser.status === "SUSPENDED") {
                            return false; // Block sign in
                        }
                        return true;
                    } else {
                        // Create new user from Google account
                        let selectedRole = "PROSPECT";
                        try {
                            const cookieStore = cookies();
                            const roleCookie = cookieStore.get("google_oauth_role");
                            if (roleCookie?.value) {
                                selectedRole = roleCookie.value;
                            }
                        } catch (e) {
                            console.error("Could not read cookie", e);
                        }

                        const initialStatus = selectedRole === "ADVOCATE" ? "PENDING_VERIFICATION" : "ACTIVE";

                        const newUser = await db.user.create({
                            email: user.email,
                            name: user.name || (profile as any)?.name || "User",
                            role: selectedRole,
                            status: initialStatus,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });

                        await db.systemLog.create({
                            action: "USER_REGISTERED",
                            description: `New user registered via Google: ${user.email}`,
                            userId: newUser.id,
                            createdAt: new Date().toISOString()
                        });
                    }
                } catch (error) {
                    console.error("Error in Google sign in:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.status = user.status;
                
                // If role is missing (e.g. Google OAuth login), fetch from database
                if (!token.role && user.email) {
                    try {
                        const dbUser = await db.user.findUnique({ where: { email: user.email } });
                        if (dbUser) {
                            token.id = dbUser.id;
                            token.role = dbUser.role;
                            token.status = dbUser.status;
                        }
                    } catch (e) {
                        console.error("Failed to fetch user in jwt callback", e);
                    }
                }
            } else if (token.role === "ADVOCATE" && token.status === "PENDING_VERIFICATION" && token.email) {
                // If they are pending advocate, fetch latest status from database on subsequent requests to handle approval changes
                try {
                    const dbUser = await db.user.findUnique({ where: { email: token.email } });
                    if (dbUser && dbUser.status) {
                        token.status = dbUser.status;
                    }
                } catch (e) {
                    console.error("Failed to update pending advocate status in jwt callback", e);
                }
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.status = token.status;
            }
            return session;
        },
    },
});
