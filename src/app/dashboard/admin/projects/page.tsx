"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban, Plus, Search, Calendar, DollarSign,
  Users, TrendingUp, Eye, Trash2, Filter, UserSearch,
  CheckCircle2, Loader2, AlertCircle, X, Briefcase,
} from "lucide-react";
import {
  Badge, Card, Button, Modal,
  Input, Textarea, Select, EmptyState, Skeleton, StatsCard,
} from "@/components/ui";
import { projectsAPI, clientsAPI, teamAPI } from "@/lib/api";
import { Project } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "",            label: "All Statuses"  },
  { value: "planning",    label: "Planning"      },
  { value: "in-progress", label: "In Progress"   },
  { value: "review",      label: "Review"        },
  { value: "completed",   label: "Completed"     },
  { value: "on-hold",     label: "On Hold"       },
];

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low"    },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High"   },
  { value: "urgent", label: "Urgent" },
];

const defaultForm = {
  title:        "",
  description:  "",
  budget:       "",
  deliveryDate: "",
  clientId:     "",
  status:       "planning",
  category:     "",
};

const defaultTask = {
  title:       "",
  description: "",
  priority:    "medium",
  dueDate:     "",
  payAmount:   "",
  assignedTo:  "" as string,
  memberName:  "" as string,
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
}

interface TeamMember {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  skills?: string[];
}

interface TaskDraft {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  payAmount: string;
  assignedTo: string;
  memberName: string;
}

// ─── SearchDropdown — generic reusable dropdown (outside all page components) ─

interface SearchDropdownProps<T> {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  results: T[];
  searching: boolean;
  open: boolean;
  searchErr: string;
  selected: boolean;
  onClear: () => void;
  renderResult: (item: T) => React.ReactNode;
  renderSelected?: () => React.ReactNode;
  error?: string;
  wrapperRef: React.MutableRefObject<HTMLDivElement | null>;
}

