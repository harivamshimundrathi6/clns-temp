"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Mail, Lock, Chrome, Bird } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [showGoogleRoleSelect, setShowGoogleRoleSelect] = React.useState(false);
    const router = useRouter();
    const [error, setError] = React.useState<string | null>(null);

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const target = event.target as typeof event.target & {
            email: { value: string };
            password: { value: string };
        };

        try {
            const res = await signIn("credentials", {
                email: target.email.value,
                password: target.password.value,
                redirect: false,
            });

            if (res?.error) {
                // If it's a generic error but we know it could be EmailNotVerified from our throw
                // NextAuth v5 might obscure the exact error message on the client, but let's check for it.
                if (res.error === "EmailNotVerified" || res.code === "EmailNotVerified") {
                    router.push(`/verify-email?email=${encodeURIComponent(target.email.value)}`);
                    return;
                }
                
                // As a fallback for NextAuth v5 custom error masking
                if (res.error.includes("EmailNotVerified") || res.error === "Configuration") {
                     // Since we can't always perfectly extract the custom error in NextAuth v5 on the client without a custom error page, 
                     // we might just show invalid credentials, but let's try pushing to verify-email if the error string matches.
                     if (res.error.includes("EmailNotVerified")) {
                         router.push(`/verify-email?email=${encodeURIComponent(target.email.value)}`);
                         return;
                     }
                }
                
                setError("Invalid credentials or Email not verified");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err: any) {
            if (err?.message === "EmailNotVerified") {
                router.push(`/verify-email?email=${encodeURIComponent(target.email.value)}`);
                return;
            }
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="grid gap-6">
            <form onSubmit={onSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input
                                id="email"
                                name="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                required
                                disabled={isLoading}
                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                type="password"
                                autoComplete="current-password"
                                required
                                disabled={isLoading}
                                className="pl-10 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <Button disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white mt-2">
                        {isLoading ? (
                            <Bird className="mr-2 h-4 w-4 animate-fly text-blue-300" />
                        ) : null}
                        {isLoading ? "Signing In..." : "Sign In with Email"}
                    </Button>
                </div>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#020817] px-2 text-slate-500">
                        Or continue with
                    </span>
                </div>
            </div>

            <div className="grid gap-4">
                {showGoogleRoleSelect ? (
                    <div className="grid gap-2 animate-in fade-in zoom-in duration-200">
                        <p className="text-sm text-center text-slate-400">Sign in as:</p>
                        <div className="grid grid-cols-3 gap-2">
                            <Button 
                                variant="outline" 
                                type="button" 
                                className="bg-white/5 border-white/10 hover:bg-white/10 text-xs py-1 px-2"
                                onClick={() => {
                                    document.cookie = "google_oauth_role=CLIENT; path=/; max-age=300";
                                    signIn("google", { callbackUrl: "/dashboard" });
                                }}
                            >
                                Client
                            </Button>
                            <Button 
                                variant="outline" 
                                type="button" 
                                className="bg-white/5 border-white/10 hover:bg-white/10 text-xs py-1 px-2"
                                onClick={() => {
                                    document.cookie = "google_oauth_role=STUDENT; path=/; max-age=300";
                                    signIn("google", { callbackUrl: "/dashboard" });
                                }}
                            >
                                Student
                            </Button>
                            <Button 
                                variant="outline" 
                                type="button" 
                                className="bg-white/5 border-white/10 hover:bg-white/10 text-xs py-1 px-2"
                                onClick={() => {
                                    document.cookie = "google_oauth_role=ADVOCATE; path=/; max-age=300";
                                    signIn("google", { callbackUrl: "/dashboard" });
                                }}
                            >
                                Advocate
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button 
                        variant="outline" 
                        type="button" 
                        disabled={isLoading} 
                        className="w-full bg-white/5 border-white/10 hover:bg-white/10"
                        onClick={() => setShowGoogleRoleSelect(true)}
                    >
                        <Chrome className="mr-2 h-4 w-4" />
                        Continue with Google
                    </Button>
                )}
            </div>

            <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300">
                    Sign up
                </Link>
            </div>
        </div>
    );
}
