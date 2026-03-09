import axios from "axios";

// ─── Base URL ────────────────────────────────────────────────────────
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://king-praise-techz-backend.onrender.com/api";

// ─── Axios client (legacy) ────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("kpt-auth-store");
      if (raw) {
        const token = JSON.parse(raw)?.state?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
  }
  return config;
});

// ─── Fetch with auth ──────────────────────────────────────────────────
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("kpt-auth-store");
      if (raw) token = JSON.parse(raw)?.state?.token || null;
    } catch {}
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("kpt-auth-store");
      window.location.href = "/auth/login";
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP error ${res.status}`);
  }
  return res.json();
};

// ─── API Modules ──────────────────────────────────────────────────────
export const projectsAPI = {
  getAll: (q?: Record<string, unknown>) => {
    const params = q ? "?" + new URLSearchParams(q as Record<string, string>).toString() : "";
    return fetchWithAuth(`/projects${params}`);
  },
  getById: (id: string) => fetchWithAuth(`/projects/${id}`),
  create: (data: unknown) => fetchWithAuth("/projects/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: unknown) => fetchWithAuth(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchWithAuth(`/projects/${id}`, { method: "DELETE" }),
};

export const reviewsAPI = {
  getAll: (q?: Record<string, unknown>) => {
    const params = q ? "?" + new URLSearchParams(q as Record<string, string>).toString() : "";
    return fetchWithAuth(`/reviews${params}`);
  },
  create: (data: unknown) => fetchWithAuth("/reviews", { method: "POST", body: JSON.stringify(data) }),
  approve: (id: string) => fetchWithAuth(`/reviews/${id}/approve`, { method: "POST" }),
  reject: (id: string) => fetchWithAuth(`/reviews/${id}/reject`, { method: "POST" }),
};

export const teamAPI = {
  getAll: (q?: Record<string, unknown>) => {
    const params = q ? "?" + new URLSearchParams(q as Record<string, string>).toString() : "";
    return fetchWithAuth(`/team${params}`);
  },
  getById: (id: string) => fetchWithAuth(`/team/${id}`),
  promoteToAdmin: (id: string, data: unknown) => fetchWithAuth(`/team/${id}/promote`, { method: "POST", body: JSON.stringify(data) }),
  revokeAdmin: (id: string) => fetchWithAuth(`/team/${id}/revoke-admin`, { method: "POST" }),
};

export const tasksAPI = {
  getAll: (q?: Record<string, unknown>) => {
    const params = q ? "?" + new URLSearchParams(q as Record<string, string>).toString() : "";
    return fetchWithAuth(`/tasks${params}`);
  },
  update: (id: string, data: unknown) => fetchWithAuth(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

export const notificationsAPI = {
  getAll: (q?: Record<string, unknown>) => {
    const params = q ? "?" + new URLSearchParams(q as Record<string, string>).toString() : "";
    return fetchWithAuth(`/notifications${params}`);
  },
  markAllRead: () => fetchWithAuth("/notifications/mark-all-read", { method: "POST" }),
};

export const dashboardAPI = {
  getStats: (q?: Record<string, unknown>) => {
    const params = q ? "?" + new URLSearchParams(q as Record<string, string>).toString() : "";
    return fetchWithAuth(`/dashboard${params}`);
  },
};

export const milestoneAPI = {
  getAll: (q?: Record<string, unknown>) => {
    const params = q ? "?" + new URLSearchParams(q as Record<string, string>).toString() : "";
    return fetchWithAuth(`/milestones${params}`);
  },
  update: (id: string, data: unknown) => fetchWithAuth(`/milestones/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

export const authAPI = {
  me: () => fetchWithAuth("/auth/me"),
  updateProfile: (data: unknown) => fetchWithAuth("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
  changePassword: (data: unknown) => fetchWithAuth("/auth/change-password", { method: "POST", body: JSON.stringify(data) }),
};
