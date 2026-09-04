import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = { title: "GF Venda Fácil — Gestão simples para o seu negócio", description: "Sistema de caixa e vendas para pequenos negócios." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
