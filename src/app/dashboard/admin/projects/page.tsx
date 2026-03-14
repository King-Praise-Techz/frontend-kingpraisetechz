"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FolderKanban, Plus, Search, Calendar, DollarSign,
  Users, TrendingUp, Eye, Trash2, Filter,
} from "lucide-react";
import {
  Badge, Card, SectionHeader, Button, Modal,
  Input, Textarea, Select, EmptyState, Skeleton, StatsCard,
} from "@/components/ui";
import { projectsAPI, teamAPI } from "@/lib/api";
import { Project } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "planning", label: "Planning" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
  { value: "on-hold", label: "On Hold" },
];

const defaultForm = {
  title: "",
  description: "",
  budget: "",
  deliveryDate: "",
  clientEmail: "",
  clientName: "",
  status: "planning",
  category: "",
};

export default function AdminProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectsAPI.getAll(
        statusFilter ? { status: statusFilter } : undefined
      );
      setProjects(res.data?.projects || res.data || []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.clientEmail.trim()) e.clientEmail = "Client email is required";
    if (!form.clientName.trim()) e.clientName = "Client name is required";
    if (!form.budget || isNaN(Number(form.budget))) e.budget = "Valid budget is required";
    if (!form.deliveryDate) e.deliveryDate = "Delivery date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await projectsAPI.create({
        ...form,
        budget: Number(form.budget),
      });
      toast.success("Project created successfully!");
      setShowCreateModal(false);
      setForm(defaultForm);
      setErrors({});
      await fetchProjects();
    } catch (err: any) {
      toast.error(err.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDeleting(id);
    try {
      await projectsAPI.delete(id);
      toast.success("Project deleted");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.clientName?.toLowerCase().includes(q) ||
      p.clientEmail?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "in-progress").length,
    completed: projects.filter((p) => p.status === "completed").length,
    totalBudget: projects.reduce((s, p) => s + (p.budget || 0), 0),
  };

  const statusVariant = (s: string) =>
    s === "completed" ? "success" :
    s === "in-progress" ? "warning" :
    s === "on-hold" ? "danger" : "info";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track all client projects</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => setShowCreateModal(true)}
        >
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Projects"
          value={stats.total}
          icon={<FolderKanban size={20} />}
          iconBg="bg-brand-500/20"
          iconColor="text-brand-400"
          delay={0}
        />
        <StatsCard
          title="Active"
          value={stats.active}
          icon={<TrendingUp size={20} />}
          iconBg="bg-emerald-500/20"
          iconColor="text-emerald-400"
          delay={0.05}
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={<Users size={20} />}
          iconBg="bg-purple-500/20"
          iconColor="text-purple-400"
          delay={0.1}
        />
        <StatsCard
          title="Total Budget"
          value={formatCurrency(stats.totalBudget)}
          icon={<DollarSign size={20} />}
          iconBg="bg-gold-500/20"
          iconColor="text-gold-400"
          delay={0.15}
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input-dark w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
              placeholder="Search projects, clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500 shrink-0" />
            <select
              className="input-dark px-3 py-2.5 rounded-xl text-sm cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: "#1a1a2e" }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Projects List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={28} />}
          title="No projects found"
          description={search || statusFilter ? "Try adjusting your filters" : "Create your first project to get started"}
          action={
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setShowCreateModal(true)}>
              Create Project
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-5 card-hover"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
                    <FolderKanban size={18} className="text-brand-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white text-sm">{project.title}</h3>
                      <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">{project.description}</p>

                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Users size={11} />
                        {project.clientName}
                      </span>
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <DollarSign size={11} />
                        {formatCurrency(project.budget)}
                      </span>
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(project.deliveryDate)}
                      </span>
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <TrendingUp size={11} />
                        {project.progress}% complete
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 progress-bar" style={{ height: 4 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: i * 0.04 + 0.2 }}
                        className="progress-fill h-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/dashboard/admin/projects/${project.id}`}>
                    <button className="w-8 h-8 rounded-lg glass-card border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                      <Eye size={14} />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deleting === project.id}
                    className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {deleting === project.id ? (
                      <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); setForm(defaultForm); setErrors({}); }}
        title="Create New Project"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Project Title *"
              placeholder="e.g. E-commerce Website"
              value={form.title}
              error={errors.title}
              onChange={(e: any) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              label="Category"
              placeholder="e.g. Web Development"
              value={form.category}
              onChange={(e: any) => setForm({ ...form, category: e.target.value })}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Describe the project scope and goals..."
            value={form.description}
            onChange={(e: any) => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Client Name *"
              placeholder="John Doe"
              value={form.clientName}
              error={errors.clientName}
              onChange={(e: any) => setForm({ ...form, clientName: e.target.value })}
            />
            <Input
              label="Client Email *"
              type="email"
              placeholder="client@example.com"
              value={form.clientEmail}
              error={errors.clientEmail}
              onChange={(e: any) => setForm({ ...form, clientEmail: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Budget (NGN) *"
              type="number"
              placeholder="350000"
              value={form.budget}
              error={errors.budget}
              prefix={<DollarSign size={14} />}
              onChange={(e: any) => setForm({ ...form, budget: e.target.value })}
            />
            <Input
              label="Delivery Date *"
              type="date"
              value={form.deliveryDate}
              error={errors.deliveryDate}
              onChange={(e: any) => setForm({ ...form, deliveryDate: e.target.value })}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e: any) => setForm({ ...form, status: e.target.value })}
              options={STATUS_OPTIONS.slice(1)}
            />
          </div>

          <div
            className="p-3 rounded-xl text-xs flex items-start gap-2"
            style={{ background: "var(--brand-dim)", border: "1px solid var(--brand-border)", color: "var(--text-2)" }}
          >
            <TrendingUp size={13} className="shrink-0 mt-0.5" style={{ color: "var(--brand)" }} />
            The client will receive an email notification once the project is created.
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => { setShowCreateModal(false); setForm(defaultForm); setErrors({}); }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              loading={submitting}
              onClick={handleCreate}
              icon={<Plus size={14} />}
            >
              Create Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}