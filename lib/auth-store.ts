import bcrypt from "bcryptjs";
import { defaultThemes, type ThemeConfig, type UserProfile } from "@/lib/theme";

type MemoryUser = {
  id: string;
  username: string;
  displayName: string;
  role: "admin" | "client";
  passwordHash: string;
  theme: ThemeConfig;
};

type MemorySession = {
  userId: string;
  expiresAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __caixaflow_users?: MemoryUser[];
  __caixaflow_sessions?: Map<string, MemorySession>;
};

function ensureStore() {
  if (!globalStore.__caixaflow_users) {
    const seed = [
      {
        id: "admin-1",
        username: "admin",
        displayName: "Administrador",
        role: "admin" as const,
        passwordHash: bcrypt.hashSync("920025", 10),
        theme: defaultThemes.green,
      },
      {
        id: "client-rosa",
        username: "rosa",
        displayName: "Rosa",
        role: "client" as const,
        passwordHash: bcrypt.hashSync("123456", 10),
        theme: defaultThemes.red,
      },
      {
        id: "client-julia",
        username: "julia",
        displayName: "Júlia",
        role: "client" as const,
        passwordHash: bcrypt.hashSync("123456", 10),
        theme: defaultThemes.blue,
      },
    ];
    globalStore.__caixaflow_users = seed;
  }

  if (!globalStore.__caixaflow_sessions) {
    globalStore.__caixaflow_sessions = new Map();
  }

  return globalStore;
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

export function serializeUser(user: MemoryUser): UserProfile {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    businessName: user.theme.businessName,
    theme: normalizeTheme(user.theme),
  };
}

export function listUsers(): UserProfile[] {
  const store = ensureStore();
  return store.__caixaflow_users!.map((user) => serializeUser(user));
}

export function getUserById(id: string): UserProfile | null {
  const user = ensureStore().__caixaflow_users!.find((entry) => entry.id === id);
  return user ? serializeUser(user) : null;
}

export function findUserByUsername(username: string): UserProfile | null {
  const user = ensureStore().__caixaflow_users!.find((entry) => entry.username.toLowerCase() === username.toLowerCase());
  return user ? serializeUser(user) : null;
}

export function validatePassword(username: string, password: string) {
  const candidate = ensureStore().__caixaflow_users!.find((entry) => entry.username.toLowerCase() === username.toLowerCase());
  if (!candidate) return null;
  const valid = bcrypt.compareSync(password, candidate.passwordHash);
  if (!valid) return null;
  return serializeUser(candidate);
}

export function createSession(token: string, userId: string) {
  const store = ensureStore();
  store.__caixaflow_sessions!.set(token, {
    userId,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
  });
}

export function getSessionUser(token: string): UserProfile | null {
  const store = ensureStore();
  const session = store.__caixaflow_sessions!.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    store.__caixaflow_sessions!.delete(token);
    return null;
  }

  const user = store.__caixaflow_users!.find((entry) => entry.id === session.userId);
  return user ? serializeUser(user) : null;
}

export function destroySession(token: string) {
  ensureStore().__caixaflow_sessions!.delete(token);
}

export async function createUser(payload: {
  username?: string;
  displayName?: string;
  password?: string;
  role?: "admin" | "client";
  theme?: Partial<ThemeConfig>;
}) {
  const store = ensureStore();
  const username = String(payload.username ?? "").trim();
  const password = String(payload.password ?? "").trim();
  const role = payload.role === "admin" ? "admin" : "client";

  if (!username || !password) {
    throw new Error("Usuário, nome e senha são obrigatórios.");
  }

  if (store.__caixaflow_users!.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("Este usuário já existe.");
  }

  const userTheme = normalizeTheme(payload.theme ?? defaultThemes.green);
  const created: MemoryUser = {
    id: `${role}-${Date.now()}`,
    username,
    displayName: String(payload.displayName ?? "").trim() || username,
    role,
    passwordHash: bcrypt.hashSync(password, 10),
    theme: userTheme,
  };

  store.__caixaflow_users!.push(created);
  return serializeUser(created);
}

export function deleteUserById(userId: string): UserProfile | null {
  const store = ensureStore();
  const match = store.__caixaflow_users!.find((entry) => entry.id === userId);
  if (!match) return null;
  if (match.username.toLowerCase() === "admin") {
    throw new Error("Não é possível excluir a conta administrativa principal.");
  }

  const index = store.__caixaflow_users!.findIndex((entry) => entry.id === userId);
  const [removed] = store.__caixaflow_users!.splice(index, 1);

  store.__caixaflow_sessions!.forEach((session, token) => {
    if (session.userId === userId) {
      store.__caixaflow_sessions!.delete(token);
    }
  });

  return serializeUser(removed);
}

export function updateUserTheme(userId: string, theme: Partial<ThemeConfig>): UserProfile | null {
  const store = ensureStore();
  const match = store.__caixaflow_users!.find((entry) => entry.id === userId);
  if (!match) return null;

  match.theme = normalizeTheme({ ...match.theme, ...theme, businessName: theme.businessName || match.theme.businessName });
  return serializeUser(match);
}

export function updateUserProfile(userId: string, payload: {
  username?: string;
  displayName?: string;
  password?: string;
  role?: "admin" | "client";
  theme?: Partial<ThemeConfig>;
}) {
  const store = ensureStore();
  const match = store.__caixaflow_users!.find((entry) => entry.id === userId);
  if (!match) return null;

  if (payload.username) {
    const nextUsername = payload.username.trim();
    if (!nextUsername) {
      throw new Error("Usuário não pode ficar vazio.");
    }
    const isTaken = store.__caixaflow_users!.some((entry) => entry.id !== userId && entry.username.toLowerCase() === nextUsername.toLowerCase());
    if (isTaken) {
      throw new Error("Este usuário já existe.");
    }
    match.username = nextUsername;
  }

  if (payload.displayName) match.displayName = payload.displayName.trim() || match.displayName;
  if (payload.role) match.role = payload.role;
  if (payload.password && payload.password.trim()) match.passwordHash = bcrypt.hashSync(payload.password.trim(), 10);
  if (payload.theme) match.theme = normalizeTheme({ ...match.theme, ...payload.theme });

  return serializeUser(match);
}
