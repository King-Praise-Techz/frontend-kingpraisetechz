"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Eye, EyeOff, Crown, Lock, CheckCircle2,
  ArrowLeft, ShieldCheck, AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

/* ─── Password strength helper ──────────────────────────────────────────────── */
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)          score++;
  if (pw.length >= 12)         score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: "Weak",   color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair",   color: "#f59e0b" };
  if (score <= 3) return { score, label: "Good",   color: "#3b82f6" };
  return              { score, label: "Strong", color: "#10b981" };
}

/* ─── PasswordInput — lifted OUTSIDE ResetPasswordForm ──────────────────────
   Defining input wrappers inside a parent component creates a new component
   type every render → React unmounts + remounts the input → focus lost.
   This stable external component keeps the input mounted continuously.
────────────────────────────────────────────────────────────────────────────── */
interface PasswordInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  borderStyle?: React.CSSProperties;
}

function PasswordInput({ value, onChange, placeholder, borderStyle }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pr-11 w-full"
        style={borderStyle}
        required
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
        style={{ color: "var(--text-3)" }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

/* ─── Inner form (needs Suspense for useSearchParams) ────────────────────── */
function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams?.get("token") ?? "";

  const { resetPassword, isLoading } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState("");

  // Stable handlers — useCallback so identity stays the same across renders
  const handlePasswordChange = useCallback((val: string) => {
    setPassword(val);
    setError("");
  }, []);

  const handleConfirmChange = useCallback((val: string) => {
    setConfirm(val);
    setError("");
  }, []);

  const strength       = getStrength(password);
  const passwordsMatch = password === confirm;
  const canSubmit      = !isLoading && password.length >= 8 && passwordsMatch && !!token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      await resetPassword?.(token, password);
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password. The link may have expired.");
    }
  };

  /* ── Invalid / missing token ── */
  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.28)" }}
          >
            <AlertTriangle size={28} style={{ color: "#ef4444" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
            Invalid link
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
            This reset link is missing a token or has expired.
            Please request a new password reset link.
          </p>
          <Link href="/auth/forgot-password" className="btn btn-primary btn-full">
            Request new link
          </Link>
        </div>
        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: "var(--text-2)" }}
          >
            <ArrowLeft size={15} /> Back to login
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">

      {/* ── Success state ── */}
      {done && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.28)" }}
          >
            <CheckCircle2 size={28} style={{ color: "#10b981" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
            Password reset!
          </h2>
          <p className="text-sm mb-5" style={{ color: "var(--text-2)" }}>
            Your password has been updated successfully.
          </p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>
            Redirecting you to login in a moment…
          </p>
          <div className="mt-6 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #10b981, #34d399)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}

      {/* ── Form state ── */}
      {!done && (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          className="glass-card p-8"
        >
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--brand-dim)", border: "1px solid var(--brand-border)" }}
            >
              <Lock size={28} style={{ color: "var(--brand)" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
              Set new password
            </h1>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>
              Choose a strong password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* New password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium block" style={{ color: "var(--text-2)" }}>
                New Password
              </label>
              <PasswordInput
                value={password}
                onChange={handlePasswordChange}
                placeholder="Min 8 characters"
              />
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="pt-2 space-y-1.5"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength.score ? strength.color : "rgba(255,255,255,0.08)" }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium block" style={{ color: "var(--text-2)" }}>
                Confirm Password
              </label>
              <PasswordInput
                value={confirm}
                onChange={handleConfirmChange}
                placeholder="Repeat your password"
                borderStyle={
                  confirm && !passwordsMatch
                    ? { borderColor: "rgba(239,68,68,0.5)" }
                    : confirm && passwordsMatch
                    ? { borderColor: "rgba(16,185,129,0.5)" }
                    : undefined
                }
              />
              {confirm && !passwordsMatch && (
                <p className="text-xs" style={{ color: "#ef4444" }}>Passwords do not match</p>
              )}
              {confirm && passwordsMatch && password.length >= 8 && (
                <p className="text-xs flex items-center gap-1" style={{ color: "#10b981" }}>
                  <CheckCircle2 size={12} /> Passwords match
                </p>
              )}
            </div>

            {/* Global error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
              >
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}

            {/* Security note */}
            <div
              className="flex items-start gap-2.5 p-3 rounded-xl"
              style={{ background: "var(--brand-dim)", border: "1px solid var(--brand-border)" }}
            >
              <ShieldCheck size={14} style={{ color: "var(--brand)", marginTop: 2, flexShrink: 0 }} />
              <p className="text-xs" style={{ color: "var(--text-2)", lineHeight: 1.6 }}>
                Use at least 8 characters with a mix of uppercase letters,
                numbers and symbols for a strong password.
              </p>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={!canSubmit}
              whileHover={canSubmit ? { scale: 1.01 } : {}}
              whileTap={canSubmit  ? { scale: 0.99 } : {}}
              className="btn btn-glow btn-full btn-lg mt-1"
              style={{ opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? "pointer" : "not-allowed" }}
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : null}
              {isLoading ? "Resetting…" : "Reset Password"}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm transition-colors"
              style={{ color: "var(--text-2)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-1)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
            >
              <ArrowLeft size={15} /> Back to login
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Page wrapper ───────────────────────────────────────────────────────────── */
export default function ResetPasswordPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-12"
      style={{
        background: `
          radial-gradient(ellipse 55% 45% at 15% -5%, rgba(92,110,248,0.14) 0%, transparent 70%),
          radial-gradient(ellipse 40% 35% at 85% 105%, rgba(26,77,255,0.09) 0%, transparent 65%),
          var(--bg)
        `,
      }}
    >
      <div className="w-full max-w-[430px]">
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--brand), #818cf8)", boxShadow: "0 4px 20px var(--brand-glow)" }}
          >
            <Crown size={17} color="#fff" />
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
            King Praise Techz
          </span>
        </motion.div>

        <Suspense
          fallback={
            <div className="glass-card p-8 text-center" style={{ color: "var(--text-2)" }}>
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3" />
              Loading…
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}