"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, FolderKanban, Calendar, DollarSign, Users, CheckSquare,
  Upload, Clock, CheckCircle2, AlertCircle, Plus, Edit2
} from "lucide-react";
import {
  Badge, ProgressBar, Card, SectionHeader, Button, Modal, Input,
  Textarea, EmptyState, Skeleton
} from "@/components/ui";
import { projectsAPI, tasksAPI } from "@/lib/api";
import { Project, Task, Milestone } from "@/types";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: "", description: "", dueDate: "", order: "1" });

  useEffect(() => {
    if (id) {
      projectsAPI.getById(id as string)
        .then((res) => setProject(res.data.project || res.data))
        .catch(() => toast.error("Failed to load project"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleAddMilestone = async () => {
    if (!project) return;
    setSubmitting(true);
    try {
      await projectsAPI.uploadMilestone(project.id, {
        ...milestoneForm,
        order: parseInt(milestoneForm.order),
      });
      toast.success("Milestone added! Client has been notified by email.");
      setShowMilestoneModal(false);
      setMilestoneForm({ title: "", description: "", dueDate: "", order: "1" });
      const res = await projectsAPI.getById(project.id);
      setProject(res.data.project || res.data);
    } catch {
      toast.error("Failed to add milestone");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMilestone = async (milestoneId: string, data: Partial<Milestone>) => {
    if (!project) return;
    try {
      await projectsAPI.updateMilestone(project.id, milestoneId, data);
      toast.success("Milestone updated");
      const res = await projectsAPI.getById(project.id);
      setProject(res.data.project || res.data);
    } catch {
      toast.error("Failed to update milestone");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState
        icon={<FolderKanban size={28} />}
        title="Project not found"
        description="This project may have been deleted or doesn't exist"
        action={<Button variant="primary" onClick={() => router.push("/dashboard/admin/projects")}>Back to Projects</Button>}
      />
    );
  }

  const statusVariant = project.status === "completed" ? "success" : project.status === "in-progress" ? "warning" : project.status === "on-hold" ? "danger" : "info";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/admin/projects">
          <button className="mt-1 w-9 h-9 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5">
            <ArrowLeft size={16} />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-bold text-3xl text-white">{project.title}</h1>
            <Badge variant={statusVariant}>{project.status}</Badge>
          </div>
          <p className="text-slate-400 mt-1">{project.description}</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowMilestoneModal(true)}>
          Add Milestone
        </Button>
      </div>

      {/* Key Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Budget", value: formatCurrency(project.budget), icon: <DollarSign size={16} className="text-gold-400" />, bg: "bg-gold-500/10" },
          { label: "Delivery Date", value: formatDate(project.deliveryDate), icon: <Calendar size={16} className="text-brand-400" />, bg: "bg-brand-500/10" },
          { label: "Team Members", value: `${project.assignedTeam?.length || 0} members`, icon: <Users size={16} className="text-emerald-400" />, bg: "bg-emerald-500/10" },
          { label: "Tasks", value: `${project.tasks?.filter(t => t.status === "completed").length || 0}/${project.tasks?.length || 0} done`, icon: <CheckSquare size={16} className="text-purple-400" />, bg: "bg-purple-500/10" },
        ].map((item) => (
          <div key={item.label} className="glass-card p-4">
            <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-3`}>
              {item.icon}
            </div>
            <p className="text-slate-400 text-xs">{item.label}</p>
            <p className="text-white font-semibold text-sm mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <Card>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-semibold">Overall Progress</h3>
          <span className="text-white font-bold text-lg">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} height={10} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <Card>
          <SectionHeader
            title="Milestones"
            action={
              <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setShowMilestoneModal(true)}>Add</Button>
            }
          />
          {!project.milestones?.length ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle2 size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No milestones yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {project.milestones.map((m, i) => (
                <div key={m.id} className="p-4 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${m.status === "completed" ? "bg-emerald-500" : m.status === "in-progress" ? "bg-brand-500" : "bg-white/10 border border-white/15"}`}>
                        {m.status === "completed" ? <CheckCircle2 size={13} className="text-white" /> : <span className="text-xs text-slate-300 font-bold">{i + 1}</span>}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{m.title}</p>
                        {m.description && <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{m.description}</p>}
                        <p className="text-slate-500 text-xs mt-1 flex items-center gap-1"><Clock size={10} />Due {formatDate(m.dueDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={m.status === "completed" ? "success" : m.status === "in-progress" ? "warning" : "neutral"}>
                        {m.status}
                      </Badge>
                    </div>
                  </div>
                  {m.status !== "completed" && (
                    <div className="flex gap-2 mt-3">
                      {m.status === "pending" && (
                        <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleUpdateMilestone(m.id, { status: "in-progress" })}>
                          Start
                        </Button>
                      )}
                      <Button variant="primary" size="sm" className="flex-1" onClick={() => handleUpdateMilestone(m.id, { status: "completed" })}>
                        Mark Complete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tasks */}
        <Card>
          <SectionHeader title="Assigned Tasks" subtitle={`${project.tasks?.length || 0} total tasks`} />
          {!project.tasks?.length ? (
            <div className="text-center py-8 text-slate-500">
              <CheckSquare size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No tasks assigned</p>
            </div>
          ) : (
            <div className="space-y-3">
              {project.tasks.map((task) => (
                <div key={task.id} className="p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-white text-sm font-medium">{task.title}</p>
                    <Badge variant={task.status === "completed" ? "success" : task.status === "review" ? "info" : task.status === "in-progress" ? "warning" : "neutral"}>
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-xs">{task.assignedToName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gold-400 font-medium">{formatCurrency(task.payment)}</span>
                    <span className="text-xs text-slate-500">Due {formatDate(task.dueDate)}</span>
                  </div>
                  {task.status === "review" && task.deliverable && (
                    <div className="mt-2 p-2 rounded-lg bg-brand-500/10 border border-brand-500/20">
                      <p className="text-xs text-brand-400 font-medium">Deliverable submitted — awaiting review</p>
                      {task.deliverableUrl && (
                        <a href={task.deliverableUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-300 hover:text-brand-200 underline mt-0.5 block">
                          View deliverable
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Client Info */}
      <Card>
        <SectionHeader title="Client Information" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold font-display text-lg">
            {project.clientName[0]}
          </div>
          <div>
            <p className="text-white font-semibold">{project.clientName}</p>
            <p className="text-slate-400 text-sm">{project.clientEmail}</p>
          </div>
        </div>
      </Card>

      {/* Add Milestone Modal */}
      <Modal open={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Add Project Milestone" size="md">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/20 flex items-start gap-2">
            <AlertCircle size={14} className="text-brand-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300">
              This milestone will be sent to {project.clientEmail} by email and appear on their dashboard.
            </p>
          </div>
          <Input label="Milestone Title *" placeholder="e.g., Homepage Design Approved" value={milestoneForm.title} onChange={(e: any) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} />
          <Textarea label="Description" placeholder="What was achieved in this milestone?" value={milestoneForm.description} onChange={(e: any) => setMilestoneForm({ ...milestoneForm, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Due Date *" type="date" value={milestoneForm.dueDate} onChange={(e: any) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })} />
            <Input label="Order" type="number" value={milestoneForm.order} onChange={(e: any) => setMilestoneForm({ ...milestoneForm, order: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowMilestoneModal(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" loading={submitting} onClick={handleAddMilestone} icon={<Upload size={14} />}>
              Add Milestone
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
