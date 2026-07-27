"use client";

import { Activity, KeyRound, Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AdminApiKeysTable } from "@/components/admin/api-keys-table";
import { AdminPlansTable } from "@/components/admin/plans-table";
import { AdminSearchLogsTable } from "@/components/admin/search-logs-table";
import { AdminWalletsTable } from "@/components/admin/wallets-table";
import { AdminSystemSettings } from "@/components/admin/system-settings";
import { AdminUsersTable } from "@/components/admin/users-table";
import { AdminWhatsAppAccounts } from "@/components/admin/whatsapp-accounts-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStats } from "@/hooks/use-api";
import { formatNumber } from "@/lib/utils";

export function AdminPanel() {
  const { data: stats, isLoading } = useAdminStats();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "users";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "users") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fallbackStats = stats as any;

  const totalUsers = stats?.users?.total ?? fallbackStats?.total_users ?? 0;
  const activeUsers =
    stats?.users?.active_today ?? fallbackStats?.active_users ?? 0;

  const mrr =
    stats?.revenue?.mrr ?? fallbackStats?.monthly_recurring_revenue ?? 0;
  const totalRevenue =
    stats?.revenue?.total ?? fallbackStats?.total_revenue ?? 0;

  const totalLookups =
    stats?.lookups?.total_this_month ??
    fallbackStats?.total_api_calls_this_month ??
    fallbackStats?.total_searches ??
    0;
  const rawSuccessRate =
    stats?.lookups?.success_rate ?? fallbackStats?.success_rate ?? 0;
  const successRate =
    rawSuccessRate <= 1 ? rawSuccessRate * 100 : rawSuccessRate;

  return (
    <>
      <PageHeader
        title="Admin"
        description="Users, wallets, keys and system configuration."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading || !stats ? (
          Array.from({ length: 3 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : (
          <>
            <StatCard
              label="Users"
              value={formatNumber(totalUsers)}
              hint={`${formatNumber(activeUsers)} active today`}
              icon={Users}
            />
            <StatCard
              label="Monthly Revenue"
              value={`$${mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              hint={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total`}
              icon={Activity}
            />
            <StatCard
              label="API Calls (This Month)"
              value={formatNumber(totalLookups)}
              hint={`${successRate.toFixed(0)}% success rate`}
              icon={KeyRound}
            />
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-8">
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="logs">Search Logs</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="settings">System</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <AdminUsersTable />
        </TabsContent>
        <TabsContent value="wallets" className="mt-4">
          <AdminWalletsTable />
        </TabsContent>
        <TabsContent value="api-keys" className="mt-4">
          <AdminApiKeysTable />
        </TabsContent>
        <TabsContent value="logs" className="mt-4">
          <AdminSearchLogsTable />
        </TabsContent>
        <TabsContent value="whatsapp" className="mt-4">
          <AdminWhatsAppAccounts />
        </TabsContent>
        <TabsContent value="plans" className="mt-4">
          <AdminPlansTable />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <AdminSystemSettings />
        </TabsContent>
      </Tabs>
    </>
  );
}
