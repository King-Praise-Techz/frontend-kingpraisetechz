"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

/* =========================
   Stats Card
========================= */

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;

  accentColor?: string; // NEW PROP

  iconBg?: string;
  iconColor?: string;

  trend?: { value: number; label?: string };
  delay?: number;
}

export function StatsCard({
  title,
  value,
  icon,
  accentColor,
  iconBg,
  iconColor,
  trend,
  delay = 0,
}: StatsCardProps) {

  const background = iconBg ?? (accentColor ? `${accentColor}20` : "bg-white/10");
  const color = iconColor ?? (accentColor ? accentColor : "text-white");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card p-6 card-hover"
    >
      <div className="flex items-start justify-between mb-4">

        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: background,
            boxShadow: accentColor
              ? `0 0 18px ${accentColor}55`
              : undefined,
          }}
        >
          <span style={{ color }}>{icon}</span>
        </div>

        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.value > 0
                ? "bg-emerald-500/15 text-emerald-400"
                : trend.value < 0
                ? "bg-red-500/15 text-red-400"
                : "bg-slate-500/15 text-slate-400"
            )}
          >
            {trend.value > 0 ? (
              <TrendingUp size={12} />
            ) : trend.value < 0 ? (
              <TrendingDown size={12} />
            ) : (
              <Minus size={12} />
            )}

            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <p className="text-3xl font-display font-bold text-white mb-1">
        {value}
      </p>

      <p className="text-slate-400 text-sm">{title}</p>

      {trend?.label && (
        <p className="text-slate-500 text-xs mt-1">
          {trend.label}
        </p>
      )}
    </motion.div>
  );
}

/* =========================
   Badge
========================= */

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}

const badgeVariants = {
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  info: "badge-info",
  neutral: "bg-white/10 text-slate-300 border border-white/15",
};

export function Badge({
  children,
  variant = "neutral",
  size = "md",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        badgeVariants[variant],
        size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-3 py-1"
      )}
    >
      {children}
    </span>
  );
}

/* =========================
   Progress Bar
========================= */

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  height?: number;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  color,
  height = 8,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-1">

      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>Progress</span>
          <span className="font-medium text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div className="progress-bar" style={{ height }}>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="progress-fill h-full"
          style={color ? { background: color } : undefined}
        />

      </div>
    </div>
  );
}

/* =========================
   Section Header
========================= */

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display font-bold text-white text-xl">
          {title}
        </h2>

        {subtitle && (
          <p className="text-slate-400 text-sm mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}

/* =========================
   Card Wrapper
========================= */

export function Card({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div className={cn("glass-card p-6", className)} {...props}>
      {children}
    </div>
  );
}