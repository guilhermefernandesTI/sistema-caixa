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
  username: string;
  password: string;
  displayName: string;
  role: "admin" | "client";
  theme: ThemeConfig;
};

export const defaultThemes: Record<string, ThemeConfig> = {
  green: {
    businessName: "caixa flow",
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

export function applyTheme(theme: ThemeConfig) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--brand-primary", theme.primary);
  root.style.setProperty("--brand-secondary", theme.secondary);
  root.style.setProperty("--brand-accent", theme.accent);
  root.style.setProperty("--brand-bg", theme.background);
  root.style.setProperty("--brand-sidebar", theme.sidebar);
  root.style.setProperty("--brand-text", theme.text);
  root.style.setProperty("--brand-card", theme.card);
  root.style.setProperty("--brand-business-name", theme.businessName);
}

export function getInitialTheme(theme?: ThemeConfig) {
  return theme ?? defaultThemes.green;
}
