"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { applyTheme, defaultThemes, type ThemeConfig, type UserProfile } from "@/lib/theme";

type AuthContextValue = {
  user: UserProfile | null;
  isReady: boolean;
  signIn: (username: string, password: string) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  signOut: () => Promise<void>;
  updateTheme: (theme: ThemeConfig) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    applyTheme(defaultThemes.green);

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "same-origin" });
        if (!response.ok) {
          setUser(null);
          setIsReady(true);
          return;
        }
        const data = await response.json();
        const currentUser = data.user as UserProfile | undefined;
        if (currentUser) {
          const nextUser: UserProfile = {
            ...currentUser,
            displayName: currentUser.displayName || "Usuário",
            role: currentUser.role || "client",
            theme: currentUser.theme ?? defaultThemes.green,
          };
          setUser(nextUser);
          applyTheme(nextUser.theme);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsReady(true);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!isReady || !user) {
      if (!isReady) return;
      return;
    }
    applyTheme(user.theme ?? defaultThemes.green);
  }, [user, isReady]);

  const signIn = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.error || "Usuário ou senha inválidos." };
      }

      const userFromApi = data.user as Partial<UserProfile> | undefined;
      const nextUser: UserProfile = {
        id: userFromApi?.id,
        username: userFromApi?.username || "",
        displayName: userFromApi?.displayName || "Usuário",
        role: userFromApi?.role || "client",
        theme: userFromApi?.theme ?? defaultThemes.green,
      };
      setUser(nextUser);
      applyTheme(nextUser.theme as ThemeConfig);
      return { success: true, message: "Login realizado com sucesso.", user: nextUser };
    } catch (error) {
      return { success: false, message: "Não foi possível entrar no sistema." };
    }
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    setUser(null);
  };

  const updateTheme = async (theme: ThemeConfig) => {
    const response = await fetch("/api/auth/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(theme),
    });

    if (!response.ok) {
      throw new Error("Não foi possível salvar a personalização.");
    }

    const data = await response.json();
    const nextUser = {
      ...(data.user as UserProfile),
      displayName: (data.user as UserProfile)?.displayName || "Usuário",
      role: (data.user as UserProfile)?.role || "client",
      theme: (data.user as UserProfile)?.theme ?? defaultThemes.green,
    } as UserProfile;
    setUser(nextUser);
    applyTheme(nextUser.theme ?? defaultThemes.green);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isReady, signIn, signOut, updateTheme }),
    [user, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function getThemeForUser(username: string) {
  return defaultThemes.green;
}
