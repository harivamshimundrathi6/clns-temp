import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, createUserWithEmailAndPassword, sendEmailVerification } from "@/lib/firebase";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
    role: z.enum(["ADMIN", "ADVOCATE", "CLIENT", "STUDENT", "PROSPECT"]).default("PROSPECT"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const { email, password, name, role } = result.data;

        // We rely on Firebase Auth to check for existing users.
        // It will throw 'auth/email-already-in-use' if the email is taken.

        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Store additional user data in Firestore
        const userData = {
            email,
            name,
            role: role as any,
            status: "PENDING",
            firebaseUid: firebaseUser.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const user = await db.user.create(userData);

        try {
            await db.systemLog.create({
                action: "USER_REGISTERED",
                description: `New user registered: ${email} (${role})`,
                userId: user.id,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Failed to write system log:", e);
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
            status: "PENDING"
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
