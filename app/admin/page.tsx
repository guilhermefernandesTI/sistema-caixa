"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, ShieldCheck, Sparkles, Trash2, Users } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { defaultThemes, type ThemeConfig, type UserProfile } from "@/lib/theme";

const presets = [
  { label: "Verde padrão", theme: defaultThemes.green },
  { label: "Azul Júlia", theme: defaultThemes.blue },
  { label: "Vermelho Rosa", theme: defaultThemes.red },
  { label: "Lilás Luxe", theme: defaultThemes.purple },
  { label: "Dourado Aurora", theme: defaultThemes.gold },
  { label: "Coral Sol", theme: defaultThemes.coral },
  { label: "Noir Dark", theme: defaultThemes.dark },
];

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<ThemeConfig>(defaultThemes.green);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ username: "", displayName: "", password: "", role: "client" as "admin" | "client" });
  const [editForm, setEditForm] = useState({ username: "", displayName: "", password: "", role: "client" as "admin" | "client" });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch("/api/users", { credentials: "same-origin" });
        if (!response.ok) return;
        const data = await response.json();
        const nextUsers = data.users ?? [];
        setUsers(nextUsers);
        if (!selectedUserId && nextUsers.length > 0) {
          setSelectedUserId(nextUsers[0].id);
          setTheme(nextUsers[0].theme ?? defaultThemes.green);
        }
      } catch {
        setUsers([]);
      }
    };

    loadUsers();
  }, [selectedUserId]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") return;
    if (!selectedUserId && users.length > 0) {
      setSelectedUserId(users[0].id);
      setTheme(users[0].theme ?? defaultThemes.green);
    }
  }, [user, users, selectedUserId]);

  const selectedUser = users.find((entry) => entry.id === selectedUserId) ?? user ?? null;

  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        username: selectedUser.username,
        displayName: selectedUser.displayName,
        password: "",
        role: selectedUser.role,
      });
      if (selectedUser.theme) {
        setTheme(selectedUser.theme);
      }
    }
  }, [selectedUser]);

  const handleSelectUser = (entry: UserProfile) => {
    setSelectedUserId(entry.id);
    setTheme(entry.theme ?? defaultThemes.green);
  };

  const handleSaveTheme = async () => {
    if (!selectedUser?.id) return;

    const nextTheme = { ...theme, businessName: theme.businessName.trim() || selectedUser.displayName || "caixa flow" };
    setTheme(nextTheme);

    const response = await fetch(`/api/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ theme: nextTheme }),
    });

    if (!response.ok) {
      alert("Não foi possível salvar a personalização do cliente.");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    const data = await response.json();
    const savedTheme = data.user.theme ?? nextTheme;
    setTheme(savedTheme);
    setUsers((current) => current.map((entry) => entry.id === data.user.id ? data.user : entry));
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.username || !form.password) return;

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        username: form.username,
        displayName: form.displayName || form.username,
        password: form.password,
        role: form.role,
        theme: defaultThemes.green,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "Não foi possível criar o usuário.");
      return;
    }

    setUsers((current) => [...current, data.user]);
    setSelectedUserId(data.user.id);
    setTheme(data.user.theme ?? defaultThemes.green);
    setForm({ username: "", displayName: "", password: "", role: "client" });
  };

  const handleUpdateSelectedUser = async () => {
    if (!selectedUserId) return;

    const payload: { username?: string; displayName?: string; password?: string; role?: "admin" | "client" } = {
      username: editForm.username,
      displayName: editForm.displayName,
      role: editForm.role,
    };

    if (editForm.password.trim()) {
      payload.password = editForm.password.trim();
    }

    const response = await fetch(`/api/users/${selectedUserId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "Não foi possível atualizar o estabelecimento.");
      return;
    }

    setUsers((current) => current.map((entry) => entry.id === data.user.id ? data.user : entry));
    setSelectedUserId(data.user.id);
    setTheme(data.user.theme ?? defaultThemes.green);
    setEditForm({ username: data.user.username, displayName: data.user.displayName, password: "", role: data.user.role });
  };

  const handleDeleteUser = async (userId: string) => {
    const target = users.find((entry) => entry.id === userId);
    if (!target) return;
    if (target.id === user?.id) {
      alert("Você não pode excluir sua própria conta administrativa.");
      return;
    }

    const confirmed = window.confirm(`Deseja excluir o estabelecimento "${target.displayName}"?`);
    if (!confirmed) return;

    const response = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
      credentials: "same-origin",
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "Não foi possível excluir o estabelecimento.");
      return;
    }

    const nextUsers = users.filter((entry) => entry.id !== userId);
    setUsers(nextUsers);
    if (selectedUserId === userId) {
      const nextSelection = nextUsers[0];
      setSelectedUserId(nextSelection?.id);
      setTheme(nextSelection?.theme ?? defaultThemes.green);
    }
  };

  const handleChangeTheme = (key: keyof ThemeConfig, value: string) => {
    setTheme((current) => ({ ...current, [key]: value }));
  };

  if (user?.role !== "admin") {
    return (
      <>
        <PageTitle eyebrow="Acesso" title="Área restrita" description="Esta página é exclusiva para administradores." />
        <div className="rounded-2xl border border-[#e4e8df] bg-white p-6 text-sm text-[#4b5652]">
          Faça login com a conta admin para gerenciar clientes, contas e personalização visual.
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="Administração"
        title="Gestão de clientes e branding"
        description="Cadastre novos logins, selecione um cliente e defina o nome e as cores do sistema que ele vai enxergar."
        action={<div className="inline-flex items-center gap-2 rounded-full bg-[#eaf9f0] px-3 py-2 text-xs font-bold text-[#1d7d49]"><ShieldCheck size={14} /> Modo administrador</div>}
      />

      <section className="mb-6 rounded-2xl border border-[#e4e8df] bg-white p-5 shadow-soft sm:p-6">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--brand-accent)]">
          <Users size={17} /> Cadastro de clientes
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-[#edf0e9] bg-[#fafcf8] p-4">
            <p className="text-sm font-bold text-[#2d3835]">Usuários cadastrados</p>
            <div className="mt-3 space-y-2">
              {users.length === 0 ? (
                <p className="text-sm text-[#5f6c68]">Nenhum cliente cadastrado ainda.</p>
              ) : (
                users.map((entry) => (
                 <div
                   key={entry.id}
                   className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-3 ${selectedUserId === entry.id ? "border-[var(--brand-accent)] bg-[#f4f8ff]" : "border-[#e4e8df] bg-white"}`}
                 >
                   <button
                     type="button"
                     onClick={() => handleSelectUser(entry)}
                     className="flex flex-1 items-center justify-between text-left"
                   >
                     <div>
                       <p className="text-sm font-semibold text-[#2d3835]">{entry.displayName}</p>
                       <p className="text-xs text-[#64716b]">@{entry.username} · {entry.role === "admin" ? "Admin" : "Cliente"}</p>
                     </div>
                     <span className="rounded-full bg-[#eef2f7] px-2 py-1 text-[10px] font-bold uppercase text-[#495861]">{entry.role}</span>
                   </button>
                   <div className="flex items-center gap-2">
                     <button
                       type="button"
                       onClick={() => handleSelectUser(entry)}
                       className="rounded-lg border border-[#dfe5db] bg-white p-2 text-[#3b4642] transition hover:border-[var(--brand-accent)]"
                       aria-label={`Editar ${entry.displayName}`}
                     >
                       <Pencil size={14} />
                     </button>
                     {entry.id && entry.id !== user?.id && (
                       <button
                         type="button"
                         onClick={() => handleDeleteUser(entry.id!)}
                         className="rounded-lg border border-[#ffd7d7] bg-[#fff5f5] p-2 text-[#b63b3b] transition hover:border-[#f8a6a6]"
                         aria-label={`Excluir ${entry.displayName}`}
                       >
                         <Trash2 size={14} />
                       </button>
                     )}
                   </div>
                 </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="rounded-2xl border border-[#edf0e9] bg-[#fafcf8] p-4">
            <p className="text-sm font-bold text-[#2d3835]">Criar novo login</p>
            <div className="mt-4 grid gap-3">
              <label className="text-sm font-medium">
                Usuário
                <input value={form.username} onChange={(e) => setForm((current) => ({ ...current, username: e.target.value }))} className="mt-1 w-full rounded-xl border border-[#dfe5db] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-accent)]" placeholder="ex.: maria" />
              </label>
              <label className="text-sm font-medium">
                Nome exibido
                <input value={form.displayName} onChange={(e) => setForm((current) => ({ ...current, displayName: e.target.value }))} className="mt-1 w-full rounded-xl border border-[#dfe5db] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-accent)]" placeholder="ex.: Maria Silva" />
              </label>
              <label className="text-sm font-medium">
                Senha
                <input type="password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} className="mt-1 w-full rounded-xl border border-[#dfe5db] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-accent)]" placeholder="••••••••" />
              </label>
              <label className="text-sm font-medium">
                Tipo
                <select value={form.role} onChange={(e) => setForm((current) => ({ ...current, role: e.target.value as "admin" | "client" }))} className="mt-1 w-full rounded-xl border border-[#dfe5db] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-accent)]">
                 <option value="client">Cliente</option>
                 <option value="admin">Administrador</option>
                </select>
              </label>
            </div>
            <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white"><Plus size={16} />Criar login</button>
          </form>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-6 rounded-2xl border border-[#e4e8df] bg-white p-5 shadow-soft sm:p-6">
          <div className="rounded-2xl border border-[#edf0e9] bg-[#fafcf8] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--brand-accent)]">
              <Pencil size={17} /> Editar estabelecimento
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#3b4642]">
                Usuário
                <input
                 value={editForm.username}
                 onChange={(e) => setEditForm((current) => ({ ...current, username: e.target.value }))}
                 className="mt-2 w-full rounded-xl border border-[#e4e8df] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--brand-accent)]"
                />
              </label>
              <label className="text-sm font-medium text-[#3b4642]">
                Nome exibido
                <input
                 value={editForm.displayName}
                 onChange={(e) => setEditForm((current) => ({ ...current, displayName: e.target.value }))}
                 className="mt-2 w-full rounded-xl border border-[#e4e8df] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--brand-accent)]"
                />
              </label>
              <label className="text-sm font-medium text-[#3b4642]">
                Tipo
                <select
                 value={editForm.role}
                 onChange={(e) => setEditForm((current) => ({ ...current, role: e.target.value as "admin" | "client" }))}
                 className="mt-2 w-full rounded-xl border border-[#e4e8df] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--brand-accent)]"
                >
                 <option value="client">Cliente</option>
                 <option value="admin">Administrador</option>
                </select>
              </label>
              <label className="text-sm font-medium text-[#3b4642]">
                Nova senha (opcional)
                <input
                 type="password"
                 value={editForm.password}
                 onChange={(e) => setEditForm((current) => ({ ...current, password: e.target.value }))}
                 className="mt-2 w-full rounded-xl border border-[#e4e8df] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--brand-accent)]"
                 placeholder="Digite para alterar"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={handleUpdateSelectedUser} className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white">
                <Check size={16} />Salvar alterações
              </button>
              {selectedUser?.id && selectedUser.id !== user?.id && (
                <button type="button" onClick={() => handleDeleteUser(selectedUser.id!)} className="inline-flex items-center gap-2 rounded-xl border border-[#ffd7d7] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#b63b3b]">
                 <Trash2 size={16} />Excluir estabelecimento
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#edf0e9] bg-[#fafcf8] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--brand-accent)]">
              <Sparkles size={17} /> Personalização do cliente
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#3b4642]">
                Nome do estabelecimento
                <input value={theme.businessName} onChange={(e) => handleChangeTheme("businessName", e.target.value)} className="mt-2 w-full rounded-xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3 text-sm outline-none focus:border-[var(--brand-accent)]" />
              </label>

              <label className="text-sm font-medium text-[#3b4642]">
                Cor primária
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3">
                 <input type="color" value={theme.primary} onChange={(e) => handleChangeTheme("primary", e.target.value)} className="h-10 w-12 rounded-lg border-0 bg-transparent p-0" />
                 <input value={theme.primary} onChange={(e) => handleChangeTheme("primary", e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </label>

              <label className="text-sm font-medium text-[#3b4642]">
                Cor de destaque
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3">
                 <input type="color" value={theme.accent} onChange={(e) => handleChangeTheme("accent", e.target.value)} className="h-10 w-12 rounded-lg border-0 bg-transparent p-0" />
                 <input value={theme.accent} onChange={(e) => handleChangeTheme("accent", e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </label>

              <label className="text-sm font-medium text-[#3b4642]">
                Cor secundária
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3">
                 <input type="color" value={theme.secondary} onChange={(e) => handleChangeTheme("secondary", e.target.value)} className="h-10 w-12 rounded-lg border-0 bg-transparent p-0" />
                 <input value={theme.secondary} onChange={(e) => handleChangeTheme("secondary", e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </label>

              <label className="text-sm font-medium text-[#3b4642]">
                Fundo geral
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3">
                 <input type="color" value={theme.background} onChange={(e) => handleChangeTheme("background", e.target.value)} className="h-10 w-12 rounded-lg border-0 bg-transparent p-0" />
                 <input value={theme.background} onChange={(e) => handleChangeTheme("background", e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </label>

              <label className="text-sm font-medium text-[#3b4642]">
                Sidebar
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3">
                 <input type="color" value={theme.sidebar} onChange={(e) => handleChangeTheme("sidebar", e.target.value)} className="h-10 w-12 rounded-lg border-0 bg-transparent p-0" />
                 <input value={theme.sidebar} onChange={(e) => handleChangeTheme("sidebar", e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                 key={preset.label}
                 type="button"
                 onClick={() => setTheme((current) => ({ ...preset.theme, businessName: current.businessName }))}
                 className="rounded-xl border border-[#e4e8df] bg-white px-3 py-2 text-xs font-semibold text-[#4b5652] transition hover:border-[var(--brand-accent)]"
                >
                 {preset.label}
                </button>
              ))}
            </div>

            <button onClick={handleSaveTheme} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white">
              Salvar visual do cliente
            </button>
          </div>
        </section>

        <aside className="rounded-2xl border border-[#e4e8df] bg-white p-5 shadow-soft sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-accent)]">Preview</p>
          <div className="mt-4 rounded-2xl p-4" style={{ background: theme.background, border: `1px solid ${theme.secondary}` }}>
            <div className="rounded-2xl p-3" style={{ background: theme.sidebar, color: "#fff" }}>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black">{theme.businessName}</span>
                <span className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: theme.accent, color: theme.sidebar }}>Ativo</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-xl p-3" style={{ background: "white", border: `1px solid ${theme.secondary}` }}>
                <p className="text-xs opacity-60">Vendas hoje</p>
                <p className="mt-2 text-2xl font-black" style={{ color: theme.primary }}>R$ 2.486</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 rounded-xl px-3 py-3 text-sm font-bold text-white" style={{ background: theme.primary }}>Salvar</button>
                <button className="flex-1 rounded-xl px-3 py-3 text-sm font-bold" style={{ background: theme.secondary, color: theme.text }}>Detalhes</button>
              </div>
            </div>
          </div>

          {saved && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#d7f7df] bg-[#eefaf0] px-3 py-2 text-sm font-medium text-[#1a7d3a]">
              <Check size={16} /> Visual salvo para {selectedUser?.displayName}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
