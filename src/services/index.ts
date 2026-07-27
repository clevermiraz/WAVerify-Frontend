/**
 * Typed wrappers around every backend endpoint.
 *
 * Components never build URLs — they call these, so a route change is a
 * one-line edit here.
 */

import { api, buildQuery } from "@/lib/api-client";
import type {
  AdminApiKey,
  AdminSearchLog,
  AdminStats,
  AdminWallet,
  AdminUser,
  ApiKey,
  BillingOverview,
  CheckResult,
  CreatedApiKey,
  CreatePlanRequest,
  DashboardStats,
  LookupStatus,
  Page,
  Plan,
  SearchLog,
  Wallet,
  SystemSettings,
  UpdatePlanRequest,
  UsageOverview,
  User,
  WhatsAppAccount,
  WhatsAppAccountInitResponse,
  WhatsAppAccountsResponse,
  WhatsAppAccountStatusResponse,
} from "@/types/api";

export { authService } from "./auth";

export const verificationService = {
  check: (phone: string) => api.post<CheckResult>("/check", { phone }, { timeoutMs: 10_000 }),

  history: (params: {
    page?: number;
    page_size?: number;
    status?: LookupStatus | "";
    q?: string;
  }) => api.get<Page<SearchLog>>(`/searches${buildQuery(params)}`),
};

export const apiKeyService = {
  list: () => api.get<ApiKey[]>("/api-keys"),
  create: (name: string) => api.post<CreatedApiKey>("/api-keys", { name }),
  rename: (id: string, name: string) =>
    api.patch<ApiKey>(`/api-keys/${id}`, { name }),
  remove: (id: string) => api.delete<void>(`/api-keys/${id}`),
};

export const usageService = {
  overview: (days = 30) =>
    api.get<UsageOverview>(`/usage${buildQuery({ days })}`),
  dashboardStats: () => api.get<DashboardStats>("/dashboard/stats"),
};

export const billingService = {
  plans: () => api.get<Plan[]>("/plans", { anonymous: true }),
  overview: () => api.get<BillingOverview>("/billing"),
  topup: (plan_slug: string) =>
    api.post<Wallet>("/billing/topup", { plan_slug }),
};

export const userService = {
  update: (payload: { full_name?: string; company?: string; profile_image_url?: string }) =>
    api.patch<User>("/users/me", payload),
  // `password` is omitted for Google-only accounts, which have none; the
  // access token is the only credential such a user can present.
  remove: (password?: string) =>
    api.post<void>("/users/me/delete", { password: password || null }),
};

export const adminService = {
  stats: () => api.get<AdminStats>("/admin/stats"),
  users: (params: { page?: number; page_size?: number; q?: string }) =>
    api.get<Page<AdminUser>>(`/admin/users${buildQuery(params)}`),
  updateUser: (id: string, payload: { is_active?: boolean; role?: string }) =>
    api.patch<AdminUser>(`/admin/users/${id}`, payload),
  wallets: (params: { page?: number; page_size?: number }) =>
    api.get<Page<AdminWallet>>(
      `/admin/wallets${buildQuery(params)}`
    ),
  apiKeys: (params: { page?: number; page_size?: number }) =>
    api.get<Page<AdminApiKey>>(`/admin/api-keys${buildQuery(params)}`),
  searchLogs: (params: { page?: number; page_size?: number; q?: string }) =>
    api.get<Page<AdminSearchLog>>(`/admin/search-logs${buildQuery(params)}`),
  settings: () => api.get<SystemSettings>("/admin/settings"),
};

export const adminWhatsAppService = {
  accounts: () => api.get<WhatsAppAccountsResponse>("/admin/whatsapp/accounts"),
  init: () => api.post<WhatsAppAccountInitResponse>("/admin/whatsapp/accounts"),
  status: (id: string) =>
    api.get<WhatsAppAccountStatusResponse>(
      `/admin/whatsapp/accounts/${id}/status`
    ),
  reverify: (id: string) =>
    api.post<WhatsAppAccountInitResponse>(
      `/admin/whatsapp/accounts/${id}/reverify`
    ),
  setDefault: (id: string) =>
    api.patch<WhatsAppAccount>(`/admin/whatsapp/accounts/${id}/default`),
  remove: (id: string) =>
    api.delete<{ success: boolean; message: string }>(
      `/admin/whatsapp/accounts/${id}`
    ),
};

export const adminPlansService = {
  list: () => api.get<Plan[]>("/admin/plans"),
  create: (data: CreatePlanRequest) => api.post<Plan>("/admin/plans", data),
  update: (id: string, data: UpdatePlanRequest) =>
    api.patch<Plan>(`/admin/plans/${id}`, data),
  remove: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/admin/plans/${id}`),
};
