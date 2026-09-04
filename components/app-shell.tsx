"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Boxes, ChevronDown, LayoutDashboard, LogOut, Menu, PaintBucket, ReceiptText, ShieldCheck, WalletCards, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";

const nav = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/sales", label: "Nova venda", icon: ReceiptText },
  { href: "/products", label: "Produtos", icon: Boxes },
  { href: "/cash", label: "Caixa", icon: WalletCards },
  { href: "/settings", label: "Personalização", icon: PaintBucket },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isReady, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/login" && isReady && !user) {
      router.replace("/login");
    }
  }, [pathname, router, user, isReady]);

  useEffect(() => {
    if (isReady && user && pathname === "/" && user.role === "admin") {
      router.replace("/admin");
    }
  }, [isReady, pathname, router, user]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!isReady) {
    return <div className="min-h-screen grid place-items-center bg-[#f7f8f3] text-ink">Carregando...</div>;
  }

  if (!user) {
    return <div className="min-h-screen grid place-items-center bg-[#f7f8f3] text-ink">Sessão expirada. Redirecionando para login...</div>;
  }

  const businessName = user.theme.businessName || "GF Venda Fácil";
  const businessNameParts = businessName.trim().split(/\s+/).filter(Boolean);
  const brandMain = businessNameParts[0] || "caixa";
  const brandSecondary = businessNameParts.length > 1 ? businessNameParts.slice(1).join(" ") : "";
  const visibleNav = user.role === "admin"
    ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }]
    : nav.filter((item) => item.href !== "/settings");

  useEffect(() => {
    if (pathname === "/settings" && user && user.role !== "admin") {
      router.replace("/");
    }
  }, [pathname, router, user]);

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] text-[var(--brand-text)]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[var(--brand-sidebar)] px-5 py-6 text-white transition-transform ${open ? "translate-x-0" : "-translate-x-full" } lg:translate-x-0`}>
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--brand-accent)] text-[var(--brand-sidebar)] font-black">GF</span>
            <span className="text-lg font-bold tracking-tight">
              <span>{brandMain}</span>
              {brandSecondary ? <span className="ml-1 text-[var(--brand-secondary)]">{brandSecondary}</span> : null}
            </span>
          </Link>
          <button className="rounded-lg p-1 text-white/60 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu"><X size={18} /></button>
        </div>
        <div className="mt-10 flex-1">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Operação</p>
          <nav className="space-y-1">
            {visibleNav.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-white text-[var(--brand-text)] shadow-lg" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>
                  <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />{label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--brand-accent)] text-sm font-bold text-[var(--brand-sidebar)]">{user.displayName.slice(0, 2).toUpperCase()}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.displayName}</p>
              <p className="text-xs text-white/45">{user.role === "admin" ? "Administrador" : "Cliente"}</p>
            </div>
            <ChevronDown size={15} className="ml-auto text-white/40" />
          </div>
          <button onClick={async () => {
            await signOut();
            setOpen(false);
            router.replace("/login");
            router.refresh();
          }} className="mt-3 flex w-full items-center gap-2 border-t border-white/10 pt-3 text-xs text-white/50 hover:text-white"><LogOut size={14} />Sair da conta</button>
        </div>
      </aside>
      {open && <button aria-label="Fechar menu" className="fixed inset-0 z-20 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[var(--brand-secondary)] bg-[var(--brand-bg)] px-5 backdrop-blur-md sm:px-8">
          <button className="rounded-xl border border-[#dfe5db] bg-white p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button>
          <div className="hidden lg:block">
            <p className="text-xs font-medium text-[#58615a]">Sexta-feira, 04 de setembro de 2026</p>
            <p className="text-sm font-semibold">Bom dia, {user.displayName.split(" ")[0]} <span aria-hidden="true">👋</span></p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {pathname !== "/login" && pathname !== "/" && (
              <button onClick={() => router.back()} className="inline-flex items-center gap-2 rounded-xl border border-[#dfe5db] bg-white px-3 py-2 text-xs font-semibold text-[#3b4642]">
                <ArrowLeft size={14} /> Voltar
              </button>
            )}
            <div className="hidden items-center gap-2 rounded-full border border-[#dfe5db] bg-white px-3 py-2 text-xs font-medium sm:flex">
              <span className="h-2 w-2 rounded-full bg-[var(--brand-accent)]" /> Caixa aberto
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((value) => !value)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[var(--brand-accent)] text-xs font-bold text-[var(--brand-sidebar)] ring-2 ring-white"
                aria-label="Abrir menu do perfil"
              >
                {user.displayName.slice(0, 2).toUpperCase()}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 z-20 mt-3 w-52 rounded-2xl border border-[#e4e8df] bg-white p-2 shadow-xl">
                  <div className="px-2 py-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#7a827d]">Perfil</p>
                    <p className="mt-2 text-sm font-semibold text-[#1d2724]">{user.displayName}</p>
                    <p className="text-xs text-[#64716b]">{user.role === "admin" ? "Administrador" : "Cliente"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setProfileMenuOpen(false);
                      await signOut();
                      router.replace("/login");
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-[#3b4642] hover:bg-[#f5f7f3]"
                  >
                    <LogOut size={15} /> Sair do sistema
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-accent)]">{eyebrow}</p>}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-[#58615a]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
