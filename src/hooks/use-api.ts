"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import {
  adminPlansService,
  adminService,
  adminWhatsAppService,
  apiKeyService,
  billingService,
  usageService,
  verificationService,
} from "@/services";
import type { LookupStatus } from "@/types/api";

/** Central key registry — prevents typo-driven cache misses. */
export const queryKeys = {
  dashboardStats: ["dashboard", "stats"] as const,
  usage: (days: number) => ["usage", days] as const,
  apiKeys: ["api-keys"] as const,
  plans: ["plans"] as const,
  billing: ["billing"] as const,
  payments: ["payments"] as const,
  history: (params: object) => ["history", params] as const,
  admin: {
    stats: ["admin", "stats"] as const,
    users: (params: object) => ["admin", "users", params] as const,
    wallets: (params: object) =>
      ["admin", "wallets", params] as const,
    apiKeys: (params: object) => ["admin", "api-keys", params] as const,
    searchLogs: (params: object) => ["admin", "search-logs", params] as const,
    settings: ["admin", "settings"] as const,
    whatsappAccounts: ["admin", "whatsapp", "accounts"] as const,
    plans: ["admin", "plans"] as const,
  },
};

/** Surface a failed mutation as a toast, using the backend's message. */
export function toastApiError(
  error: unknown,
  fallback = "Something went wrong."
) {
  const message = error instanceof ApiError ? error.message : fallback;
  toast.error(message);
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: usageService.dashboardStats,
  });
}

export function useUsage(days = 30) {
  return useQuery({
    queryKey: queryKeys.usage(days),
    queryFn: () => usageService.overview(days),
  });
}

export function useApiKeys() {
  return useQuery({ queryKey: queryKeys.apiKeys, queryFn: apiKeyService.list });
}

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans,
    queryFn: billingService.plans,
    staleTime: 5 * 60_000,
  });
}

export function useBilling() {
  return useQuery({
    queryKey: queryKeys.billing,
    queryFn: billingService.overview,
  });
}

export function usePayments() {
  return useQuery({
    queryKey: queryKeys.payments,
    queryFn: billingService.payments,
  });
}

export function useSearchHistory(params: {
  page: number;
  page_size: number;
  status?: LookupStatus | "";
  q?: string;
}) {
  return useQuery({
    queryKey: queryKeys.history(params),
    queryFn: () => verificationService.history(params),
    placeholderData: (previous) => previous,
  });
}

/**
 * Runs a lookup and invalidates everything the result affects — history,
 * usage counters and the dashboard summary.
 *
 * Per-call callbacks belong on `mutate(phone, { onSuccess })` at the call
 * site; this hook owns only the cache invalidation.
 */
export function useCheckNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phone: string) => verificationService.check(phone),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["history"] });
      void queryClient.invalidateQueries({ queryKey: ["usage"] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardStats,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing });
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: adminService.stats,
  });
}

export function useAdminUsers(params: {
  page: number;
  page_size: number;
  q?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminService.users(params),
    placeholderData: (previous) => previous,
  });
}

export function useAdminWallets(params: {
  page: number;
  page_size: number;
}) {
  return useQuery({
    queryKey: queryKeys.admin.wallets(params),
    queryFn: () => adminService.wallets(params),
    placeholderData: (previous) => previous,
  });
}

export function useAdminApiKeys(params: { page: number; page_size: number }) {
  return useQuery({
    queryKey: queryKeys.admin.apiKeys(params),
    queryFn: () => adminService.apiKeys(params),
    placeholderData: (previous) => previous,
  });
}

export function useAdminSearchLogs(params: {
  page: number;
  page_size: number;
  q?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.searchLogs(params),
    queryFn: () => adminService.searchLogs(params),
    placeholderData: (previous) => previous,
  });
}

export function useSystemSettings() {
  return useQuery({
    queryKey: queryKeys.admin.settings,
    queryFn: adminService.settings,
  });
}

export function useAdminWhatsAppAccounts() {
  return useQuery({
    queryKey: queryKeys.admin.whatsappAccounts,
    queryFn: adminWhatsAppService.accounts,
  });
}

export function useInitWhatsAppAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminWhatsAppService.init,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.whatsappAccounts,
      });
    },
  });
}

export function useReverifyWhatsAppAccount() {
  return useMutation({
    mutationFn: (id: string) => adminWhatsAppService.reverify(id),
  });
}

export function useRemoveWhatsAppAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminWhatsAppService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.whatsappAccounts,
      });
    },
  });
}

export function useSetDefaultWhatsAppAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminWhatsAppService.setDefault(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.whatsappAccounts,
      });
    },
  });
}

// -- Admin Plans --

export function useAdminPlans() {
  return useQuery({
    queryKey: queryKeys.admin.plans,
    queryFn: adminPlansService.list,
  });
}

export function useCreateAdminPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminPlansService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.plans });
    },
  });
}

export function useUpdateAdminPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof adminPlansService.update>[1];
    }) => adminPlansService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.plans });
    },
  });
}

export function useRemoveAdminPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminPlansService.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.plans });
    },
  });
}
