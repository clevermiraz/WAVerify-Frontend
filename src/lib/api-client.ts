/**
 * Single HTTP client for the whole app.
 *
 * Responsibilities: attach the access token, normalise every backend error
 * into `ApiError`, and transparently refresh an expired access token once
 * per failed request. Concurrent 401s share one refresh so a page with
 * several queries does not stampede the endpoint.
 */

import type { ApiErrorBody, TokenPair } from "@/types/api";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return null;

  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!response.ok) {
        tokenStore.clear();
        return null;
      }
      const tokens = (await response.json()) as TokenPair;
      tokenStore.set(tokens);
      return tokens.access_token;
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
  /** Internal: prevents infinite refresh recursion. */
  _retried?: boolean;
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
  { body, anonymous, _retried, headers, ...init }: RequestOptions = {}
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
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      0,
      "network_error",
      "Could not reach the server. Check your connection and try again."
    );
  }

  if (response.status === 401 && !anonymous && !_retried) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, {
        body,
        anonymous,
        headers,
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
