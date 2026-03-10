"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Shield, Zap, Crown, Users, ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";

type LoginRole = "client" | "team" | "admin";

const roleConfig = {
  client: {
    label: "Client",
    description: "Track your project progress and milestones",
    icon: <Zap size={20} />,
    color: "from-brand-500 to-brand-400",
    glowColor: "rgba(26,77,255,0.3)",
    borderColor: "border-brand-500/40",
    bgColor: "bg-brand-500/10",
    textColor: "text-brand-400",
  },
  team: {
    label: "Team Member",
    description: "Manage your tasks and deliverables",
    icon: <Users size={20} />,
    color: "from-emerald-500 to-teal-400",
    glowColor: "rgba(16,185,129,0.3)",
    borderColor: "border-emerald-500/40",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
  },
  admin: {
    label: "Admin",
    description: "Full platform management access",
    icon: <Crown size={20} />,
    color: "from-gold-500 to-gold-400",
    glowColor: "rgba(245,158,11,0.3)",
    borderColor: "border-gold-500/40",
    bgColor: "bg-gold-500/10",
    textColor: "text-gold-400",
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
    if (role === "admin") {
      setFormData({ email: "chibuksai@gmail.com", password: "" });
    } else {
      setFormData({ email: "", password: "" });
    }
    setTimeout(() => setStep(2), 200);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    try {
      const result = await login(formData.email, formData.password);

      if (result.needs2FASetup) {
        router.push("/auth/2fa?setup=true");
        return;
      }
      if (result.requires2FA) {
        router.push("/auth/2fa");
        return;
      }

      // Direct login (admin)
      router.push("/dashboard/admin");
    } catch {
      // Error handled in store
    }
  };

  const config = selectedRole ? roleConfig[selectedRole] : null;

  return (
    <div className="min-h-screen flex">
      {/* Left Panel – Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(26,77,255,0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.1) 0%, transparent 50%)",
          }}
        />
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full border border-brand-500/10 animate-float" style={{ animationDelay: "0s" }} />
        <div className="absolute top-40 right-40 w-32 h-32 rounded-full border border-brand-500/15 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-20 w-48 h-48 rounded-full border border-gold-500/10 animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl btn-glow flex items-center justify-center">
              <Crown size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">King Praise Techz</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="font-display font-bold text-5xl leading-tight text-white mb-4">
              Build. Deliver.<br />
              <span className="gradient-text">Exceed.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Your professional web agency management platform. Track projects, manage teams, and delight clients — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[{ label: "Projects", value: "200+" }, { label: "Clients", value: "50+" }, { label: "Delivered", value: "98%" }].map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <p className="font-display font-bold text-2xl gradient-text">{stat.value}</p>
                <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Shield size={16} className="text-slate-500" />
          <span className="text-slate-500 text-sm">Enterprise-grade security &amp; 2FA protection</span>
        </div>
      </div>

      {/* Right Panel – Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 rounded-lg btn-glow flex items-center justify-center">
                <Crown size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">King Praise Techz</span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className={cn("step-dot", step >= 1 ? "active" : "")} />
              <div className={cn("step-dot", step >= 2 ? "active" : "")} />
            </div>

            <h2 className="font-display font-bold text-3xl text-white mb-2">
              {step === 1 ? "Welcome back" : `Sign in as ${config?.label}`}
            </h2>
            <p className="text-slate-400">
              {step === 1 ? "Choose how you'd like to sign in" : "Enter your credentials to continue"}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                {(Object.entries(roleConfig) as [LoginRole, typeof roleConfig.client][]).map(([role, cfg]) => (
                  <motion.button
                    key={role}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleRoleSelect(role)}
                    className={cn(
                      "w-full glass-card p-5 flex items-center gap-4 text-left transition-all duration-300 card-hover border",
                      "border-white/5 hover:border-white/15"
                    )}
                  >
                    <div
                      className={cn("w-12 h-12 rounded-xl flex items-center justify-center", cfg.bgColor)}
                      style={{ boxShadow: `0 0 20px ${cfg.glowColor}` }}
                    >
                      <span className={cfg.textColor}>{cfg.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white font-display">{cfg.label}</p>
                      <p className="text-sm text-slate-400 mt-0.5">{cfg.description}</p>
                    </div>
                    <ArrowRight size={16} className="text-slate-500" />
                  </motion.button>
                ))}

                <div className="text-center pt-4">
                  <p className="text-slate-400 text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && config && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button
                  onClick={() => { setStep(1); setSelectedRole(null); }}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
                >
                  <ChevronLeft size={16} />
                  Back to role selection
                </button>

                <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-sm font-medium border", config.bgColor, config.borderColor, config.textColor)}>
                  {config.icon}
                  <span>Signing in as {config.label}</span>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-300">Password</label>
                      <Link href="/auth/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="input-dark w-full px-4 py-3 rounded-xl text-sm pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      "w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all",
                      "bg-gradient-to-r",
                      config.color,
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    style={{ boxShadow: `0 0 20px ${config.glowColor}` }}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>

                  {selectedRole !== "admin" && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-500/5 border border-brand-500/20">
                      <Shield size={14} className="text-brand-400 shrink-0" />
                      <p className="text-xs text-slate-400">2-Factor Authentication required for security</p>
                    </div>
                  )}
                </form>

                <div className="text-center mt-6">
                  <p className="text-slate-400 text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
