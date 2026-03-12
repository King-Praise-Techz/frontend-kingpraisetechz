"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Crown, LayoutDashboard, FolderKanban, Users, Star, Bell, LogOut,
  ChevronRight, Menu, X, Settings, CheckSquare, BarChart3,
  Briefcase, Activity,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { cn, generateAvatarUrl, roleColors, roleLabels, timeAgo } from "@/lib/utils";
import { notificationsAPI } from "@/lib/api";
import { Notification } from "@/types";
import { AuthGuard } from "@/components/shared/AuthGuard";

const adminNav = [
  { href: "/dashboard/admin",           label: "Overview",   icon: <LayoutDashboard size={17} /> },
  { href: "/dashboard/admin/projects",  label: "Projects",   icon: <FolderKanban    size={17} /> },
  { href: "/dashboard/admin/team",      label: "Team",       icon: <Users           size={17} /> },
  { href: "/dashboard/admin/reviews",   label: "Reviews",    icon: <Star            size={17} /> },
  { href: "/dashboard/admin/analytics", label: "Analytics",  icon: <BarChart3       size={17} /> },
  { href: "/dashboard/admin/settings",  label: "Settings",   icon: <Settings        size={17} /> },
];
const clientNav = [
  { href: "/dashboard/client",              label: "Overview",        icon: <LayoutDashboard size={17} /> },
  { href: "/dashboard/client/projects",     label: "My Projects",     icon: <FolderKanban    size={17} /> },
  { href: "/dashboard/client/milestones",   label: "Milestones",      icon: <CheckSquare     size={17} /> },
  { href: "/dashboard/client/reviews",      label: "Submit Review",   icon: <Star            size={17} /> },
  { href: "/dashboard/client/settings",     label: "Settings",        icon: <Settings        size={17} /> },
];
const teamNav = [
  { href: "/dashboard/team",            label: "Overview",   icon: <LayoutDashboard size={17} /> },
  { href: "/dashboard/team/tasks",      label: "My Tasks",   icon: <CheckSquare     size={17} /> },
  { href: "/dashboard/team/projects",   label: "Projects",   icon: <FolderKanban    size={17} /> },
  { href: "/dashboard/team/earnings",   label: "Earnings",   icon: <Briefcase       size={17} /> },
  { href: "/dashboard/team/settings",   label: "Settings",   icon: <Settings        size={17} /> },
];
const navMap = { admin: adminNav, client: clientNav, team: teamNav };

