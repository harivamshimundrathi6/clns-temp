"use client";

import { motion } from "framer-motion";
import { Shield, Clock, CheckCircle2, Mail, ArrowLeft, Scale, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PendingApprovalPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [checking, setChecking] = useState(false);
    const [resending, setResending] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    
    // Bar ID missing state
    const [needsBarId, setNeedsBarId] = useState(false);
    const [barIdInput, setBarIdInput] = useState("");
    const [submittingBarId, setSubmittingBarId] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        // If user is already approved, redirect to dashboard
        if (session?.user && (session.user as any).status === "ACTIVE") {
            router.push("/dashboard");
            return;
        }

        const checkStatus = async () => {
            try {
                const res = await fetch("/api/auth/check-approval-status");
                const data = await res.json();
                if (data.status === "ACTIVE") {
                    setStatusMessage("You got verified! Redirecting to your dashboard...");
                    setTimeout(() => {
                        window.location.href = "/dashboard";
                    }, 1500);
                } else if (data.role === "ADVOCATE" && (!data.barId || data.barId.trim() === "")) {
                    setNeedsBarId(true);
                } else {
                    setNeedsBarId(false);
                }
            } catch (e) {
                console.error("Error checking status:", e);
            }
        };

        checkStatus();

        // Poll every 5 seconds to check approval status automatically in the background
        const interval = setInterval(async () => {
            if (!needsBarId) {
                checkStatus();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [session, status, router, needsBarId]);

    const handleCheckStatus = async () => {
        setChecking(true);
        setStatusMessage("");
        try {
            const res = await fetch("/api/auth/check-approval-status");
            const data = await res.json();
            if (data.status === "ACTIVE") {
                setStatusMessage("You got verified! Redirecting to your dashboard...");
                setTimeout(() => {
                    // Force session refresh by reloading
                    window.location.href = "/dashboard";
                }, 1500);
            } else if (data.role === "ADVOCATE" && (!data.barId || data.barId.trim() === "")) {
                setNeedsBarId(true);
            } else if (data.status === "REJECTED") {
                setStatusMessage("Unfortunately, your application was not approved. Please contact support for more details.");
            } else {
                setStatusMessage("Your application is still under review. We'll notify you by email once a decision is made.");
            }
        } catch {
            setStatusMessage("Unable to check status. Please try again later.");
        } finally {
            setChecking(false);
        }
    };

    const handleResendMail = async () => {
        setResending(true);
        setStatusMessage("");
        try {
            const res = await fetch("/api/auth/resend-verification-request", {
                method: "POST"
            });
            const data = await res.json();
            if (res.ok) {
                setStatusMessage("Verification request email has been resent to admin (get.clns@gmail.com) successfully!");
            } else {
                setStatusMessage(data.error || "Failed to resend email. Please try again.");
            }
        } catch {
            setStatusMessage("Unable to resend email. Please try again later.");
        } finally {
            setResending(false);
        }
    };

    const handleSubmitBarId = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!barIdInput.trim()) return;
        
        setSubmittingBarId(true);
        setStatusMessage("");
        
        try {
            const res = await fetch("/api/auth/submit-bar-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ barId: barIdInput })
            });
            const data = await res.json();
            
            if (res.ok) {
                setNeedsBarId(false);
                setStatusMessage("Bar ID submitted successfully. Your application is now under review.");
            } else {
                setStatusMessage(data.error || "Failed to submit Bar ID. Please try again.");
            }
        } catch {
            setStatusMessage("Unable to submit Bar ID. Please try again later.");
        } finally {
            setSubmittingBarId(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-[#020712] text-white flex items-center justify-center px-6">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-[#020712] to-[#020712]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08),transparent_70%)] blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 mx-auto max-w-lg w-full"
            >
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-12 backdrop-blur-xl text-center space-y-8">
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        >
                            <Shield className="h-12 w-12 text-blue-400" />
                        </motion.div>
                    </motion.div>

                    {/* Title */}
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                            {needsBarId ? "Action Required" : "Verification Pending"}
                        </h1>
                        <p className="mt-3 text-white/60 text-sm leading-relaxed">
                            {needsBarId 
                                ? "Please provide your Bar Council ID to proceed."
                                : "Thank you for registering as an advocate on CLNS!"}
                        </p>
                    </div>

                    {needsBarId ? (
                        <form onSubmit={handleSubmitBarId} className="space-y-4 text-left">
                            <div className="space-y-2">
                                <label htmlFor="barId" className="text-sm font-medium text-white/80">Bar Council ID</label>
                                <div className="relative">
                                    <Scale className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                                    <input
                                        id="barId"
                                        type="text"
                                        placeholder="e.g. TS/1234/2021"
                                        value={barIdInput}
                                        onChange={(e) => setBarIdInput(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                                        required
                                        disabled={submittingBarId}
                                    />
                                </div>
                                <p className="text-xs text-white/40">This will be verified by our team before approval.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={submittingBarId || !barIdInput.trim()}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.2)] transition-all hover:shadow-[0_15px_40px_rgba(37,99,235,0.35)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submittingBarId ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Submit Bar ID
                            </button>
                        </form>
                    ) : (
                        <>
                            {/* Steps */}
                            <div className="space-y-4 text-left">
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-emerald-300">Email Verified</p>
                                        <p className="text-xs text-white/40">Your email has been verified successfully.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                    <Clock className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0 animate-pulse" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-300">Admin Review In Progress</p>
                                        <p className="text-xs text-white/40">Our team is verifying your Bar Council ID and credentials.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <Mail className="h-5 w-5 text-white/30 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-white/50">Email Notification</p>
                                        <p className="text-xs text-white/30">You&apos;ll receive an email once your account is approved.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleCheckStatus}
                                    disabled={checking}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.2)] transition-all hover:shadow-[0_15px_40px_rgba(37,99,235,0.35)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {checking ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                            <Clock className="h-4 w-4" />
                                        </motion.div>
                                    ) : (
                                        <Shield className="h-4 w-4" />
                                    )}
                                    {checking ? "Checking..." : "Check Approval Status"}
                                </button>

                                <button
                                    onClick={handleResendMail}
                                    disabled={resending || checking}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-6 py-3 text-sm font-semibold text-blue-400 transition-all hover:bg-blue-500/10 hover:border-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resending ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                            <Clock className="h-4 w-4" />
                                        </motion.div>
                                    ) : (
                                        <Mail className="h-4 w-4" />
                                    )}
                                    {resending ? "Resending..." : "Resend Verification Mail"}
                                </button>

                                <Link
                                    href="/"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/60 transition-all hover:bg-white/10 hover:text-white"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Home
                                </Link>
                            </div>
                        </>
                    )}

                    {/* Status message */}
                    {statusMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-xl text-sm ${
                                statusMessage.includes("approved!") || statusMessage.includes("successfully")
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                    : statusMessage.includes("not approved") || statusMessage.includes("Failed") || statusMessage.includes("Unable")
                                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                                    : "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                            }`}
                        >
                            {statusMessage}
                        </motion.div>
                    )}

                    <p className="text-xs text-white/30">
                        Need help? Contact us at{" "}
                        <a href="mailto:get.clns@gmail.com" className="text-blue-400/70 hover:text-blue-400 underline">
                            get.clns@gmail.com
                        </a>
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
