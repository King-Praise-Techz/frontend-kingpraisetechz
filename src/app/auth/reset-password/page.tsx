"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Crown, Lock, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const { resetPassword, isLoading } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return;
    if (!token) return;
    try {
      await resetPassword?.(token, password);
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch {
      // error handled in store
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-400 text-sm">Invalid or missing reset token. Please request a new password reset link.</p>
        <Link href="/auth/forgot-password" className="text-brand-400 text-sm mt-4 inline-block">Request new link</Link>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      {!done ? (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-brand-400" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white mb-2">Set new password</h1>
            <p className="text-slate-400 text-sm">Choose a strong password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={8}
                  className="input-dark w-full px-4 py-3 rounded-xl text-sm pr-12"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={cn("input-dark w-full px-4 py-3 rounded-xl text-sm pr-12", confirm && password !== confirm ? "border-red-500/50" : "")}
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm && password !== confirm && <p className="text-red-400 text-xs mt-1">Passwords do not match</p>}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !password || password !== confirm}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 rounded-xl font-semibold text-white btn-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Reset Password"}
            </motion.button>
          </form>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">Password reset!</h2>
          <p className="text-slate-400 text-sm">Redirecting you to login...</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <Link href="/auth/login" className="text-slate-400 hover:text-white transition-colors text-sm">
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(26,77,255,0.08) 0%, transparent 70%)" }} />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl btn-glow flex items-center justify-center">
            <Crown size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">King Praise Techz</span>
        </div>
        <Suspense fallback={<div className="glass-card p-8 text-center text-slate-400">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