function SearchDropdown<T>({
  label, required, placeholder, value, onChange,
  results, searching, open, searchErr, selected,
  onClear, renderResult, renderSelected, error, wrapperRef,
}: SearchDropdownProps<T>) {
  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
        {label} {required && <span style={{ color: "var(--rose)" }}>*</span>}
      </label>
      <div className="relative">
        <UserSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          className={`input-dark w-full pl-9 pr-9 py-2.5 rounded-xl text-sm ${
            error ? "border-red-500/60" : selected ? "border-emerald-500/40" : ""
          }`}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {searching && <Loader2 size={14} className="animate-spin text-slate-400" />}
          {!searching && selected && <CheckCircle2 size={14} className="text-emerald-400" />}
          {!searching && !selected && value && (
            <button type="button" onClick={onClear} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
          )}
        </div>
      </div>

      {selected && renderSelected && renderSelected()}

      <AnimatePresence>
        {open && !selected && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden"
            style={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
          >
            {searching && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                <Loader2 size={13} className="animate-spin" /> Searching…
              </div>
            )}
            {!searching && searchErr && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                <AlertCircle size={13} className="text-amber-400 shrink-0" /> {searchErr}
              </div>
            )}
            {!searching && results.length > 0 && results.map((item, i) => (
              <div key={i}>{renderResult(item)}</div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--rose)" }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ─── ClientLookup ─────────────────────────────────────────────────────────────

interface ClientLookupProps {
  selectedClient: Client | null;
  onSelect: (client: Client | null) => void;
  error?: string;
}

function ClientLookup({ selectedClient, onSelect, error }: ClientLookupProps) {
  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState<Client[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen]           = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const debounceRef               = useRef<number | undefined>(undefined);
  const wrapperRef                = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = (q: string) => {
    setQuery(q);
    setSearchErr("");
    if (selectedClient) onSelect(null);
    window.clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    debounceRef.current = window.setTimeout(async () => {
      setSearching(true); setOpen(true);
      try {
        const res  = await clientsAPI.search(q);
        const list = res.data?.clients ?? res.data ?? [];
        setResults(list);
        if (!list.length) setSearchErr("No clients found.");
      } catch { setSearchErr("Failed to search clients."); setResults([]); }
      finally { setSearching(false); }
    }, 350);
  };

  const pick  = (c: Client) => { onSelect(c); setQuery(`${c.firstName} ${c.lastName} — ${c.email}`); setOpen(false); setResults([]); };
  const clear = ()           => { onSelect(null); setQuery(""); setResults([]); setOpen(false); setSearchErr(""); };

  return (
    <SearchDropdown<Client>
      label="Client" required
      placeholder="Search by name or email…"
      value={query} onChange={search}
      results={results} searching={searching} open={open} searchErr={searchErr}
      selected={!!selectedClient} onClear={clear}
      error={error} wrapperRef={wrapperRef}
      renderSelected={() => (
        <motion.div
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 rounded-xl flex items-center gap-3"
          style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)" }}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Users size={14} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{selectedClient!.firstName} {selectedClient!.lastName}</p>
            <p className="text-xs text-slate-400 truncate">{selectedClient!.email}</p>
            {selectedClient!.company && <p className="text-xs text-slate-500">{selectedClient!.company}</p>}
          </div>
          <button type="button" onClick={clear} className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded">Change</button>
        </motion.div>
      )}
      renderResult={(c) => (
        <button type="button" onClick={() => pick(c)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0">
            <Users size={12} className="text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium">{c.firstName} {c.lastName}</p>
            <p className="text-xs text-slate-400 truncate">{c.email}</p>
          </div>
          {c.company && <span className="text-xs text-slate-500 shrink-0">{c.company}</span>}
        </button>
      )}
    />
  );
}

// ─── TeamMemberLookup ─────────────────────────────────────────────────────────

interface TeamMemberLookupProps {
  onSelect: (member: TeamMember) => void;
}

function TeamMemberLookup({ onSelect }: TeamMemberLookupProps) {
  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState<TeamMember[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen]           = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const debounceRef               = useRef<number | undefined>(undefined);
  const wrapperRef                = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = (q: string) => {
    setQuery(q);
    setSearchErr("");
    window.clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    debounceRef.current = window.setTimeout(async () => {
      setSearching(true); setOpen(true);
      try {
        const res  = await teamAPI.getAll({ search: q });
        const list = res.data?.members ?? res.data ?? [];
        setResults(list);
        if (!list.length) setSearchErr("No team members found.");
      } catch { setSearchErr("Failed to search team members."); setResults([]); }
      finally { setSearching(false); }
    }, 350);
  };

  const pick  = (m: TeamMember) => { onSelect(m); setQuery(""); setResults([]); setOpen(false); };
  const clear = ()               => { setQuery(""); setResults([]); setOpen(false); setSearchErr(""); };

  return (
    <SearchDropdown<TeamMember>
      label="Assign to team member" required
      placeholder="Search team members…"
      value={query} onChange={search}
      results={results} searching={searching} open={open} searchErr={searchErr}
      selected={false} onClear={clear}
      wrapperRef={wrapperRef}
      renderResult={(m) => (
        <button type="button" onClick={() => pick(m)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Briefcase size={12} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium">{m.firstName} {m.lastName}</p>
            <p className="text-xs text-slate-400 truncate">{m.jobTitle || m.email}</p>
          </div>
          {m.skills && m.skills.length > 0 && (
            <span className="text-xs text-slate-500 shrink-0">{m.skills[0]}</span>
          )}
        </button>
      )}
    />
  );
}

// ─── TaskForm — outside AdminProjectsPage to prevent remount on state change ──

interface TaskFormProps {
  task: typeof defaultTask;
  onChange: (field: string, value: string) => void;
  onMemberSelect: (member: TeamMember) => void;
  onClearMember: () => void;
}

function TaskForm({ task, onChange, onMemberSelect, onClearMember }: TaskFormProps) {
  return (
    <div className="space-y-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <TeamMemberLookup onSelect={onMemberSelect} />

      {task.memberName && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)" }}
        >
          <Briefcase size={13} className="text-emerald-400 shrink-0" />
          <span className="text-xs text-emerald-300 flex-1">{task.memberName}</span>
          <button type="button" onClick={onClearMember} className="text-slate-500 hover:text-red-400 transition-colors">
            <X size={13} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Task title *</label>
          <input
            className="input-dark w-full px-3 py-2 rounded-xl text-sm"
            placeholder="e.g. Design homepage"
            value={task.title}
            onChange={e => onChange("title", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Priority</label>
          <select
            className="input-dark w-full px-3 py-2 rounded-xl text-sm cursor-pointer"
            value={task.priority}
            onChange={e => onChange("priority", e.target.value)}
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            {PRIORITY_OPTIONS.map(o => (
              <option key={o.value} value={o.value} style={{ background: "#1a1a2e" }}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Description</label>
        <textarea
          className="input-dark w-full px-3 py-2 rounded-xl text-sm resize-none"
          placeholder="What needs to be done…"
          rows={2}
          value={task.description}
          onChange={e => onChange("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Due date *</label>
          <input
            type="date"
            className="input-dark w-full px-3 py-2 rounded-xl text-sm"
            value={task.dueDate}
            onChange={e => onChange("dueDate", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Pay amount (NGN)</label>
          <input
            type="number"
            className="input-dark w-full px-3 py-2 rounded-xl text-sm"
            placeholder="0"
            value={task.payAmount}
            onChange={e => onChange("payAmount", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminProjectsPage() {

  const [projects, setProjects]               = useState<Project[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState("");
  const [statusFilter, setStatusFilter]       = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [deleting, setDeleting]               = useState<string | null>(null);
  const [form, setForm]                       = useState(defaultForm);
  const [errors, setErrors]                   = useState<Record<string, string>>({});
  const [selectedClient, setSelectedClient]   = useState<Client | null>(null);

  // Task draft state
  const [tasks, setTasks]             = useState<TaskDraft[]>([]);
  const [currentTask, setCurrentTask] = useState({ ...defaultTask });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskError, setTaskError]       = useState("");

  useEffect(() => {
    setLoading(true);
    projectsAPI.getAll(statusFilter ? { status: statusFilter } : undefined)
      .then(res => setProjects(res.data?.projects || res.data || []))
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const closeModal = () => {
    setShowCreateModal(false);
    setForm(defaultForm);
    setErrors({});
    setSelectedClient(null);
    setTasks([]);
    setCurrentTask({ ...defaultTask });
    setShowTaskForm(false);
    setTaskError("");
  };

  // Stable handlers — defined in page, passed as props to TaskForm
  const handleTaskFieldChange  = (field: string, value: string) =>
    setCurrentTask(prev => ({ ...prev, [field]: value }));

  const handleTaskMemberSelect = (member: TeamMember) =>
    setCurrentTask(prev => ({
      ...prev,
      assignedTo: member._id || member.id,
      memberName: `${member.firstName} ${member.lastName}`,
    }));

  const handleTaskMemberClear = () =>
    setCurrentTask(prev => ({ ...prev, assignedTo: "", memberName: "" }));

  const addTask = () => {
    setTaskError("");
    if (!currentTask.assignedTo)    { setTaskError("Please select a team member."); return; }
    if (!currentTask.title.trim())  { setTaskError("Task title is required.");      return; }
    if (!currentTask.dueDate)       { setTaskError("Due date is required.");        return; }
    setTasks(prev => [...prev, { ...currentTask, id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }]);
    setCurrentTask({ ...defaultTask });
    setShowTaskForm(false);
  };

  const removeTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())                         e.title        = "Title is required";
    if (!selectedClient)                            e.clientId     = "Please search and select a client";
    if (!form.budget || isNaN(Number(form.budget))) e.budget       = "Valid budget is required";
    if (!form.deliveryDate)                         e.deliveryDate = "Delivery date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await projectsAPI.create({
        title:        form.title,
        description:  form.description,
        budget:       Number(form.budget),
        deliveryDate: form.deliveryDate,
        status:       form.status,
        category:     form.category,
        clientId:     selectedClient!.id,
        clientName:   `${selectedClient!.firstName} ${selectedClient!.lastName}`,
        clientEmail:  selectedClient!.email,
        tasks: tasks.map(t => ({
          assignedTo:  t.assignedTo,
          title:       t.title,
          description: t.description,
          priority:    t.priority,
          dueDate:     t.dueDate,
          payAmount:   Number(t.payAmount) || 0,
          currency:    "NGN",
        })),
      });
      toast.success(
        tasks.length
          ? `Project created with ${tasks.length} task${tasks.length > 1 ? "s" : ""}!`
          : "Project created successfully!"
      );
      closeModal();
      // Refresh project list
      setLoading(true);
      projectsAPI.getAll(statusFilter ? { status: statusFilter } : undefined)
        .then(res => setProjects(res.data?.projects || res.data || []))
        .catch(() => toast.error("Failed to reload projects"))
        .finally(() => setLoading(false));
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
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch { toast.error("Failed to delete project"); }
    finally { setDeleting(null); }
  };

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.clientName?.toLowerCase().includes(q) ||
      p.clientEmail?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total:       projects.length,
    active:      projects.filter(p => p.status === "in-progress").length,
    completed:   projects.filter(p => p.status === "completed").length,
    totalBudget: projects.reduce((s, p) => s + (p.budget || 0), 0),
  };

  const statusVariant = (s: string) =>
    s === "completed"   ? "success" :
    s === "in-progress" ? "warning" :
    s === "on-hold"     ? "danger"  : "info";

  const priorityColor = (p: string) =>
    p === "urgent" ? "text-red-400"   :
    p === "high"   ? "text-amber-400" :
    p === "medium" ? "text-blue-400"  : "text-slate-400";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track all client projects</p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => setShowCreateModal(true)}>
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Projects" value={stats.total}                       icon={<FolderKanban size={20} />} iconBg="bg-brand-500/20"   iconColor="text-brand-400"   delay={0}    />
        <StatsCard title="Active"         value={stats.active}                      icon={<TrendingUp   size={20} />} iconBg="bg-emerald-500/20" iconColor="text-emerald-400" delay={0.05} />
        <StatsCard title="Completed"      value={stats.completed}                   icon={<Users        size={20} />} iconBg="bg-purple-500/20"  iconColor="text-purple-400"  delay={0.1}  />
        <StatsCard title="Total Budget"   value={formatCurrency(stats.totalBudget)} icon={<DollarSign   size={20} />} iconBg="bg-gold-500/20"    iconColor="text-gold-400"    delay={0.15} />
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
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500 shrink-0" />
            <select
              className="input-dark px-3 py-2.5 rounded-xl text-sm cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)" }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ background: "#1a1a2e" }}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Projects list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
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
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-5 card-hover"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
                    <FolderKanban size={18} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white text-sm">{project.title}</h3>
                      <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">{project.description}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-slate-500 text-xs flex items-center gap-1"><Users size={11} />{project.clientName}</span>
                      <span className="text-slate-500 text-xs flex items-center gap-1"><DollarSign size={11} />{formatCurrency(project.budget)}</span>
                      <span className="text-slate-500 text-xs flex items-center gap-1"><Calendar size={11} />{formatDate(project.deliveryDate)}</span>
                      <span className="text-slate-500 text-xs flex items-center gap-1"><TrendingUp size={11} />{project.progress}% complete</span>
                    </div>
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
                    {deleting === project.id
                      ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Create Project Modal ── */}
      <Modal open={showCreateModal} onClose={closeModal} title="Create New Project" size="lg">
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

          <ClientLookup
            selectedClient={selectedClient}
            onSelect={setSelectedClient}
            error={errors.clientId}
          />

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

          {/* ── Team Tasks Section ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-white">Team Tasks</p>
                <p className="text-xs text-slate-500 mt-0.5">Assign tasks to team members at creation — optional</p>
              </div>
              {!showTaskForm && (
                <button
                  type="button"
                  onClick={() => { setShowTaskForm(true); setTaskError(""); }}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: "var(--brand-dim)", border: "1px solid var(--brand-border)", color: "var(--brand)" }}
                >
                  <Plus size={12} /> Add Task
                </button>
              )}
            </div>

            {/* Task form — animated */}
            <AnimatePresence>
              {showTaskForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  <TaskForm
                    task={currentTask}
                    onChange={handleTaskFieldChange}
                    onMemberSelect={handleTaskMemberSelect}
                    onClearMember={handleTaskMemberClear}
                  />
                  {taskError && (
                    <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "var(--rose)" }}>
                      <AlertCircle size={11} /> {taskError}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button" onClick={addTask}
                      className="flex-1 py-2 rounded-xl text-sm font-medium text-white"
                      style={{ background: "var(--brand)", boxShadow: "0 2px 12px var(--brand-glow)" }}
                    >
                      Add Task
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowTaskForm(false); setCurrentTask({ ...defaultTask }); setTaskError(""); }}
                      className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Added tasks list */}
            {tasks.length > 0 && (
              <div className="space-y-2 mt-3">
                {tasks.map(t => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <Briefcase size={13} className="text-slate-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{t.title}</p>
                      <p className="text-xs text-slate-500 truncate">{t.memberName}</p>
                    </div>
                    <span className={`text-xs font-medium shrink-0 ${priorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                    {t.payAmount && (
                      <span className="text-xs text-slate-500 shrink-0">
                        ₦{Number(t.payAmount).toLocaleString()}
                      </span>
                    )}
                    <button
                      type="button" onClick={() => removeTask(t.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
                {!showTaskForm && (
                  <button
                    type="button"
                    onClick={() => { setShowTaskForm(true); setTaskError(""); }}
                    className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    style={{ border: "1px dashed rgba(255,255,255,0.1)" }}
                  >
                    + Add another task
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notice */}
          <div
            className="p-3 rounded-xl text-xs flex items-start gap-2"
            style={{ background: "var(--brand-dim)", border: "1px solid var(--brand-border)", color: "var(--text-2)" }}
          >
            <TrendingUp size={13} className="shrink-0 mt-0.5" style={{ color: "var(--brand)" }} />
            The client and any assigned team members will receive email notifications once the project is created.
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" className="flex-1" loading={submitting} onClick={handleCreate} icon={<Plus size={14} />}>
              {tasks.length > 0
                ? `Create + ${tasks.length} Task${tasks.length > 1 ? "s" : ""}`
                : "Create Project"}
            </Button>
          </div>

        </div>
      </Modal>
    </div>
  );
}