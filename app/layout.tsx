import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = { title: "caixaflow — Gestão simples para o seu negócio", description: "Sistema de caixa e vendas para pequenos negócios." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body><AppShell>{children}</AppShell></body></html>; }
