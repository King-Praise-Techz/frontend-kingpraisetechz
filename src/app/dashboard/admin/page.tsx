"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FolderKanban, Users, Star, TrendingUp, CheckCircle2, Clock,
  AlertCircle, Crown, Plus, ArrowRight, Activity, DollarSign
} from "lucide-react";
import { StatsCard, Badge, ProgressBar, SectionHeader, Card, Button, Skeleton } from "@/components/ui";
import { dashboardAPI, projectsAPI, reviewsAPI } from "@/lib/api";
import { Project, Review } from "@/types";
import { formatCurrency, formatDate, getStatusColor, truncate } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

const chartData = [
  { month: "Jan", revenue: 450000, projects: 4 },
  { month: "Feb", revenue: 620000, projects: 5 },
  { month: "Mar", revenue: 380000, projects: 3 },
  { month: "Apr", revenue: 750000, projects: 7 },
  { month: "May", revenue: 890000, projects: 8 },
  { month: "Jun", revenue: 670000, projects: 6 },
];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes, reviewsRes] = await Promise.all([
          dashboardAPI.getStats(),
          projectsAPI.getAll(),
          reviewsAPI.getAll(),
        ]);
        setStats(statsRes.data);
        const allProjects = projectsRes.data.projects || [];
        setProjects(allProjects.filter((p: Project) => p.status === "in-progress").slice(0, 5));
        const reviews = reviewsRes.data.reviews || [];
        setPendingReviews(reviews.filter((r: Review) => r.status === "pending").slice(0, 3));
      } catch {
        // Use mock data for demo
        setStats({
          totalProjects: 24,
          activeProjects: 8,
          completedProjects: 14,
          totalRevenue: 12450000,
          pendingReviews: 3,
          teamMembers: 6,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Projects",
      value: stats?.totalProjects || "—",
      icon: <FolderKanban size={22} />,
      iconBg: "bg-brand-500/15",
      iconColor: "text-brand-400",
      glowColor: "rgba(26,77,255,0.2)",
      trend: { value: 12, label: "vs last month" },
    },
    {
      title: "Active Projects",
      value: stats?.activeProjects || "—",
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
      iconBg: "bg-gold-500/15",
      iconColor: "text-gold-500",
      glowColor: "rgba(245,158,11,0.2)",
      trend: { value: 18, label: "vs last month" },
    },
    {
      title: "Team Members",
      value: stats?.teamMembers || "—",
      icon: <Users size={22} />,
      iconBg: "bg-purple-500/15",
      iconColor: "text-purple-400",
      glowColor: "rgba(168,85,247,0.2)",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-gold-500/20 flex items-center justify-center">
              <Crown size={14} className="text-gold-400" />
            </div>
            <span className="text-gold-400 text-sm font-medium">Administrator</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">
            Good morning, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening across your agency today.</p>
        </div>
        <Link href="/dashboard/admin/projects/new">
          <Button variant="primary" icon={<Plus size={16} />} size="md">New Project</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-36" />)
          : statCards.map((card, i) => <StatsCard key={card.title} {...card} delay={i * 0.1} />)
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <SectionHeader title="Revenue Overview" subtitle="Monthly revenue trends" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a4dff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a4dff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9" }}
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1a4dff" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Project Status */}
        <Card>
          <SectionHeader title="Project Status" subtitle="Current distribution" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9" }}
                />
                <Bar dataKey="projects" fill="#1a4dff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
                <button className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">View all <ArrowRight size={14} /></button>
              </Link>
            }
          />
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FolderKanban size={32} className="mx-auto mb-2 opacity-50" />
              <p>No active projects</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-medium text-sm">{project.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{project.clientName} · Due {formatDate(project.deliveryDate)}</p>
                    </div>
                    <Badge variant={project.status === "completed" ? "success" : project.status === "in-progress" ? "warning" : "info"}>
                      {project.status}
                    </Badge>
                  </div>
                  <ProgressBar value={project.progress} showLabel />
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Reviews */}
        <Card>
          <SectionHeader
            title="Pending Reviews"
            subtitle="Awaiting your approval"
            action={
              <Link href="/dashboard/admin/reviews">
                <button className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">View all <ArrowRight size={14} /></button>
              </Link>
            }
          />
          {pendingReviews.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Star size={32} className="mx-auto mb-2 opacity-50" />
              <p>No pending reviews</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviews.map((review) => (
                <div key={review.id} className="p-4 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm shrink-0">
                      {review.clientName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{review.clientName}</p>
                      <p className="text-slate-500 text-xs">{review.projectName}</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? "text-gold-400 fill-gold-400" : "text-slate-600"} />
                        ))}
                      </div>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{review.comment}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="primary" size="sm" className="flex-1">Approve</Button>
                    <Button variant="danger" size="sm" className="flex-1">Reject</Button>
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
