"use client";

import { useState } from "react";
import { Check, Palette, Save, SlidersHorizontal } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { defaultThemes } from "@/lib/theme";

export default function SettingsPage() {
  const { user, updateTheme } = useAuth();
  const [theme, setTheme] = useState(user?.theme ?? defaultThemes.green);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof typeof theme, value: string) => {
    setTheme((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    updateTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const presets = [
    { label: "Verde padrão", theme: defaultThemes.green },
    { label: "Azul Júlia", theme: defaultThemes.blue },
    { label: "Vermelho Rosa", theme: defaultThemes.red },
  ];

  return (
    <>
      <PageTitle
        eyebrow="Configuração"
        title="Personalização do sistema"
        description="Defina o nome do estabelecimento, as cores da marca e a identidade visual que cada cliente vai enxergar ao entrar no caixa."
        action={<button onClick={handleSave} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white"><Save size={16} />Salvar visual</button>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-[#e4e8df] bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--brand-accent)]">
            <Palette size={18} /> Identidade da marca
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#3b4642]">
              Nome do estabelecimento
              <input
                value={theme.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3 text-sm outline-none focus:border-[var(--brand-accent)]"
              />
            </label>

            <label className="text-sm font-medium text-[#3b4642]">
              Cor primária
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3">
                <input type="color" value={theme.primary} onChange={(e) => handleChange("primary", e.target.value)} className="h-10 w-12 rounded-lg border-0 bg-transparent p-0" />
                <input value={theme.primary} onChange={(e) => handleChange("primary", e.target.value)} className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>

            <label className="text-sm font-medium text-[#3b4642]">
              Cor de destaque
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3">
                <input type="color" value={theme.accent} onChange={(e) => handleChange("accent", e.target.value)} className="h-10 w-12 rounded-lg border-0 bg-transparent p-0" />
                <input value={theme.accent} onChange={(e) => handleChange("accent", e.target.value)} className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>

            <label className="text-sm font-medium text-[#3b4642]">
              Cor secundária
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3">
                <input type="color" value={theme.secondary} onChange={(e) => handleChange("secondary", e.target.value)} className="h-10 w-12 rounded-lg border-0 bg-transparent p-0" />
                <input value={theme.secondary} onChange={(e) => handleChange("secondary", e.target.value)} className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>

            <label className="text-sm font-medium text-[#3b4642]">
              Fundo geral
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3">
                <input type="color" value={theme.background} onChange={(e) => handleChange("background", e.target.value)} className="h-10 w-12 rounded-lg border-0 bg-transparent p-0" />
                <input value={theme.background} onChange={(e) => handleChange("background", e.target.value)} className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>

            <label className="text-sm font-medium text-[#3b4642]">
              Sidebar
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4e8df] bg-[#f8faf7] px-3 py-3">
                <input type="color" value={theme.sidebar} onChange={(e) => handleChange("sidebar", e.target.value)} className="h-10 w-12 rounded-lg border-0 bg-transparent p-0" />
                <input value={theme.sidebar} onChange={(e) => handleChange("sidebar", e.target.value)} className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-[#edf0e9] bg-[#fafcf8] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--brand-text)]">
              <SlidersHorizontal size={16} /> Modelos prontos
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setTheme(preset.theme)}
                  className="rounded-xl border border-[#e4e8df] bg-white px-3 py-2 text-xs font-semibold text-[#4b5652] transition hover:border-[var(--brand-accent)]"
                >
                  {preset.label}
                </button>
              ))}
            </div>
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
              <div className="rounded-xl p-3" style={{ background: theme.card, border: `1px solid ${theme.secondary}` }}>
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
              <Check size={16} /> Visual salva para {user?.displayName}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
