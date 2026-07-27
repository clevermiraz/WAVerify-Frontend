/**
 * Single HTTP client for the whole app.
 *
 * Responsibilities: attach the access token, normalise every backend error
 * into `ApiError`, and transparently refresh an expired access token once
 * per failed request. Concurrent 401s share one refresh so a page with
 * several queries does not stampede the endpoint.
 */

import type { ApiErrorBody, TokenPair } from "@/types/api";

/**
 * Origin of the API, without a path. The `/api/v1` prefix belongs to this
 * client rather than to the environment: the request/response types in
 * `@/types/api` are written against v1, so a deployment cannot move to another
 * version by changing configuration alone.
 */
export const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export const API_URL = `${API_ORIGIN}/api/v1`;

const ACCESS_TOKEN_KEY = "waverify.access_token";
const REFRESH_TOKEN_KEY = "waverify.refresh_token";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  /** True when re-authenticating could plausibly fix the request. */
  get isAuthError() {
    return this.status === 401;
  }
}

// --- Token storage ---------------------------------------------------------
// localStorage keeps the dashboard a pure SPA against a separate API origin.
// Tokens are short-lived and rotated; refresh tokens are revoked server-side
// on use and on logout.

export const tokenStore = {
  getAccess(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  set(tokens: TokenPair) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler = () => {};

/** Registered by the auth provider so an unrecoverable 401 redirects once. */
export function setSessionExpiredHandler(handler: SessionExpiredHandler) {
  onSessionExpired = handler;
}

// --- Refresh coordination --------------------------------------------------

let refreshInFlight: Promise<string | null> | null = null;

const REFRESH_LOCK = "waverify.token-refresh";

/**
 * Serialise refreshes across every tab on this origin.
 *
 * The in-process `refreshInFlight` only dedupes within one document. Refresh
 * tokens are rotated and the presented one is revoked server-side, so two tabs
 * refreshing at once would have the loser replay a burned token and be signed
 * out mid-session. Web Locks is the only cross-document mutex available; where
 * it is missing the old single-tab behaviour is the fallback.
 */
async function withRefreshLock(
  run: () => Promise<string | null>
): Promise<string | null> {
  if (typeof navigator === "undefined" || !navigator.locks) return run();
  // `LockGrantedCallback<T>` is typed as returning `T` rather than
  // `T | PromiseLike<T>`, so the call is seen as `Promise<Promise<…>>`.
  // Awaiting collapses it, which is what happens at runtime anyway.
  return await navigator.locks.request(REFRESH_LOCK, run);
}

async function refreshAccessToken(): Promise<string | null> {
  const presentedToken = tokenStore.getRefresh();
  if (!presentedToken) return null;

  refreshInFlight ??= (async () => {
    try {
      return await withRefreshLock(async () => {
        // Whoever held the lock before us may have already rotated the pair.
        // localStorage is shared, so their result is visible here: adopt it
        // instead of replaying a token the server has now revoked.
        const current = tokenStore.getRefresh();
        if (!current) return null;
        if (current !== presentedToken) return tokenStore.getAccess();

        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: current }),
        });
        if (!response.ok) {
          tokenStore.clear();
          return null;
        }
        const tokens = (await response.json()) as TokenPair;
        tokenStore.set(tokens);
        return tokens.access_token;
      });
    } catch {
      return null;
    } finally {
      // Cleared in a microtask so callers awaiting this promise all observe
      // the same result before the next refresh can start.
      queueMicrotask(() => {
        refreshInFlight = null;
      });
    }
  })();

  return refreshInFlight;
}

// --- Core request ----------------------------------------------------------

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip the Authorization header (public endpoints). */
  anonymous?: boolean;
  /**
   * Per-attempt deadline in milliseconds.
   *
   * Prefer this over passing `signal: AbortSignal.timeout(...)`: a signal
   * created by the caller is already counting down, so the retry that follows
   * a token refresh would inherit an all-but-expired deadline and abort
   * immediately. A fresh one is minted for each attempt.
   */
  timeoutMs?: number;
  /** Internal: prevents infinite refresh recursion. */
  _retried?: boolean;
}

/** Combine the caller's signal (if any) with this attempt's timeout. */
function attemptSignal(
  external: AbortSignal | null | undefined,
  timeoutMs: number | undefined
): AbortSignal | undefined {
  if (!timeoutMs) return external ?? undefined;
  const timeout = AbortSignal.timeout(timeoutMs);
  if (!external) return timeout;
  return typeof AbortSignal.any === "function"
    ? AbortSignal.any([external, timeout])
    : timeout;
}

async function toApiError(response: Response): Promise<ApiError> {
  let code = "http_error";
  let message = `Request failed with status ${response.status}.`;
  let fields: Record<string, string> = {};

  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    if (body?.error) {
      code = body.error.code ?? code;
      message = body.error.message ?? message;
      fields = body.error.details?.fields ?? {};
    }
  } catch {
    // Non-JSON response (proxy error page, network appliance) — keep the
    // generic message rather than surfacing raw HTML.
  }

  return new ApiError(response.status, code, message, fields);
}

export async function apiRequest<T>(
  path: string,
  { body, anonymous, timeoutMs, _retried, headers, ...init }: RequestOptions = {}
): Promise<T> {
  const requestHeaders = new Headers(headers);
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!anonymous) {
    const token = tokenStore.getAccess();
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: attemptSignal(init.signal, timeoutMs),
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "TimeoutError";
    throw new ApiError(
      0,
      timedOut ? "timeout" : "network_error",
      timedOut
        ? "The server took too long to respond. Please try again."
        : "Could not reach the server. Check your connection and try again."
    );
  }

  if (response.status === 401 && !anonymous && !_retried) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, {
        body,
        anonymous,
        headers,
        timeoutMs,
        ...init,
        _retried: true,
      });
    }
    tokenStore.clear();
    onSessionExpired();
  }

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};

/** Build a query string, dropping empty values. */
export function buildQuery(
  params: Record<string, string | number | undefined | null>
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}
