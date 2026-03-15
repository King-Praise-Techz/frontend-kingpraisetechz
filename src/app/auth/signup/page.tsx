"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Shield, Eye, EyeOff, ArrowRight, Users, Zap,
  Crown, Code, Palette, Globe, Database,
  LayoutDashboard, MessageSquare, Phone, CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";

type SignupRole = "client" | "team";

const skillOptions = [
  { id: "frontend", label: "Frontend Dev",   icon: <Code            size={13} /> },
  { id: "backend",  label: "Backend Dev",    icon: <Database        size={13} /> },
  { id: "design",   label: "UI/UX Design",   icon: <Palette         size={13} /> },
  { id: "mobile",   label: "Mobile Dev",     icon: <Phone           size={13} /> },
  { id: "devops",   label: "DevOps",         icon: <Globe           size={13} /> },
  { id: "pm",       label: "Project Mgmt",   icon: <LayoutDashboard size={13} /> },
  { id: "seo",      label: "SEO",            icon: <Globe           size={13} /> },
  { id: "content",  label: "Content",        icon: <MessageSquare   size={13} /> },
];

// ─── tiny helpers ────────────────────────────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs font-medium uppercase tracking-wide block mb-1.5"
         style={{ color: "var(--text-3)" }}>
    {children}
  </label>
);

const ErrorMsg = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-xs mt-1" style={{ color: "var(--rose)" }}>{msg}</p> : null;

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-5">
    <p className="text-base font-semibold" style={{ color: "var(--text-1)" }}>{title}</p>
    <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{subtitle}</p>
  </div>
);

const Divider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 my-6">
    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>{label}</span>
    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
  </div>
);

