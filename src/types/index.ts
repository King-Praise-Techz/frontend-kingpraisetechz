export type UserRole = "admin" | "client" | "team";

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  avatar?: string;
  isTemporaryAdmin?: boolean;
  temporaryAdminExpiry?: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
  company?: string;
  industry?: string;
  jobTitle?: string;
  skills?: string[];
  phone?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deliveryDate: string;
  status: "planning" | "in-progress" | "review" | "completed" | "on-hold";
  clientId: string;
  clientName: string;
  clientEmail: string;
  assignedTeam: TeamMember[];
  milestones: Milestone[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  progress: number;
  category?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  completedAt?: string;
  order: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  status: "pending" | "in-progress" | "review" | "completed";
  dueDate: string;
  payment: number;
  deliverable?: string;
  deliverableUrl?: string;
  submittedAt?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Review {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  projectId: string;
  projectName: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken?: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  twoFactorRequired: boolean;
  needs2FASetup?: boolean;
  setupToken?: string | null;
  partialToken?: string | null;
  login: (email: string, password: string) => Promise<{ requires2FA: boolean; needs2FASetup?: boolean }>;
  signup: (data: SignupData) => Promise<void>;
  verify2FA: (otp: string) => Promise<void>;
  enable2FA?: (setupToken: string, otp: string) => Promise<void>;
  forgotPassword?: (email: string) => Promise<void>;
  resetPassword?: (token: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export interface SignupData {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  role: "client" | "team";
  company?: string;
  industry?: string;
  phone?: string;
  jobTitle?: string;
  skills?: string[];
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue?: number;
  pendingReviews?: number;
  teamMembers?: number;
  pendingTasks?: number;
  completedTasks?: number;
  totalEarnings?: number;
}
