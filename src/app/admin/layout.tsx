import { AdminGuard } from "@/components/admin/admin-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DashboardShell>
      <AdminGuard>{children}</AdminGuard>
    </DashboardShell>
  );
}
