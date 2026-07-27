import { api } from "@/lib/api-client";
import type {
  AuthResponse,
  MessageResponse,
  TokenPair,
  User,
} from "@/types/api";

export const authService = {
  register: (payload: {
    email: string;
    password: string;
    full_name?: string;
    company?: string;
  }) => api.post<AuthResponse>("/auth/register", payload, { anonymous: true }),

  login: (payload: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", payload, { anonymous: true }),

  /**
   * Exchange a Google ID token for a WAVerify session.
   *
   * `credential` is passed through untouched — it is verified server-side
   * against Google's keys, so decoding it here would prove nothing.
   */
  google: (credential: string) =>
    api.post<AuthResponse>(
      "/auth/google",
      { credential },
      { anonymous: true }
    ),

  logout: (refreshToken: string) =>
    api.post<MessageResponse>("/auth/logout", { refresh_token: refreshToken }),

  refresh: (refreshToken: string) =>
    api.post<TokenPair>(
      "/auth/refresh",
      { refresh_token: refreshToken },
      {
        anonymous: true,
      }
    ),

  me: () => api.get<User>("/auth/me"),

  verifyEmail: (token: string) =>
    api.post<User>("/auth/verify-email", { token }, { anonymous: true }),

  resendVerification: (email: string) =>
    api.post<MessageResponse>(
      "/auth/resend-verification",
      { email },
      { anonymous: true }
    ),

  forgotPassword: (email: string) =>
    api.post<MessageResponse>(
      "/auth/forgot-password",
      { email },
      { anonymous: true }
    ),

  resetPassword: (payload: { token: string; password: string }) =>
    api.post<MessageResponse>("/auth/reset-password", payload, {
      anonymous: true,
    }),

  changePassword: (payload: {
    current_password: string;
    new_password: string;
  }) => api.post<MessageResponse>("/auth/change-password", payload),
};
