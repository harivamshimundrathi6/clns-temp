"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { CheckCircle2, ShieldCheck, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

function VerifyCallbackContent() {
    const searchParams = useSearchParams();
    const oobCode = searchParams.get("oobCode");
    const mode = searchParams.get("mode");
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "error" | "success">("loading");

    useEffect(() => {
        if (!oobCode || mode !== "verifyEmail") {
            router.push("/login");
            return;
        }

        const verifyAndLogin = async () => {
            try {
                // Call NextAuth signIn with our out-of-band code.
                // Our backend will use this code to verify the email directly with Firebase
                // and then instantly log the user in.
                const res = await signIn("credentials", {
                    oobCode,
                    redirect: false,
                });

                if (res?.error) {
                    setStatus("error");
                    toast.error("Verification link is invalid or expired.");
                    setTimeout(() => router.push("/login"), 3000);
                } else {
                    setStatus("success");
                    toast.success("Email verified successfully! Logging you in...");
                    setTimeout(() => router.push("/dashboard"), 1500);
                }
            } catch (error) {
                console.error("Verification error", error);
                setStatus("error");
                toast.error("An error occurred during verification.");
                setTimeout(() => router.push("/login"), 3000);
            }
        };

        verifyAndLogin();
    }, [oobCode, mode, router]);

    return (
        <AuthLayout
            title="Verifying your email"
            subtitle="Please wait while we confirm your email address..."
        >
            <div className="flex flex-col items-center justify-center space-y-8 py-10 text-center min-h-[250px]">
                <AnimatePresence mode="wait">
                    {status === "loading" && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center space-y-6"
                        >
                            <div className="relative flex h-24 w-24 items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500 border-r-blue-500/50"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                    className="absolute inset-2 rounded-full border-[3px] border-transparent border-b-indigo-500 border-l-indigo-500/50"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                >
                                    <ShieldCheck className="h-8 w-8 text-blue-400" />
                                </motion.div>
                            </div>
                            <motion.p 
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="text-slate-300 font-medium tracking-wide"
                            >
                                Securely verifying your email...
                            </motion.p>
                        </motion.div>
                    )}
                    
                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="flex flex-col items-center space-y-6"
                        >
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 250, damping: 15 }}
                                className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] border border-green-500/30"
                            >
                                <CheckCircle2 className="h-10 w-10" />
                            </motion.div>
                            <p className="text-green-400 font-medium text-lg">
                                Verification successful!
                            </p>
                            <p className="text-slate-400 text-sm">
                                Logging you in and redirecting to dashboard...
                            </p>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center space-y-6"
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 text-red-500 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                <XCircle className="h-10 w-10" />
                            </div>
                            <p className="text-red-400 font-medium text-lg">
                                Verification failed or expired.
                            </p>
                            <p className="text-slate-400 text-sm">
                                Redirecting to login...
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AuthLayout>
    );
}

export default function VerifyCallback() {
    return (
        <Suspense fallback={
            <AuthLayout title="Verifying your email" subtitle="Please wait...">
                <div className="flex justify-center py-8"><Loader2 className="h-12 w-12 animate-spin text-blue-500" /></div>
            </AuthLayout>
        }>
            <VerifyCallbackContent />
        </Suspense>
    );
}
