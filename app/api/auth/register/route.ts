import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, createUserWithEmailAndPassword, sendEmailVerification } from "@/lib/firebase";
import { z } from "zod";
import { sendVerificationRequestEmail } from "@/lib/email";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
    role: z.enum(["ADMIN", "ADVOCATE", "CLIENT", "STUDENT", "PROSPECT"]).default("PROSPECT"),
    barId: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const { email, password, name, role, barId } = result.data;

        // For advocates, barId is required
        if (role === "ADVOCATE" && (!barId || barId.trim().length === 0)) {
            return NextResponse.json({ error: "Bar Council ID is required for advocates" }, { status: 400 });
        }

        // We rely on Firebase Auth to check for existing users.
        // It will throw 'auth/email-already-in-use' if the email is taken.

        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Determine initial status based on role
        // Advocates need admin verification before they can access the dashboard
        const initialStatus = role === "ADVOCATE" ? "PENDING_VERIFICATION" : "PENDING";

        // Store additional user data in Firestore
        const userData: any = {
            email,
            name,
            role: role as any,
            status: initialStatus,
            firebaseUid: firebaseUser.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Store barId for advocates
        if (role === "ADVOCATE" && barId) {
            userData.barId = barId.trim();
        }

        const user = await db.user.create(userData);

        try {
            await db.systemLog.create({
                action: "USER_REGISTERED",
                description: `New user registered: ${email} (${role})${role === "ADVOCATE" ? ` | Bar ID: ${barId}` : ""}`,
                userId: user.id,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Failed to write system log:", e);
        }

        // For advocates, create a verification request for admin review
        if (role === "ADVOCATE") {
            try {
                await db.verificationRequest.create({
                    userId: user.id,
                    status: "PENDING",
                    barId: barId?.trim() || "",
                    advocateName: name,
                    advocateEmail: email,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

                await db.systemLog.create({
                    action: "VERIFICATION_REQUEST_CREATED",
                    description: `Advocate verification request created for: ${email} (Bar ID: ${barId})`,
                    userId: user.id,
                    createdAt: new Date().toISOString()
                });

                // Send email notification to admin get.clns@gmail.com
                try {
                    await sendVerificationRequestEmail(name, email, barId || "");
                } catch (emailError) {
                    console.error("Failed to send verification request notification email:", emailError);
                }
            } catch (e) {
                console.error("Failed to create verification request:", e);
            }
        }

        // Send email verification without custom redirect URL (removes "Continue" option)
        await sendEmailVerification(firebaseUser);

        // Firebase Client SDK automatically logs the user in on creation. 
        // We will sign them out immediately so they have to verify their email and log in manually.
        await auth.signOut();

        return NextResponse.json({
            email: firebaseUser.email,
            name: name,
            role: role,
            status: initialStatus
        }, { status: 201 });
    } catch (error: any) {
        console.error("Registration error:", error);
        
        // Handle Firebase Auth specific errors
        if (error.code === 'auth/email-already-in-use') {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }
        if (error.code === 'auth/weak-password') {
            return NextResponse.json({ error: "Password is too weak" }, { status: 400 });
        }
        if (error.code === 'auth/invalid-email') {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }
        
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
