import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");
    const action = searchParams.get("action");

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const errorPage = (title: string, message: string) => {
        return new NextResponse(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CLNS Advocate Verification</title>
                <style>
                    body {
                        background-color: #020817;
                        color: #ffffff;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        margin: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                    }
                    .container {
                        max-width: 480px;
                        width: 90%;
                        text-align: center;
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        padding: 40px;
                        border-radius: 24px;
                        backdrop-filter: blur(12px);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    }
                    .icon {
                        width: 80px;
                        height: 80px;
                        margin: 0 auto 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        background: rgba(239, 68, 68, 0.1);
                        border: 1px solid rgba(239, 68, 68, 0.2);
                        color: #ef4444;
                    }
                    h1 {
                        font-size: 24px;
                        font-weight: 700;
                        margin: 0 0 12px;
                        background: linear-gradient(to right, #f87171, #dc2626);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    p {
                        color: rgba(255, 255, 255, 0.6);
                        font-size: 15px;
                        line-height: 1.6;
                        margin: 0 0 30px;
                    }
                    .btn {
                        display: inline-block;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        color: #ffffff;
                        font-weight: 600;
                        text-decoration: none;
                        padding: 12px 28px;
                        border-radius: 12px;
                        transition: all 0.2s;
                    }
                    .btn:hover {
                        background: rgba(255, 255, 255, 0.1);
                        transform: translateY(-2px);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <h1>${title}</h1>
                    <p>${message}</p>
                    <a href="${appUrl}/login" class="btn">Go to Dashboard</a>
                </div>
            </body>
            </html>`,
            { headers: { "Content-Type": "text/html" } }
        );
    };

    if (!requestId || !action || !["APPROVE", "REJECT"].includes(action)) {
        return errorPage("Invalid Request", "Please specify a valid verification request and action.");
    }

    try {
        // Fetch the verification request
        const verificationRequest = await db.verificationRequest.findUnique({
            where: { id: requestId }
        });

        if (!verificationRequest) {
            return errorPage("Request Not Found", "The requested verification details could not be found.");
        }

        if (verificationRequest.status !== "PENDING") {
            return errorPage(
                "Already Processed",
                `This verification request has already been processed and is currently marked as: <strong>${verificationRequest.status}</strong>.`
            );
        }

        const newUserStatus = action === "APPROVE" ? "ACTIVE" : "REJECTED";
        const newRequestStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

        // Update user status
        await db.user.update(verificationRequest.userId, {
            status: newUserStatus,
            updatedAt: new Date().toISOString()
        });

        // Update verification request
        await db.verificationRequest.update(requestId, {
            status: newRequestStatus,
            reviewedBy: "Email Quick Link",
            reviewNote: `Processed via Quick ${action.toLowerCase()} email link.`,
            updatedAt: new Date().toISOString()
        });

        // Log the action
        await db.systemLog.create({
            action: action === "APPROVE" ? "ADVOCATE_APPROVED" : "ADVOCATE_REJECTED",
            description: `Advocate ${verificationRequest.advocateEmail} was ${action.toLowerCase()}d via email quick links`,
            userId: verificationRequest.userId,
            createdAt: new Date().toISOString()
        });

        // Send notification email to the advocate
        try {
            if (action === "APPROVE") {
                await sendApprovalEmail(verificationRequest.advocateName || "Advocate", verificationRequest.advocateEmail || "", "Approved via email quick verification.");
            } else {
                await sendRejectionEmail(verificationRequest.advocateName || "Applicant", verificationRequest.advocateEmail || "", "Credentials could not be verified.");
            }
        } catch (emailError) {
            console.warn("Could not dispatch confirmation email to advocate:", emailError);
        }

        // Return a beautiful success page
        return new NextResponse(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CLNS Advocate Verification Success</title>
                <style>
                    body {
                        background-color: #020817;
                        color: #ffffff;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        margin: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                    }
                    .container {
                        max-width: 480px;
                        width: 90%;
                        text-align: center;
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        padding: 40px;
                        border-radius: 24px;
                        backdrop-filter: blur(12px);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    }
                    .icon {
                        width: 80px;
                        height: 80px;
                        margin: 0 auto 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                    }
                    .icon.success {
                        background: rgba(16, 185, 129, 0.1);
                        border: 1px solid rgba(16, 185, 129, 0.2);
                        color: #10b981;
                    }
                    .icon.rejected {
                        background: rgba(239, 68, 68, 0.1);
                        border: 1px solid rgba(239, 68, 68, 0.2);
                        color: #ef4444;
                    }
                    h1 {
                        font-size: 24px;
                        font-weight: 700;
                        margin: 0 0 12px;
                    }
                    h1.success {
                        background: linear-gradient(to right, #34d399, #10b981);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    h1.rejected {
                        background: linear-gradient(to right, #f87171, #ef4444);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    p {
                        color: rgba(255, 255, 255, 0.6);
                        font-size: 15px;
                        line-height: 1.6;
                        margin: 0 0 30px;
                    }
                    .btn {
                        display: inline-block;
                        background: linear-gradient(to right, #2563eb, #4f46e5);
                        color: #ffffff;
                        font-weight: 600;
                        text-decoration: none;
                        padding: 12px 28px;
                        border-radius: 12px;
                        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
                        transition: all 0.2s;
                    }
                    .btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon ${action === "APPROVE" ? "success" : "rejected"}">
                        ${action === "APPROVE"
                            ? `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`
                            : `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
                        }
                    </div>
                    <h1 class="${action === "APPROVE" ? "success" : "rejected"}">
                        Advocate ${action === "APPROVE" ? "Approved" : "Declined"}
                    </h1>
                    <p>
                        Advocate <strong>${verificationRequest.advocateName}</strong> (Bar ID: <code>${verificationRequest.barId}</code>) 
                        has been successfully <strong>${action === "APPROVE" ? "Approved & Activated" : "Declined"}</strong>.
                        An email notification has been dispatched to them.
                    </p>
                    <a href="${appUrl}/login" class="btn">Go to Dashboard</a>
                </div>
            </body>
            </html>`,
            { headers: { "Content-Type": "text/html" } }
        );

    } catch (error) {
        console.error("Email approval link error:", error);
        return errorPage("Server Error", "An unexpected error occurred while processing verification.");
    }
}
