import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { defaultThemes, type ThemeConfig, type UserProfile } from "@/lib/theme";

export function normalizeTheme(theme?: Partial<ThemeConfig> | null): ThemeConfig {
  return {
    businessName: theme?.businessName || defaultThemes.green.businessName,
    primary: theme?.primary || defaultThemes.green.primary,
    secondary: theme?.secondary || defaultThemes.green.secondary,
    accent: theme?.accent || defaultThemes.green.accent,
    background: theme?.background || defaultThemes.green.background,
    sidebar: theme?.sidebar || defaultThemes.green.sidebar,
    text: theme?.text || defaultThemes.green.text,
    card: theme?.card || defaultThemes.green.card,
  };
}

export function serializeUser(user: {
  id: string;
  username: string;
  displayName: string;
  role: string;
  businessName?: string | null;
  themePrimary?: string | null;
  themeSecondary?: string | null;
  themeAccent?: string | null;
  themeBackground?: string | null;
  themeSidebar?: string | null;
  themeText?: string | null;
  themeCard?: string | null;
}): UserProfile {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: (user.role === "admin" ? "admin" : "client") as "admin" | "client",
    businessName: user.businessName || defaultThemes.green.businessName,
    theme: normalizeTheme({
      businessName: user.businessName || defaultThemes.green.businessName,
      primary: user.themePrimary || defaultThemes.green.primary,
      secondary: user.themeSecondary || defaultThemes.green.secondary,
      accent: user.themeAccent || defaultThemes.green.accent,
      background: user.themeBackground || defaultThemes.green.background,
      sidebar: user.themeSidebar || defaultThemes.green.sidebar,
      text: user.themeText || defaultThemes.green.text,
      card: user.themeCard || defaultThemes.green.card,
    }),
  };
}

export async function ensureSeedUsers() {
  const seedUsers = [
    {
      username: "admin",
      password: "920025",
      displayName: "Administrador",
      role: "admin",
      theme: defaultThemes.green,
    },
    {
      username: "julia",
      password: "123456",
      displayName: "Júlia",
      role: "client",
      theme: defaultThemes.blue,
    },
    {
      username: "rosa",
      password: "123456",
      displayName: "Rosa",
      role: "client",
      theme: defaultThemes.red,
    },
  ];

  for (const candidate of seedUsers) {
    const existing = await prisma.user.findUnique({ where: { username: candidate.username } });
    if (!existing) {
      await prisma.user.create({
        data: {
          username: candidate.username,
          passwordHash: await bcrypt.hash(candidate.password, 10),
          displayName: candidate.displayName,
          role: candidate.role,
          businessName: candidate.theme.businessName,
          themePrimary: candidate.theme.primary,
          themeSecondary: candidate.theme.secondary,
          themeAccent: candidate.theme.accent,
          themeBackground: candidate.theme.background,
          themeSidebar: candidate.theme.sidebar,
          themeText: candidate.theme.text,
          themeCard: candidate.theme.card,
        },
      });
    }
  }
}
