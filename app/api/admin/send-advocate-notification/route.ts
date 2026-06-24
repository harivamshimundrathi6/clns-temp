import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const developerEmail = process.env.DEVELOPER_EMAIL;
        if (session.user.email !== developerEmail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { email, name, action, reviewNote } = await req.json();

        if (!email || !action) {
            return NextResponse.json({ error: "Missing email or action" }, { status: 400 });
        }

        const isApproved = action === "APPROVE";

        // Call the unified email helper functions
        try {
            if (isApproved) {
                await sendApprovalEmail(name || "Advocate", email, reviewNote);
            } else {
                await sendRejectionEmail(name || "Applicant", email, reviewNote);
            }
        } catch (mailError) {
            console.warn("Failed to send notification email via email utility:", mailError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Send advocate notification error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
