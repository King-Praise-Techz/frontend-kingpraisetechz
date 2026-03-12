"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

// ─── StatsCard ────────────────────────────────────────────
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconColor?: string;
  accentColor?: string; // css color string
  trend?: { value: number; label?: string };
  delay?: number;
}
export function StatsCard({ title, value, icon, iconColor, accentColor = "var(--brand)", trend, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.38 }}
      className="card card-hover p-5 relative overflow-hidden"
    >
      {/* subtle accent glow top-left */}
      <div
        className="absolute -top-8 -left-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
        style={{ background: accentColor, filter: "blur(28px)" }}
      />

      <div className="flex items-start justify-between mb-4 relative">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>

        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            trend.value > 0  ? "badge-success" :
            trend.value < 0  ? "badge-danger"  : "badge-neutral"
          )}>
            {trend.value > 0  ? <TrendingUp  size={11} /> :
             trend.value < 0  ? <TrendingDown size={11} /> :
                                <Minus size={11} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <p
        className="text-2xl font-bold mb-0.5"
        style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}
      >
        {value}
      </p>
      <p className="text-sm" style={{ color: "var(--text-2)" }}>{title}</p>
      {trend?.label && <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{trend.label}</p>}
    </motion.div>
  );
}

// ─── Badge ────────────────────────────────────────────────
interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}
export function Badge({ children, variant = "neutral", size = "md" }: BadgeProps) {
  return (
    <span className={cn(
      "badge",
      `badge-${variant}`,
      size === "sm" ? "text-[0.68rem] px-2 py-0.5" : ""
    )}>
      {children}
    </span>
  );
}

// ─── ProgressBar ─────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  height?: number;
}
export function ProgressBar({ value, max = 100, showLabel = false, color, height = 7 }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex justify-between text-xs" style={{ color: "var(--text-2)" }}>
          <span>Progress</span>
          <span className="font-semibold" style={{ color: "var(--text-1)" }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="progress-fill"
          style={color ? { background: color } : undefined}
        />
      </div>
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}
export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="font-semibold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
          {title}
        </h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-3)" }}
      >
        {icon}
      </div>
      <h3 className="font-semibold mb-1.5" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
        {title}
      </h3>
      <p className="text-sm max-w-xs" style={{ color: "var(--text-2)" }}>{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

// ─── Card ─────────────────────────────────────────────────
export function Card({ children, className, ...props }: { children: ReactNode; className?: string; [k: string]: any }) {
  return (
    <div className={cn("card p-5", className)} {...props}>
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────
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
  const varMap = { primary: "btn-primary", secondary: "btn-secondary", ghost: "btn-ghost", danger: "btn-danger", gold: "btn-gold" };
  const sizeMap = { sm: "btn-sm", md: "", lg: "btn-lg" };
  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.01 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn("btn", varMap[variant], sizeMap[size], className)}
    >
      {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      {children}
    </motion.button>
  );
}

// ─── Modal ────────────────────────────────────────────────
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
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0" style={{ background: "rgba(7,9,15,0.75)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className={cn("relative card w-full z-10 overflow-hidden", sizes[size])}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--text-2)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >✕</button>
        </div>
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 70px)" }}>{children}</div>
      </motion.div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────
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
      {label && <label className="text-sm font-medium block" style={{ color: "var(--text-2)" }}>{label}</label>}
      <div className="relative">
        {prefix && <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }}>{prefix}</div>}
        <input
          className={cn("input", prefix && "pl-10", error && "err", className)}
          {...props}
        />
      </div>
      {error && <p className="text-xs" style={{ color: "var(--rose)" }}>{error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: "var(--text-3)" }}>{hint}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────
export function Textarea({ label, error, ...props }: { label?: string; error?: string; [key: string]: any }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium block" style={{ color: "var(--text-2)" }}>{label}</label>}
      <textarea className={cn("input resize-none", error && "err")} rows={4} {...props} />
      {error && <p className="text-xs" style={{ color: "var(--rose)" }}>{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────
export function Select({ label, error, options, ...props }: { label?: string; error?: string; options: { value: string; label: string }[]; [key: string]: any }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium block" style={{ color: "var(--text-2)" }}>{label}</label>}
      <select
        className={cn("input cursor-pointer", error && "err")}
        style={{ background: "var(--surface-2)" }}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: "var(--surface-2)" }}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs" style={{ color: "var(--rose)" }}>{error}</p>}
    </div>
  );
}