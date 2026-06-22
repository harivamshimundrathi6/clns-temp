import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { VerifyEmailForm } from "./verify-email-form";

export const metadata: Metadata = {
    title: "Verify Email | CLNS",
    description: "Verify your email to continue",
};

export default function VerifyEmailPage({
    searchParams,
}: {
    searchParams: { email?: string };
}) {
    const email = searchParams.email || "your email address";

    return (
        <AuthLayout
            title="Check your email"
            subtitle="Email Verification Required"
        >
            <VerifyEmailForm email={email} />
        </AuthLayout>
    );
}
