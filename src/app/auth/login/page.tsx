"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Crown, Users, Zap, Shield, ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";

type LoginRole = "client" | "team" | "admin";

const roleConfig = {
  client: {
    label: "Client",
    description: "Track your project progress and milestones",
    icon: <Zap size={18} />,
    accent: "var(--brand)",
    accentDim: "var(--brand-dim)",
    accentBorder: "var(--brand-border)",
    gradient: "linear-gradient(135deg, #5c6ef8, #818cf8)",
  },
  team: {
    label: "Team Member",
    description: "Manage tasks and deliverables",
    icon: <Users size={18} />,
    accent: "var(--emerald)",
    accentDim: "var(--emerald-dim)",
    accentBorder: "var(--emerald-border)",
    gradient: "linear-gradient(135deg, #34d399, #6ee7b7)",
  },
  admin: {
    label: "Administrator",
    description: "Full platform management access",
    icon: <Crown size={18} />,
    accent: "var(--gold)",
    accentDim: "var(--gold-dim)",
    accentBorder: "var(--gold-border)",
    gradient: "linear-gradient(135deg, #f0a429, #fbbf24)",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleRoleSelect = (role: LoginRole) => {
    setSelectedRole(role);
    setFormData({ email: role === "admin" ? "chibuksai@gmail.com" : "", password: "" });
    setTimeout(() => setStep(2), 180);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    try {
      const result = await login(formData.email, formData.password);
      if (result.needs2FASetup) { router.push("/auth/2fa?setup=true"); return; }
      if (result.requires2FA)   { router.push("/auth/2fa"); return; }
      router.push("/dashboard/admin");
    } catch {}
  };

  const config = selectedRole ? roleConfig[selectedRole] : null;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{
        background: `
          radial-gradient(ellipse 55% 45% at 15% -5%, rgba(92,110,248,0.16) 0%, transparent 70%),
          radial-gradient(ellipse 45% 40% at 85% 105%, rgba(92,110,248,0.09) 0%, transparent 70%),
          var(--bg)
        `,
      }}
    >
      <div className="w-full max-w-[430px]">

        {/* Logo + Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <Link
            href="/"
            className="flex items-center gap-3 group"
            style={{ textDecoration: "none" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-opacity duration-200 group-hover:opacity-80"
              style={{ background: "linear-gradient(135deg, var(--brand), #818cf8)", boxShadow: "0 4px 20px var(--brand-glow)" }}
            >
              <Crown size={17} color="#fff" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
              King Praise Techz
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{
              color: "var(--text-2)",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-1)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover, var(--text-3))";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }}
          >
            <ChevronLeft size={13} />
            Home
          </Link>
        </motion.div>

        {/* Step dots */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map(s => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-all duration-400"
              style={{ background: s <= step ? "var(--brand)" : "rgba(255,255,255,0.08)" }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Role select ── */}
          {step === 1 && (
            <motion.div
              key="roles"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }}
            >
              <h1 className="text-3xl font-bold mb-1.5" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
                Welcome back
              </h1>
              <p className="text-sm mb-7" style={{ color: "var(--text-2)" }}>Choose how you'd like to sign in</p>

              <div className="space-y-3">
                {(Object.entries(roleConfig) as [LoginRole, typeof roleConfig.client][]).map(([role, cfg]) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all duration-200 group"
                    style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = cfg.accentBorder;
                      (e.currentTarget as HTMLElement).style.background = cfg.accentDim;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-1)";
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: cfg.accentDim, border: `1px solid ${cfg.accentBorder}` }}
                    >
                      <span style={{ color: cfg.accent }}>{cfg.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>{cfg.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>{cfg.description}</p>
                    </div>
                    <ArrowRight size={16} style={{ color: "var(--text-3)" }} />
                  </button>
                ))}
              </div>

              <p className="text-center text-sm mt-8" style={{ color: "var(--text-2)" }}>
                Don't have an account?{" "}
                <Link href="/auth/signup" style={{ color: "var(--brand)" }} className="font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </motion.div>
          )}

          {/* ── Step 2: Sign in form ── */}
          {step === 2 && config && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }}
            >
              <button
                onClick={() => { setStep(1); setSelectedRole(null); }}
                className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
                style={{ color: "var(--text-2)" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-1)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
              >
                <ChevronLeft size={15} /> Back
              </button>

              {/* Role pill */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{
                  background: config.accentDim,
                  border: `1px solid ${config.accentBorder}`,
                  color: config.accent,
                }}
              >
                {config.icon}
                Signing in as {config.label}
              </div>

              <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
                Sign in
              </h1>
              <p className="text-sm mb-7" style={{ color: "var(--text-2)" }}>Enter your credentials to continue</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Email address</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Password</label>
                    <Link href="/auth/forgot-password" className="text-xs hover:underline" style={{ color: "var(--brand)" }}>
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input pr-11"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "var(--text-3)" }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={!isLoading ? { scale: 1.01 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  className="btn btn-full btn-lg mt-2"
                  style={{
                    background: config.gradient,
                    color: "#fff",
                    boxShadow: `0 4px 22px ${config.accentBorder}`,
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  {isLoading ? "Signing in…" : "Sign In"}
                  {!isLoading && <ArrowRight size={15} />}
                </motion.button>

                {selectedRole !== "admin" && (
                  <div
                    className="flex items-center gap-2.5 p-3 rounded-xl"
                    style={{ background: "var(--brand-dim)", border: "1px solid var(--brand-border)" }}
                  >
                    <Shield size={14} style={{ color: "var(--brand)" }} />
                    <p className="text-xs" style={{ color: "var(--text-2)" }}>
                      Two-Factor Authentication required on login
                    </p>
                  </div>
                )}
              </form>

              <p className="text-center text-sm mt-8" style={{ color: "var(--text-2)" }}>
                Don't have an account?{" "}
                <Link href="/auth/signup" style={{ color: "var(--brand)" }} className="font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}