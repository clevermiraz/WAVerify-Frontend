/** Mirrors the Pydantic schemas served by the FastAPI backend. */

export type UserRole = "user" | "admin";
export type PlanTier = "free" | "starter" | "growth" | "pro";
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
  profile_image_url: string | null;
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

/**
 * Where `display_name` came from, which is what explains a missing name.
 * The listed values are the ones the backend documents today; the union stays
 * open so a source added later does not break the build — the UI falls back to
 * the raw value.
 */
export type NameSource =
  | "business_verified"
  | "business_name"
  | "contact_name"
  | (string & {});

export type LineType =
  | "mobile"
  | "fixed_line"
  | "fixed_line_or_mobile"
  | "toll_free"
  | "premium_rate"
  | "shared_cost"
  | "personal_number"
  | "pager"
  | "uan"
  | "voicemail"
  | "unknown"
  | (string & {});

/**
 * Facts derived from the number itself, with no WhatsApp involvement, so they
 * are filled in even when the number has no account. `line_type` always has a
 * value (`unknown` when undetermined); everything else can be null or empty.
 */
export interface NumberInfo {
  country_code: string | null;
  /** ISO 3166-1 alpha-2, e.g. `BD`. */
  region: string | null;
  location: string | null;
  carrier: string | null;
  line_type: LineType;
  timezones: string[];
  international_format: string | null;
  national_format: string | null;
}

export interface GravatarAccount {
  service: string;
  url: string;
}

/** Public Gravatar profile for the email sent with the check. */
export interface GravatarProfile {
  display_name: string | null;
  about: string | null;
  location: string | null;
  job_title: string | null;
  company: string | null;
  pronouns: string | null;
  avatar_url: string | null;
  profile_url: string | null;
  verified_accounts: GravatarAccount[];
}

export interface CheckResult {
  success: boolean;
  phone: string;
  exists: boolean;
  display_name: string | null;
  /** Null for most personal accounts — WhatsApp does not give a stranger the
   *  name. That is normal, not a failed lookup. */
  name_source: NameSource | null;
  about: string | null;
  business: boolean;
  /** Expires within hours. Render it, never store it. */
  profile_photo: string | null;
  /** Changes when the account changes its picture, so it survives the URL. */
  profile_photo_id: string | null;
  /** 1 means phone only; more means WhatsApp Web or Desktop is linked. */
  device_count: number | null;
  /** Documented as always present; typed nullable so a response from an older
   *  backend cannot crash the UI. */
  number_info: NumberInfo | null;
  /** Only filled in when an email was sent and it has a Gravatar profile. */
  gravatar: GravatarProfile | null;
  response_time_ms: number;
  cached: boolean;
  checked_at: string;
}

/**
 * History keeps a smaller field set than a live check. `number_info` and
 * `gravatar` are stored, but only for lookups made after the backend started
 * saving them — both are null on older rows. `name_source`, `profile_photo_id`
 * and `device_count` are live-response only and never appear here.
 */
export interface SearchLog {
  id: string;
  phone_number: string;
  country_code: string | null;
  status: LookupStatus;
  source: LookupSource;
  exists_on_whatsapp: boolean | null;
  display_name: string | null;
  number_info: NumberInfo | null;
  gravatar: GravatarProfile | null;
  response_time_ms: number;
  cached: boolean;
  created_at: string;
}

/**
 * One stored lookup in full, from `GET /searches/{id}`.
 *
 * The WhatsApp fields use the stored column names rather than the live
 * response's, so this is not an extension of `CheckResult`. `name_source`,
 * `profile_photo_id` and `device_count` are never here — they are only ever
 * on a fresh check.
 */
export interface SearchLogDetail {
  id: string;
  phone_number: string;
  /** Not documented on this route; guarded everywhere it is read. */
  country_code?: string | null;
  source?: LookupSource;
  status: LookupStatus;
  exists_on_whatsapp: boolean | null;
  display_name: string | null;
  about: string | null;
  is_business: boolean;
  /** Expired long ago for anything but a very recent lookup. */
  profile_photo_url: string | null;
  number_info: NumberInfo | null;
  gravatar: GravatarProfile | null;
  /** Set when `status` is `failed` — e.g. `provider_error`. */
  error_code: string | null;
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
  credits_awarded: number;
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
  credits_awarded: number;
  rate_limit_per_minute: number;
  features: string[];
  is_contact_sales: boolean;
  sort_order: number;
  is_active?: boolean;
  is_public?: boolean;
  is_recommended?: boolean;
}

export type UpdatePlanRequest = Partial<CreatePlanRequest>;

export interface Wallet {
  id: string;
  credits_balance: number;
}

export interface BillingOverview {
  wallet: Wallet;
}

export interface CheckoutResponse {
  /** Hosted Polar checkout page — navigate the browser to it. */
  checkout_url: string;
}

/** `unmapped` means the payment succeeded but could not be matched to a plan
 *  automatically, so support has to finish it by hand. */
export type PaymentStatus = "paid" | "refunded" | "unmapped";

export interface PortalResponse {
  /** Signed, short-lived link into Polar's customer portal. */
  portal_url: string;
}

/** `url` is null while Polar is still building the PDF. */
export interface InvoiceResponse {
  status: "ready" | "generating";
  url: string | null;
}

export interface Payment {
  id: string;
  status: PaymentStatus;
  amount_cents: number;
  currency: string;
  credits_granted: number;
  created_at: string;
  plan: Plan | null;
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
  remaining_credits: number | null;
  success_rate: number;
  average_response_time_ms: number;
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
  remaining_credits: number | null;
  active_api_keys: number;
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

export interface AdminWallet {
  id: string;
  user_id: string;
  user_email: string;
  credits_balance: number;
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
