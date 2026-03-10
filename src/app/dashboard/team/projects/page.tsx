"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderKanban, DollarSign, Calendar, CheckSquare, ArrowRight } from "lucide-react";
import { Badge, ProgressBar, EmptyState, Skeleton } from "@/components/ui";
import { tasksAPI, projectsAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function TeamProjectsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksAPI.getAll()
      .then((res) => setTasks(res.data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  // Group tasks by project
  const projectMap = tasks.reduce((acc: Record<string, any>, task) => {
    if (!acc[task.projectId]) {
      acc[task.projectId] = { id: task.projectId, title: "Project", tasks: [] };
    }
    acc[task.projectId].tasks.push(task);
    return acc;
  }, {});
  const projects = Object.values(projectMap);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Projects</h1>
        <p className="text-slate-400 mt-1">Projects you're contributing to</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState icon={<FolderKanban size={28} />} title="No projects yet" description="Projects with your assigned tasks will appear here" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project: any, i) => {
            const totalPayment = project.tasks.reduce((s: number, t: any) => s + t.payment, 0);
            const doneCount = project.tasks.filter((t: any) => t.status === "completed").length;
            const progress = project.tasks.length > 0 ? Math.round((doneCount / project.tasks.length) * 100) : 0;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-white">{project.title}</h3>
                    <p className="text-slate-400 text-sm mt-0.5">{project.tasks.length} tasks assigned to you</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={13} className="text-gold-400" />
                    <div>
                      <p className="text-slate-500 text-xs">Your Earnings</p>
                      <p className="text-white font-semibold">{formatCurrency(totalPayment)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckSquare size={13} className="text-brand-400" />
                    <div>
                      <p className="text-slate-500 text-xs">Completion</p>
                      <p className="text-white font-semibold">{doneCount}/{project.tasks.length}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Your Progress</span>
                    <span className="text-white font-semibold">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>
                <Link href="/dashboard/team/tasks">
                  <button className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1 transition-colors">
                    View tasks <ArrowRight size={14} />
                  </button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
