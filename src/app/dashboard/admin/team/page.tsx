"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Crown, Shield, UserCheck, Clock, Plus, Search } from "lucide-react";
import { StatsCard, Badge, Card, Button, Modal, Input, Select, EmptyState, Skeleton } from "@/components/ui";
import { teamAPI } from "@/lib/api";
import { TeamMember } from "@/types";
import { generateAvatarUrl, timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminTeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [promoteForm, setPromoteForm] = useState({
    type: "temporary" as "temporary" | "permanent",
    expiry: "",
  });
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => { fetchTeam(); }, []);

  const fetchTeam = async () => {
    try {
      const res = await teamAPI.getAll();
      setMembers(res.data.members || []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!selectedMember) return;
    setProcessing(selectedMember.id);
    try {
      await teamAPI.promoteToAdmin(selectedMember.id, {
        type: promoteForm.type,
        expiry: promoteForm.type === "temporary" ? promoteForm.expiry : null,
      });
      toast.success(`${selectedMember.name} promoted to admin!`);
      setShowPromoteModal(false);
      setSelectedMember(null);
      fetchTeam();
    } catch {
      toast.error("Failed to promote team member");
    } finally {
      setProcessing(null);
    }
  };

  const handleRevokeAdmin = async (member: any) => {
    setProcessing(member.id);
    try {
      await teamAPI.revokeAdmin(member.id);
      toast.success(`Admin access revoked for ${member.name}`);
      fetchTeam();
    } catch {
      toast.error("Failed to revoke admin access");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = members.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const admins = members.filter((m) => m.role === "admin" || m.isTemporaryAdmin);
  const regularMembers = members.filter((m) => m.role === "team" && !m.isTemporaryAdmin);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Team Management</h1>
        <p className="text-slate-400 mt-1">Manage team members and admin permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Members" value={members.length} icon={<Users size={20} />} iconBg="bg-brand-500/15" iconColor="text-brand-400" glowColor="rgba(26,77,255,0.2)" />
        <StatsCard title="Admins" value={admins.length} icon={<Crown size={20} />} iconBg="bg-gold-500/15" iconColor="text-gold-500" glowColor="rgba(245,158,11,0.2)" />
        <StatsCard title="Team Members" value={regularMembers.length} icon={<UserCheck size={20} />} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" glowColor="rgba(16,185,129,0.2)" />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search team members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
        />
      </div>

      {/* Team list */}
      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="No team members" description="Your team members will appear here" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 card-hover"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={member.avatar || generateAvatarUrl(member.name)}
                    alt={member.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  {(member.role === "admin" || member.isTemporaryAdmin) && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center">
                      <Crown size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold">{member.name}</p>
                    {member.isTemporaryAdmin && (
                      <Badge variant="warning"><Clock size={10} className="mr-1" />Temp Admin</Badge>
                    )}
                    {member.role === "admin" && !member.isTemporaryAdmin && (
                      <Badge variant="success"><Shield size={10} className="mr-1" />Admin</Badge>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm">{member.email}</p>
                  {member.skills?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {member.skills.slice(0, 3).map((skill: string) => (
                        <span key={skill} className="text-xs px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/15">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {member.isTemporaryAdmin && member.temporaryAdminExpiry && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock size={10} />Admin until {new Date(member.temporaryAdminExpiry).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {member.role !== "admin" && !member.isTemporaryAdmin ? (
                  <Button
                    variant="gold"
                    size="sm"
                    className="flex-1"
                    icon={<Crown size={14} />}
                    onClick={() => { setSelectedMember(member); setShowPromoteModal(true); }}
                  >
                    Promote to Admin
                  </Button>
                ) : member.isTemporaryAdmin ? (
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    loading={processing === member.id}
                    onClick={() => handleRevokeAdmin(member)}
                  >
                    Revoke Admin
                  </Button>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Promote Modal */}
      <Modal open={showPromoteModal} onClose={() => { setShowPromoteModal(false); setSelectedMember(null); }} title={`Promote ${selectedMember?.name}`} size="sm">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/20 flex items-start gap-3">
            <Crown size={16} className="text-gold-400 mt-0.5 shrink-0" />
            <p className="text-slate-300 text-sm">
              This will grant {selectedMember?.name} admin access. Their dashboard will switch to the admin view.
            </p>
          </div>

          <Select
            label="Access Type"
            options={[
              { value: "temporary", label: "Temporary Admin" },
              { value: "permanent", label: "Permanent Admin" },
            ]}
            value={promoteForm.type}
            onChange={(e: any) => setPromoteForm({ ...promoteForm, type: e.target.value })}
          />

          {promoteForm.type === "temporary" && (
            <Input
              label="Access Expiry Date *"
              type="datetime-local"
              value={promoteForm.expiry}
              onChange={(e: any) => setPromoteForm({ ...promoteForm, expiry: e.target.value })}
              hint="The team member's dashboard will revert after this date"
            />
          )}

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowPromoteModal(false)}>Cancel</Button>
            <Button
              variant="gold"
              className="flex-1"
              loading={!!processing}
              onClick={handlePromote}
            >
              Confirm Promotion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
