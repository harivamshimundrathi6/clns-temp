"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Mail, Lock, User, Briefcase, GraduationCap, Chrome, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function SignupForm() {
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role")?.toLowerCase();
    
    // Validate role param, otherwise fallback to "client"
    const initialRole = 
        (roleParam === "student" || roleParam === "advocate" || roleParam === "client") 
            ? roleParam 
            : "client";

    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedRole, setSelectedRole] = React.useState<"client" | "student" | "advocate">(initialRole);
    const [showGoogleRoleSelect, setShowGoogleRoleSelect] = React.useState(false);
    const router = useRouter();
    const [error, setError] = React.useState<string | null>(null);

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const target = event.target as typeof event.target & {
            name: { value: string };
            email: { value: string };
            password: { value: string };
        };

        const barIdInput = (event.target as any).barId;

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: target.name.value,
                    email: target.email.value,
                    password: target.password.value,
                    role: selectedRole.toUpperCase(),
                    ...(selectedRole === "advocate" && barIdInput ? { barId: barIdInput.value } : {}),
                }),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Registration failed");
            }

            const data = await res.json();
            router.push(`/verify-email?email=${encodeURIComponent(data.email || target.email.value)}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="grid gap-6">
            {/* Role Selection */}
            <div className="grid gap-2">
                <Label>I am a...</Label>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => setSelectedRole("client")}
                        className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-all hover:bg-white/5",
                            selectedRole === "client"
                                ? "border-blue-500 bg-blue-500/10 text-white"
                                : "border-white/10 text-slate-400"
                        )}
                    >
                        <User className="h-5 w-5" />
                        Client
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedRole("student")}
                        className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-all hover:bg-white/5",
                            selectedRole === "student"
                                ? "border-blue-500 bg-blue-500/10 text-white"
                                : "border-white/10 text-slate-400"
                        )}
                    >
                        <GraduationCap className="h-5 w-5" />
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedRole("advocate")}
                        className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-all hover:bg-white/5",
                            selectedRole === "advocate"
                                ? "border-blue-500 bg-blue-500/10 text-white"
                                : "border-white/10 text-slate-400"
                        )}
                    >
                        <Briefcase className="h-5 w-5" />
                        Advocate
                    </button>
                </div>
            </div>

            <form onSubmit={onSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                type="text"
                                autoCapitalize="words"
                                autoComplete="name"
                                required
                                disabled={isLoading}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                            />
                        </div>
                    </div>
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
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                type="password"
                                autoComplete="new-password"
                                required
                                disabled={isLoading}
                                className="pl-10 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    {selectedRole === "advocate" && (
                        <div className="grid gap-2">
                            <Label htmlFor="barId">Bar Council ID</Label>
                            <div className="relative">
                                <Scale className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    id="barId"
                                    name="barId"
                                    placeholder="e.g. TS/1234/2021 or AP/5678/2020"
                                    type="text"
                                    required
                                    disabled={isLoading}
                                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                />
                            </div>
                            <p className="text-xs text-slate-500">Your Bar Council enrollment number. This will be verified by our team.</p>
                        </div>
                    )}
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <Button disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white mt-2">
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create {selectedRole === "advocate" ? "Advocate Account" : "Account"}
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
                        <p className="text-sm text-center text-slate-400">Sign up as:</p>
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
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300">
                    Sign in
                </Link>
            </div>
        </div>
    );
}