// Role accent configs
const roleAccent: Record<string, { color: string; dim: string; border: string; label: string }> = {
  admin:  { color: "var(--gold)",    dim: "var(--gold-dim)",    border: "var(--gold-border)",    label: "Administrator" },
  client: { color: "var(--brand)",   dim: "var(--brand-dim)",   border: "var(--brand-border)",   label: "Client" },
  team:   { color: "var(--emerald)", dim: "var(--emerald-dim)", border: "var(--emerald-border)", label: "Team Member" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const role = (user?.role || "client") as "admin" | "client" | "team";
  const nav = navMap[role] || clientNav;
  const accent = roleAccent[role];

  useEffect(() => {
    if (user) {
      notificationsAPI.getAll()
        .then(res => {
          const notifs = res.data.notifications || [];
          setNotifications(notifs);
          setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => { logout(); router.push("/auth/login"); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="p-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, var(--brand), #818cf8)", boxShadow: "0 4px 14px var(--brand-glow)" }}
          >
            <Crown size={16} color="#fff" />
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
                King Praise Techz
              </p>
              <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>Agency Platform</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* User badge */}
      {sidebarOpen && user && (
        <div className="px-4 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: accent.dim, border: `1px solid ${accent.border}` }}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border" style={{ borderColor: accent.border }}>
              <img
                src={user.avatar || generateAvatarUrl(user.name || "User")}
                alt={user.name} className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>{user.name}</p>
              <p className="text-xs font-medium" style={{ color: accent.color }}>{accent.label}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const isActive = pathname === item.href || (item.href !== `/dashboard/${role}` && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn("nav-item", isActive && "active")} title={!sidebarOpen ? item.label : undefined}>
                <span className="shrink-0" style={isActive ? { color: accent.color } : {}}>{item.icon}</span>
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate text-[0.8125rem]">
                    {item.label}
                  </motion.span>
                )}
                {isActive && sidebarOpen && (
                  <ChevronRight size={13} className="ml-auto shrink-0" style={{ color: accent.color }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid var(--border)" }}>
        {!sidebarOpen && user && (
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src={user.avatar || generateAvatarUrl(user.name || "User")} alt={user.name} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="nav-item w-full text-left"
          style={{ color: "var(--text-2)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--rose)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
        >
          <LogOut size={17} className="shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <AuthGuard allowedRoles={[role as any]}>
      <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>

        {/* Desktop sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? 236 : 64 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="hidden lg:flex flex-col relative overflow-hidden shrink-0"
          style={{ background: "var(--surface-1)", borderRight: "1px solid var(--border)", borderRadius: 0 }}
        >
          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 right-3 z-10 w-6 h-6 rounded-md flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-3)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-1)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
            }}
          >
            <ChevronRight size={12} className={sidebarOpen ? "rotate-180" : ""} />
          </button>
          <SidebarContent />
        </motion.aside>

        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 lg:hidden"
                style={{ background: "rgba(7,9,15,0.7)", backdropFilter: "blur(6px)" }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden"
                style={{ background: "var(--surface-1)", borderRight: "1px solid var(--border)" }}
              >
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-4 transition-colors"
                  style={{ color: "var(--text-3)" }}
                >
                  <X size={19} />
                </button>
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* Header */}
          <header
            className="h-14 flex items-center justify-between px-5 shrink-0"
            style={{ background: "rgba(12,16,24,0.88)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden transition-colors"
                style={{ color: "var(--text-2)" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-1)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
              >
                <Menu size={20} />
              </button>
              <p className="text-xs hidden sm:block" style={{ color: "var(--text-3)" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Role badge */}
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: accent.dim, border: `1px solid ${accent.border}`, color: accent.color }}
              >
                <Activity size={11} />
                {accent.label}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-2)" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-1)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                      style={{ background: "var(--brand)" }}
                    >
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
                      className="absolute right-0 top-11 w-76 z-50 overflow-hidden"
                      style={{
                        width: 300, background: "var(--surface-2)",
                        border: "1px solid var(--border-md)", borderRadius: "var(--r-lg)",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                      }}
                    >
                      <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                        <p className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>Notifications</p>
                        {unreadCount > 0 && (
                          <span
                            className="text-xs cursor-pointer font-medium"
                            style={{ color: "var(--brand)" }}
                            onClick={async () => {
                              await notificationsAPI.markAllRead();
                              setUnreadCount(0);
                              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                            }}
                          >
                            Mark all read
                          </span>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm" style={{ color: "var(--text-3)" }}>No notifications</div>
                        ) : (
                          notifications.slice(0, 5).map(notif => (
                            <div
                              key={notif.id}
                              className="px-4 py-3 transition-colors"
                              style={{
                                borderBottom: "1px solid var(--border)",
                                background: !notif.read ? "var(--brand-dim)" : "transparent",
                              }}
                            >
                              <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{notif.title}</p>
                              <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>{notif.message}</p>
                              <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{timeAgo(notif.createdAt)}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl overflow-hidden" style={{ border: `1px solid ${accent.border}` }}>
                  <img
                    src={user?.avatar || generateAvatarUrl(user?.name || "User")}
                    alt={user?.name} className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-tight" style={{ color: "var(--text-1)" }}>
                    {user?.name?.split(" ")[0]}
                  </p>
                  <p className="text-xs" style={{ color: accent.color }}>
                    {accent.label}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6" style={{ background: "var(--bg)" }}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}