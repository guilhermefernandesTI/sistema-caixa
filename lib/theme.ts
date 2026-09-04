export type ThemeConfig = {
  businessName: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  sidebar: string;
  text: string;
  card: string;
};

export type UserProfile = {
  id?: string;
  username: string;
  password?: string;
  displayName: string;
  role: "admin" | "client";
  businessName?: string;
  theme: ThemeConfig;
};

export const defaultThemes: Record<string, ThemeConfig> = {
  green: {
    businessName: "GF Venda Fácil",
    primary: "#15231f",
    secondary: "#d9f99d",
    accent: "#42c98b",
    background: "#f7f8f3",
    sidebar: "#15231f",
    text: "#17211d",
    card: "#ffffff",
  },
  blue: {
    businessName: "Júlia Boutique",
    primary: "#0f172a",
    secondary: "#bfdbfe",
    accent: "#3b82f6",
    background: "#eff6ff",
    sidebar: "#0f172a",
    text: "#102033",
    card: "#ffffff",
  },
  red: {
    businessName: "Rosa Café",
    primary: "#431407",
    secondary: "#fecdd3",
    accent: "#ef4444",
    background: "#fff1f2",
    sidebar: "#431407",
    text: "#3f1d1b",
    card: "#ffffff",
  },
  purple: {
    businessName: "Luna Studio",
    primary: "#2e1065",
    secondary: "#ddd6fe",
    accent: "#8b5cf6",
    background: "#f5f3ff",
    sidebar: "#2e1065",
    text: "#2b2145",
    card: "#ffffff",
  },
  gold: {
    businessName: "Aurora Coffee",
    primary: "#4a2d00",
    secondary: "#fef3c7",
    accent: "#f59e0b",
    background: "#fffaf1",
    sidebar: "#4a2d00",
    text: "#3c2a14",
    card: "#ffffff",
  },
  coral: {
    businessName: "Sol e Mar",
    primary: "#7c2d12",
    secondary: "#fed7aa",
    accent: "#f97316",
    background: "#fff7ed",
    sidebar: "#7c2d12",
    text: "#3b241d",
    card: "#ffffff",
  },
  dark: {
    businessName: "Noir Lounge",
    primary: "#111827",
    secondary: "#d1d5db",
    accent: "#facc15",
    background: "#f3f4f6",
    sidebar: "#111827",
    text: "#111827",
    card: "#ffffff",
  },
};

export const predefinedUsers: UserProfile[] = [
  {
    username: "admin",
    password: "920025",
    displayName: "Administrador",
    role: "admin",
    theme: defaultThemes.green,
  },
  {
    username: "rosa",
    password: "123456",
    displayName: "Rosa",
    role: "client",
    theme: defaultThemes.red,
  },
  {
    username: "julia",
    password: "123456",
    displayName: "Júlia",
    role: "client",
    theme: defaultThemes.blue,
  },
];

export function normalizeTheme(theme?: Partial<ThemeConfig> | ThemeConfig | null): ThemeConfig {
  const resolved = theme ?? defaultThemes.green;
  return {
    businessName: resolved.businessName || defaultThemes.green.businessName,
    primary: resolved.primary || defaultThemes.green.primary,
    secondary: resolved.secondary || defaultThemes.green.secondary,
    accent: resolved.accent || defaultThemes.green.accent,
    background: resolved.background || defaultThemes.green.background,
    sidebar: resolved.sidebar || defaultThemes.green.sidebar,
    text: resolved.text || defaultThemes.green.text,
    card: resolved.card || defaultThemes.green.card,
  };
}

export function applyTheme(theme?: Partial<ThemeConfig> | ThemeConfig | null) {
  if (typeof document === "undefined") return;

  const safeTheme = normalizeTheme(theme ?? defaultThemes.green);
  const root = document.documentElement;
  root.style.setProperty("--brand-primary", safeTheme.primary);
  root.style.setProperty("--brand-secondary", safeTheme.secondary);
  root.style.setProperty("--brand-accent", safeTheme.accent);
  root.style.setProperty("--brand-bg", safeTheme.background);
  root.style.setProperty("--brand-sidebar", safeTheme.sidebar);
  root.style.setProperty("--brand-text", safeTheme.text);
  root.style.setProperty("--brand-card", safeTheme.card);
  root.style.setProperty("--brand-business-name", safeTheme.businessName);
}

export function getInitialTheme(theme?: ThemeConfig) {
  return theme ?? defaultThemes.green;
}
