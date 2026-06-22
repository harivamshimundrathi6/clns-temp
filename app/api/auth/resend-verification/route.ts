import { NextResponse } from "next/server";
import { auth, signInWithEmailAndPassword, sendEmailVerification } from "@/lib/firebase";
import { z } from "zod";

const resendSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = resendSchema.parse(body);

        // Sign in to Firebase to get the user object
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        if (firebaseUser.emailVerified) {
            return NextResponse.json({ message: "Email is already verified" }, { status: 400 });
        }

        // Send the verification email
        const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        const actionCodeSettings = {
            url: `${baseUrl}/verify-callback`,
            handleCodeInApp: true,
        };
        await sendEmailVerification(firebaseUser, actionCodeSettings);

        // Sign out again
        await auth.signOut();

        return NextResponse.json({ message: "Verification email resent successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Resend error:", error);
        return NextResponse.json({ error: "Invalid credentials or too many requests" }, { status: 400 });
    }
}
