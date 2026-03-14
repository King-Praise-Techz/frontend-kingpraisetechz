"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, FolderKanban, Star, Target,
  Users, TrendingUp, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { StatsCard, Card, SectionHeader, ProgressBar, Skeleton } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { dashboardAPI, projectsAPI, teamAPI, reviewsAPI } from "@/lib/api";
import toast from "react-hot-toast";

type Period = "7d" | "30d" | "90d";

const CATEGORY_COLORS = ["#1a4dff", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="glass-card p-3 border border-white/10">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name === "revenue" ? formatCurrency(p.value) : `${p.value} ${p.name}`}
        </p>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [stats, setStats] = useState({
    totalRevenue: 0,
    completedProjects: 0,
    avgRating: 0,
    teamEfficiency: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalTeam: 0,
    totalReviews: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);

  const fetchAll = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;

      // Fetch all in parallel
      const [dashRes, projectsRes, teamRes, reviewsRes] = await Promise.allSettled([
        dashboardAPI.getStats({ period: periodDays }),
        projectsAPI.getAll(),
        teamAPI.getAll(),
        reviewsAPI.getAll(),
      ]);

      // --- Dashboard stats ---
      const dash =
        dashRes.status === "fulfilled"
          ? dashRes.value?.data || dashRes.value
          : null;

      // --- Projects ---
      const projects: any[] =
        projectsRes.status === "fulfilled"
          ? projectsRes.value?.data?.projects ||
            projectsRes.value?.data ||
            projectsRes.value ||
            []
          : [];

      // --- Team ---
      const team: any[] =
        teamRes.status === "fulfilled"
          ? teamRes.value?.data?.team ||
            teamRes.value?.data ||
            teamRes.value ||
            []
          : [];

      // --- Reviews ---
      const reviews: any[] =
        reviewsRes.status === "fulfilled"
          ? reviewsRes.value?.data?.reviews ||
            reviewsRes.value?.data ||
            reviewsRes.value ||
            []
          : [];

      // ── Compute stats ──────────────────────────────────────
      const completed = projects.filter((p: any) => p.status === "completed");
      const active    = projects.filter((p: any) => p.status === "in-progress");
      const totalBudget = completed.reduce((s: number, p: any) => s + (p.budget || 0), 0);

      const approvedReviews = reviews.filter((r: any) => r.status === "approved");
      const avgRating =
        approvedReviews.length > 0
          ? approvedReviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) /
            approvedReviews.length
          : 0;

      // Team efficiency — average task completion rate across all members
      const memberEfficiencies = team
        .map((m: any) => {
          const total = m.totalTasks || m.tasks?.length || 0;
          const done  = m.completedTasks || m.tasks?.filter((t: any) => t.status === "completed").length || 0;
          return total > 0 ? (done / total) * 100 : null;
        })
        .filter((v): v is number => v !== null);

      const efficiency =
        memberEfficiencies.length > 0
          ? Math.round(memberEfficiencies.reduce((a, b) => a + b, 0) / memberEfficiencies.length)
          : dash?.teamEfficiency || 0;

      setStats({
        totalRevenue:      dash?.totalRevenue     ?? totalBudget,
        completedProjects: dash?.completedProjects ?? completed.length,
        avgRating:         dash?.avgRating         ?? avgRating,
        teamEfficiency:    dash?.teamEfficiency    ?? efficiency,
        totalProjects:     dash?.totalProjects     ?? projects.length,
        activeProjects:    dash?.activeProjects    ?? active.length,
        totalTeam:         dash?.totalTeam         ?? team.length,
        totalReviews:      approvedReviews.length,
      });

      // ── Revenue trend chart ────────────────────────────────
      // Use backend monthly data if available, else derive from projects
      if (dash?.monthlyRevenue && Array.isArray(dash.monthlyRevenue)) {
        setRevenueData(dash.monthlyRevenue);
      } else {
        // Group completed projects by month
        const months: Record<string, { month: string; revenue: number; projects: number }> = {};
        const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

        completed.forEach((p: any) => {
          const d = new Date(p.updatedAt || p.createdAt);
          if (isNaN(d.getTime())) return;
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (!months[key]) {
            months[key] = { month: MONTHS[d.getMonth()], revenue: 0, projects: 0 };
          }
          months[key].revenue   += p.budget || 0;
          months[key].projects  += 1;
        });

        const sorted = Object.entries(months)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-7)
          .map(([, v]) => v);

        setRevenueData(sorted.length > 0 ? sorted : []);
      }

      // ── Category breakdown ────────────────────────────────
      if (dash?.categoryBreakdown && Array.isArray(dash.categoryBreakdown)) {
        setCategoryData(
          dash.categoryBreakdown.map((c: any, i: number) => ({
            name:  c.name || c.category,
            value: c.value || c.count || c.percentage,
            color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
          }))
        );
      } else {
        // Derive from projects categories
        const catMap: Record<string, number> = {};
        projects.forEach((p: any) => {
          const cat = p.category || "Other";
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        const total = projects.length || 1;
        setCategoryData(
          Object.entries(catMap).map(([name, count], i) => ({
            name,
            value: Math.round((count / total) * 100),
            color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
          }))
        );
      }

      // ── Team performance ──────────────────────────────────
      if (team.length > 0) {
        setTeamPerformance(
          team.slice(0, 6).map((m: any) => {
            const totalT  = m.totalTasks    || m.tasks?.length || 0;
            const doneT   = m.completedTasks || m.tasks?.filter((t: any) => t.status === "completed").length || 0;
            return {
              name:      m.name || m.fullName || `${m.firstName || ""} ${m.lastName || ""}`.trim(),
              tasks:     totalT,
              completed: doneT,
            };
          })
        );
      }
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = () => fetchAll(true);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Analytics</h1>
          <p className="text-slate-400 mt-1 text-sm">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p
                  ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                  : "glass-card text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {p}
            </button>
          ))}
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-9 h-9 rounded-xl glass-card border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<DollarSign size={20} />}
            iconBg="bg-amber-500/15"
            iconColor="text-amber-400"
            glowColor="rgba(245,158,11,0.4)"
            delay={0.05}
          />
          <StatsCard
            title="Projects Completed"
            value={stats.completedProjects}
            icon={<FolderKanban size={20} />}
            iconBg="bg-blue-500/15"
            iconColor="text-blue-400"
            glowColor="rgba(59,130,246,0.4)"
            delay={0.1}
          />
          <StatsCard
            title="Avg Client Rating"
            value={stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}/5` : "N/A"}
            icon={<Star size={20} />}
            iconBg="bg-emerald-500/15"
            iconColor="text-emerald-400"
            glowColor="rgba(16,185,129,0.4)"
            delay={0.15}
          />
          <StatsCard
            title="Team Efficiency"
            value={stats.teamEfficiency > 0 ? `${stats.teamEfficiency}%` : "N/A"}
            icon={<Target size={20} />}
            iconBg="bg-purple-500/15"
            iconColor="text-purple-400"
            glowColor="rgba(168,85,247,0.4)"
            delay={0.2}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Revenue Trend"
            subtitle="Monthly revenue from completed projects"
          />
          {loading ? (
            <Skeleton className="h-64" />
          ) : revenueData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              No revenue data available yet
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1a4dff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1a4dff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#1a4dff" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Category Breakdown */}
        <Card>
          <SectionHeader title="Project Categories" subtitle="Distribution by type" />
          {loading ? (
            <Skeleton className="h-48" />
          ) : categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              No category data yet
            </div>
          ) : (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value">
                      {categoryData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {categoryData.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                      <span className="text-slate-400">{c.name}</span>
                    </div>
                    <span className="text-white font-medium">{c.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Summary Row */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Projects",  value: stats.totalProjects,  icon: <FolderKanban size={16} />, color: "text-brand-400",   bg: "bg-brand-500/10" },
            { label: "Active Projects", value: stats.activeProjects, icon: <TrendingUp    size={16} />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Team Members",    value: stats.totalTeam,      icon: <Users         size={16} />, color: "text-purple-400",  bg: "bg-purple-500/10" },
            { label: "Reviews",         value: stats.totalReviews,   icon: <Star          size={16} />, color: "text-amber-400",   bg: "bg-amber-500/10" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4"
            >
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-3`}>
                <span className={item.color}>{item.icon}</span>
              </div>
              <p className="text-white font-bold text-2xl">{item.value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{item.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Team Performance */}
      <Card>
        <SectionHeader title="Team Performance" subtitle="Task completion rates" />
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : teamPerformance.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No team data available
          </div>
        ) : (
          <div className="space-y-4">
            {teamPerformance.map((member, i) => {
              const rate = member.tasks > 0
                ? Math.round((member.completed / member.tasks) * 100)
                : 0;
              return (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-white font-medium">{member.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">
                        {member.completed}/{member.tasks} tasks
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: rate >= 90 ? "#10b981" : rate >= 75 ? "#1a4dff" : "#f59e0b",
                        }}
                      >
                        {rate}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={rate}
                    color={rate >= 90 ? "#10b981" : rate >= 75 ? "#1a4dff" : "#f59e0b"}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}