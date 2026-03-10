"use client";
import { useState } from "react";
import { User, Shield, Save, Mail, CheckCircle2, Code, Palette, Globe, Database, Phone, LayoutDashboard, MessageSquare } from "lucide-react";
import { Card, SectionHeader, Input, Button } from "@/components/ui";
import { useAuthStore } from "@/lib/store/authStore";
import { generateAvatarUrl, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const skillOptions = [
  { id: "frontend", label: "Frontend Dev", icon: <Code size={13} /> },
  { id: "backend", label: "Backend Dev", icon: <Database size={13} /> },
  { id: "design", label: "UI/UX Design", icon: <Palette size={13} /> },
  { id: "mobile", label: "Mobile Dev", icon: <Phone size={13} /> },
  { id: "devops", label: "DevOps", icon: <Globe size={13} /> },
  { id: "pm", label: "Project Mgmt", icon: <LayoutDashboard size={13} /> },
  { id: "seo", label: "SEO", icon: <Globe size={13} /> },
  { id: "content", label: "Content", icon: <MessageSquare size={13} /> },
];

export default function TeamSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || "" });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    updateUser({ name: profile.name });
    toast.success("Profile updated!");
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your team member profile</p>
      </div>

      <Card>
        <SectionHeader title="Profile" />
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user?.avatar || generateAvatarUrl(user?.name || "Team")}
            alt={user?.name}
            className="w-14 h-14 rounded-xl object-cover border border-white/10"
          />
          <div>
            <p className="text-white font-semibold">{user?.name}</p>
            <p className="text-emerald-400 text-sm">Team Member</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input label="Full Name" value={profile.name} onChange={(e: any) => setProfile({ name: e.target.value })} prefix={<User size={14} />} />
          <Input label="Email" value={user?.email} disabled prefix={<Mail size={14} />} hint="Contact admin to change your email" />
        </div>
        <div className="mt-6">
          <label className="text-sm font-medium text-slate-300 block mb-3">Your Skills</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {skillOptions.map((skill) => (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill.id)}
                className={cn(
                  "p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-all",
                  selectedSkills.includes(skill.id)
                    ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                    : "glass-card border-white/5 text-slate-400 hover:text-white hover:border-white/15"
                )}
              >
                <span className={selectedSkills.includes(skill.id) ? "text-brand-400" : "text-slate-500"}>{skill.icon}</span>
                {skill.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <Button variant="primary" icon={<Save size={14} />} loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Security" />
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-emerald-400" />
            <div>
              <p className="text-white text-sm font-medium">2FA Protected</p>
              <p className="text-slate-500 text-xs">Google Authenticator active</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs font-medium">Enabled</span>
          </div>
        </div>
        {user?.isTemporaryAdmin && (
          <div className="mt-3 p-4 rounded-xl bg-gold-500/10 border border-gold-500/20">
            <p className="text-gold-400 text-sm font-medium">⚡ Temporary Admin Access Active</p>
            <p className="text-slate-400 text-xs mt-1">
              You have temporary admin privileges until {user.temporaryAdminExpiry ? new Date(user.temporaryAdminExpiry).toLocaleDateString() : "—"}.
              Your dashboard will revert to team view after expiry.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
