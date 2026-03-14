"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FolderKanban, Users, Star, TrendingUp,
  Activity, DollarSign, Crown, Plus, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import {
  StatsCard, Badge, ProgressBar, SectionHeader,
  Card, Button, Skeleton,
} from "@/components/ui";
import { dashboardAPI, projectsAPI, reviewsAPI } from "@/lib/api";
import { Project, Review } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import toast from "react-hot-toast";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AdminDashboard() {
  const { user } = useAuthStore();

  const [stats, setStats]               = useState<any>(null);
  const [projects, setProjects]         = useState<Project[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [projectChart, setProjectChart] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [approvingId, setApprovingId]   = useState<string | null>(null);
  const [rejectingId, setRejectingId]   = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, projectsRes, reviewsRes] = await Promise.allSettled([
        dashboardAPI.getStats(),
        projectsAPI.getAll(),
        reviewsAPI.getAll(),
      ]);

      // ── Stats ───────────────────────────────────────────
      const dashData =
        statsRes.status === "fulfilled"
          ? statsRes.value?.data || statsRes.value
          : null;

      // ── Projects ────────────────────────────────────────
      const allProjects: Project[] =
        projectsRes.status === "fulfilled"
          ? projectsRes.value?.data?.projects ||
            projectsRes.value?.data ||
            projectsRes.value ||
            []
          : [];

      // ── Reviews ─────────────────────────────────────────
      const allReviews: Review[] =
        reviewsRes.status === "fulfilled"
          ? reviewsRes.value?.data?.reviews ||
            reviewsRes.value?.data ||
            reviewsRes.value ||
            []
          : [];

      // ── Set stats ────────────────────────────────────────
      const completed  = allProjects.filter((p) => p.status === "completed");
      const active     = allProjects.filter((p) => p.status === "in-progress");
      const totalRev   = completed.reduce((s, p) => s + (p.budget || 0), 0);
      const pendingRev = allReviews.filter((r) => r.status === "pending");

      setStats({
        totalProjects:     dashData?.totalProjects     ?? allProjects.length,
        activeProjects:    dashData?.activeProjects    ?? active.length,
        totalRevenue:      dashData?.totalRevenue      ?? totalRev,
        teamMembers:       dashData?.teamMembers       ?? 0,
        completedProjects: dashData?.completedProjects ?? completed.length,
        pendingReviews:    dashData?.pendingReviews    ?? pendingRev.length,
      });

      setProjects(active.slice(0, 5));
      setPendingReviews(pendingRev.slice(0, 3));

      // ── Revenue chart ─────────────────────────────────────
      if (dashData?.monthlyRevenue && Array.isArray(dashData.monthlyRevenue)) {
        setRevenueChart(dashData.monthlyRevenue);
      } else {
        // Derive from completed projects grouped by month
        const monthMap: Record<string, { month: string; revenue: number; projects: number }> = {};
        completed.forEach((p) => {
          const d = new Date(p.updatedAt || p.createdAt);
          if (isNaN(d.getTime())) return;
          const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
          if (!monthMap[key]) {
            monthMap[key] = { month: MONTHS[d.getMonth()], revenue: 0, projects: 0 };
          }
          monthMap[key].revenue  += p.budget || 0;
          monthMap[key].projects += 1;
        });
        const sorted = Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-6)
          .map(([, v]) => v);
        setRevenueChart(sorted);
      }

      // ── Projects per month chart ──────────────────────────
      if (dashData?.monthlyProjects && Array.isArray(dashData.monthlyProjects)) {
        setProjectChart(dashData.monthlyProjects);
      } else {
        const monthMap: Record<string, { month: string; projects: number }> = {};
        allProjects.forEach((p) => {
          const d = new Date(p.createdAt);
          if (isNaN(d.getTime())) return;
          const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
          if (!monthMap[key]) {
            monthMap[key] = { month: MONTHS[d.getMonth()], projects: 0 };
          }
          monthMap[key].projects += 1;
        });
        const sorted = Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-6)
          .map(([, v]) => v);
        setProjectChart(sorted);
      }
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await reviewsAPI.approve(id);
      toast.success("Review approved");
      setPendingReviews((prev) => prev.filter((r) => r.id !== id));
      setStats((s: any) => ({ ...s, pendingReviews: (s?.pendingReviews || 1) - 1 }));
    } catch {
      toast.error("Failed to approve review");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setRejectingId(id);
    try {
      await reviewsAPI.reject(id);
      toast.success("Review rejected");
      setPendingReviews((prev) => prev.filter((r) => r.id !== id));
      setStats((s: any) => ({ ...s, pendingReviews: (s?.pendingReviews || 1) - 1 }));
    } catch {
      toast.error("Failed to reject review");
    } finally {
      setRejectingId(null);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    {
      title: "Total Projects",
      value: stats?.totalProjects ?? "—",
      icon: <FolderKanban size={22} />,
      iconBg: "bg-brand-500/15",
      iconColor: "text-brand-400",
      glowColor: "rgba(26,77,255,0.2)",
      trend: { value: 12, label: "vs last month" },
    },
    {
      title: "Active Projects",
      value: stats?.activeProjects ?? "—",
      icon: <Activity size={22} />,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      glowColor: "rgba(16,185,129,0.2)",
      trend: { value: 4, label: "in progress" },
    },
    {
      title: "Total Revenue",
      value: stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : "—",
      icon: <DollarSign size={22} />,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
      glowColor: "rgba(245,158,11,0.2)",
      trend: { value: 18, label: "vs last month" },
    },
    {
      title: "Team Members",
      value: stats?.teamMembers ?? "—",
      icon: <Users size={22} />,
      iconBg: "bg-purple-500/15",
      iconColor: "text-purple-400",
      glowColor: "rgba(168,85,247,0.2)",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center">
              <Crown size={14} className="text-amber-400" />
            </div>
            <span className="text-amber-400 text-sm font-medium">Administrator</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">
            {greeting()}, {user?.name?.split(" ")[0] || "Admin"} 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Here's what's happening across your agency today.
          </p>
        </div>
        <Link href="/dashboard/admin/projects">
          <Button variant="primary" icon={<Plus size={16} />} size="md">
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-36" />)
          : statCards.map((card, i) => (
              <StatsCard key={card.title} {...card} delay={i * 0.08} />
            ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <SectionHeader title="Revenue Overview" subtitle="Monthly revenue from completed projects" />
          {loading ? (
            <Skeleton className="h-52" />
          ) : revenueChart.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-500 text-sm">
              No revenue data yet
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1a4dff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1a4dff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,10,20,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#f1f5f9",
                    }}
                    formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#1a4dff" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Projects per Month */}
        <Card>
          <SectionHeader title="Projects Created" subtitle="Monthly count" />
          {loading ? (
            <Skeleton className="h-52" />
          ) : projectChart.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-500 text-sm">
              No project data yet
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,10,20,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#f1f5f9",
                    }}
                    formatter={(v) => [v, "Projects"]}
                  />
                  <Bar dataKey="projects" fill="#1a4dff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Active Projects */}
        <Card>
          <SectionHeader
            title="Active Projects"
            action={
              <Link href="/dashboard/admin/projects">
                <button className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1 transition-colors">
                  View all <ArrowRight size={14} />
                </button>
              </Link>
            }
          />
          {loading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FolderKanban size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active projects</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/dashboard/admin/projects/${project.id}`}>
                    <div className="p-4 rounded-xl border transition-all cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-white font-medium text-sm">{project.title}</p>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {project.clientName} · Due {formatDate(project.deliveryDate)}
                          </p>
                        </div>
                        <Badge variant="warning">in-progress</Badge>
                      </div>
                      <ProgressBar value={project.progress} showLabel />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Reviews */}
        <Card>
          <SectionHeader
            title="Pending Reviews"
            subtitle={`${pendingReviews.length} awaiting approval`}
            action={
              <Link href="/dashboard/admin/reviews">
                <button className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1 transition-colors">
                  View all <ArrowRight size={14} />
                </button>
              </Link>
            }
          />
          {loading ? (
            <div className="space-y-3">
              {Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : pendingReviews.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Star size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No pending reviews</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviews.map((review) => (
                <div key={review.id} className="p-4 rounded-xl border"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm shrink-0">
                      {review.clientName?.[0]?.toUpperCase() || "C"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{review.clientName}</p>
                      <p className="text-slate-500 text-xs">{review.projectName}</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array(5).fill(0).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"}
                          />
                        ))}
                      </div>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{review.comment}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      loading={approvingId === review.id}
                      onClick={() => handleApprove(review.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      loading={rejectingId === review.id}
                      onClick={() => handleReject(review.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}