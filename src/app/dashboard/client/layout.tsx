import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { AuthGuard } from "@/components/shared/AuthGuard";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["client"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
