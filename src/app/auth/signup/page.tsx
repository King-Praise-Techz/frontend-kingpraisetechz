"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Shield, Eye, EyeOff, ArrowRight, ArrowLeft, Users, Zap,
  Crown, Code, Palette, Globe, Database, LayoutDashboard, MessageSquare, Phone,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";

type SignupRole = "client" | "team";

const skillOptions = [
  { id: "frontend",  label: "Frontend Dev",   icon: <Code        size={13} /> },
  { id: "backend",   label: "Backend Dev",    icon: <Database    size={13} /> },
  { id: "design",    label: "UI/UX Design",   icon: <Palette     size={13} /> },
  { id: "mobile",    label: "Mobile Dev",     icon: <Phone       size={13} /> },
  { id: "devops",    label: "DevOps",         icon: <Globe       size={13} /> },
  { id: "pm",        label: "Project Mgmt",   icon: <LayoutDashboard size={13} /> },
  { id: "seo",       label: "SEO",            icon: <Globe       size={13} /> },
  { id: "content",   label: "Content",        icon: <MessageSquare size={13} /> },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "",
    company: "", industry: "", jobTitle: "", phone: "",
  });

  const totalSteps = selectedRole === "team" ? 4 : 3;
  const toggleSkill = (id: string) =>
    setSelectedSkills(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = "Required";
    if (!formData.lastName.trim())  errs.lastName  = "Required";
    if (!formData.email.includes("@")) errs.email = "Enter a valid email";
    if (formData.password.length < 8)  errs.password = "Min 8 characters";
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 2 && !validateStep2()) return;
    if (step < totalSteps) setStep(p => p + 1);
  };

  const handleSignup = async () => {
    try {
      await signup({
        firstName: formData.firstName, lastName: formData.lastName,
        email: formData.email, password: formData.password,
        role: selectedRole!,
        company: formData.company || undefined,
        industry: formData.industry || undefined,
        jobTitle: formData.jobTitle || undefined,
        phone: formData.phone || undefined,
        skills: selectedSkills,
      });
      router.push("/auth/2fa?setup=true");
    } catch {}
  };

  const slide = {
    initial: { opacity: 0, x: 28 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -28 },
    transition: { duration: 0.22 },
  };

  const Field = ({
    label, error, name, type = "text", placeholder, right,
  }: {
    label: string; error?: string; name: string; type?: string; placeholder?: string; right?: React.ReactNode;
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium block" style={{ color: "var(--text-2)" }}>{label}</label>
      <div className="relative">
        <input
          type={type} placeholder={placeholder}
          className={cn("input", right && "pr-11", error && "err")}
          value={(formData as any)[name]}
          onChange={e => setFormData({ ...formData, [name]: e.target.value })}
        />
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      {error && <p className="text-xs" style={{ color: "var(--rose)" }}>{error}</p>}
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-12"
      style={{
        background: `
          radial-gradient(ellipse 55% 45% at 15% -5%, rgba(92,110,248,0.14) 0%, transparent 70%),
          radial-gradient(ellipse 45% 35% at 85% 105%, rgba(52,211,153,0.07) 0%, transparent 65%),
          var(--bg)
        `,
      }}
    >
      <div className="w-full max-w-[480px]">
        {/* Logo */}
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

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {Array(totalSteps || 3).fill(0).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-400"
              style={{ background: i + 1 <= step ? "var(--brand)" : "rgba(255,255,255,0.08)" }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Role ── */}
          {step === 1 && (
            <motion.div key="s1" {...slide}>
              <h1 className="text-3xl font-bold mb-1.5" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
                Create account
              </h1>
              <p className="text-sm mb-7" style={{ color: "var(--text-2)" }}>How are you joining today?</p>

              <div className="space-y-3">
                {[
                  {
                    role: "client" as SignupRole,
                    icon: <Zap size={18} />,
                    label: "I'm a Client",
                    desc: "Hire King Praise Techz for your project",
                    accent: "var(--brand)",
                    accentDim: "var(--brand-dim)",
                    accentBorder: "var(--brand-border)",
                  },
                  {
                    role: "team" as SignupRole,
                    icon: <Users size={18} />,
                    label: "I'm a Team Member",
                    desc: "Work inside the platform on projects",
                    accent: "var(--emerald)",
                    accentDim: "var(--emerald-dim)",
                    accentBorder: "var(--emerald-border)",
                  },
                ].map(item => (
                  <button
                    key={item.role}
                    onClick={() => { setSelectedRole(item.role); setStep(2); }}
                    className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all duration-200"
                    style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = item.accentBorder;
                      (e.currentTarget as HTMLElement).style.background = item.accentDim;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-1)";
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: item.accentDim, border: `1px solid ${item.accentBorder}` }}
                    >
                      <span style={{ color: item.accent }}>{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>{item.desc}</p>
                    </div>
                    <ArrowRight size={16} style={{ color: "var(--text-3)" }} />
                  </button>
                ))}
              </div>

              <p className="text-center text-sm mt-8" style={{ color: "var(--text-2)" }}>
                Already have an account?{" "}
                <Link href="/auth/login" style={{ color: "var(--brand)" }} className="font-medium hover:underline">Sign in</Link>
              </p>
            </motion.div>
          )}

          {/* ── Step 2: Personal details ── */}
          {step === 2 && (
            <motion.div key="s2" {...slide}>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
                style={{ color: "var(--text-2)" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-1)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
              >
                <ArrowLeft size={15} /> Back
              </button>

              <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
                Your details
              </h2>
              <p className="text-sm mb-7" style={{ color: "var(--text-2)" }}>Tell us a bit about yourself</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name" name="firstName" placeholder="Ada" error={errors.firstName} />
                  <Field label="Last Name"  name="lastName"  placeholder="Obi"  error={errors.lastName} />
                </div>
                <Field label="Email" name="email" type="email" placeholder="you@example.com" error={errors.email} />
                <Field
                  label="Password" name="password" type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters" error={errors.password}
                  right={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ color: "var(--text-3)" }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <Field
                  label="Confirm Password" name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat password" error={errors.confirmPassword}
                  right={
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ color: "var(--text-3)" }}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <button onClick={handleNext} className="btn btn-primary btn-full mt-1">
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3 Client: Business ── */}
          {step === 3 && selectedRole === "client" && (
            <motion.div key="s3c" {...slide}>
              <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-sm mb-6 transition-colors" style={{ color: "var(--text-2)" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-1)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
              >
                <ArrowLeft size={15} /> Back
              </button>

              <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
                About your business
              </h2>
              <p className="text-sm mb-7" style={{ color: "var(--text-2)" }}>Optional — helps us serve you better</p>

              <div className="space-y-4">
                <Field label="Company name" name="company" placeholder="Acme Ltd" />
                <Field label="Industry" name="industry" placeholder="E-commerce, SaaS, etc." />
                <Field label="Phone number" name="phone" type="tel" placeholder="+234 000 000 0000" />

                <div className="flex items-start gap-2.5 p-3 rounded-xl mt-2"
                  style={{ background: "var(--brand-dim)", border: "1px solid var(--brand-border)" }}
                >
                  <Shield size={13} style={{ color: "var(--brand)", marginTop: 2 }} />
                  <p className="text-xs" style={{ color: "var(--text-2)" }}>
                    Two-Factor Authentication will be set up after registration.
                  </p>
                </div>

                <motion.button
                  onClick={handleSignup} disabled={isLoading}
                  whileHover={!isLoading ? { scale: 1.01 } : {}} whileTap={!isLoading ? { scale: 0.98 } : {}}
                  className="btn btn-primary btn-full btn-lg"
                >
                  {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {isLoading ? "Creating account…" : "Create Account"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3 Team: Skills ── */}
          {step === 3 && selectedRole === "team" && (
            <motion.div key="s3t" {...slide}>
              <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-sm mb-6 transition-colors" style={{ color: "var(--text-2)" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-1)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
              >
                <ArrowLeft size={15} /> Back
              </button>

              <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
                Your skills
              </h2>
              <p className="text-sm mb-7" style={{ color: "var(--text-2)" }}>Select all that apply</p>

              <div className="flex flex-wrap gap-2 mb-7">
                {skillOptions.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={cn("pill", selectedSkills.includes(skill.id) && "active")}
                  >
                    {skill.icon} {skill.label}
                  </button>
                ))}
              </div>

              <button onClick={handleNext} className="btn btn-primary btn-full">
                Continue <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ── Step 4 Team: Job info ── */}
          {step === 4 && selectedRole === "team" && (
            <motion.div key="s4" {...slide}>
              <button onClick={() => setStep(3)} className="flex items-center gap-1.5 text-sm mb-6 transition-colors" style={{ color: "var(--text-2)" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-1)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
              >
                <ArrowLeft size={15} /> Back
              </button>

              <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
                Almost there
              </h2>
              <p className="text-sm mb-7" style={{ color: "var(--text-2)" }}>Just a couple more details</p>

              <div className="space-y-4">
                <Field label="Job title" name="jobTitle" placeholder="Senior Frontend Engineer" />
                <Field label="Phone number" name="phone" type="tel" placeholder="+234 000 000 0000" />

                <div className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{ background: "var(--emerald-dim)", border: "1px solid var(--emerald-border)" }}
                >
                  <Shield size={13} style={{ color: "var(--emerald)", marginTop: 2 }} />
                  <p className="text-xs" style={{ color: "var(--text-2)" }}>
                    Two-Factor Authentication will be set up after registration.
                  </p>
                </div>

                <motion.button
                  onClick={handleSignup} disabled={isLoading}
                  whileHover={!isLoading ? { scale: 1.01 } : {}} whileTap={!isLoading ? { scale: 0.98 } : {}}
                  className="btn btn-full btn-lg"
                  style={{ background: "var(--emerald)", color: "#fff", boxShadow: "0 4px 20px var(--emerald-border)" }}
                >
                  {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {isLoading ? "Creating account…" : "Create Account"}
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}