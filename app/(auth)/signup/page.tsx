import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Create Account | CLNS",
    description: "Join the CLNS network today",
};

export default function SignupPage() {
    return (
        <AuthLayout
            title="Create an account"
            subtitle="Select your role to get started with CLNS"
        >
            <Suspense fallback={<div className="h-[400px] flex items-center justify-center">Loading...</div>}>
                <SignupForm />
            </Suspense>
        </AuthLayout>
    );
}
