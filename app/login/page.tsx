"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("920025");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = signIn(username, password);
    if (result.success) {
      setMessage(result.message);
      router.push("/");
      return;
    }

    setMessage(result.message);
  };

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] px-4 py-10 text-[var(--brand-text)]">
      <div className="mx-auto flex max-w-5xl overflow-hidden rounded-[32px] border border-[var(--brand-secondary)] bg-white shadow-2xl">
        <div className="hidden w-1/2 bg-[var(--brand-sidebar)] p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--brand-accent)] text-lg font-black text-[var(--brand-sidebar)]">cf</span>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Sistema de caixa</p>
                <h1 className="text-2xl font-black">caixa flow</h1>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-white/45">Acesso</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">Controle seu caixa com identidade visual própria.</h2>
            <p className="mt-4 max-w-md text-sm text-white/70">Faça login com as credenciais do cliente ou do administrador para visualizar a marca, as cores e o ambiente personalizados.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <p className="font-semibold text-white">Credenciais de demonstração</p>
            <p className="mt-2">admin / 920025</p>
            <p className="mt-1">julia / 123456</p>
            <p className="mt-1">rosa / 123456</p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-[var(--brand-bg)] p-6 lg:w-1/2 lg:p-10">
          <div className="w-full max-w-md rounded-[28px] border border-[var(--brand-secondary)] bg-white p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--brand-accent)]">Login</p>
            <h2 className="mt-3 text-3xl font-black">Entrar</h2>
            <p className="mt-2 text-sm text-[#58615a]">Acesse o painel da sua operação.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-[#3b4642]">
                Usuário
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3">
                  <UserRound size={17} className="text-[var(--brand-accent)]" />
                  <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" className="w-full bg-transparent text-sm outline-none" />
                </div>
              </label>

              <label className="block text-sm font-medium text-[#3b4642]">
                Senha
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3">
                  <LockKeyhole size={17} className="text-[var(--brand-accent)]" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" className="w-full bg-transparent text-sm outline-none" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-[var(--brand-accent)]">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {message && <p className="rounded-xl border border-[#f6d3c6] bg-[#fff8f4] px-3 py-2 text-xs font-medium text-[#a95c3f]">{message}</p>}

              <button type="submit" className="w-full rounded-2xl bg-[var(--brand-primary)] py-3.5 text-sm font-bold text-white transition hover:opacity-95">
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
