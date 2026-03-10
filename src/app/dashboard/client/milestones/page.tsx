"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckSquare, Clock, CheckCircle2, Calendar, FolderKanban
} from "lucide-react";
import { Badge, Card, SectionHeader, EmptyState, Skeleton, StatsCard } from "@/components/ui";
import { projectsAPI } from "@/lib/api";
import { Project, Milestone } from "@/types";
import { formatDate } from "@/lib/utils";

interface MilestoneWithProject extends Milestone {
  projectTitle: string;
  projectId: string;
}

export default function ClientMilestonesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsAPI.getAll()
      .then((res) => setProjects(res.data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const allMilestones: MilestoneWithProject[] = projects
    .flatMap((p) => (p.milestones || []).map((m) => ({ ...m, projectTitle: p.title, projectId: p.id })))
    .sort((a, b) => a.order - b.order);

  const completed = allMilestones.filter((m) => m.status === "completed");
  const upcoming = allMilestones.filter((m) => m.status !== "completed");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Milestones</h1>
        <p className="text-slate-400 mt-1">Track your project progress step by step</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Milestones"
          value={allMilestones.length}
          icon={<CheckSquare size={20} />}
          iconBg="bg-brand-500/15"
          iconColor="text-brand-400"
          glowColor="rgba(26,77,255,0.2)"
        />
        <StatsCard
          title="Completed"
          value={completed.length}
          icon={<CheckCircle2 size={20} />}
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-400"
          glowColor="rgba(16,185,129,0.2)"
        />
        <StatsCard
          title="Remaining"
          value={upcoming.length}
          icon={<Clock size={20} />}
          iconBg="bg-gold-500/15"
          iconColor="text-gold-400"
          glowColor="rgba(245,158,11,0.2)"
        />
      </div>

      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : allMilestones.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={28} />}
          title="No milestones yet"
          description="Your project milestones will appear here once added by the team"
        />
      ) : (
        <div className="space-y-6">
          {/* Timeline view */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-4">
              {allMilestones.map((milestone, i) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 pl-10 relative"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    milestone.status === "completed"
                      ? "bg-emerald-500 border-emerald-500"
                      : milestone.status === "in-progress"
                      ? "bg-brand-500 border-brand-500 animate-pulse"
                      : "bg-surface-DEFAULT border-white/20"
                  }`}>
                    {milestone.status === "completed" ? (
                      <CheckCircle2 size={14} className="text-white" />
                    ) : (
                      <span className="text-xs font-bold text-slate-300">{i + 1}</span>
                    )}
                  </div>

                  <div className={`flex-1 glass-card p-4 border ${
                    milestone.status === "completed"
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : milestone.status === "in-progress"
                      ? "border-brand-500/20 bg-brand-500/5"
                      : "border-white/5"
                  }`}>
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <p className={`font-semibold text-sm ${milestone.status === "completed" ? "text-slate-400 line-through" : "text-white"}`}>
                          {milestone.title}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">{milestone.projectTitle}</p>
                      </div>
                      <Badge variant={
                        milestone.status === "completed" ? "success" :
                          milestone.status === "in-progress" ? "warning" : "neutral"
                      }>
                        {milestone.status}
                      </Badge>
                    </div>
                    {milestone.description && (
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed">{milestone.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar size={11} className="text-slate-500" />
                      <p className="text-slate-500 text-xs">Due {formatDate(milestone.dueDate)}</p>
                      {milestone.completedAt && (
                        <span className="text-emerald-400 text-xs ml-2">
                          • Completed {formatDate(milestone.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
