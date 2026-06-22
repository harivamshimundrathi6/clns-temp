"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { 
  applyActionCode, 
  verifyPasswordResetCode, 
  confirmPasswordReset,
  checkActionCode
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Loader2, KeyRound, MailCheck } from "lucide-react";
import Link from "next/link";

function ActionHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "input">("loading");
  const [message, setMessage] = useState("Verifying your request...");
  
  // For password reset
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus("error");
      setMessage("Invalid request. Missing parameters.");
      return;
    }

    const handleAction = async () => {
      try {
        switch (mode) {
          case "verifyEmail":
            await applyActionCode(auth, oobCode);
            setStatus("success");
            setMessage("Your email has been successfully verified! You can now log in.");
            break;

          case "resetPassword":
            const email = await verifyPasswordResetCode(auth, oobCode);
            setResetEmail(email);
            setStatus("input");
            setMessage("Please enter your new password.");
            break;

          case "recoverEmail":
            const info = await checkActionCode(auth, oobCode);
            await applyActionCode(auth, oobCode);
            setStatus("success");
            setMessage(`Your email has been recovered and reverted to ${info.data.email}. Please reset your password if you didn't request this change.`);
            break;

          default:
            setStatus("error");
            setMessage("Invalid action mode.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "An error occurred while processing your request. The link may have expired or already been used.");
      }
    };

    handleAction();
  }, [mode, oobCode]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("Resetting password...");
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setStatus("success");
      setMessage("Your password has been successfully reset. You can now log in with your new password.");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[#020712]/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-md w-full relative z-10">
      
      {status === "loading" && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Processing</h2>
          <p className="text-white/60 text-center">{message}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mb-6 border border-teal-500/30 shadow-[0_0_40px_rgba(20,184,166,0.3)]">
            {mode === "verifyEmail" ? (
              <MailCheck className="w-10 h-10 text-teal-400" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-teal-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 text-center">Success!</h2>
          <p className="text-teal-100/70 text-center mb-8">{message}</p>
          <Button asChild size="lg" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold">
            <Link href="/login">Continue to Login</Link>
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 text-center">Action Failed</h2>
          <p className="text-red-200/70 text-center mb-8">{message}</p>
          <Button asChild variant="outline" size="lg" className="w-full border-white/20 text-white hover:bg-white/10">
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      )}

      {status === "input" && mode === "resetPassword" && (
        <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-blue-500/30">
            <KeyRound className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Reset Password</h2>
          <p className="text-white/60 text-center mb-8 text-sm">
            Setting new password for <span className="text-white font-medium">{resetEmail}</span>
          </p>

          <form onSubmit={handlePasswordReset} className="w-full space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-blue-500/50"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-blue-500/50"
                required
                minLength={6}
              />
            </div>
            
            {message !== "Please enter your new password." && (
              <p className="text-red-400 text-sm text-center font-medium py-2">{message}</p>
            )}

            <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 rounded-xl mt-4">
              Reset Password
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <div className="min-h-screen w-full bg-[#020712] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Logo */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 z-20">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="CLNS" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-white tracking-tight">CLNS</span>
        </Link>
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-8 bg-[#020712]/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-md w-full z-10">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      }>
        <ActionHandler />
      </Suspense>
    </div>
  );
}
