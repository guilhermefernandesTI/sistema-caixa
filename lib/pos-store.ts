export type PaymentMethod = "Pix" | "Cartão" | "Dinheiro";

export type CashMovement = {
  id: string;
  type: "SANGRIA" | "REFORCO";
  amount: number;
  reason: string;
  createdAt: string;
};

export type LocalSale = {
  id: string;
  cashSessionId: string;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  customerName?: string;
};

export type LocalCashSession = {
  id: string;
  operator: string;
  openingAmount: number;
  openedAt: string;
  closedAt?: string;
  closingAmount?: number;
  movements: CashMovement[];
};

const cashKey = "caixa-flow-cash-sessions";
const salesKey = "caixa-flow-sales";

const read = <T,>(key: string): T[] => {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value as T[] : [];
  } catch { return []; }
};

const write = <T,>(key: string, value: T[]) => window.localStorage.setItem(key, JSON.stringify(value));
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const getCashSessions = () => read<LocalCashSession>(cashKey);
export const getSales = () => read<LocalSale>(salesKey);
export const getOpenCash = () => getCashSessions().find((session) => !session.closedAt);

export const openCash = (operator: string, openingAmount: number) => {
  const session: LocalCashSession = { id: id("cash"), operator, openingAmount, openedAt: new Date().toISOString(), movements: [] };
  write(cashKey, [session, ...getCashSessions()]);
  return session;
};

export const closeCash = (sessionId: string, closingAmount: number) => {
  const sessions = getCashSessions().map((session) => session.id === sessionId ? { ...session, closingAmount, closedAt: new Date().toISOString() } : session);
  write(cashKey, sessions);
  return sessions.find((session) => session.id === sessionId);
};

export const addCashMovement = (sessionId: string, type: CashMovement["type"], amount: number, reason: string) => {
  const movement: CashMovement = { id: id("movement"), type, amount, reason, createdAt: new Date().toISOString() };
  const sessions = getCashSessions().map((session) => session.id === sessionId ? { ...session, movements: [movement, ...session.movements] } : session);
  write(cashKey, sessions);
  return movement;
};

export const registerSale = (sale: Omit<LocalSale, "id" | "createdAt">) => {
  const next: LocalSale = { ...sale, id: id("sale"), createdAt: new Date().toISOString() };
  write(salesKey, [next, ...getSales()]);
  return next;
};

export const expectedCash = (session: LocalCashSession) => {
  const cashSales = getSales().filter((sale) => sale.cashSessionId === session.id && sale.paymentMethod === "Dinheiro").reduce((sum, sale) => sum + sale.total, 0);
  const movements = session.movements.reduce((sum, movement) => sum + (movement.type === "REFORCO" ? movement.amount : -movement.amount), 0);
  return session.openingAmount + cashSales + movements;
};
