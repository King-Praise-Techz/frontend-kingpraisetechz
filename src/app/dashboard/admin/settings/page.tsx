"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, Bell, Key, Camera, Save, Eye, EyeOff } from "lucide-react";
import { Card, SectionHeader, Button, Input, Badge } from "@/components/ui";
import { useAuthStore } from "@/lib/store/authStore";
import { apiClient } from "@/lib/api";
import { generateAvatarUrl } from "@/lib/utils";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    company: "",
    bio: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={16} /> },
    { id: "security", label: "Security", icon: <Shield size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  ];

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await apiClient.put("/auth/profile", profileForm);
      updateUser({ name: profileForm.name, email: profileForm.email });
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await apiClient.put("/auth/password", { current: passwordForm.current, new: passwordForm.new });
      toast.success("Password changed successfully!");
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch {
      toast.error("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Avatar */}
          <Card>
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={user?.avatar || generateAvatarUrl(user?.name || "User")}
                  alt={user?.name}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center hover:bg-brand-400 transition-colors">
                  <Camera size={14} className="text-white" />
                </button>
              </div>
              <div>
                <p className="text-white font-semibold">{user?.name}</p>
                <p className="text-slate-400 text-sm">{user?.email}</p>
                <div className="mt-2">
                  <Badge variant={user?.role === "admin" ? "warning" : user?.role === "team" ? "success" : "info"}>
                    {user?.role === "admin" ? "Administrator" : user?.role === "team" ? "Team Member" : "Client"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Personal Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileForm.name}
                onChange={(e: any) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                value={profileForm.email}
                onChange={(e: any) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
              <Input
                label="Phone Number"
                value={profileForm.phone}
                onChange={(e: any) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+234 000 000 0000"
              />
              <Input
                label="Company (optional)"
                value={profileForm.company}
                onChange={(e: any) => setProfileForm({ ...profileForm, company: e.target.value })}
                placeholder="Your company name"
              />
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-slate-300 block mb-2">Bio</label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="A brief description about yourself..."
                rows={3}
                className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="primary" icon={<Save size={16} />} loading={saving} onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <SectionHeader title="Change Password" />
            <div className="space-y-4 max-w-sm">
              {(["current", "new", "confirm"] as const).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-slate-300 block mb-2 capitalize">
                    {field === "current" ? "Current Password" : field === "new" ? "New Password" : "Confirm New Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords[field] ? "text" : "password"}
                      value={passwordForm[field]}
                      onChange={(e) => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                      placeholder="••••••••"
                      className="input-dark w-full px-4 py-3 rounded-xl text-sm pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPasswords[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <Button variant="primary" icon={<Key size={16} />} loading={saving} onClick={handleChangePassword}>
                Update Password
              </Button>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Two-Factor Authentication" subtitle="Protect your account with Google Authenticator" />
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Shield size={18} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">2FA Status</p>
                  <p className="text-slate-400 text-xs">{user?.twoFactorEnabled ? "Enabled and active" : "Not yet configured"}</p>
                </div>
              </div>
              <Badge variant={user?.twoFactorEnabled ? "success" : "warning"}>
                {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <SectionHeader title="Notification Preferences" />
            <div className="space-y-4">
              {[
                { label: "Project Updates", desc: "Get notified when project status changes", enabled: true },
                { label: "Milestone Alerts", desc: "Receive alerts when milestones are added", enabled: true },
                { label: "Task Assignments", desc: "Get notified when assigned new tasks", enabled: true },
                { label: "Review Updates", desc: "Updates on review approval status", enabled: false },
                { label: "Email Digests", desc: "Weekly summary of your activity", enabled: false },
              ].map((notif) => (
                <div key={notif.label} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
                  <div>
                    <p className="text-white font-medium text-sm">{notif.label}</p>
                    <p className="text-slate-400 text-xs">{notif.desc}</p>
                  </div>
                  <button className={`relative w-11 h-6 rounded-full transition-all ${notif.enabled ? "bg-brand-500" : "bg-white/10"}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notif.enabled ? "left-6" : "left-1"}`} />
                  </button>
                </div>
              ))}
              <div className="flex justify-end">
                <Button variant="primary" icon={<Save size={16} />}>Save Preferences</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
