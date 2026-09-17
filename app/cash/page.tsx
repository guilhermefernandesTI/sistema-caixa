"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Banknote, Check, LockKeyhole, Plus, WalletCards } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { formatCurrency } from "@/lib/data";
import { addCashMovement, closeCash, expectedCash, getCashSessions, getOpenCash, getSales, openCash, type CashMovement, type LocalCashSession } from "@/lib/pos-store";

const money = (value: string) => Number(value.trim().replace(/\s/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", "."));
const dateTime = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

export default function CashPage() {
  const [session, setSession] = useState<LocalCashSession | null | undefined>(undefined);
  const [history, setHistory] = useState<LocalCashSession[]>([]);
  const [mode, setMode] = useState<"open" | "close" | "movement" | null>(null);
  const [operator, setOperator] = useState("");
  const [amount, setAmount] = useState("");
  const [movementType, setMovementType] = useState<CashMovement["type"]>("SANGRIA");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const refresh = () => { setSession(getOpenCash() ?? null); setHistory(getCashSessions().filter((item) => item.closedAt)); };
  useEffect(() => { refresh(); }, []);
  const expected = useMemo(() => session ? expectedCash(session) : 0, [session, history]);
  const cashSales = session ? getSales().filter((sale) => sale.cashSessionId === session.id && sale.paymentMethod === "Dinheiro").reduce((sum, sale) => sum + sale.total, 0) : 0;

  const submit = async () => {
    const value = money(amount);
    if (!Number.isFinite(value) || value < 0 || (mode === "open" && !operator.trim()) || (mode === "movement" && !reason.trim())) { setError("Preencha todos os campos com valores válidos."); return; }
    if (mode === "open" || mode === "close") {
      const response = await fetch("/api/pos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mode === "open" ? { action: "open", openingAmount: value } : { action: "close", closingAmount: value }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Não foi possível salvar no banco."); return; }
    }
    if (mode === "open") openCash(operator.trim(), value);
    if (mode === "close" && session) closeCash(session.id, value);
    if (mode === "movement" && session) addCashMovement(session.id, movementType, value, reason.trim());
    setAmount(""); setOperator(""); setReason(""); setError(""); setMode(null); refresh();
  };

  return <>
    <PageTitle eyebrow="Financeiro" title="Caixa" description="Controle a abertura, dinheiro físico, retiradas e fechamento de cada turno." action={session ? <div className="flex gap-2"><button onClick={() => setMode("movement")} className="inline-flex items-center gap-2 rounded-xl border border-[#e4e8df] bg-white px-4 py-3 text-sm font-semibold"><Plus size={16} />Movimentação</button><button onClick={() => setMode("close")} className="inline-flex items-center gap-2 rounded-xl border border-[#f0cdbc] bg-[#fff8f4] px-4 py-3 text-sm font-semibold text-[#a95c3f]"><LockKeyhole size={16} />Fechar caixa</button></div> : <button onClick={() => setMode("open")} className="inline-flex items-center gap-2 rounded-xl bg-[#15231f] px-4 py-3 text-sm font-semibold text-white"><WalletCards size={17} />Abrir caixa</button>} />
    {!session ? <div className="mx-auto max-w-xl rounded-2xl border border-[#e4e8df] bg-white p-8 text-center shadow-soft"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#eef6e8] text-forest"><LockKeyhole size={28} /></div><h2 className="mt-5 text-xl font-bold">Nenhum caixa aberto</h2><p className="mt-2 text-sm text-ink/50">Abra o caixa com o valor inicial e o responsável antes de vender.</p><button onClick={() => setMode("open")} className="mt-6 rounded-xl bg-[#15231f] px-5 py-3 text-sm font-bold text-white">Abrir novo caixa</button></div> : <><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-[#15231f] p-5 text-white"><p className="text-xs text-white/60">Dinheiro esperado</p><p className="mt-3 text-3xl font-bold">{formatCurrency(expected)}</p><p className="mt-2 text-xs text-white/60">Abertura + vendas em dinheiro ± movimentações</p></div><div className="rounded-2xl border border-[#e4e8df] bg-white p-5"><p className="text-xs text-ink/50">Abertura</p><p className="mt-3 text-2xl font-bold">{formatCurrency(session.openingAmount)}</p><p className="mt-2 text-xs text-ink/45">{session.operator} · {dateTime(session.openedAt)}</p></div><div className="rounded-2xl border border-[#e4e8df] bg-white p-5"><p className="text-xs text-ink/50">Vendas em dinheiro</p><p className="mt-3 text-2xl font-bold">{formatCurrency(cashSales)}</p><p className="mt-2 text-xs text-ink/45">Turno atual</p></div></div><section className="mt-6 rounded-2xl border border-[#e4e8df] bg-white p-5 shadow-soft"><h2 className="font-bold">Sangrias e reforços</h2><div className="mt-4 space-y-2">{session.movements.length === 0 ? <p className="text-sm text-ink/45">Nenhuma movimentação neste turno.</p> : session.movements.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-[#fafbf8] p-3"><div className={item.type === "REFORCO" ? "rounded-full bg-[#eaf8ee] p-2 text-[#23804d]" : "rounded-full bg-[#fff0e9] p-2 text-[#c76542]"}>{item.type === "REFORCO" ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}</div><div className="flex-1"><p className="text-sm font-semibold">{item.type === "REFORCO" ? "Reforço" : "Sangria"}</p><p className="text-xs text-ink/45">{item.reason} · {dateTime(item.createdAt)}</p></div><b className={item.type === "REFORCO" ? "text-[#23804d]" : "text-[#c76542]"}>{item.type === "REFORCO" ? "+" : "-"}{formatCurrency(item.amount)}</b></div>)}</div></section></>}
    <section className="mt-6 rounded-2xl border border-[#e4e8df] bg-white p-5 shadow-soft"><h2 className="font-bold">Histórico de fechamentos</h2><div className="mt-4 space-y-2">{history.length === 0 ? <p className="text-sm text-ink/45">Ainda não há caixas fechados.</p> : history.map((item) => { const difference = (item.closingAmount ?? 0) - expectedCash(item); return <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#fafbf8] p-3 text-sm"><span><b>{dateTime(item.closedAt!)}</b> · {item.operator}</span><span>Contado: <b>{formatCurrency(item.closingAmount ?? 0)}</b></span><span className={difference === 0 ? "text-[#23804d]" : "text-[#c76542]"}>{difference === 0 ? "Sem diferença" : `${difference > 0 ? "Sobra" : "Falta"}: ${formatCurrency(Math.abs(difference))}`}</span></div>; })}</div></section>
    {mode && <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-5"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-bold">{mode === "open" ? "Abrir caixa" : mode === "close" ? "Fechar caixa" : "Nova movimentação"}</h2>{mode === "open" && <label className="mt-5 block text-sm font-medium">Nome do operador<input value={operator} onChange={(e) => setOperator(e.target.value)} className="mt-2 w-full rounded-xl border border-[#e4e8df] px-3 py-3" placeholder="Ex.: Maria" /></label>}{mode === "movement" && <><label className="mt-5 block text-sm font-medium">Tipo<select value={movementType} onChange={(e) => setMovementType(e.target.value as CashMovement["type"])} className="mt-2 w-full rounded-xl border border-[#e4e8df] px-3 py-3"><option value="SANGRIA">Sangria (retirada)</option><option value="REFORCO">Reforço (entrada)</option></select></label><label className="mt-4 block text-sm font-medium">Motivo / comprovante<input value={reason} onChange={(e) => setReason(e.target.value)} className="mt-2 w-full rounded-xl border border-[#e4e8df] px-3 py-3" placeholder="Ex.: Depósito bancário #123" /></label></>}{mode === "close" && <div className="mt-4 rounded-xl bg-[#f5f8f1] p-4 text-sm">Esperado em dinheiro: <b>{formatCurrency(expected)}</b></div>}<label className="mt-4 block text-sm font-medium">{mode === "close" ? "Valor contado" : "Valor (R$)"}<input value={amount} onChange={(e) => { setAmount(e.target.value); setError(""); }} inputMode="decimal" className="mt-2 w-full rounded-xl border border-[#e4e8df] px-3 py-3" placeholder="0,00" /></label>{error && <p className="mt-2 text-xs text-[#c76542]">{error}</p>}<div className="mt-6 flex gap-3"><button onClick={() => { setMode(null); setError(""); }} className="flex-1 rounded-xl border border-[#e4e8df] py-3 text-sm font-bold">Cancelar</button><button onClick={submit} className="flex-1 rounded-xl bg-[#15231f] py-3 text-sm font-bold text-white">Confirmar</button></div></div></div>}
  </>;
}
