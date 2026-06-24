import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { sendVerificationRequestEmail } from "@/lib/email";

const submitBarIdSchema = z.object({
    barId: z.string().min(1, "Bar Council ID is required"),
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const body = await req.json();
        const result = submitBarIdSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const { barId } = result.data;
        const email = session.user.email;

        // Verify the user exists and is an advocate
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.role !== "ADVOCATE") {
            return NextResponse.json({ error: "Only advocates can submit a Bar ID" }, { status: 403 });
        }

        // Update user with Bar ID
        await db.user.update(user.id, {
            barId: barId.trim(),
            updatedAt: new Date().toISOString()
        });

        // Create system log
        try {
            await db.systemLog.create({
                action: "BAR_ID_SUBMITTED",
                description: `Advocate submitted Bar ID during onboarding: ${email} (Bar ID: ${barId})`,
                userId: user.id,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Failed to write system log:", e);
        }

        // Check if there's an existing pending verification request
        const existingReqs = await db.verificationRequest.findMany({
            where: { userId: user.id }
        });
        const hasPending = existingReqs.some(r => r.status === "PENDING");

        if (!hasPending) {
            // Create a verification request
            try {
                const verificationRequest = await db.verificationRequest.create({
                    userId: user.id,
                    status: "PENDING",
                    barId: barId.trim(),
                    advocateName: user.name || "Advocate",
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
                    await sendVerificationRequestEmail(user.name || "Advocate", email, barId, verificationRequest.id);
                } catch (emailError) {
                    console.error("Failed to send verification request notification email:", emailError);
                }
            } catch (e) {
                console.error("Failed to create verification request:", e);
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Submit Bar ID error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
