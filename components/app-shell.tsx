"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, ChevronDown, CircleHelp, LayoutDashboard, LogOut, Menu, ReceiptText, WalletCards, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/sales", label: "Nova venda", icon: ReceiptText },
  { href: "/products", label: "Produtos", icon: Boxes },
  { href: "/cash", label: "Caixa", icon: WalletCards },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f7f8f3] text-ink">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#15231f] px-5 py-6 text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint text-ink font-black">cf</span>
            <span className="text-lg font-bold tracking-tight">caixa<span className="text-mint">flow</span></span>
          </Link>
          <button className="rounded-lg p-1 text-white/60 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu"><X size={18} /></button>
        </div>
        <div className="mt-10 flex-1">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Operação</p>
          <nav className="space-y-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-white text-ink shadow-lg" : "text-white/65 hover:bg-white/10 hover:text-white"}`}><Icon size={18} strokeWidth={active ? 2.4 : 1.8} />{label}</Link>;
            })}
          </nav>
          <p className="mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Relatórios</p>
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white"><BarChart3 size={18} />Desempenho</Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f4b183] text-sm font-bold text-ink">GS</div><div className="min-w-0"><p className="truncate text-sm font-semibold">Gabriel Silva</p><p className="text-xs text-white/45">Administrador</p></div><ChevronDown size={15} className="ml-auto text-white/40" /></div>
          <button className="mt-3 flex w-full items-center gap-2 border-t border-white/10 pt-3 text-xs text-white/50 hover:text-white"><LogOut size={14} />Sair da conta</button>
        </div>
      </aside>
      {open && <button aria-label="Fechar menu" className="fixed inset-0 z-20 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="lg:pl-64"><header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[#e4e8df] bg-[#f7f8f3]/90 px-5 backdrop-blur-md sm:px-8"><button className="rounded-xl border border-[#dfe5db] bg-white p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button><div className="hidden lg:block"><p className="text-xs font-medium text-ink/45">Sexta-feira, 04 de setembro de 2026</p><p className="text-sm font-semibold">Bom dia, Gabriel <span aria-hidden="true">👋</span></p></div><div className="ml-auto flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-[#dfe5db] bg-white px-3 py-2 text-xs font-medium sm:flex"><span className="h-2 w-2 rounded-full bg-[#42c98b]" /> Caixa aberto</div><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f4b183] text-xs font-bold text-ink">GS</div></div></header><main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8">{children}</main></div>
    </div>
  );
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) { return <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-forest">{eyebrow}</p>}<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm text-ink/55">{description}</p>}</div>{action}</div>; }
