"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus, Search, ShoppingCart } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { formatCurrency, products, type Product } from "@/lib/data";
import { getOpenCash, registerSale, type LocalCashSession, type PaymentMethod } from "@/lib/pos-store";

type CartItem = Product & { quantity: number };

export default function SalesPage() {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>("Pix");
  const [cashReceived, setCashReceived] = useState("");
  const [discount, setDiscount] = useState("");
  const [managerCode, setManagerCode] = useState("");
  const [customer, setCustomer] = useState("");
  const [cashSession, setCashSession] = useState<LocalCashSession | null | undefined>(undefined);
  const [receipt, setReceipt] = useState<{ total: number; change: number } | null>(null);
  useEffect(() => setCashSession(getOpenCash() ?? null), []);
  const filtered = products.filter((item) => `${item.name} ${item.sku}`.toLowerCase().includes(query.toLowerCase()));
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const discountValue = Number(discount.replace(",", ".")) || 0;
  const hasAuthorizedDiscount = discountValue === 0 || managerCode === "GERENTE";
  const total = Math.max(0, subtotal - (hasAuthorizedDiscount ? discountValue : 0));
  const received = Number(cashReceived.replace(",", ".")) || 0;
  const change = payment === "Dinheiro" ? Math.max(0, received - total) : 0;
  const canFinish = Boolean(cashSession) && cart.length > 0 && hasAuthorizedDiscount && (payment !== "Dinheiro" || received >= total);
  const add = (product: Product) => setCart((current) => { const item = current.find((entry) => entry.id === product.id); return item ? current.map((entry) => entry.id === product.id ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...current, { ...product, quantity: 1 }]; });
  const quantity = (id: string, amount: number) => setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item).filter((item) => item.quantity));
  const finish = async () => {
    if (!cashSession || !canFinish) return;
    const response = await fetch("/api/pos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sale", paymentMethod: payment, items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })) }) });
    const data = await response.json();
    if (!response.ok) { alert(data.error ?? "Não foi possível concluir a venda."); return; }
    registerSale({ cashSessionId: cashSession.id, total, paymentMethod: payment, customerName: customer.trim() || undefined });
    setReceipt({ total, change }); setCart([]); setCashReceived(""); setDiscount(""); setManagerCode("");
  };
  return <>
    <PageTitle eyebrow="Ponto de venda" title="Nova venda" description="Busque por nome ou código de barras, monte o pedido e registre o pagamento." action={<span className={`rounded-full px-3 py-2 text-xs font-bold ${cashSession ? "bg-[#eaf8ee] text-[#23804d]" : "bg-[#fff0e9] text-[#c76542]"}`}>{cashSession ? "● Caixa aberto" : "● Caixa fechado"}</span>} />
    {!cashSession && <div className="mb-5 rounded-2xl border border-[#f5d7c9] bg-[#fff8f4] p-4 text-sm text-[#a95c3f]">As vendas estão bloqueadas até que um caixa seja aberto.</div>}
    <div className="grid items-start gap-6 xl:grid-cols-[1fr_390px]"><section className="rounded-2xl border border-[#e4e8df] bg-white p-5 shadow-soft"><div className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar nome ou código de barras/SKU..." className="w-full rounded-xl bg-[#f7f8f3] py-3 pl-10 pr-3 text-sm outline-none" /></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{filtered.map((product) => <button key={product.id} disabled={!cashSession || product.stock < 1} onClick={() => add(product)} className="rounded-2xl border border-[#edf0e9] p-3 text-left hover:border-forest/40 disabled:cursor-not-allowed disabled:opacity-40"><div className="grid aspect-[1.25] place-items-center rounded-xl text-3xl font-bold" style={{ background: product.accent }}>{product.name[0]}</div><p className="mt-3 truncate text-sm font-bold">{product.name}</p><p className="mt-1 text-xs text-ink/45">{product.sku} · {product.stock} un.</p><div className="mt-3 flex justify-between"><b>{formatCurrency(product.price)}</b><Plus size={17} className="text-forest" /></div></button>)}</div></section>
    <section className="sticky top-[92px] rounded-2xl border border-[#e4e8df] bg-white shadow-soft"><div className="border-b border-[#eef0eb] p-5"><h2 className="font-bold">Pedido atual</h2><p className="mt-1 text-xs text-ink/45">{cart.reduce((sum, item) => sum + item.quantity, 0)} itens</p></div><div className="max-h-64 space-y-3 overflow-auto p-5">{cart.length === 0 ? <div className="py-8 text-center text-sm text-ink/45"><ShoppingCart className="mx-auto mb-2 opacity-30" />Pedido vazio</div> : cart.map((item) => <div key={item.id} className="flex items-center gap-2 text-sm"><div className="min-w-0 flex-1"><b className="block truncate">{item.name}</b><span className="text-xs text-ink/45">{formatCurrency(item.price)}</span></div><button onClick={() => quantity(item.id, -1)}><Minus size={15} /></button><b>{item.quantity}</b><button onClick={() => quantity(item.id, 1)}><Plus size={15} /></button></div>)}</div><div className="border-t border-[#eef0eb] p-5"><label className="block text-xs font-bold text-ink/55">Cliente (opcional)<input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Nome do cliente" className="mt-2 w-full rounded-xl border border-[#e4e8df] px-3 py-2 text-sm font-normal" /></label><div className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal</span><b>{formatCurrency(subtotal)}</b></div><label className="block text-xs font-bold text-ink/55">Desconto (R$)<input value={discount} onChange={(e) => setDiscount(e.target.value)} inputMode="decimal" className="mt-1 w-full rounded-lg border border-[#e4e8df] px-3 py-2 text-sm font-normal" /></label>{discountValue > 0 && <label className="block text-xs font-bold text-ink/55">Autorização do gerente<input value={managerCode} onChange={(e) => setManagerCode(e.target.value)} placeholder="Código: GERENTE" className="mt-1 w-full rounded-lg border border-[#e4e8df] px-3 py-2 text-sm font-normal" /></label>}<div className="flex justify-between border-t pt-3 text-lg"><b>Total</b><b>{formatCurrency(total)}</b></div></div><p className="mb-2 mt-5 text-xs font-bold">Pagamento</p><div className="grid grid-cols-3 gap-2">{(["Pix", "Cartão", "Dinheiro"] as PaymentMethod[]).map((method) => <button key={method} onClick={() => setPayment(method)} className={`rounded-lg border py-2 text-xs font-bold ${payment === method ? "border-forest bg-[#eef6e8] text-forest" : "border-[#e4e8df]"}`}>{method}</button>)}</div>{payment === "Dinheiro" && <label className="mt-3 block text-xs font-bold">Recebido<input value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} inputMode="decimal" className="mt-1 w-full rounded-lg border border-[#e4e8df] px-3 py-2 text-sm font-normal" /><span className="mt-1 block text-right text-forest">Troco: {formatCurrency(change)}</span></label>}<button disabled={!canFinish} onClick={finish} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#15231f] py-3 text-sm font-bold text-white disabled:opacity-35"><Check size={17} />Finalizar venda</button></div></section></div>
    {receipt && <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-5"><div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl"><Check className="mx-auto text-[#23804d]" size={34} /><h2 className="mt-3 text-xl font-bold">Venda concluída</h2><p className="mt-2">Total: <b>{formatCurrency(receipt.total)}</b></p>{receipt.change > 0 && <p className="mt-1 text-forest">Troco: {formatCurrency(receipt.change)}</p>}<div className="mt-6 grid grid-cols-2 gap-3"><button onClick={() => window.print()} className="rounded-xl border border-[#e4e8df] py-3 text-sm font-bold">Imprimir</button><button onClick={() => setReceipt(null)} className="rounded-xl bg-[#15231f] py-3 text-sm font-bold text-white">Nova venda</button></div></div></div>}
  </>;
}
