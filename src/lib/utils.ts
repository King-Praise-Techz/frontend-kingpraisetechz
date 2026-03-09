import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMM dd, yyyy");
}

export function formatDatetime(date: string | Date): string {
  return format(new Date(date), "MMM dd, yyyy • h:mm a");
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    "planning": "badge-info",
    "in-progress": "badge-warning",
    "review": "badge-info",
    "completed": "badge-success",
    "on-hold": "badge-danger",
    "pending": "badge-warning",
    "approved": "badge-success",
    "rejected": "badge-danger",
  };
  return colors[status] || "badge-info";
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return "bg-green-500";
  if (progress >= 50) return "bg-blue-500";
  if (progress >= 25) return "bg-yellow-500";
  return "bg-red-500";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a4dff&color=fff&size=128&bold=true`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const roleColors = {
  admin: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  client: { bg: "rgba(26,77,255,0.15)", text: "#4d7aff", border: "rgba(26,77,255,0.3)" },
  team: { bg: "rgba(16,185,129,0.15)", text: "#10b981", border: "rgba(16,185,129,0.3)" },
};

export const roleLabels = {
  admin: "Administrator",
  client: "Client",
  team: "Team Member",
};
