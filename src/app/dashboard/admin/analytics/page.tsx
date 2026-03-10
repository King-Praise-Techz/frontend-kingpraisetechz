"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, DollarSign, FolderKanban, Users, Star,
  BarChart3, Activity, Target
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { StatsCard, Card, SectionHeader } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

const monthlyData = [
  { month: "Aug", revenue: 380000, projects: 3, clients: 2 },
  { month: "Sep", revenue: 520000, projects: 4, clients: 3 },
  { month: "Oct", revenue: 450000, projects: 4, clients: 2 },
  { month: "Nov", revenue: 680000, projects: 6, clients: 4 },
  { month: "Dec", revenue: 750000, projects: 7, clients: 5 },
  { month: "Jan", revenue: 620000, projects: 5, clients: 3 },
  { month: "Feb", revenue: 890000, projects: 8, clients: 6 },
];

const categoryData = [
  { name: "Web Development", value: 40, color: "#1a4dff" },
  { name: "UI/UX Design", value: 25, color: "#10b981" },
  { name: "Mobile Apps", value: 20, color: "#f59e0b" },
  { name: "E-Commerce", value: 15, color: "#8b5cf6" },
];

const teamPerformance = [
  { name: "Chidi A.", tasks: 12, completed: 11, rating: 4.9 },
  { name: "Aisha B.", tasks: 9, completed: 9, rating: 5.0 },
  { name: "Emeka O.", tasks: 14, completed: 12, rating: 4.7 },
  { name: "Fatima M.", tasks: 8, completed: 7, rating: 4.8 },
  { name: "Tunde S.", tasks: 11, completed: 10, rating: 4.6 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-white/10">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-white text-sm font-semibold" style={{ color: p.color }}>
            {p.name === "revenue" ? formatCurrency(p.value) : p.value} {p.name !== "revenue" && p.name}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">Business insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((p) => (
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
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value="₦4.29M"
          icon={<DollarSign size={20} />}
          iconBg="bg-gold-500/15"
          iconColor="text-gold-400"
          glowColor="rgba(245,158,11,0.2)"
          trend={{ value: 18, label: "vs last period" }}
          delay={0}
        />
        <StatsCard
          title="Projects Completed"
          value="37"
          icon={<FolderKanban size={20} />}
          iconBg="bg-brand-500/15"
          iconColor="text-brand-400"
          glowColor="rgba(26,77,255,0.2)"
          trend={{ value: 12, label: "vs last period" }}
          delay={0.1}
        />
        <StatsCard
          title="Client Satisfaction"
          value="4.8/5"
          icon={<Star size={20} />}
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-400"
          glowColor="rgba(16,185,129,0.2)"
          trend={{ value: 5, label: "vs last period" }}
          delay={0.2}
        />
        <StatsCard
          title="Team Efficiency"
          value="94%"
          icon={<Target size={20} />}
          iconBg="bg-purple-500/15"
          iconColor="text-purple-400"
          glowColor="rgba(168,85,247,0.2)"
          trend={{ value: 3, label: "task completion" }}
          delay={0.3}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <SectionHeader title="Revenue Trend" subtitle="Monthly revenue over time" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a4dff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a4dff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#1a4dff" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <SectionHeader title="Project Categories" subtitle="Revenue by type" />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                  {categoryData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, ""]} contentStyle={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                  <span className="text-slate-400 text-xs">{cat.name}</span>
                </div>
                <span className="text-white text-xs font-semibold">{cat.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects per month */}
        <Card>
          <SectionHeader title="Projects Over Time" subtitle="Monthly project count" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9" }} />
                <Bar dataKey="projects" name="Projects" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clients" name="New Clients" fill="#1a4dff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Team Performance */}
        <Card>
          <SectionHeader title="Team Performance" subtitle="Task completion rates" />
          <div className="space-y-3">
            {teamPerformance.map((member, i) => {
              const rate = Math.round((member.completed / member.tasks) * 100);
              return (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs shrink-0">
                    {member.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-white text-sm font-medium">{member.name}</span>
                      <span className="text-xs text-slate-400">{member.completed}/{member.tasks} tasks</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rate}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                        className="progress-fill h-full"
                        style={{ background: rate >= 90 ? "#10b981" : rate >= 75 ? "#1a4dff" : "#f59e0b" }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white w-10 text-right">{rate}%</span>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
