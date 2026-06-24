import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        // Verify the caller is the developer/super-admin
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const developerEmail = process.env.DEVELOPER_EMAIL;
        if (session.user.email !== developerEmail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { requestId, action, reviewNote } = body;

        if (!requestId || !["APPROVE", "REJECT"].includes(action)) {
            return NextResponse.json({ error: "Invalid request. Provide requestId and action (APPROVE/REJECT)." }, { status: 400 });
        }

        // Get the verification request
        const verificationRequest = await db.verificationRequest.findUnique({
            where: { id: requestId }
        });

        if (!verificationRequest) {
            return NextResponse.json({ error: "Verification request not found" }, { status: 404 });
        }

        if (verificationRequest.status !== "PENDING") {
            return NextResponse.json({ error: "This request has already been processed" }, { status: 400 });
        }

        const newUserStatus = action === "APPROVE" ? "ACTIVE" : "REJECTED";
        const newRequestStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

        // Update the user status
        await db.user.update(verificationRequest.userId, {
            status: newUserStatus,
            updatedAt: new Date().toISOString()
        });

        // Update the verification request
        await db.verificationRequest.update(requestId, {
            status: newRequestStatus,
            reviewedBy: session.user.email,
            reviewNote: reviewNote || "",
            updatedAt: new Date().toISOString()
        });

        // Log the action
        await db.systemLog.create({
            action: action === "APPROVE" ? "ADVOCATE_APPROVED" : "ADVOCATE_REJECTED",
            description: `Advocate ${verificationRequest.advocateEmail} was ${action.toLowerCase()}d by ${session.user.email}${reviewNote ? ` — Note: ${reviewNote}` : ""}`,
            userId: verificationRequest.userId,
            createdAt: new Date().toISOString()
        });

        // Send notification email to the advocate
        try {
            const emailRes = await fetch(new URL("/api/admin/send-advocate-notification", req.url).toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: verificationRequest.advocateEmail,
                    name: verificationRequest.advocateName,
                    action: action,
                    reviewNote: reviewNote,
                }),
            });
            if (!emailRes.ok) {
                console.warn("Failed to send notification email, but approval was processed");
            }
        } catch (emailError) {
            console.warn("Email notification failed:", emailError);
            // Don't fail the approval just because email failed
        }

        return NextResponse.json({
            success: true,
            action: action,
            userId: verificationRequest.userId,
            message: `Advocate ${action.toLowerCase()}d successfully`
        });

    } catch (error) {
        console.error("Advocate approval error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// GET endpoint to fetch all verification requests for the admin panel
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const developerEmail = process.env.DEVELOPER_EMAIL;
        if (session.user.email !== developerEmail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const requests = await db.verificationRequest.findMany({
            include: { user: true },
        });

        // Sort in memory: pending first, then by creation date (newest first)
        requests.sort((a, b) => {
            if (a.status === "PENDING" && b.status !== "PENDING") return -1;
            if (a.status !== "PENDING" && b.status === "PENDING") return 1;
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

        return NextResponse.json({ requests });

    } catch (error) {
        console.error("Fetch verification requests error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
