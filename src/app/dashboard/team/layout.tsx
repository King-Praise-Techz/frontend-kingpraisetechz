import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { AuthGuard } from "@/components/shared/AuthGuard";

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["team"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
