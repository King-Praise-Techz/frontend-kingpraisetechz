"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  FolderKanban,
  Star,
  Target,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { StatsCard, Card, SectionHeader, ProgressBar } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

type Period = "7d" | "30d" | "90d";

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
  { name: "Chidi A.", tasks: 12, completed: 11 },
  { name: "Aisha B.", tasks: 9, completed: 9 },
  { name: "Emeka O.", tasks: 14, completed: 12 },
  { name: "Fatima M.", tasks: 8, completed: 7 },
  { name: "Tunde S.", tasks: 11, completed: 10 },
];

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
        <p
          key={i}
          className="text-sm font-semibold"
          style={{ color: p.color }}
        >
          {p.name === "revenue"
            ? formatCurrency(p.value)
            : `${p.value} ${p.name}`}
        </p>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            Analytics
          </h1>
          <p className="text-slate-400 mt-1">
            Business insights and performance metrics
          </p>
        </div>

        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatsCard
          title="Total Revenue"
          value="₦4.29M"
          icon={<DollarSign size={20} />}
          iconBg="bg-amber-500/15"
          iconColor="text-amber-400"
          glowColor="rgba(245,158,11,0.4)"
          trend={{ value: 18, label: "vs last period" }}
          delay={0.1}
        />

        <StatsCard
          title="Projects Completed"
          value="37"
          icon={<FolderKanban size={20} />}
          iconBg="bg-blue-500/15"
          iconColor="text-blue-400"
          glowColor="rgba(59,130,246,0.4)"
          trend={{ value: 12, label: "vs last period" }}
          delay={0.2}
        />

        <StatsCard
          title="Client Satisfaction"
          value="4.8/5"
          icon={<Star size={20} />}
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-400"
          glowColor="rgba(16,185,129,0.4)"
          trend={{ value: 5, label: "vs last period" }}
          delay={0.3}
        />

        <StatsCard
          title="Team Efficiency"
          value="94%"
          icon={<Target size={20} />}
          iconBg="bg-purple-500/15"
          iconColor="text-purple-400"
          glowColor="rgba(168,85,247,0.4)"
          trend={{ value: 3, label: "task completion" }}
          delay={0.4}
        />

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue */}
        <Card className="lg:col-span-2">

          <SectionHeader
            title="Revenue Trend"
            subtitle="Monthly revenue over time"
          />

          <div className="h-64">

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>

                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a4dff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1a4dff" stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1a4dff"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                />

              </AreaChart>
            </ResponsiveContainer>

          </div>

        </Card>

        {/* Category */}
        <Card>

          <SectionHeader
            title="Project Categories"
            subtitle="Revenue by type"
          />

          <div className="h-48">

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>

                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                >
                  {categoryData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip />

              </PieChart>
            </ResponsiveContainer>

          </div>

        </Card>

      </div>

      {/* Team Performance */}

      <Card>

        <SectionHeader
          title="Team Performance"
          subtitle="Task completion rates"
        />

        <div className="space-y-4">

          {teamPerformance.map((member, i) => {

            const rate = Math.round(
              (member.completed / member.tasks) * 100
            );

            return (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >

                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-white font-medium">
                    {member.name}
                  </span>

                  <span className="text-slate-400">
                    {member.completed}/{member.tasks}
                  </span>
                </div>

                <ProgressBar
                  value={rate}
                  color={
                    rate >= 90
                      ? "#10b981"
                      : rate >= 75
                      ? "#1a4dff"
                      : "#f59e0b"
                  }
                />

              </motion.div>
            );
          })}

        </div>

      </Card>

    </div>
  );
}