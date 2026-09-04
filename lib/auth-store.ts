import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { defaultThemes, type ThemeConfig, type UserProfile } from "@/lib/theme";

function toUserProfile(user: {
  id: string;
  username: string;
  displayName: string;
  role: string;
  businessName: string | null;
  themePrimary: string | null;
  themeSecondary: string | null;
  themeAccent: string | null;
  themeBackground: string | null;
  themeSidebar: string | null;
  themeText: string | null;
  themeCard: string | null;
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
  businessName: string | null;
  themePrimary: string | null;
  themeSecondary: string | null;
  themeAccent: string | null;
  themeBackground: string | null;
  themeSidebar: string | null;
  themeText: string | null;
  themeCard: string | null;
}) {
  return toUserProfile(user);
}

async function ensureSeedUsers() {
  const count = await prisma.user.count();
  if (count > 0) return;

  const seedUsers = [
    { username: "admin", password: "920025", displayName: "Administrador", role: "admin", theme: defaultThemes.green },
    { username: "rosa", password: "123456", displayName: "Rosa", role: "client", theme: defaultThemes.red },
    { username: "julia", password: "123456", displayName: "Júlia", role: "client", theme: defaultThemes.blue },
  ];

  for (const candidate of seedUsers) {
    await prisma.user.create({
      data: {
        tenantId: `${candidate.username}-${Date.now()}`,
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

export async function listUsers(): Promise<UserProfile[]> {
  await ensureSeedUsers();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return users.map((user) => toUserProfile(user));
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toUserProfile(user) : null;
}

export async function findUserByUsername(username: string): Promise<UserProfile | null> {
  const user = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });
  return user ? toUserProfile(user) : null;
}

export async function validatePassword(username: string, password: string): Promise<UserProfile | null> {
  await ensureSeedUsers();
  const candidate = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });
  if (!candidate) return null;

  const valid = await bcrypt.compare(password, candidate.passwordHash);
  if (!valid) return null;

  return toUserProfile(candidate);
}

export async function createSession(token: string, userId: string) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await prisma.session.create({
    data: { token, userId, expiresAt },
  });
}

export async function getSessionUser(token: string): Promise<UserProfile | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return toUserProfile(session.user);
}

export async function destroySession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export async function createUser(payload: {
  username?: string;
  displayName?: string;
  password?: string;
  role?: "admin" | "client";
  theme?: Partial<ThemeConfig>;
}) {
  await ensureSeedUsers();

  const username = String(payload.username ?? "").trim();
  const password = String(payload.password ?? "").trim();
  const role = payload.role === "admin" ? "admin" : "client";

  if (!username || !password) {
    throw new Error("Usuário, nome e senha são obrigatórios.");
  }

  const existing = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });

  if (existing) {
    throw new Error("Este usuário já existe.");
  }

  const userTheme = normalizeTheme(payload.theme ?? defaultThemes.green);
  const created = await prisma.user.create({
    data: {
      tenantId: `${role}-${Date.now()}`,
      username,
      displayName: String(payload.displayName ?? "").trim() || username,
      role,
      passwordHash: await bcrypt.hash(password, 10),
      businessName: userTheme.businessName,
      themePrimary: userTheme.primary,
      themeSecondary: userTheme.secondary,
      themeAccent: userTheme.accent,
      themeBackground: userTheme.background,
      themeSidebar: userTheme.sidebar,
      themeText: userTheme.text,
      themeCard: userTheme.card,
    },
  });

  return toUserProfile(created);
}

export async function deleteUserById(userId: string): Promise<UserProfile | null> {
  const match = await prisma.user.findUnique({ where: { id: userId } });
  if (!match) return null;
  if (match.username.toLowerCase() === "admin") {
    throw new Error("Não é possível excluir a conta administrativa principal.");
  }

  const deleted = await prisma.user.delete({ where: { id: userId } });
  return toUserProfile(deleted);
}

export async function updateUserTheme(userId: string, theme: Partial<ThemeConfig>): Promise<UserProfile | null> {
  const match = await prisma.user.findUnique({ where: { id: userId } });
  if (!match) return null;

  const currentTheme = normalizeTheme({
    businessName: match.businessName || defaultThemes.green.businessName,
    primary: match.themePrimary || defaultThemes.green.primary,
    secondary: match.themeSecondary || defaultThemes.green.secondary,
    accent: match.themeAccent || defaultThemes.green.accent,
    background: match.themeBackground || defaultThemes.green.background,
    sidebar: match.themeSidebar || defaultThemes.green.sidebar,
    text: match.themeText || defaultThemes.green.text,
    card: match.themeCard || defaultThemes.green.card,
  });

  const nextTheme = normalizeTheme({ ...currentTheme, ...theme, businessName: theme.businessName || currentTheme.businessName });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      businessName: nextTheme.businessName,
      themePrimary: nextTheme.primary,
      themeSecondary: nextTheme.secondary,
      themeAccent: nextTheme.accent,
      themeBackground: nextTheme.background,
      themeSidebar: nextTheme.sidebar,
      themeText: nextTheme.text,
      themeCard: nextTheme.card,
    },
  });

  return toUserProfile(updated);
}

export async function updateUserProfile(userId: string, payload: {
  username?: string;
  displayName?: string;
  password?: string;
  role?: "admin" | "client";
  theme?: Partial<ThemeConfig>;
}) {
  const match = await prisma.user.findUnique({ where: { id: userId } });
  if (!match) return null;

  const nextUsername = payload.username?.trim();
  if (nextUsername !== undefined && !nextUsername) {
    throw new Error("Usuário não pode ficar vazio.");
  }

  if (nextUsername) {
    const isTaken = await prisma.user.findFirst({
      where: { username: { equals: nextUsername, mode: "insensitive" }, id: { not: userId } },
    });
    if (isTaken) {
      throw new Error("Este usuário já existe.");
    }
  }

  const currentTheme = normalizeTheme({
    businessName: match.businessName || defaultThemes.green.businessName,
    primary: match.themePrimary || defaultThemes.green.primary,
    secondary: match.themeSecondary || defaultThemes.green.secondary,
    accent: match.themeAccent || defaultThemes.green.accent,
    background: match.themeBackground || defaultThemes.green.background,
    sidebar: match.themeSidebar || defaultThemes.green.sidebar,
    text: match.themeText || defaultThemes.green.text,
    card: match.themeCard || defaultThemes.green.card,
  });

  const nextTheme = payload.theme ? normalizeTheme({ ...currentTheme, ...payload.theme }) : currentTheme;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      username: nextUsername ?? match.username,
      displayName: payload.displayName ? payload.displayName.trim() || match.displayName : match.displayName,
      role: payload.role ?? match.role,
      passwordHash: payload.password && payload.password.trim() ? await bcrypt.hash(payload.password.trim(), 10) : match.passwordHash,
      businessName: nextTheme.businessName,
      themePrimary: nextTheme.primary,
      themeSecondary: nextTheme.secondary,
      themeAccent: nextTheme.accent,
      themeBackground: nextTheme.background,
      themeSidebar: nextTheme.sidebar,
      themeText: nextTheme.text,
      themeCard: nextTheme.card,
    },
  });

  return toUserProfile(updated);
}
