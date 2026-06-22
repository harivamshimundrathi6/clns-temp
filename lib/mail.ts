import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL || "get.clns@gmail.com",
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function sendConsultationEmail(
    clientEmail: string,
    clientName: string,
    advocateName: string,
    caseDetails: { title: string; description: string; type: string }
) {
    if (!process.env.SMTP_PASSWORD) {
        console.warn("SMTP_PASSWORD is not set in environment variables. Emails won't be sent.");
        return;
    }

    const adminEmail = "get.clns@gmail.com";

    const subject = `New Consultation Booking: ${caseDetails.title}`;
    const adminTextBody = `Hello Admin,

A new consultation has been booked on the platform.

Client Name: ${clientName}
Client Email: ${clientEmail}
Advocate Requested: ${advocateName}

Case Details:
Type: ${caseDetails.type}
Title: ${caseDetails.title}
Description: ${caseDetails.description}

Best,
CLNS Automated System
`;

    const clientTextBody = `Dear ${clientName},

Your consultation request with ${advocateName} has been successfully received. We will get back to you shortly.

Here are your booking details:
Type: ${caseDetails.type}
Title: ${caseDetails.title}
Description: ${caseDetails.description}

Thank you,
The CLNS Team
`;

    try {
        // Send to Admin
        await transporter.sendMail({
            from: process.env.SMTP_EMAIL || "get.clns@gmail.com",
            to: adminEmail,
            subject: "[Admin] " + subject,
            text: adminTextBody,
        });

        // Send to Client
        await transporter.sendMail({
            from: process.env.SMTP_EMAIL || "get.clns@gmail.com",
            to: clientEmail,
            subject: "Your CLNS Consultation Booking Details",
            text: clientTextBody,
        });

        console.log("Consultation emails sent successfully.");
    } catch (error) {
        console.error("Error sending consultation emails:", error);
    }
}

export async function sendCustomVerificationEmail(email: string, name: string, verificationLink: string) {
    if (!process.env.SMTP_PASSWORD) {
        console.warn("SMTP_PASSWORD is not set. Verification email won't be sent.");
        return;
    }

    const subject = "Verify your email address for CLNS";
    
    // Beautiful HTML template matching the dark theme
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Verify your email</title>
        <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020712; color: #ffffff; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #071022; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .logo { font-size: 24px; font-weight: bold; color: #ffffff; text-decoration: none; display: inline-block; margin-bottom: 30px; letter-spacing: -0.5px; }
            .logo-clns { color: #3b82f6; }
            h1 { font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 20px; color: #ffffff; }
            p { font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px; }
            .btn { display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; margin-bottom: 30px; }
            .btn:hover { background-color: #2563eb; }
            .footer { font-size: 13px; color: #52525b; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }
            .link-raw { color: #3b82f6; word-break: break-all; font-size: 13px; margin-top: 20px; display: block; }
        </style>
    </head>
    <body>
        <div class="container">
            <a href="https://clns.in" class="logo"><span class="logo-clns">CLNS</span> Network</a>
            <h1>Verify your email address</h1>
            <p>Hello ${name},</p>
            <p>Thank you for joining CLNS. Please click the button below to verify your email address and activate your account.</p>
            
            <a href="${verificationLink}" class="btn">Verify Email</a>
            
            <p>If you didn't create an account with CLNS, you can safely ignore this email.</p>
            
            <p class="link-raw">If the button doesn't work, copy and paste this link into your browser:<br>${verificationLink}</p>
            
            <div class="footer">
                &copy; ${new Date().getFullYear()} CLNS. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: process.env.SMTP_EMAIL || "get.clns@gmail.com",
            to: email,
            subject: subject,
            html: htmlBody,
        });
        console.log("Custom verification email sent successfully to", email);
    } catch (error) {
        console.error("Error sending custom verification email:", error);
        throw error;
    }
}

