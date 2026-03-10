"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderKanban, Calendar, DollarSign, CheckSquare, ArrowRight, Search } from "lucide-react";
import { Badge, ProgressBar, EmptyState, Skeleton, Input } from "@/components/ui";
import { projectsAPI } from "@/lib/api";
import { Project } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    projectsAPI.getAll()
      .then((res) => setProjects(res.data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">My Projects</h1>
        <p className="text-slate-400 mt-1">All your projects at a glance</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={28} />}
          title="No projects found"
          description="Your projects will appear here once assigned by the admin"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 card-hover group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-white text-base">{project.title}</h3>
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{project.description}</p>
                </div>
                <Badge variant={
                  project.status === "completed" ? "success" :
                    project.status === "in-progress" ? "warning" :
                      project.status === "on-hold" ? "danger" : "info"
                }>
                  {project.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/3">
                  <DollarSign size={13} className="text-gold-400" />
                  <div>
                    <p className="text-slate-500 text-xs">Budget</p>
                    <p className="text-white text-xs font-semibold">{formatCurrency(project.budget)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/3">
                  <Calendar size={13} className="text-brand-400" />
                  <div>
                    <p className="text-slate-500 text-xs">Delivery</p>
                    <p className="text-white text-xs font-semibold">{formatDate(project.deliveryDate)}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white font-semibold">{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} />
              </div>

              {project.milestones?.length > 0 && (
                <div className="mb-4 space-y-1.5">
                  <p className="text-slate-500 text-xs font-medium">Milestones</p>
                  {project.milestones.slice(0, 3).map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${m.status === "completed" ? "bg-emerald-400" : m.status === "in-progress" ? "bg-brand-400" : "bg-slate-600"}`} />
                      <p className={`text-xs ${m.status === "completed" ? "text-slate-500 line-through" : "text-slate-300"}`}>{m.title}</p>
                    </div>
                  ))}
                </div>
              )}

              {project.status === "completed" && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <p className="text-emerald-400 text-xs font-medium">Project Complete!</p>
                  <Link href="/dashboard/client/reviews">
                    <span className="text-xs text-emerald-300 hover:text-emerald-200 flex items-center gap-1">
                      Leave review <ArrowRight size={10} />
                    </span>
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
