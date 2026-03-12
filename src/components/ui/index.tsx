"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

// Stats Card
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: { value: number; label?: string };
  delay?: number;
  glowColor?: string;
}

export function StatsCard({ title, value, icon, iconBg, iconColor, trend, delay = 0, glowColor }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card p-6 card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg)}
          style={{ boxShadow: glowColor ? `0 0 20px ${glowColor}` : undefined }}
        >
          <span className={iconColor}>{icon}</span>
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend.value > 0 ? "bg-emerald-500/15 text-emerald-400" :
              trend.value < 0 ? "bg-red-500/15 text-red-400" : "bg-slate-500/15 text-slate-400"
          )}>
            {trend.value > 0 ? <TrendingUp size={12} /> : trend.value < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-display font-bold text-white mb-1">{value}</p>
      <p className="text-slate-400 text-sm">{title}</p>
      {trend?.label && <p className="text-slate-500 text-xs mt-1">{trend.label}</p>}
    </motion.div>
  );
}

// Badge
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

export function Badge({ children, variant = "neutral", size = "md" }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-medium",
      badgeVariants[variant],
      size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-3 py-1"
    )}>
      {children}
    </span>
  );
}

// Progress Bar
interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, max = 100, showLabel = false, color, height = 8 }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>Progress</span>
          <span className="font-medium text-white">{Math.round(percentage)}%</span>
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

// Section Header
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display font-bold text-white text-xl">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Empty State
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}

// Loading skeleton
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-lg bg-white/5 relative overflow-hidden", className)}
      style={{
        backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 2s linear infinite",
      }}
    />
  );
}

// Card wrapper
export function Card({ children, className, ...props }: { children: ReactNode; className?: string; [key: string]: any }) {
  return (
    <div className={cn("glass-card p-6", className)} {...props}>
      {children}
    </div>
  );
}

// Button
interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  icon?: ReactNode;
}

export function Button({ children, variant = "primary", size = "md", disabled, loading, onClick, type = "button", className, icon }: ButtonProps) {
  const variants = {
    primary: "btn-glow text-white",
    secondary: "glass-card text-white hover:border-white/20 border border-white/10 transition-all",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-xl",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all rounded-xl",
    gold: "btn-gold text-white rounded-xl",
  };

  const sizes = {
    sm: "text-xs px-3 py-2",
    md: "text-sm px-4 py-2.5",
    lg: "text-sm px-6 py-3.5",
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </motion.button>
  );
}

// Modal
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={cn("relative glass-card w-full overflow-hidden z-10", sizes[size])}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="font-display font-bold text-white text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center">
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// Input
interface InputProps {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  [key: string]: any;
}

export function Input({ label, error, hint, prefix, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-300 block">{label}</label>}
      <div className="relative">
        {prefix && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{prefix}</div>}
        <input
          className={cn(
            "input-dark w-full px-4 py-3 rounded-xl text-sm",
            prefix && "pl-10",
            error && "border-red-500/50",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// Textarea
export function Textarea({ label, error, ...props }: { label?: string; error?: string; [key: string]: any }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-300 block">{label}</label>}
      <textarea
        className={cn("input-dark w-full px-4 py-3 rounded-xl text-sm resize-none", error && "border-red-500/50")}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// Select
export function Select({ label, error, options, ...props }: { label?: string; error?: string; options: { value: string; label: string }[]; [key: string]: any }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-300 block">{label}</label>}
      <select
        className={cn("input-dark w-full px-4 py-3 rounded-xl text-sm cursor-pointer", error && "border-red-500/50")}
        style={{ background: "rgba(255,255,255,0.05)" }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: "#1a1a2e" }}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
