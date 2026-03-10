"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Shield, Eye, EyeOff, ArrowRight, ArrowLeft,
  Zap, Users, CheckCircle2, Crown, Building2,
  Phone, Code, Palette, Globe, Database, LayoutDashboard, MessageSquare,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";

type SignupRole = "client" | "team";

const skillOptions = [
  { id: "frontend", label: "Frontend Dev",  icon: <Code size={14} /> },
  { id: "backend",  label: "Backend Dev",   icon: <Database size={14} /> },
  { id: "design",   label: "UI/UX Design",  icon: <Palette size={14} /> },
  { id: "mobile",   label: "Mobile Dev",    icon: <Phone size={14} /> },
  { id: "devops",   label: "DevOps",        icon: <Globe size={14} /> },
  { id: "pm",       label: "Project Mgmt",  icon: <LayoutDashboard size={14} /> },
  { id: "seo",      label: "SEO",           icon: <Globe size={14} /> },
  { id: "content",  label: "Content",       icon: <MessageSquare size={14} /> },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    industry: "",
    jobTitle: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = selectedRole === "team" ? 4 : 3;

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim())  errs.lastName  = "Last name is required";
    if (!formData.email.includes("@")) errs.email = "Valid email required";
    if (formData.password.length < 8)  errs.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const toggleSkill = (skillId: string) =>
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );

  const handleNext = () => {
    if (step === 2 && !validateStep2()) return;
    if (step < totalSteps) setStep((p) => p + 1);
  };
  const handleBack = () => step > 1 && setStep((p) => p - 1);

  const handleSignup = async () => {
    try {
      await signup({
        firstName: formData.firstName,
        lastName:  formData.lastName,
        email:     formData.email,
        password:  formData.password,
        role:      selectedRole!,
        company:   formData.company   || undefined,
        industry:  formData.industry  || undefined,
        jobTitle:  formData.jobTitle  || undefined,
        phone:     formData.phone     || undefined,
        skills:    selectedSkills,
      });
      router.push("/auth/2fa?setup=true");
    } catch {
      // error handled in store
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(26,77,255,0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.1) 0%, transparent 50%)" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl btn-glow flex items-center justify-center">
            <Crown size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">King Praise Techz</span>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="font-display font-bold text-4xl text-white">
            Join the <span className="gradient-text">future</span><br />of web agencies
          </h1>
          <p className="text-slate-400 leading-relaxed">
            Get seamless project tracking, real-time collaboration, and professional deliverables — all in one platform.
          </p>
          <div className="space-y-3">
            {["Track projects and milestones in real-time", "2FA security for every account", "Role-based dashboards for clients and team"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <Shield size={16} className="text-slate-500" />
          <span className="text-slate-500 text-sm">Enterprise-grade security</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg btn-glow flex items-center justify-center">
              <Crown size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">King Praise Techz</span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {Array(totalSteps || 3).fill(0).map((_, i) => (
              <div
                key={i}
                className={cn("h-1 flex-1 rounded-full transition-all duration-500",
                  i + 1 <= step ? "bg-brand-500" : "bg-white/10"
                )}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1 – Role Selection */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display font-bold text-3xl text-white mb-2">Create account</h2>
                <p className="text-slate-400 mb-8">How are you joining us today?</p>
                <div className="space-y-4">
                  {[
                    { role: "client" as SignupRole, label: "I&apos;m a Client", desc: "I want to hire King Praise Techz for a project", tags: ["Project Tracking", "Milestones", "Reviews"], icon: <Zap size={22} className="text-brand-400" />, bg: "bg-brand-500/10", border: "hover:border-brand-500/40" },
                    { role: "team"   as SignupRole, label: "I&apos;m a Team Member", desc: "I&apos;m part of the KPT team", tags: ["Tasks", "Payments", "Deliverables"], icon: <Users size={22} className="text-emerald-400" />, bg: "bg-emerald-500/10", border: "hover:border-emerald-500/40" },
                  ].map(({ role, label, desc, tags, icon, bg, border }) => (
                    <motion.button
                      key={role}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => { setSelectedRole(role); setStep(2); }}
                      className={cn("w-full glass-card p-6 text-left border border-white/5 transition-all card-hover", border)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", bg)}>{icon}</div>
                        <div className="flex-1">
                          <p className="font-display font-bold text-white text-lg" dangerouslySetInnerHTML={{ __html: label }} />
                          <p className="text-slate-400 text-sm mt-1" dangerouslySetInnerHTML={{ __html: desc }} />
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {tags.map((t) => (
                              <span key={t} className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-400 border border-white/8">{t}</span>
                            ))}
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-500 mt-2 shrink-0" />
                      </div>
                    </motion.button>
                  ))}
                </div>
                <p className="text-center text-slate-400 text-sm mt-8">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* Step 2 – Account Info */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
                  <ArrowLeft size={16} /> Back
                </button>
                <h2 className="font-display font-bold text-3xl text-white mb-2">Your Details</h2>
                <p className="text-slate-400 mb-6">Fill in your account information</p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1.5">First Name</label>
                      <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="John" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
                      {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1.5">Last Name</label>
                      <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Doe" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
                      {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Email Address</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Min. 8 characters" className="input-dark w-full px-4 py-3 rounded-xl text-sm pr-12" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Repeat your password" className="input-dark w-full px-4 py-3 rounded-xl text-sm pr-12" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <button onClick={handleNext} className="w-full py-3.5 rounded-xl font-semibold text-white btn-glow flex items-center justify-center gap-2 mt-2">
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 – Role-specific info */}
            {step === 3 && selectedRole && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
                  <ArrowLeft size={16} /> Back
                </button>

                {selectedRole === "client" ? (
                  <>
                    <h2 className="font-display font-bold text-3xl text-white mb-2">About your business</h2>
                    <p className="text-slate-400 mb-6">Tell us a bit about your company</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-1.5">Company Name (optional)</label>
                        <div className="relative">
                          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Acme Corp" className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-1.5">Industry (optional)</label>
                        <input type="text" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} placeholder="e.g. E-commerce, Finance..." className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-1.5">Phone (optional)</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+234 800 0000 000" className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm" />
                        </div>
                      </div>
                      <button onClick={handleSignup} disabled={isLoading} className="w-full py-3.5 rounded-xl font-semibold text-white btn-glow flex items-center justify-center gap-2 disabled:opacity-50">
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="font-display font-bold text-3xl text-white mb-2">Your skills</h2>
                    <p className="text-slate-400 mb-6">Select your areas of expertise</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {skillOptions.map((skill) => (
                        <button
                          key={skill.id}
                          onClick={() => toggleSkill(skill.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                            selectedSkills.includes(skill.id)
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"
                          )}
                        >
                          {skill.icon} {skill.label}
                        </button>
                      ))}
                    </div>
                    <button onClick={handleNext} className="w-full py-3.5 rounded-xl font-semibold text-white btn-glow flex items-center justify-center gap-2">
                      Continue <ArrowRight size={16} />
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 4 – Team: job title & confirm */}
            {step === 4 && selectedRole === "team" && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
                  <ArrowLeft size={16} /> Back
                </button>
                <h2 className="font-display font-bold text-3xl text-white mb-2">Almost done!</h2>
                <p className="text-slate-400 mb-6">A few more details to complete your profile</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Job Title (optional)</label>
                    <input type="text" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} placeholder="e.g. Full-Stack Developer" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Phone (optional)</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+234 800 0000 000" className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={14} className="text-brand-400" />
                      <p className="text-xs font-medium text-brand-300">2FA Setup Required</p>
                    </div>
                    <p className="text-xs text-slate-400">After creating your account, you&apos;ll need to set up two-factor authentication before accessing your dashboard.</p>
                  </div>
                  <button onClick={handleSignup} disabled={isLoading} className="w-full py-3.5 rounded-xl font-semibold text-white btn-glow flex items-center justify-center gap-2 disabled:opacity-50">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
