/** Mirrors the Pydantic schemas served by the FastAPI backend. */

export type UserRole = "user" | "admin";
export type PlanTier = string;
export type SubscriptionStatus = "active" | "canceled" | "past_due";
export type LookupStatus = "exists" | "not_found" | "failed";
export type LookupSource = "dashboard" | "api";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  last_login_at: string | null;
  /** False for Google-only accounts, which have no password to change. */
  has_password: boolean;
  has_google: boolean;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface MessageResponse {
  message: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details: { fields?: Record<string, string> } & Record<string, unknown>;
  };
}

export interface PageMeta {
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface Page<T> extends PageMeta {
  items: T[];
}

export interface CheckResult {
  success: boolean;
  phone: string;
  exists: boolean;
  display_name: string | null;
  about: string | null;
  business: boolean;
  profile_photo: string | null;
  response_time_ms: number;
  cached: boolean;
  checked_at: string;
}

export interface SearchLog {
  id: string;
  phone_number: string;
  country_code: string | null;
  status: LookupStatus;
  source: LookupSource;
  exists_on_whatsapp: boolean | null;
  display_name: string | null;
  response_time_ms: number;
  cached: boolean;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

/** Only returned at creation — `key` is never retrievable again. */
export interface CreatedApiKey extends ApiKey {
  key: string;
}

export interface Plan {
  id: string;
  slug: PlanTier;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  monthly_request_quota: number | null;
  rate_limit_per_minute: number;
  features: string[];
  is_contact_sales: boolean;
  sort_order: number;
  is_active?: boolean;
  is_public?: boolean;
  is_recommended?: boolean;
}

export interface CreatePlanRequest {
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  currency?: string;
  monthly_request_quota: number | null;
  rate_limit_per_minute: number;
  features: string[];
  is_contact_sales: boolean;
  sort_order: number;
  is_active?: boolean;
  is_public?: boolean;
  is_recommended?: boolean;
}

export type UpdatePlanRequest = Partial<CreatePlanRequest>;

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  canceled_at: string | null;
  plan: Plan;
}

export interface BillingOverview {
  subscription: Subscription;
  requests_used: number;
  requests_remaining: number | null;
  quota: number | null;
}

export interface UsagePoint {
  date: string;
  total: number;
  successful: number;
  failed: number;
}

export interface UsageSummary {
  today_requests: number;
  month_requests: number;
  quota: number | null;
  remaining_credits: number | null;
  success_rate: number;
  average_response_time_ms: number;
  period_start: string;
  period_end: string;
}

export interface UsageOverview {
  summary: UsageSummary;
  daily: UsagePoint[];
  recent: SearchLog[];
}

export interface DashboardStats {
  total_searches: number;
  numbers_on_whatsapp: number;
  success_rate: number;
  average_response_time_ms: number;
  month_requests: number;
  quota: number | null;
  remaining_credits: number | null;
  active_api_keys: number;
  plan_name: string;
}

export interface AdminStats {
  users: {
    total: number;
    active_today: number;
  };
  revenue: {
    mrr: number;
    total: number;
  };
  lookups: {
    total_this_month: number;
    success_rate: number;
  };
}

export interface WhatsAppAccount {
  id: string;
  phone_number: string | null;
  status: "initializing" | "pairing" | "connected" | "disconnected" | "error";
  total_lookups_performed: number;
  lookups_this_month: number;
  created_at: string;
  is_default?: boolean;
}

export interface WhatsAppAccountsResponse {
  accounts: WhatsAppAccount[];
}

export interface WhatsAppAccountInitResponse {
  id: string;
  status: string;
  message: string;
}

export interface WhatsAppAccountStatusResponse {
  id: string;
  status: string;
  qr_data: string | null;
  paired_number: string | null;
}

/** The admin listing extends the base user with analytics fields. */
export interface AdminUser extends User {
  total_lookups?: number;
}

export interface AdminApiKey {
  id: string;
  user_id: string;
  name: string;
  prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export interface AdminSubscription {
  id: string;
  user_id: string;
  user_email: string;
  plan_name: string;
  status: string;
  current_period_end: string;
}

export interface AdminSearchLog {
  id: string;
  user_id: string;
  user_email?: string;
  phone_number: string;
  status: string;
  source: string;
  response_time_ms: number;
  created_at: string;
}

export interface SystemSettings {
  environment: string;
  whatsapp_provider: string;
  verification_cache_ttl_seconds: number;
  rate_limit_enabled: boolean;
  rate_limit_per_minute: number;
  email_backend: string;
}
