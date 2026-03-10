"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, CheckCircle2, Clock, TrendingUp, Briefcase } from "lucide-react";
import { StatsCard, Card, SectionHeader, Badge, EmptyState, Skeleton } from "@/components/ui";
import { tasksAPI } from "@/lib/api";
import { Task } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TeamEarningsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksAPI.getAll()
      .then((res) => setTasks(res.data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const completedTasks = tasks.filter((t) => t.status === "completed");
  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const totalEarnings = completedTasks.reduce((s, t) => s + t.payment, 0);
  const pendingEarnings = pendingTasks.reduce((s, t) => s + t.payment, 0);
  const avgPayment = completedTasks.length > 0 ? totalEarnings / completedTasks.length : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Earnings</h1>
        <p className="text-slate-400 mt-1">Your payment history and pending earnings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Earned" value={formatCurrency(totalEarnings)} icon={<DollarSign size={20} />} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" glowColor="rgba(16,185,129,0.2)" delay={0} />
        <StatsCard title="Pending" value={formatCurrency(pendingEarnings)} icon={<Clock size={20} />} iconBg="bg-gold-500/15" iconColor="text-gold-400" glowColor="rgba(245,158,11,0.2)" delay={0.1} />
        <StatsCard title="Tasks Completed" value={completedTasks.length} icon={<CheckCircle2 size={20} />} iconBg="bg-brand-500/15" iconColor="text-brand-400" glowColor="rgba(26,77,255,0.2)" delay={0.2} />
        <StatsCard title="Avg Per Task" value={formatCurrency(avgPayment)} icon={<TrendingUp size={20} />} iconBg="bg-purple-500/15" iconColor="text-purple-400" glowColor="rgba(168,85,247,0.2)" delay={0.3} />
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <SectionHeader title="Earnings Summary" />
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))", border: "1px solid rgba(16,185,129,0.2)" }}>
              <p className="text-slate-400 text-xs">Total Earned</p>
              <p className="font-display font-bold text-3xl text-white mt-1">{formatCurrency(totalEarnings)}</p>
              <p className="text-emerald-400 text-xs mt-1">{completedTasks.length} tasks completed</p>
            </div>
            <div className="p-4 rounded-xl bg-white/3 border border-white/5">
              <p className="text-slate-400 text-xs">Awaiting Completion</p>
              <p className="font-display font-bold text-2xl text-white mt-1">{formatCurrency(pendingEarnings)}</p>
              <p className="text-gold-400 text-xs mt-1">{pendingTasks.length} tasks in progress</p>
            </div>
            {tasks.length > 0 && (
              <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                <div className="flex justify-between mb-2">
                  <p className="text-slate-400 text-xs">Completion Rate</p>
                  <p className="text-white text-xs font-semibold">
                    {Math.round((completedTasks.length / tasks.length) * 100)}%
                  </p>
                </div>
                <div className="progress-bar" style={{ height: 6 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedTasks.length / tasks.length) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="progress-fill h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Transaction list */}
        <Card className="lg:col-span-2">
          <SectionHeader title="Payment History" subtitle="All task payments" />
          {loading ? (
            <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : tasks.length === 0 ? (
            <EmptyState icon={<Briefcase size={24} />} title="No earnings yet" description="Completed tasks will appear here with their payment details" />
          ) : (
            <div className="space-y-2">
              {tasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${task.status === "completed" ? "bg-emerald-500/15" : "bg-gold-500/15"}`}>
                      {task.status === "completed" ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : (
                        <Clock size={14} className="text-gold-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{task.title}</p>
                      <p className="text-slate-500 text-xs">Due {formatDate(task.dueDate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${task.status === "completed" ? "text-emerald-400" : "text-gold-400"}`}>
                      {formatCurrency(task.payment)}
                    </p>
                    <Badge variant={task.status === "completed" ? "success" : task.status === "in-progress" ? "warning" : "neutral"} size="sm">
                      {task.status === "completed" ? "Paid" : "Pending"}
                    </Badge>
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
