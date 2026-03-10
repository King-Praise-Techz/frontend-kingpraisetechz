import axios from "axios";

/* ─────────────────────────────────────────────
   BASE URL
───────────────────────────────────────────── */

const RAW_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://king-praise-techz-backend.onrender.com";

/* Ensure /api exists only once */

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
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

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
───────────────────────────────────────────── */

export const projectsAPI = {
  getAll: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/projects${buildQuery(q)}`),

  getById: (id: string) => fetchWithAuth(`/projects/${id}`),

  create: (data: unknown) =>
    fetchWithAuth(`/projects`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: unknown) =>
    fetchWithAuth(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchWithAuth(`/projects/${id}`, {
      method: "DELETE",
    }),
};

/* ─────────────────────────────────────────────
   REVIEWS API
───────────────────────────────────────────── */

export const reviewsAPI = {
  getAll: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/reviews${buildQuery(q)}`),

  create: (data: unknown) =>
    fetchWithAuth(`/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approve: (id: string) =>
    fetchWithAuth(`/reviews/${id}/approve`, {
      method: "POST",
    }),

  reject: (id: string) =>
    fetchWithAuth(`/reviews/${id}/reject`, {
      method: "POST",
    }),
};

/* ─────────────────────────────────────────────
   TEAM API
───────────────────────────────────────────── */

export const teamAPI = {
  getAll: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/team${buildQuery(q)}`),

  getById: (id: string) => fetchWithAuth(`/team/${id}`),

  promoteToAdmin: (id: string, data: unknown) =>
    fetchWithAuth(`/team/${id}/promote`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  revokeAdmin: (id: string) =>
    fetchWithAuth(`/team/${id}/revoke-admin`, {
      method: "POST",
    }),
};

/* ─────────────────────────────────────────────
   TASKS API
───────────────────────────────────────────── */

export const tasksAPI = {
  getAll: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/tasks${buildQuery(q)}`),

  update: (id: string, data: unknown) =>
    fetchWithAuth(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

/* ─────────────────────────────────────────────
   NOTIFICATIONS API
───────────────────────────────────────────── */

export const notificationsAPI = {
  getAll: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/notifications${buildQuery(q)}`),

  markAllRead: () =>
    fetchWithAuth(`/notifications/mark-all-read`, {
      method: "POST",
    }),
};

/* ─────────────────────────────────────────────
   DASHBOARD API
───────────────────────────────────────────── */

export const dashboardAPI = {
  getStats: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/dashboard${buildQuery(q)}`),
};

/* ─────────────────────────────────────────────
   MILESTONES API
───────────────────────────────────────────── */

export const milestoneAPI = {
  getAll: (q?: Record<string, unknown>) =>
    fetchWithAuth(`/milestones${buildQuery(q)}`),

  update: (id: string, data: unknown) =>
    fetchWithAuth(`/milestones/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

/* ─────────────────────────────────────────────
   AUTH API
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