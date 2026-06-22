import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    secret: process.env.AUTH_SECRET || "some-random-secret-key-12345",
    trustHost: true,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Redirect authenticated users to their specific dashboard if they visit login/home
                const role = (auth.user as any).role || "CLIENT";
                // Prevent redirect loop if already on correct dashboard
                if (!nextUrl.pathname.startsWith(`/dashboard/${role.toLowerCase()}`)) {
                    // This logic is handled better in middleware matcher or client-side, 
                    // but we can return Response.redirect here if needed.
                    // For now, we trust the middleware to handle role-based access.
                }
            }
            return true;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.status = user.status;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.status = token.status;
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