// ─── main component ───────────────────────────────────────────────────────────
export default function SignupPage() {
  const router   = useRouter();
  const { signup, isLoading } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null);
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "",
    company: "", industry: "", jobTitle: "", phone: "",
  });

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const toggleSkill = (id: string) =>
    setSelectedSkills(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

  // ── validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedRole)                        e.role            = "Please choose how you're joining";
    if (!formData.firstName.trim())           e.firstName       = "Required";
    if (!formData.lastName.trim())            e.lastName        = "Required";
    if (!formData.email.includes("@"))        e.email           = "Enter a valid email address";
    if (formData.password.length < 8)         e.password        = "Minimum 8 characters";
    if (formData.password !== formData.confirmPassword)
                                              e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── submit ───────────────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!validate()) {
      // scroll to first error
      const el = document.querySelector("[data-error]");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    try {
      await signup({
        firstName: formData.firstName, lastName: formData.lastName,
        email: formData.email,         password: formData.password,
        role:  selectedRole!,
        company:  formData.company   || undefined,
        industry: formData.industry  || undefined,
        jobTitle: formData.jobTitle  || undefined,
        phone:    formData.phone     || undefined,
        skills:   selectedSkills,
      });
      setSubmitted(true);
      setTimeout(() => router.push("/auth/2fa?setup=true"), 1200);
    } catch {}
  };

  // ── field component (inline, keeps code readable) ───────────────────────────
  const Field = ({
    label, fieldKey, type = "text", placeholder, right, optional,
  }: {
    label: string; fieldKey: string; type?: string;
    placeholder?: string; right?: React.ReactNode; optional?: boolean;
  }) => {
    const err = errors[fieldKey];
    return (
      <div data-error={err ? true : undefined}>
        <Label>
          {label}
          {optional && (
            <span className="ml-1 normal-case" style={{ color: "var(--text-3)", fontWeight: 400 }}>
              — optional
            </span>
          )}
        </Label>
        <div className="relative">
          <input
            type={type}
            placeholder={placeholder}
            value={(formData as any)[fieldKey]}
            onChange={set(fieldKey)}
            className={cn("input", right && "pr-11", err && "err")}
            autoComplete={
              fieldKey === "email" ? "email" :
              fieldKey === "password" ? "new-password" :
              fieldKey === "confirmPassword" ? "new-password" : "on"
            }
          />
          {right && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
          )}
        </div>
        <ErrorMsg msg={err} />
      </div>
    );
  };

  // ── success overlay ──────────────────────────────────────────────────────────
  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-3"
      >
        <CheckCircle2 size={52} style={{ color: "var(--emerald)", margin: "0 auto" }} />
        <p className="text-xl font-bold" style={{ color: "var(--text-1)" }}>Account created!</p>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>Redirecting to 2FA setup…</p>
      </motion.div>
    </div>
  );

  // ── main render ──────────────────────────────────────────────────────────────
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
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[520px]"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--brand), #818cf8)", boxShadow: "0 4px 20px var(--brand-glow)" }}
          >
            <Crown size={17} color="#fff" />
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
            King Praise Techz
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
        >
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
            Create your account
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "var(--brand)" }} className="font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <div className="space-y-5">

            {/* ── Section 1: Role ─────────────────────────────────────────────── */}
            <SectionHeading title="How are you joining?" subtitle="This determines what you can do on the platform" />

            <div className="grid grid-cols-2 gap-3" data-error={errors.role ? true : undefined}>
              {[
                {
                  role: "client" as SignupRole,
                  icon: <Zap size={17} />,
                  label: "Client",
                  desc: "Hire for your project",
                  accent: "var(--brand)",
                  accentDim: "var(--brand-dim)",
                  accentBorder: "var(--brand-border)",
                },
                {
                  role: "team" as SignupRole,
                  icon: <Users size={17} />,
                  label: "Team Member",
                  desc: "Work on projects",
                  accent: "var(--emerald)",
                  accentDim: "var(--emerald-dim)",
                  accentBorder: "var(--emerald-border)",
                },
              ].map(item => {
                const isSelected = selectedRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => { setSelectedRole(item.role); setErrors(p => ({ ...p, role: "" })); }}
                    className="p-4 rounded-2xl flex flex-col items-center gap-2 text-center transition-all duration-200 cursor-pointer"
                    style={{
                      background: isSelected ? item.accentDim : "var(--surface-2)",
                      border: `1.5px solid ${isSelected ? item.accentBorder : "var(--border)"}`,
                      boxShadow: isSelected ? `0 0 0 3px ${item.accentBorder}` : "none",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: isSelected ? item.accentDim : "var(--surface-3)",
                        border: `1px solid ${isSelected ? item.accentBorder : "var(--border)"}`,
                      }}
                    >
                      <span style={{ color: isSelected ? item.accent : "var(--text-3)" }}>
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: isSelected ? item.accent : "var(--text-1)" }}>
                        {item.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <ErrorMsg msg={errors.role} />

            <Divider label="Personal details" />

            {/* ── Section 2: Name ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" fieldKey="firstName" placeholder="Ada" />
              <Field label="Last name"  fieldKey="lastName"  placeholder="Obi" />
            </div>

            <Field label="Email address" fieldKey="email" type="email" placeholder="you@example.com" />

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Password" fieldKey="password"
                type={showPw ? "text" : "password"} placeholder="Min 8 chars"
                right={
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ color: "var(--text-3)" }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <Field
                label="Confirm password" fieldKey="confirmPassword"
                type={showCpw ? "text" : "password"} placeholder="Repeat"
                right={
                  <button type="button" onClick={() => setShowCpw(!showCpw)} style={{ color: "var(--text-3)" }}>
                    {showCpw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
            </div>

            {/* ── Section 3: Skills (team only) ───────────────────────────────── */}
            <AnimatePresence>
              {selectedRole === "team" && (
                <motion.div
                  key="skills-section"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <Divider label="Your skills" />
                  <SectionHeading title="What do you specialise in?" subtitle="Select all that apply — you can update this later" />
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map(skill => (
                      <button
                        key={skill.id} type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={cn("pill", selectedSkills.includes(skill.id) && "active")}
                      >
                        {skill.icon} {skill.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Divider label="Extra info" />

            {/* ── Section 4: Optional extras ──────────────────────────────────── */}
            <SectionHeading
              title={selectedRole === "team" ? "Job details" : "Business details"}
              subtitle="Optional — helps us serve you better"
            />

            <AnimatePresence mode="wait">
              {selectedRole === "client" && (
                <motion.div key="client-extras"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Company" fieldKey="company" placeholder="Acme Ltd" optional />
                    <Field label="Industry" fieldKey="industry" placeholder="E-commerce" optional />
                  </div>
                  <Field label="Phone number" fieldKey="phone" type="tel" placeholder="+234 000 000 0000" optional />
                </motion.div>
              )}
              {selectedRole === "team" && (
                <motion.div key="team-extras"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Job title" fieldKey="jobTitle" placeholder="Frontend Engineer" optional />
                    <Field label="Phone number" fieldKey="phone" type="tel" placeholder="+234 000 000" optional />
                  </div>
                </motion.div>
              )}
              {!selectedRole && (
                <motion.div key="placeholder"
                  initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
                  className="h-16 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: "var(--surface-2)", border: "1px dashed var(--border)", color: "var(--text-3)" }}
                >
                  Select your role above to see relevant fields
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── 2FA notice ─────────────────────────────────────────────────── */}
            <div
              className="flex items-start gap-2.5 p-3 rounded-xl"
              style={{ background: "var(--brand-dim)", border: "1px solid var(--brand-border)" }}
            >
              <Shield size={13} style={{ color: "var(--brand)", marginTop: 2, flexShrink: 0 }} />
              <p className="text-xs" style={{ color: "var(--text-2)" }}>
                Two-Factor Authentication will be configured after your account is created to keep your account secure.
              </p>
            </div>

            {/* ── Submit ─────────────────────────────────────────────────────── */}
            <motion.button
              type="button"
              onClick={handleSignup}
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.01 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 4 }}
            >
              {isLoading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>
                : <> Create Account <ArrowRight size={15} /></>
              }
            </motion.button>

          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-3)" }}>
          By creating an account, you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--brand)" }} className="hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" style={{ color: "var(--brand)" }} className="hover:underline">Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  );
}