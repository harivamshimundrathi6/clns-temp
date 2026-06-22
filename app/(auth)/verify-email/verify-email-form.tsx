"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail, Lock } from "lucide-react";

export function VerifyEmailForm({ email }: { email: string }) {
    const [showResend, setShowResend] = React.useState(false);
    const [password, setPassword] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [error, setError] = React.useState("");

    async function handleResend(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("A new verification email has been sent!");
                setShowResend(false);
                setPassword("");
            } else {
                setError(data.error || "Failed to resend email. Please check your password.");
            }
        } catch (err) {
            setError("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-6 text-center w-full">
            <div className="bg-blue-500/10 p-4 rounded-full">
                <Mail className="h-8 w-8 text-blue-500" />
            </div>
            
            <p className="text-slate-300">
                We have sent you a verification email to <span className="font-semibold text-white">{email || "your email address"}</span>. 
                Please verify it and log in.
            </p>

            {message && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm p-3 rounded-md w-full">
                    {message}
                </div>
            )}
            
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-md w-full">
                    {error}
                </div>
            )}

            <div className="w-full space-y-4">
                {showResend ? (
                    <form onSubmit={handleResend} className="space-y-4 bg-white/5 p-4 rounded-lg border border-white/10 text-left">
                        <div className="space-y-2">
                            <Label htmlFor="password">Enter your password to resend</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input 
                                    id="password"
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-10 bg-[#020817] border-white/10 text-white placeholder:text-slate-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button type="submit" disabled={isLoading || !email} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Send
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowResend(false)} className="w-full bg-transparent border-white/20 text-white hover:bg-white/10">
                                Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    <Button 
                        onClick={() => setShowResend(true)}
                        variant="outline"
                        className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                        <Mail className="mr-2 h-4 w-4" />
                        Resend Verification Email
                    </Button>
                )}

                <Link href="/login" className="w-full block">
                    <Button variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-white/5">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go back to Login
                    </Button>
                </Link>
            </div>
        </div>
    );
}
