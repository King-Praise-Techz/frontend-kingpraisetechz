"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import {
  Eye,
  EyeOff,
  ArrowRight,
  Crown,
  Users,
  Zap,
  Shield,
  ChevronLeft
} from "lucide-react";

import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";

type LoginRole = "client" | "team" | "admin";

const roleConfig = {
  client: {
    label: "Client",
    description: "Track your project progress and milestones",
    icon: <Zap size={20} />,
    color: "from-indigo-500 to-indigo-400",
    glowColor: "rgba(99,102,241,0.35)",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    text: "text-indigo-400"
  },
  team: {
    label: "Team Member",
    description: "Manage tasks and deliverables",
    icon: <Users size={20} />,
    color: "from-emerald-500 to-teal-400",
    glowColor: "rgba(16,185,129,0.35)",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400"
  },
  admin: {
    label: "Admin",
    description: "Full platform management access",
    icon: <Crown size={20} />,
    color: "from-amber-500 to-yellow-400",
    glowColor: "rgba(245,158,11,0.35)",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400"
  }
};

export default function LoginPage() {

  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleRoleSelect = (role: LoginRole) => {

    setSelectedRole(role);

    if (role === "admin") {
      setFormData({
        email: "chibuksai@gmail.com",
        password: ""
      });
    } else {
      setFormData({
        email: "",
        password: ""
      });
    }

    setTimeout(() => setStep(2), 200);
  };

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!selectedRole) return;

    try {

      const result = await login(
        formData.email,
        formData.password
      );

      if (result.needs2FASetup) {
        router.push("/auth/2fa?setup=true");
        return;
      }

      if (result.requires2FA) {
        router.push("/auth/2fa");
        return;
      }

      router.push("/dashboard/admin");

    } catch {}

  };

  const config = selectedRole ? roleConfig[selectedRole] : null;

  return (

    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-6">

      <div className="w-full max-w-[460px]">

        {/* Logo */}

        <div className="flex items-center justify-center gap-3 mb-10">

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Crown size={18} />
          </div>

          <span className="text-xl font-bold text-white">
            King Praise Techz
          </span>

        </div>

        {/* Progress */}

        <div className="flex gap-2 mb-8">

          <div className={cn(
            "h-1 flex-1 rounded-full",
            step >= 1 ? "bg-indigo-500" : "bg-white/10"
          )} />

          <div className={cn(
            "h-1 flex-1 rounded-full",
            step >= 2 ? "bg-indigo-500" : "bg-white/10"
          )} />

        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1 */}

          {step === 1 && (

            <motion.div
              key="roles"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >

              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back
              </h1>

              <p className="text-slate-400 mb-8">
                Choose how you'd like to sign in
              </p>

              <div className="space-y-4">

                {(Object.entries(roleConfig) as [LoginRole, typeof roleConfig.client][]).map(([role, cfg]) => (

                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className="w-full p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition"
                  >

                    <div className="flex items-center gap-4">

                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        cfg.bg
                      )}>
                        <span className={cfg.text}>
                          {cfg.icon}
                        </span>
                      </div>

                      <div className="text-left flex-1">

                        <p className="font-semibold text-white">
                          {cfg.label}
                        </p>

                        <p className="text-sm text-slate-400">
                          {cfg.description}
                        </p>

                      </div>

                      <ArrowRight className="text-slate-500" />

                    </div>

                  </button>

                ))}

              </div>

              <p className="text-center text-sm text-slate-400 mt-8">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-indigo-400"
                >
                  Sign up
                </Link>
              </p>

            </motion.div>

          )}

          {/* STEP 2 */}

          {step === 2 && config && (

            <motion.div
              key="login"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >

              <button
                onClick={() => {
                  setStep(1);
                  setSelectedRole(null);
                }}
                className="flex items-center gap-2 text-slate-400 mb-6"
              >
                <ChevronLeft size={16}/>
                Back
              </button>

              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-sm border",
                config.bg,
                config.border,
                config.text
              )}>
                {config.icon}
                <span>Signing in as {config.label}</span>
              </div>

              <form
                onSubmit={handleLogin}
                className="space-y-4"
              >

                <input
                  type="email"
                  placeholder="Email"
                  className="input"
                  value={formData.email}
                  onChange={(e)=>
                    setFormData({
                      ...formData,
                      email:e.target.value
                    })
                  }
                  required
                />

                <div className="relative">

                  <input
                    type={showPassword ? "text":"password"}
                    placeholder="Password"
                    className="input pr-10"
                    value={formData.password}
                    onChange={(e)=>
                      setFormData({
                        ...formData,
                        password:e.target.value
                      })
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={()=>setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400"
                  >
                    {showPassword
                      ? <EyeOff size={16}/>
                      : <Eye size={16}/>
                    }
                  </button>

                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "btn-primary bg-gradient-to-r",
                    config.color
                  )}
                  style={{
                    boxShadow:`0 0 20px ${config.glowColor}`
                  }}
                >

                  {isLoading
                    ? "Signing in..."
                    : "Sign In"
                  }

                  <ArrowRight size={16}/>

                </motion.button>

                {selectedRole !== "admin" && (

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">

                    <Shield size={14} className="text-indigo-400"/>

                    <p className="text-xs text-slate-400">
                      Two-Factor Authentication required
                    </p>

                  </div>

                )}

              </form>

              <div className="text-center mt-6">

                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-indigo-400"
                >
                  Forgot password?
                </Link>

              </div>

            </motion.div>

          )}

        </AnimatePresence>

      </div>

    </div>
  );
}