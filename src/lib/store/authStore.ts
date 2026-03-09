"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { AuthState, User, SignupData } from "@/types";
import { API_BASE_URL } from "@/lib/api";

async function publicPost(endpoint: string, body: object) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

function normaliseUser(raw: any, dashboardRole?: string): User {
  return {
    id:              raw._id || raw.id,
    email:           raw.email,
    name:            raw.fullName || `${raw.firstName || ""} ${raw.lastName || ""}`.trim(),
    firstName:       raw.firstName,
    lastName:        raw.lastName,
    role:            (dashboardRole || raw.role) as "admin" | "client" | "team",
    avatar:          raw.avatar,
    isTemporaryAdmin: raw.isTemporaryAdmin,
    temporaryAdminExpiry: raw.temporaryAdminUntil,
    twoFactorEnabled: raw.twoFactorEnabled,
    createdAt:       raw.createdAt,
    company:         raw.company,
    jobTitle:        raw.jobTitle,
    skills:          raw.skills,
    phone:           raw.phone,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      twoFactorRequired: false,
      needs2FASetup: false,
      setupToken: null,
      partialToken: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await publicPost("/auth/login", { email, password });
          const d = res.data;

          if (d.needs2FASetup) {
            set({ needs2FASetup: true, setupToken: d.setupToken, twoFactorRequired: false, isLoading: false });
            return { requires2FA: false, needs2FASetup: true };
          }
          if (d.requires2FA) {
            set({ twoFactorRequired: true, partialToken: d.partialToken, needs2FASetup: false, isLoading: false });
            return { requires2FA: true, needs2FASetup: false };
          }

          const user = normaliseUser(d.user, d.dashboardRole);
          set({
            user, token: d.accessToken, refreshToken: d.refreshToken,
            isAuthenticated: true, twoFactorRequired: false, needs2FASetup: false,
            setupToken: null, partialToken: null, isLoading: false,
          });
          toast.success("Login successful!");
          return { requires2FA: false, needs2FASetup: false };
        } catch (err: any) {
          set({ isLoading: false });
          toast.error(err.message || "Login failed. Please try again.");
          throw err;
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true });
        try {
          const payload: Record<string, any> = {
            firstName: data.firstName || (data.name || "").split(" ")[0],
            lastName:  data.lastName  || (data.name || "").split(" ").slice(1).join(" ") || "User",
            email: data.email, password: data.password, role: data.role, phone: data.phone,
          };
          if (data.role === "client") { payload.company = data.company; payload.industry = data.industry; }
          if (data.role === "team")   { payload.jobTitle = data.jobTitle; payload.skills = data.skills || []; }

          await publicPost("/auth/register", payload);
          set({ needs2FASetup: true, isLoading: false });
          toast.success("Account created! Please set up 2FA to continue.");
        } catch (err: any) {
          set({ isLoading: false });
          toast.error(err.message || "Signup failed. Please try again.");
          throw err;
        }
      },

      verify2FA: async (otp: string) => {
        set({ isLoading: true });
        const { partialToken } = get();
        try {
          const res = await publicPost("/auth/2fa/verify", { partialToken, otp });
          const d = res.data;
          const user = normaliseUser(d.user, d.dashboardRole);
          set({
            user, token: d.accessToken, refreshToken: d.refreshToken,
            isAuthenticated: true, twoFactorRequired: false, partialToken: null, isLoading: false,
          });
          toast.success("Authentication successful!");
        } catch (err: any) {
          set({ isLoading: false });
          toast.error(err.message || "Invalid verification code.");
          throw err;
        }
      },

      enable2FA: async (setupToken: string, otp: string) => {
        set({ isLoading: true });
        try {
          const res = await publicPost("/auth/2fa/enable", { setupToken, otp });
          const d = res.data;
          const user = normaliseUser(d.user, d.dashboardRole);
          set({
            user, token: d.accessToken, refreshToken: d.refreshToken,
            isAuthenticated: true, needs2FASetup: false, setupToken: null, isLoading: false,
          });
          toast.success("2FA enabled! You are now logged in.");
        } catch (err: any) {
          set({ isLoading: false });
          toast.error(err.message || "Failed to enable 2FA.");
          throw err;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true });
        try {
          await publicPost("/auth/forgot-password", { email });
          set({ isLoading: false });
          toast.success("If that email exists, a reset link has been sent.");
        } catch (err: any) {
          set({ isLoading: false });
          toast.error(err.message || "Failed to send reset email.");
          throw err;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true });
        try {
          await publicPost("/auth/reset-password", { token, newPassword });
          set({ isLoading: false });
          toast.success("Password reset successfully. You can now login.");
        } catch (err: any) {
          set({ isLoading: false });
          toast.error(err.message || "Invalid or expired reset token.");
          throw err;
        }
      },

      logout: () => {
        set({
          user: null, token: null, refreshToken: null, isAuthenticated: false,
          twoFactorRequired: false, needs2FASetup: false, setupToken: null, partialToken: null,
        });
        toast.success("Logged out successfully");
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({ user: { ...currentUser, ...userData } });
      },
    }),
    {
      name: "kpt-auth-store",
      partialize: (state) => ({
        user: state.user, token: state.token, refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated, partialToken: state.partialToken,
        setupToken: state.setupToken, needs2FASetup: state.needs2FASetup,
        twoFactorRequired: state.twoFactorRequired,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) state.isAuthenticated = true;
      },
    }
  )
);
