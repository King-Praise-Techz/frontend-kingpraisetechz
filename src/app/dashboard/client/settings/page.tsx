"use client";
import { useState } from "react";
import { User, Bell, Shield, Save, Mail, Phone, Building2 } from "lucide-react";
import { Card, SectionHeader, Input, Button } from "@/components/ui";
import { useAuthStore } from "@/lib/store/authStore";
import { generateAvatarUrl } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ClientSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: "",
    company: "",
  });
  const [notifications, setNotifications] = useState({
    milestoneUpdate: true,
    projectComplete: true,
    emailUpdates: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    updateUser({ name: profile.name });
    toast.success("Profile updated successfully");
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <SectionHeader title="Profile" subtitle="Your personal information" />
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user?.avatar || generateAvatarUrl(user?.name || "Client")}
            alt={user?.name}
            className="w-14 h-14 rounded-xl object-cover border border-white/10"
          />
          <div>
            <p className="text-white font-semibold">{user?.name}</p>
            <p className="text-brand-400 text-sm">Client Account</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input label="Full Name" value={profile.name} onChange={(e: any) => setProfile({ ...profile, name: e.target.value })} prefix={<User size={14} />} />
          <Input label="Email" value={user?.email} disabled prefix={<Mail size={14} />} hint="Email cannot be changed" />
          <Input label="Phone Number" placeholder="+234 xxx xxxx xxx" value={profile.phone} onChange={(e: any) => setProfile({ ...profile, phone: e.target.value })} prefix={<Phone size={14} />} />
          <Input label="Company / Brand" placeholder="Optional" value={profile.company} onChange={(e: any) => setProfile({ ...profile, company: e.target.value })} prefix={<Building2 size={14} />} />
        </div>
        <div className="mt-4">
          <Button variant="primary" icon={<Save size={14} />} loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <SectionHeader title="Notifications" />
        {[
          { key: "milestoneUpdate", label: "Milestone Updates", desc: "Get notified when a milestone is completed" },
          { key: "projectComplete", label: "Project Completion", desc: "Notified when your project is marked complete" },
          { key: "emailUpdates", label: "Email Notifications", desc: "Receive updates via email" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5 mb-3">
            <div>
              <p className="text-white text-sm font-medium">{item.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
            </div>
            <button
              onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
              className={`w-12 h-6 rounded-full transition-all relative ${notifications[item.key as keyof typeof notifications] ? "bg-brand-500" : "bg-white/10"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications[item.key as keyof typeof notifications] ? "left-7" : "left-1"}`} />
            </button>
          </div>
        ))}
      </Card>

      {/* Security */}
      <Card>
        <SectionHeader title="Security" />
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-emerald-400" />
            <div>
              <p className="text-white text-sm font-medium">2FA Enabled</p>
              <p className="text-slate-500 text-xs">Protected with Google Authenticator</p>
            </div>
          </div>
          <span className="text-emerald-400 text-xs font-medium">Active</span>
        </div>
      </Card>
    </div>
  );
}
