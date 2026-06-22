import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
    title: "Login | CLNS",
    description: "Login to your CLNS account",
};

export default function LoginPage({ searchParams }: { searchParams: { verified?: string } }) {
    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Enter your email to sign in to your account"
        >
            {searchParams?.verified === "true" && (
                <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md p-3 mb-4 text-sm text-center">
                    Email successfully verified! You can now log in.
                </div>
            )}
            <LoginForm />
        </AuthLayout>
    );
}
