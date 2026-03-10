"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Clock, DollarSign, Upload, CheckCircle2, Search, FileUp, X } from "lucide-react";
import { Badge, SectionHeader, Card, Button, Modal, EmptyState, Skeleton, Input, Textarea } from "@/components/ui";
import { tasksAPI } from "@/lib/api";
import { Task } from "@/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function TeamTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "in-progress" | "review" | "completed">("all");
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitForm, setSubmitForm] = useState({ description: "", url: "" });
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await tasksAPI.getAll();
      setTasks(res.data.tasks || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDeliverable = async () => {
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("description", submitForm.description);
      formData.append("url", submitForm.url);
      if (file) formData.append("file", file);

      await tasksAPI.update(selectedTask.id, formData);
      toast.success("Deliverable submitted! Admin has been notified.");
      setShowSubmitModal(false);
      setSelectedTask(null);
      setSubmitForm({ description: "", url: "" });
      setFile(null);
      fetchTasks();
    } catch {
      toast.error("Failed to submit deliverable");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = tasks
    .filter((t) => filter === "all" || t.status === filter)
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  const statusFilters = [
    { value: "all", label: "All Tasks", count: tasks.length },
    { value: "pending", label: "Pending", count: tasks.filter(t => t.status === "pending").length },
    { value: "in-progress", label: "In Progress", count: tasks.filter(t => t.status === "in-progress").length },
    { value: "review", label: "In Review", count: tasks.filter(t => t.status === "review").length },
    { value: "completed", label: "Completed", count: tasks.filter(t => t.status === "completed").length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">My Tasks</h1>
        <p className="text-slate-400 mt-1">Manage and submit your assigned work</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as any)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5",
                filter === f.value
                  ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                  : "glass-card text-slate-400 hover:text-white border border-white/5"
              )}
            >
              {f.label}
              <span className={cn("text-xs rounded-full px-1.5 py-0.5 font-bold", filter === f.value ? "bg-brand-500/30 text-brand-300" : "bg-white/10 text-slate-500")}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<CheckSquare size={28} />} title="No tasks found" description={filter === "all" ? "You haven't been assigned any tasks yet" : `No ${filter} tasks`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-white text-base">{task.title}</h3>
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{task.description}</p>
                </div>
                <Badge
                  variant={
                    task.status === "completed" ? "success" :
                      task.status === "review" ? "info" :
                        task.status === "in-progress" ? "warning" : "neutral"
                  }
                >
                  {task.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-gold-500/15 flex items-center justify-center">
                    <DollarSign size={13} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Payment</p>
                    <p className="text-white font-semibold text-sm">{formatCurrency(task.payment)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center">
                    <Clock size={13} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Due Date</p>
                    <p className="text-white font-semibold text-sm">{formatDate(task.dueDate)}</p>
                  </div>
                </div>
              </div>

              {task.status === "completed" && task.deliverable && (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <p className="text-xs text-slate-300">Deliverable submitted</p>
                </div>
              )}

              {task.status !== "completed" && task.status !== "review" && (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  icon={<Upload size={14} />}
                  onClick={() => { setSelectedTask(task); setShowSubmitModal(true); }}
                >
                  Submit Deliverable
                </Button>
              )}

              {task.status === "review" && (
                <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/20 flex items-center gap-2">
                  <Clock size={14} className="text-brand-400 shrink-0" />
                  <p className="text-xs text-slate-300">Awaiting admin review</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Submit Deliverable Modal */}
      <Modal
        open={showSubmitModal}
        onClose={() => { setShowSubmitModal(false); setSelectedTask(null); }}
        title={`Submit: ${selectedTask?.title}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2">
            <FileUp size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300">
              Submit your completed work. The admin (chibuksai@gmail.com) will be notified immediately.
            </p>
          </div>

          <Textarea
            label="Description *"
            placeholder="Describe the work you've completed, any notes for the admin..."
            value={submitForm.description}
            onChange={(e: any) => setSubmitForm({ ...submitForm, description: e.target.value })}
          />

          <Input
            label="Deliverable URL (optional)"
            placeholder="https://github.com/... or hosted link"
            value={submitForm.url}
            onChange={(e: any) => setSubmitForm({ ...submitForm, url: e.target.value })}
          />

          {/* File Upload */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">Upload File (optional)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                file ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/3"
              )}
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileUp size={20} className="text-emerald-400" />
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">{file.name}</p>
                    <p className="text-slate-400 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-red-400 hover:text-red-300">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={24} className="mx-auto mb-2 text-slate-500" />
                  <p className="text-slate-400 text-sm">Click to upload or drag & drop</p>
                  <p className="text-slate-600 text-xs mt-1">Max 10MB</p>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              className="flex-1"
              loading={submitting}
              onClick={handleSubmitDeliverable}
              icon={<Upload size={14} />}
            >
              Submit Work
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
