import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { AuthGuard } from "@/components/shared/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
