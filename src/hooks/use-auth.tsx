"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  ApiError,
  setSessionExpiredHandler,
  tokenStore,
} from "@/lib/api-client";
import { authService } from "@/services";
import type { AuthResponse, User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  /** True until the stored session has been checked on first load. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    email: string;
    password: string;
    full_name?: string;
    company?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Restore the session from the stored token on first mount.
  React.useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!tokenStore.getAccess()) {
        setIsLoading(false);
        return;
      }
      try {
        const current = await authService.me();
        if (!cancelled) setUser(current);
      } catch (error) {
        // A 401 here means the stored tokens are dead; anything else (e.g.
        // the API being down) should not wipe a possibly valid session.
        if (error instanceof ApiError && error.isAuthError) tokenStore.clear();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // The API client calls this when a refresh attempt fails for good.
  React.useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      queryClient.clear();
      if (window.location.pathname.startsWith("/dashboard")) {
        router.replace("/login?expired=1");
      }
    });
  }, [queryClient, router]);

  const applyAuth = React.useCallback(
    (response: AuthResponse) => {
      tokenStore.set(response.tokens);
      setUser(response.user);
      queryClient.clear();
      return response.user;
    },
    [queryClient]
  );

  const login = React.useCallback(
    async (email: string, password: string) =>
      applyAuth(await authService.login({ email, password })),
    [applyAuth]
  );

  const register = React.useCallback(
    async (payload: {
      email: string;
      password: string;
      full_name?: string;
      company?: string;
    }) => applyAuth(await authService.register(payload)),
    [applyAuth]
  );

  const logout = React.useCallback(async () => {
    const refreshToken = tokenStore.getRefresh();
    if (refreshToken) {
      // Best effort: the local session is cleared regardless so the user is
      // never stuck signed in because the network failed.
      await authService.logout(refreshToken).catch(() => undefined);
    }
    tokenStore.clear();
    setUser(null);
    queryClient.clear();
    router.push("/login");
  }, [queryClient, router]);

  const refreshUser = React.useCallback(async () => {
    setUser(await authService.me());
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [user, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
  return context;
}
