import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { User } from "@/types";

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("mediscan_token"),
  );
  const [user, setUser] = useState<User | null>(null);

  const { data: fetchedUser, isLoading, error } = useQuery<User>({
    queryKey: ["auth-me", token],
    queryFn: () => api.get<User>("/auth/me"),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser);
    }
  }, [fetchedUser]);

  useEffect(() => {
    if (error) {
      // Clear token and logout on auth/me failure
      localStorage.removeItem("mediscan_token");
      setToken(null);
      setUser(null);
      queryClient.clear();
    }
  }, [error, queryClient]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("mediscan_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("mediscan_token");
    setToken(null);
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading: !!token && isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
