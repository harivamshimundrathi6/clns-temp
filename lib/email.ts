import nodemailer from "nodemailer";
import { db as firestoreDb } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

// Setup transporter if credentials are provided in .env
const getTransporter = () => {
    const user = process.env.SMTP_USER || "get.clns@gmail.com";
    const pass = process.env.SMTP_PASS;

    if (!pass) {
        console.warn("SMTP_PASS is not defined in environment variables. Email sending via nodemailer is disabled. Falling back to Firestore 'mail' collection.");
        return null;
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user,
            pass
        }
    });
};

export async function sendEmail({
    to,
    subject,
    html,
    text
}: {
    to: string;
    subject: string;
    html: string;
    text?: string;
}) {
    const transporter = getTransporter();

    if (transporter) {
        try {
            console.log(`Sending email via nodemailer to: ${to}...`);
            await transporter.sendMail({
                from: process.env.SMTP_USER || "get.clns@gmail.com",
                to,
                subject,
                text,
                html
            });
            console.log(`Email successfully sent to: ${to}`);
            return { success: true, method: "nodemailer" };
        } catch (error) {
            console.error("Nodemailer failed to send email:", error);
            // Fall back to Firestore if nodemailer fails
        }
    }

    // Fallback: Write to Firestore 'mail' collection (compatible with "Trigger Email from Firestore" extension)
    try {
        console.log(`Writing mail document to Firestore for: ${to}...`);
        await addDoc(collection(firestoreDb, "mail"), {
            to,
            message: {
                subject,
                html,
                text
            },
            createdAt: new Date().toISOString()
        });
        console.log(`Successfully written mail document to Firestore for: ${to}`);
        return { success: true, method: "firestore_fallback" };
    } catch (error) {
        console.error("Firestore fallback failed to save mail document:", error);
        return { success: false, error };
    }
}

/**
 * Notify the admin (get.clns@gmail.com) that a new advocate has registered and needs verification.
 */
export async function sendVerificationRequestEmail(advocateName: string, advocateEmail: string, barId: string, requestId: string) {
    const adminEmail = "get.clns@gmail.com";
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const subject = `🔔 New Advocate Verification Request: ${advocateName}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fafafa;">
            <h2 style="color: #2563eb; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">New Advocate Signup</h2>
            <p>A new advocate has registered on the CLNS platform and requires verification.</p>
            
            <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold; color: #475569; width: 140px;">Name:</td>
                        <td style="padding: 6px 0; color: #0f172a;">${advocateName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold; color: #475569;">Email:</td>
                        <td style="padding: 6px 0; color: #0f172a;"><a href="mailto:${advocateEmail}">${advocateEmail}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold; color: #475569;">Bar Council ID:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-size: 14px;">${barId}</td>
                    </tr>
                </table>
            </div>

            <p style="font-weight: bold; color: #0f172a; margin-top: 25px; text-align: center;">Verify directly from this email:</p>
            
            <div style="margin: 20px 0; text-align: center;">
                <a href="${appUrl}/api/admin/advocate-approval/email?requestId=${requestId}&action=APPROVE" 
                   style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 15px; border: 1px solid #059669; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1);">
                    ✅ Approve
                </a>
                <a href="${appUrl}/api/admin/advocate-approval/email?requestId=${requestId}&action=REJECT" 
                   style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; border: 1px solid #dc2626; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.1);">
                    ❌ Decline
                </a>
            </div>

            <p style="text-align: center; margin-top: 20px;">
                <a href="${appUrl}/login" style="color: #2563eb; text-decoration: underline; font-size: 14px;">
                    Open Developer Dashboard
                </a>
            </p>
            
            <p style="color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 25px;">
                This is an automated system notification from the CLNS Platform.
            </p>
        </div>
    `;

    return sendEmail({
        to: adminEmail,
        subject,
        html,
        text: `New Advocate Signup:\nName: ${advocateName}\nEmail: ${advocateEmail}\nBar Council ID: ${barId}\n\nApprove: ${appUrl}/api/admin/advocate-approval/email?requestId=${requestId}&action=APPROVE\nDecline: ${appUrl}/api/admin/advocate-approval/email?requestId=${requestId}&action=REJECT`
    });
}

/**
 * Send approval email to the advocate.
 */
export async function sendApprovalEmail(advocateName: string, advocateEmail: string, reviewNote?: string) {
    const subject = "✅ Your CLNS Advocate Account Has Been Approved!";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fafafa;">
            <h2 style="color: #10b981; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Welcome to CLNS, ${advocateName}! 🎉</h2>
            <p>Great news! Your advocate account has been <strong>approved</strong> by our admin team.</p>
            <p>You can now log in to your dashboard and start connecting with clients, managing cases, and publishing internship postings.</p>
            
            ${reviewNote ? `
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 20px 0; color: #166534;">
                <strong>Admin Note:</strong> ${reviewNote}
            </div>` : ""}

            <div style="margin: 30px 0; text-align: center;">
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login" 
                   style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Log In to Dashboard →
                </a>
            </div>

            <p style="color: #64748b; font-size: 13px;">Thank you for joining the CLNS Legal Network.</p>
            <p style="color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 25px;">
                If you have any questions, feel free to contact us at <a href="mailto:get.clns@gmail.com">get.clns@gmail.com</a>.
            </p>
        </div>
    `;

    return sendEmail({
        to: advocateEmail,
        subject,
        html,
        text: `Welcome to CLNS, ${advocateName}! Your advocate account has been approved. Please log in at ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login.`
    });
}

/**
 * Send rejection email to the advocate.
 */
export async function sendRejectionEmail(advocateName: string, advocateEmail: string, reviewNote?: string) {
    const subject = "❌ CLNS Advocate Application Update";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fafafa;">
            <h2 style="color: #ef4444; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Advocate Application Status</h2>
            <p>Dear ${advocateName},</p>
            <p>Thank you for your interest in joining the CLNS Legal Network.</p>
            <p>Unfortunately, we were unable to verify your advocate credentials at this time.</p>
            
            ${reviewNote ? `
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fee2e2; margin: 20px 0; color: #991b1b;">
                <strong>Reason:</strong> ${reviewNote}
            </div>` : ""}

            <p>If you believe this decision was made in error or want to provide additional supporting documents (like a copy of your Bar Association Card), please reply directly to this email or write to us at <a href="mailto:get.clns@gmail.com">get.clns@gmail.com</a>.</p>
            
            <p style="color: #64748b; font-size: 13px; margin-top: 30px;">— The CLNS Team</p>
        </div>
    `;

    return sendEmail({
        to: advocateEmail,
        subject,
        html,
        text: `Dear ${advocateName}, unfortunately, we were unable to verify your advocate credentials at this time. ${reviewNote ? `Reason: ${reviewNote}` : ""} Please contact support at get.clns@gmail.com if you have any questions.`
    });
}
