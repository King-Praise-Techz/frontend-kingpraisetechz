"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import {
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Users,
  Zap,
  CheckCircle2,
  Crown,
  Building2,
  Phone,
  Code,
  Palette,
  Globe,
  Database,
  LayoutDashboard,
  MessageSquare
} from "lucide-react";

import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";

type SignupRole = "client" | "team";

const skillOptions = [
  { id: "frontend", label: "Frontend Dev", icon: <Code size={14} /> },
  { id: "backend", label: "Backend Dev", icon: <Database size={14} /> },
  { id: "design", label: "UI/UX Design", icon: <Palette size={14} /> },
  { id: "mobile", label: "Mobile Dev", icon: <Phone size={14} /> },
  { id: "devops", label: "DevOps", icon: <Globe size={14} /> },
  { id: "pm", label: "Project Mgmt", icon: <LayoutDashboard size={14} /> },
  { id: "seo", label: "SEO", icon: <Globe size={14} /> },
  { id: "content", label: "Content", icon: <MessageSquare size={14} /> }
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
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    industry: "",
    jobTitle: "",
    phone: ""
  });

  const totalSteps = selectedRole === "team" ? 4 : 3;

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(s => s !== skillId)
        : [...prev, skillId]
    );
  };

  const validateStep2 = () => {

    const errs: Record<string, string> = {};

    if (!formData.firstName.trim()) errs.firstName = "First name required";
    if (!formData.lastName.trim()) errs.lastName = "Last name required";
    if (!formData.email.includes("@")) errs.email = "Enter valid email";
    if (formData.password.length < 8)
      errs.password = "Password must be 8 characters";

    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {

    if (step === 2 && !validateStep2()) return;

    if (step < totalSteps) setStep(p => p + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(p => p - 1);
  };

  const handleSignup = async () => {

    try {

      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: selectedRole!,
        company: formData.company || undefined,
        industry: formData.industry || undefined,
        jobTitle: formData.jobTitle || undefined,
        phone: formData.phone || undefined,
        skills: selectedSkills
      });

      router.push("/auth/2fa?setup=true");

    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-6">

      <div className="w-full max-w-[520px]">

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

          {Array(totalSteps).fill(0).map((_, i) => (

            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                i + 1 <= step ? "bg-indigo-500" : "bg-white/10"
              )}
            />

          ))}

        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1 */}

          {step === 1 && (

            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >

              <h1 className="text-3xl font-bold text-white mb-2">
                Create account
              </h1>

              <p className="text-slate-400 mb-8">
                How are you joining today?
              </p>

              <div className="space-y-4">

                {/* Client */}

                <button
                  onClick={() => {
                    setSelectedRole("client");
                    setStep(2);
                  }}
                  className="w-full p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-indigo-500/40 transition"
                >

                  <div className="flex gap-4">

                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                      <Zap className="text-indigo-400" />
                    </div>

                    <div className="text-left flex-1">

                      <p className="font-semibold text-white">
                        I'm a Client
                      </p>

                      <p className="text-sm text-slate-400">
                        Hire King Praise Techz
                      </p>

                    </div>

                    <ArrowRight className="text-slate-500" />

                  </div>

                </button>

                {/* Team */}

                <button
                  onClick={() => {
                    setSelectedRole("team");
                    setStep(2);
                  }}
                  className="w-full p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/40 transition"
                >

                  <div className="flex gap-4">

                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <Users className="text-emerald-400" />
                    </div>

                    <div className="text-left flex-1">

                      <p className="font-semibold text-white">
                        I'm a Team Member
                      </p>

                      <p className="text-sm text-slate-400">
                        Work inside the platform
                      </p>

                    </div>

                    <ArrowRight className="text-slate-500" />

                  </div>

                </button>

              </div>

              <p className="text-center text-sm text-slate-400 mt-8">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-indigo-400">
                  Sign in
                </Link>
              </p>

            </motion.div>

          )}

          {/* STEP 2 */}

          {step === 2 && (

            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >

              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-400 mb-6"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <h2 className="text-3xl font-bold text-white mb-6">
                Your Details
              </h2>

              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-3">

                  <input
                    placeholder="First Name"
                    className="input"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />

                  <input
                    placeholder="Last Name"
                    className="input"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />

                </div>

                <input
                  placeholder="Email"
                  className="input"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="input pr-10"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>

                </div>

                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="input"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value
                    })
                  }
                />

                <button
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Continue
                  <ArrowRight size={16}/>
                </button>

              </div>

            </motion.div>

          )}

          {/* STEP 3 CLIENT */}

          {step === 3 && selectedRole === "client" && (

            <motion.div
              key="s3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
            >

              <button onClick={handleBack} className="back">
                <ArrowLeft size={16}/> Back
              </button>

              <h2 className="title">About your business</h2>

              <div className="space-y-4">

                <input
                  placeholder="Company"
                  className="input"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />

                <input
                  placeholder="Industry"
                  className="input"
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                />

                <input
                  placeholder="Phone"
                  className="input"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />

                <button
                  onClick={handleSignup}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? "Creating..." : "Create Account"}
                </button>

              </div>

            </motion.div>

          )}

          {/* STEP 3 TEAM */}

          {step === 3 && selectedRole === "team" && (

            <motion.div key="s3team">

              <button onClick={handleBack} className="back">
                <ArrowLeft size={16}/> Back
              </button>

              <h2 className="title">
                Select your skills
              </h2>

              <div className="flex flex-wrap gap-2 mb-6">

                {skillOptions.map(skill => (

                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={cn(
                      "skill-pill",
                      selectedSkills.includes(skill.id) && "skill-active"
                    )}
                  >
                    {skill.icon}
                    {skill.label}
                  </button>

                ))}

              </div>

              <button
                onClick={handleNext}
                className="btn-primary"
              >
                Continue
              </button>

            </motion.div>

          )}

          {/* STEP 4 TEAM */}

          {step === 4 && selectedRole === "team" && (

            <motion.div key="s4">

              <button onClick={handleBack} className="back">
                <ArrowLeft size={16}/> Back
              </button>

              <h2 className="title">
                Almost Done
              </h2>

              <div className="space-y-4">

                <input
                  placeholder="Job Title"
                  className="input"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                />

                <input
                  placeholder="Phone"
                  className="input"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />

                <button
                  onClick={handleSignup}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? "Creating..." : "Create Account"}
                </button>

              </div>

            </motion.div>

          )}

        </AnimatePresence>

      </div>

    </div>
  );
}