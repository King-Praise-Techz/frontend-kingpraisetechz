"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FolderKanban, CheckSquare, Calendar, Clock, ArrowRight, Zap, TrendingUp, Activity
} from "lucide-react";
import { StatsCard, Badge, ProgressBar, SectionHeader, Card, Skeleton, EmptyState } from "@/components/ui";
import { projectsAPI } from "@/lib/api";
import { Project, Milestone } from "@/types";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsAPI.getAll()
      .then((res) => setProjects(res.data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const activeProject = projects.find((p) => p.status === "in-progress") || projects[0];
  const totalMilestones = projects.reduce((acc, p) => acc + (p.milestones?.length || 0), 0);
  const completedMilestones = projects.reduce((acc, p) => acc + (p.milestones?.filter(m => m.status === "completed").length || 0), 0);

  const upcomingMilestones = projects
    .flatMap((p) => (p.milestones || []).map((m) => ({ ...m, projectTitle: p.title })))
    .filter((m) => m.status !== "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md bg-brand-500/20 flex items-center justify-center">
            <Zap size={14} className="text-brand-400" />
          </div>
          <span className="text-brand-400 text-sm font-medium">Client Dashboard</span>
        </div>
        <h1 className="font-display font-bold text-3xl text-white">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">Track the progress of your projects in real-time.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="My Projects" value={projects.length} icon={<FolderKanban size={20} />} iconBg="bg-brand-500/15" iconColor="text-brand-400" glowColor="rgba(26,77,255,0.2)" delay={0} />
        <StatsCard title="Milestones Done" value={`${completedMilestones}/${totalMilestones}`} icon={<CheckSquare size={20} />} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" glowColor="rgba(16,185,129,0.2)" delay={0.1} />
        <StatsCard
          title="Active Project"
          value={activeProject?.status === "in-progress" ? "In Progress" : activeProject ? "On Hold" : "None"}
          icon={<Activity size={20} />}
          iconBg="bg-gold-500/15"
          iconColor="text-gold-400"
          glowColor="rgba(245,158,11,0.2)"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Project Detail */}
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Active Project"
            action={
              <Link href="/dashboard/client/projects">
                <button className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">All projects <ArrowRight size={14} /></button>
              </Link>
            }
          />
          {loading ? (
            <Skeleton className="h-48" />
          ) : !activeProject ? (
            <EmptyState
              icon={<FolderKanban size={24} />}
              title="No active projects"
              description="Your project details will appear here once assigned"
            />
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-xl text-white">{activeProject.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{activeProject.description}</p>
                </div>
                <Badge variant={activeProject.status === "completed" ? "success" : activeProject.status === "in-progress" ? "warning" : "info"}>
                  {activeProject.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                  <p className="text-slate-500 text-xs">Budget</p>
                  <p className="text-white font-semibold text-sm mt-1">{formatCurrency(activeProject.budget)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                  <p className="text-slate-500 text-xs">Delivery Date</p>
                  <p className="text-white font-semibold text-sm mt-1">{formatDate(activeProject.deliveryDate)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                  <p className="text-slate-500 text-xs">Milestones</p>
                  <p className="text-white font-semibold text-sm mt-1">
                    {activeProject.milestones?.filter(m => m.status === "completed").length || 0}/{activeProject.milestones?.length || 0}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Overall Progress</span>
                  <span className="text-white font-semibold">{activeProject.progress}%</span>
                </div>
                <ProgressBar value={activeProject.progress} height={10} />
              </div>

              {/* Milestones */}
              {activeProject.milestones?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Milestones</p>
                  {activeProject.milestones.map((milestone, idx) => (
                    <div key={milestone.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${milestone.status === "completed" ? "bg-emerald-500" : milestone.status === "in-progress" ? "bg-brand-500" : "bg-white/10 border border-white/15"}`}>
                        {milestone.status === "completed" ? (
                          <CheckSquare size={12} className="text-white" />
                        ) : (
                          <span className="text-xs text-slate-400 font-bold">{idx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${milestone.status === "completed" ? "text-slate-400 line-through" : "text-white"}`}>
                          {milestone.title}
                        </p>
                        <p className="text-xs text-slate-500">Due {formatDate(milestone.dueDate)}</p>
                      </div>
                      <Badge variant={milestone.status === "completed" ? "success" : milestone.status === "in-progress" ? "warning" : "neutral"}>
                        {milestone.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Upcoming Milestones */}
        <Card>
          <SectionHeader title="Upcoming" subtitle="Next milestones" />
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : upcomingMilestones.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar size={28} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming milestones</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMilestones.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-xl bg-white/3 border border-white/5"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{m.title}</p>
                      <p className="text-slate-500 text-xs">{(m as any).projectTitle}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={10} className="text-slate-500" />
                        <p className="text-xs text-slate-400">Due {formatDate(m.dueDate)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
