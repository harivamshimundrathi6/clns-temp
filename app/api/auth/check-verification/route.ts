import { NextResponse } from "next/server";
import { auth, signInWithEmailAndPassword } from "@/lib/firebase";
import { z } from "zod";

const checkSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = checkSchema.parse(body);

        // Sign in to Firebase to get the user object and check verification status
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        const isVerified = firebaseUser.emailVerified;

        // Sign out again
        await auth.signOut();

        return NextResponse.json({ verified: isVerified }, { status: 200 });
    } catch (error: any) {
        console.error("Check verification error:", error);
        return NextResponse.json({ error: "Invalid credentials or something went wrong" }, { status: 400 });
    }
}
