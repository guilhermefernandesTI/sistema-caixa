"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { applyTheme, defaultThemes, predefinedUsers, type ThemeConfig, type UserProfile } from "@/lib/theme";

const AUTH_KEY = "caixaflow-user";

type AuthContextValue = {
  user: UserProfile | null;
  isReady: boolean;
  signIn: (username: string, password: string) => { success: boolean; message: string };
  signOut: () => void;
  updateTheme: (theme: ThemeConfig) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const item = window.localStorage.getItem(AUTH_KEY);
  if (!item) return null;

  try {
    const parsed = JSON.parse(item) as UserProfile;
    if (!parsed?.username) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = readStoredUser();
    if (saved) {
      setUser(saved);
      applyTheme(saved.theme);
    } else {
      setUser(null);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (user) {
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      applyTheme(user.theme);
    } else {
      window.localStorage.removeItem(AUTH_KEY);
    }
  }, [user, isReady]);

  const signIn = (username: string, password: string) => {
    const userFound = predefinedUsers.find((item) => item.username.toLowerCase() === username.toLowerCase() && item.password === password);
    if (!userFound) {
      return { success: false, message: "Usuário ou senha inválidos." };
    }

    setUser(userFound);
    return { success: true, message: "Login realizado com sucesso." };
  };

  const signOut = () => {
    setUser(null);
  };

  const updateTheme = (theme: ThemeConfig) => {
    setUser((current) => {
      if (!current) return current;
      return { ...current, theme };
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      signIn,
      signOut,
      updateTheme,
    }),
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

export function getLoggedUser() {
  return readStoredUser();
}

export function getAvailableUsers() {
  return predefinedUsers;
}

export function getThemeForUser(username: string) {
  const user = predefinedUsers.find((item) => item.username.toLowerCase() === username.toLowerCase());
  return user?.theme ?? defaultThemes.green;
}
