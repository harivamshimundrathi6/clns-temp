import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendVerificationRequestEmail } from "@/lib/email";

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.role !== "ADVOCATE") {
            return NextResponse.json({ error: "Only advocates can request verification" }, { status: 403 });
        }

        if (user.status === "ACTIVE") {
            return NextResponse.json({ error: "Account is already active" }, { status: 400 });
        }

        // Get the Bar Council ID from the user document
        const barId = (user as any).barId || "";

        // Trigger the admin email notification
        await sendVerificationRequestEmail(user.name || "Advocate", user.email, barId);

        // Add a system log
        await db.systemLog.create({
            action: "VERIFICATION_REQUEST_RESENT",
            description: `Advocate verification request email resent for: ${user.email}`,
            userId: user.id,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ message: "Verification request email resent successfully" }, { status: 200 });
    } catch (error) {
        console.error("Resend verification request email error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
