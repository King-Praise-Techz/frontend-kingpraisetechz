import axios from "axios";

/* ─────────────────────────────────────────────
   BASE URL
───────────────────────────────────────────── */

const RAW_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://king-praise-techz-backend.onrender.com";

export const API_BASE_URL = RAW_BASE.endsWith("/api")
  ? RAW_BASE
  : `${RAW_BASE}/api`;

/* ─────────────────────────────────────────────
   TOKEN HELPER
───────────────────────────────────────────── */

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("kpt-auth-store");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
};

/* ─────────────────────────────────────────────
   QUERY HELPER
───────────────────────────────────────────── */

const buildQuery = (params?: Record<string, unknown>) => {
  if (!params) return "";
  const query = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  return query ? `?${query}` : "";
};

/* ─────────────────────────────────────────────
   AXIOS CLIENT
───────────────────────────────────────────── */

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ─────────────────────────────────────────────
   FETCH WRAPPER
───────────────────────────────────────────── */

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("kpt-auth-store");
      window.location.href = "/auth/login";
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed (${response.status})`);
  }

  return response.json();
};

/* ─────────────────────────────────────────────
   PROJECTS API
   FIX: update() changed PUT → PATCH (backend uses PATCH)
───────────────────────────────────────────── */

export const projectsAPI = {
  getAll: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/projects${buildQuery(q)}`),

  getById: (id: string) =>
    fetchWithAuth(`/projects/${id}`),

  create: (data: unknown) =>
    fetchWithAuth(`/projects`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: unknown) =>
    fetchWithAuth(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchWithAuth(`/projects/${id}`, { method: "DELETE" }),
};

/* ─────────────────────────────────────────────
   CLIENTS API
   ADDED: was completely missing — needed by ClientLookup
───────────────────────────────────────────── */

export const clientsAPI = {
  getAll: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/clients${buildQuery(q)}`),

  getById: (id: string) =>
    fetchWithAuth(`/clients/${id}`),

  search: (q: string) =>
    fetchWithAuth(`/clients${buildQuery({ search: q })}`),
};

/* ─────────────────────────────────────────────
   REVIEWS API
   FIX: approve/reject changed POST → PATCH (backend uses PATCH)
───────────────────────────────────────────── */

export const reviewsAPI = {
  getAll: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/reviews${buildQuery(q)}`),

  create: (data: unknown) =>
    fetchWithAuth(`/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approve: (id: string, data?: unknown) =>
    fetchWithAuth(`/reviews/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify(data ?? {}),
    }),

  reject: (id: string, data?: unknown) =>
    fetchWithAuth(`/reviews/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify(data ?? {}),
    }),
};

/* ─────────────────────────────────────────────
   TEAM API
   All endpoints aligned with backend ✓
───────────────────────────────────────────── */

export const teamAPI = {
  getAll: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/team${buildQuery(q)}`),

  getById: (id: string) =>
    fetchWithAuth(`/team/${id}`),

  promoteToAdmin: (id: string, data: unknown) =>
    fetchWithAuth(`/team/${id}/promote`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  revokeAdmin: (id: string) =>
    fetchWithAuth(`/team/${id}/revoke-admin`, { method: "POST" }),
};

/* ─────────────────────────────────────────────
   TASKS API
   FIX: update() changed PUT → PATCH (backend uses PATCH)
   ADDED: getById, create, updateStatus, submit, delete
───────────────────────────────────────────── */

export const tasksAPI = {
  getAll: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/tasks${buildQuery(q)}`),

  getById: (id: string) =>
    fetchWithAuth(`/tasks/${id}`),

  create: (data: unknown) =>
    fetchWithAuth(`/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: unknown) =>
    fetchWithAuth(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, data: unknown) =>
    fetchWithAuth(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  submit: (id: string, data: unknown) =>
    fetchWithAuth(`/tasks/${id}/submit`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchWithAuth(`/tasks/${id}`, { method: "DELETE" }),
};

/* ─────────────────────────────────────────────
   MILESTONES API
   FIX: update() changed PUT → PATCH (backend uses PATCH)
   ADDED: create, updateStatus, delete
───────────────────────────────────────────── */

export const milestoneAPI = {
  getAll: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/milestones${buildQuery(q)}`),

  create: (data: unknown) =>
    fetchWithAuth(`/milestones`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: unknown) =>
    fetchWithAuth(`/milestones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, data: unknown) =>
    fetchWithAuth(`/milestones/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchWithAuth(`/milestones/${id}`, { method: "DELETE" }),
};

/* ─────────────────────────────────────────────
   NOTIFICATIONS API
   Aligned with backend ✓
───────────────────────────────────────────── */

export const notificationsAPI = {
  getAll: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/notifications${buildQuery(q)}`),

  markAllRead: () =>
    fetchWithAuth(`/notifications/mark-all-read`, { method: "POST" }),
};

/* ─────────────────────────────────────────────
   DASHBOARD API
   Aligned with backend ✓
───────────────────────────────────────────── */

export const dashboardAPI = {
  getStats: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/dashboard${buildQuery(q)}`),
};

/* ─────────────────────────────────────────────
   AUTH API
   Aligned with backend ✓
───────────────────────────────────────────── */

export const authAPI = {
  me: () => fetchWithAuth(`/auth/me`),

  updateProfile: (data: unknown) =>
    fetchWithAuth(`/auth/profile`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changePassword: (data: unknown) =>
    fetchWithAuth(`/auth/change-password`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};