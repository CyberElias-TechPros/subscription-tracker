"use client";

import * as React from "react";
import { authApi, type ApiUser } from "@/lib/api-client";

const TOKEN_KEY = "subscription-tracker:auth-token";
const USER_KEY = "subscription-tracker:auth-user";

interface AuthState {
  status: "loading" | "authenticated" | "guest";
  user: ApiUser | null;
  token: string | null;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    status: "loading",
    user: null,
    token: null,
    error: null,
  });

  // Hydrate from storage
  React.useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userRaw = localStorage.getItem(USER_KEY);
      if (token && userRaw) {
        const user = JSON.parse(userRaw) as ApiUser;
        // Verify token is still valid
        authApi.me(token)
          .then(({ user: freshUser }) => {
            setState({ status: "authenticated", user: freshUser, token, error: null });
            localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
          })
          .catch(() => {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setState({ status: "guest", user: null, token: null, error: null });
          });
      } else {
        setState({ status: "guest", user: null, token: null, error: null });
      }
    } catch {
      setState({ status: "guest", user: null, token: null, error: null });
    }
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, error: null }));
    try {
      const { user, token } = await authApi.login(email, password);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ status: "authenticated", user, token, error: null });
    } catch (err: any) {
      const message = err?.message || "Login failed";
      setState((s) => ({ ...s, error: message }));
      throw err;
    }
  }, []);

  const register = React.useCallback(async (email: string, password: string, name?: string) => {
    setState((s) => ({ ...s, error: null }));
    try {
      const { user, token } = await authApi.register(email, password, name);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ status: "authenticated", user, token, error: null });
    } catch (err: any) {
      const message = err?.message || "Registration failed";
      setState((s) => ({ ...s, error: message }));
      throw err;
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      if (state.token) {
        await authApi.logout(state.token).catch(() => {});
      }
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setState({ status: "guest", user: null, token: null, error: null });
    }
  }, [state.token]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: state.status === "authenticated",
      login,
      register,
      logout,
    }),
    [state, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
