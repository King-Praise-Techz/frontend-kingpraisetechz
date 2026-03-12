"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  FolderKanban,
  Calendar,
  DollarSign,
  Users,
  CheckSquare,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";

import {
  Badge,
  ProgressBar,
  Card,
  SectionHeader,
  Button,
  Modal,
  Input,
  Textarea,
  EmptyState,
  Skeleton,
} from "@/components/ui";

import { projectsAPI } from "@/lib/api";
import { Project, Task, Milestone } from "@/types";

import { formatCurrency, formatDate } from "@/lib/utils";

import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    order: "1",
  });

  const refreshProject = async (projectId: string) => {
    try {
      const res = await projectsAPI.getById(projectId);
      setProject(res.data?.project || res.data);
    } catch {
      toast.error("Failed to refresh project");
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        const res = await projectsAPI.getById(id);
        setProject(res.data?.project || res.data);
      } catch {
        toast.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleAddMilestone = async () => {
    if (!project?.id) return;

    setSubmitting(true);

    try {
      await projectsAPI.update(project.id, {
        ...milestoneForm,
        order: parseInt(milestoneForm.order),
      });

      toast.success("Milestone added! Client has been notified by email.");

      setShowMilestoneModal(false);

      setMilestoneForm({
        title: "",
        description: "",
        dueDate: "",
        order: "1",
      });

      await refreshProject(project.id);
    } catch {
      toast.error("Failed to add milestone");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMilestone = async (
    milestoneId: string,
    data: Partial<Milestone>
  ) => {
    if (!project?.id) return;

    try {
      await projectsAPI.update(project.id, milestoneId);
      toast.success("Milestone updated");
      await refreshProject(project.id);
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
        action={
          <Button
            variant="primary"
            onClick={() => router.push("/dashboard/admin/projects")}
          >
            Back to Projects
          </Button>
        }
      />
    );
  }

  const completedTasks =
    project.tasks?.filter((t: Task) => t.status === "completed").length || 0;

  const totalTasks = project.tasks?.length || 0;

  const statusVariant =
    project.status === "completed"
      ? "success"
      : project.status === "in-progress"
      ? "warning"
      : project.status === "on-hold"
      ? "danger"
      : "info";

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
            <h1 className="font-display font-bold text-3xl text-white">
              {project.title}
            </h1>

            <Badge variant={statusVariant}>{project.status}</Badge>
          </div>

          <p className="text-slate-400 mt-1">{project.description}</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => setShowMilestoneModal(true)}
        >
          Add Milestone
        </Button>
      </div>

      {/* Info Grid */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Budget",
            value: formatCurrency(project.budget ?? 0),
            icon: <DollarSign size={16} />,
          },
          {
            label: "Delivery Date",
            value: formatDate(project.deliveryDate ?? ""),
            icon: <Calendar size={16} />,
          },
          {
            label: "Team Members",
            value: `${project.assignedTeam?.length || 0} members`,
            icon: <Users size={16} />,
          },
          {
            label: "Tasks",
            value: `${completedTasks}/${totalTasks} done`,
            icon: <CheckSquare size={16} />,
          },
        ].map((item) => (
          <div key={item.label} className="glass-card p-4">
            <div className="mb-3">{item.icon}</div>

            <p className="text-slate-400 text-xs">{item.label}</p>

            <p className="text-white font-semibold text-sm mt-0.5">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Progress */}

      <Card>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-semibold">Overall Progress</h3>

          <span className="text-white font-bold text-lg">
            {project.progress ?? 0}%
          </span>
        </div>

        <ProgressBar value={project.progress ?? 0} height={10} />
      </Card>

      {/* Milestones */}

      <Card>
        <SectionHeader
          title="Milestones"
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setShowMilestoneModal(true)}
            >
              Add
            </Button>
          }
        />

        {!project.milestones?.length ? (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle2 size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No milestones yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.milestones.map((m: Milestone, i: number) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-white/3 border border-white/5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10">
                      <span className="text-xs text-slate-300 font-bold">
                        {i + 1}
                      </span>
                    </div>

                    <div>
                      <p className="text-white font-medium text-sm">
                        {m.title}
                      </p>

                      {m.description && (
                        <p className="text-slate-400 text-xs mt-0.5">
                          {m.description}
                        </p>
                      )}

                      <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        Due {formatDate(m.dueDate)}
                      </p>
                    </div>
                  </div>

                  <Badge variant="neutral">{m.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Client Info */}

      <Card>
        <SectionHeader title="Client Information" />

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
            {project.clientName?.charAt(0) || "C"}
          </div>

          <div>
            <p className="text-white font-semibold">{project.clientName}</p>
            <p className="text-slate-400 text-sm">{project.clientEmail}</p>
          </div>
        </div>
      </Card>

      {/* Add Milestone Modal */}

      <Modal
        open={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        title="Add Project Milestone"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Milestone Title *"
            value={milestoneForm.title}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setMilestoneForm({ ...milestoneForm, title: e.target.value })
            }
          />

          <Textarea
            label="Description"
            value={milestoneForm.description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setMilestoneForm({
                ...milestoneForm,
                description: e.target.value,
              })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={milestoneForm.dueDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMilestoneForm({
                  ...milestoneForm,
                  dueDate: e.target.value,
                })
              }
            />

            <Input
              label="Order"
              type="number"
              value={milestoneForm.order}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMilestoneForm({
                  ...milestoneForm,
                  order: e.target.value,
                })
              }
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowMilestoneModal(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              className="flex-1"
              loading={submitting}
              onClick={handleAddMilestone}
              icon={<Upload size={14} />}
            >
              Add Milestone
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}