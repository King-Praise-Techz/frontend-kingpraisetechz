"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Crown, LayoutDashboard, FolderKanban, Users, Star, Bell, LogOut,
  ChevronRight, Menu, X, Settings, CheckSquare, BarChart3,
  FileUp, Briefcase, Zap, Shield, Moon
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { cn, getInitials, generateAvatarUrl, roleColors, roleLabels, timeAgo } from "@/lib/utils";
import { notificationsAPI } from "@/lib/api";
import { Notification } from "@/types";
import { AuthGuard } from "@/components/shared/AuthGuard";

const adminNav = [
  { href: "/dashboard/admin", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/admin/projects", label: "Projects", icon: <FolderKanban size={18} /> },
  { href: "/dashboard/admin/team", label: "Team", icon: <Users size={18} /> },
  { href: "/dashboard/admin/reviews", label: "Reviews", icon: <Star size={18} /> },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
  { href: "/dashboard/admin/settings", label: "Settings", icon: <Settings size={18} /> },
];

const clientNav = [
  { href: "/dashboard/client", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/client/projects", label: "My Projects", icon: <FolderKanban size={18} /> },
  { href: "/dashboard/client/milestones", label: "Milestones", icon: <CheckSquare size={18} /> },
  { href: "/dashboard/client/reviews", label: "Submit Review", icon: <Star size={18} /> },
  { href: "/dashboard/client/settings", label: "Settings", icon: <Settings size={18} /> },
];

const teamNav = [
  { href: "/dashboard/team", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/team/tasks", label: "My Tasks", icon: <CheckSquare size={18} /> },
  { href: "/dashboard/team/projects", label: "Projects", icon: <FolderKanban size={18} /> },
  { href: "/dashboard/team/earnings", label: "Earnings", icon: <Briefcase size={18} /> },
  { href: "/dashboard/team/settings", label: "Settings", icon: <Settings size={18} /> },
];

const navMap = { admin: adminNav, client: clientNav, team: teamNav };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const role = user?.role || "client";
  const nav = navMap[role] || clientNav;
  const roleStyle = roleColors[role];

  useEffect(() => {
    if (user) {
      notificationsAPI.getAll()
        .then((res) => {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.notifications?.filter((n: Notification) => !n.read).length || 0);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl btn-glow flex items-center justify-center shrink-0">
            <Crown size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <p className="font-display font-bold text-white text-sm leading-tight truncate">King Praise Techz</p>
              <p className="text-slate-500 text-xs">Agency Platform</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* User badge */}
      {sidebarOpen && (
        <div className="px-4 py-4 border-b border-white/5">
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: roleStyle.bg, border: `1px solid ${roleStyle.border}` }}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
              <img
                src={user?.avatar || generateAvatarUrl(user?.name || "User")}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs font-medium" style={{ color: roleStyle.text }}>
                {roleLabels[role]}
                {user?.isTemporaryAdmin && " (Temporary)"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/dashboard/${role}` && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn("nav-item", isActive && "active")}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">
                    {item.label}
                  </motion.span>
                )}
                {isActive && sidebarOpen && <ChevronRight size={14} className="ml-auto shrink-0 text-brand-400" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        {!sidebarOpen && user && (
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src={user?.avatar || generateAvatarUrl(user?.name || "User")} alt={user?.name} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="nav-item w-full text-left hover:text-red-400">
          <LogOut size={18} className="shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <AuthGuard allowedRoles={[role as any]}>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? 240 : 68 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="hidden lg:flex flex-col glass-card rounded-none border-r border-white/5 relative overflow-hidden shrink-0"
          style={{ borderRadius: 0 }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 right-3 z-10 w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            {sidebarOpen ? <ChevronRight size={12} className="rotate-180" /> : <ChevronRight size={12} />}
          </button>
          <SidebarContent />
        </motion.aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden"
                style={{ background: "rgba(10,10,20,0.97)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.08)" }}
              >
                <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Top Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0" style={{ background: "rgba(10,10,20,0.8)", backdropFilter: "blur(20px)" }}>
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
                <Menu size={20} />
              </button>
              <div>
                <p className="text-slate-400 text-xs hidden sm:block">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative w-9 h-9 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all hover:border-white/15"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-12 w-80 glass-card z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5 flex justify-between items-center">
                        <p className="font-semibold text-white text-sm">Notifications</p>
                        {unreadCount > 0 && (
                          <span className="text-xs text-brand-400 cursor-pointer hover:text-brand-300" onClick={async () => {
                            await notificationsAPI.markAllRead();
                            setUnreadCount(0);
                            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                          }}>
                            Mark all read
                          </span>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-sm">No notifications</div>
                        ) : (
                          notifications.slice(0, 5).map((notif) => (
                            <div key={notif.id} className={cn("p-4 border-b border-white/5 last:border-0 transition-colors hover:bg-white/5", !notif.read && "bg-brand-500/5")}>
                              <p className="text-white text-sm font-medium">{notif.title}</p>
                              <p className="text-slate-400 text-xs mt-1">{notif.message}</p>
                              <p className="text-slate-600 text-xs mt-1">{timeAgo(notif.createdAt)}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={user?.avatar || generateAvatarUrl(user?.name || "User")}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block">
                  <p className="text-white text-sm font-medium leading-tight">{user?.name?.split(" ")[0]}</p>
                  <p className="text-slate-500 text-xs" style={{ color: roleStyle.text }}>{roleLabels[role]}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
