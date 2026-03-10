"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckSquare, DollarSign, Clock, Upload, ArrowRight, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { StatsCard, Badge, ProgressBar, SectionHeader, Card, Button, Skeleton, EmptyState } from "@/components/ui";
import { tasksAPI } from "@/lib/api";
import { Task } from "@/types";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";

export default function TeamDashboard() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksAPI.getAll()
      .then((res) => setTasks(res.data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in-progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const totalEarnings = completedTasks.reduce((acc, t) => acc + t.payment, 0);
  const pendingEarnings = pendingTasks.reduce((acc, t) => acc + t.payment, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
            <Activity size={14} className="text-emerald-400" />
          </div>
          <span className="text-emerald-400 text-sm font-medium">Team Dashboard</span>
        </div>
        <h1 className="font-display font-bold text-3xl text-white">
          Hey, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's your work overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Tasks" value={tasks.length} icon={<CheckSquare size={20} />} iconBg="bg-brand-500/15" iconColor="text-brand-400" glowColor="rgba(26,77,255,0.2)" delay={0} />
        <StatsCard title="Active Tasks" value={pendingTasks.length} icon={<Clock size={20} />} iconBg="bg-orange-500/15" iconColor="text-orange-400" glowColor="rgba(249,115,22,0.2)" delay={0.1} />
        <StatsCard title="Completed" value={completedTasks.length} icon={<CheckCircle2 size={20} />} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" glowColor="rgba(16,185,129,0.2)" delay={0.2} />
        <StatsCard title="Total Earnings" value={formatCurrency(totalEarnings)} icon={<DollarSign size={20} />} iconBg="bg-gold-500/15" iconColor="text-gold-400" glowColor="rgba(245,158,11,0.2)" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks */}
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Active Tasks"
            action={
              <Link href="/dashboard/team/tasks">
                <button className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">View all <ArrowRight size={14} /></button>
              </Link>
            }
          />
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : pendingTasks.length === 0 ? (
            <EmptyState icon={<CheckSquare size={24} />} title="No active tasks" description="All tasks completed! New assignments will appear here." />
          ) : (
            <div className="space-y-3">
              {pendingTasks.slice(0, 4).map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{task.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 truncate">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Badge variant={task.status === "in-progress" ? "warning" : task.status === "review" ? "info" : "neutral"}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-4">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={11} />Due {formatDate(task.dueDate)}
                      </span>
                      <span className="text-xs text-gold-400 flex items-center gap-1 font-medium">
                        <DollarSign size={11} />{formatCurrency(task.payment)}
                      </span>
                    </div>
                    <Link href={`/dashboard/team/tasks`}>
                      <button className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                        Submit <Upload size={11} />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Earnings Breakdown */}
        <Card>
          <SectionHeader title="Earnings" subtitle="Payment overview" />
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(26,77,255,0.15), rgba(77,122,255,0.08))", border: "1px solid rgba(26,77,255,0.2)" }}>
              <p className="text-slate-400 text-xs mb-1">Total Earnings</p>
              <p className="font-display font-bold text-2xl text-white">{formatCurrency(totalEarnings)}</p>
              <p className="text-emerald-400 text-xs mt-1">{completedTasks.length} tasks completed</p>
            </div>

            <div className="p-4 rounded-xl bg-white/3 border border-white/5">
              <p className="text-slate-400 text-xs mb-1">Pending Earnings</p>
              <p className="font-display font-bold text-xl text-white">{formatCurrency(pendingEarnings)}</p>
              <p className="text-gold-400 text-xs mt-1">{pendingTasks.length} tasks in progress</p>
            </div>

            {tasks.length > 0 && (
              <div className="space-y-2">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Completion Rate</p>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Tasks Done</span>
                  <span className="text-white font-semibold">
                    {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                  </span>
                </div>
                <ProgressBar value={tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0} height={6} />
              </div>
            )}

            {user?.isTemporaryAdmin && (
              <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20">
                <p className="text-gold-400 text-xs font-medium flex items-center gap-1">
                  <AlertCircle size={12} />Temporary Admin Access Active
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Expires: {user.temporaryAdminExpiry ? formatDate(user.temporaryAdminExpiry) : "Unknown"}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
