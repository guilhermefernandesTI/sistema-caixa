"use client";

import { useMemo, useState } from "react";
import { Archive, ChevronDown, Edit3, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { formatCurrency, products as initialProducts, type Product } from "@/lib/data";

const allCategories = ["Todas", "Bebidas", "Lanches", "Doces"];

export default function ProductsPage() {
  const [inventory, setInventory] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    category: "Bebidas",
    price: "",
    stock: "",
  });

  const filtered = useMemo(
    () =>
      inventory.filter(
        (product) =>
          (category === "Todas" || product.category === category) &&
          `${product.name} ${product.sku}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [inventory, query, category],
  );

  const openCreateForm = () => {
    setEditingId(null);
    setDraft({ name: "", category: "Bebidas", price: "", stock: "" });
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setDraft({ name: "", category: "Bebidas", price: "", stock: "" });
  };

  const handleSaveProduct = () => {
    const name = draft.name.trim();
    const price = Number(draft.price);
    const stock = Number(draft.stock);

    if (!name || Number.isNaN(price) || Number.isNaN(stock) || price <= 0 || stock < 0) {
      alert("Preencha nome, preço e estoque válidos.");
      return;
    }

    if (editingId) {
      setInventory((current) =>
        current.map((product) =>
          product.id === editingId
            ? {
                ...product,
                name,
                category: draft.category,
                price,
                stock,
              }
            : product,
        ),
      );
    } else {
      const nextProduct: Product = {
        id: `p${Date.now()}`,
        sku: `NOV-${String(Date.now()).slice(-5)}`,
        name,
        category: draft.category,
        price,
        stock,
        accent: ["#f8d7a8", "#f4b183", "#ffd166", "#a8dadc", "#c99a73", "#f7c873"][Math.floor(Math.random() * 6)],
      };

      setInventory((current) => [nextProduct, ...current]);
    }

    closeForm();
  };

  const handleDeleteProduct = (productId: string) => {
    const target = inventory.find((product) => product.id === productId);
    if (!target) return;

    const confirmed = window.confirm(`Deseja excluir o produto "${target.name}"?`);
    if (!confirmed) return;

    setInventory((current) => current.filter((product) => product.id !== productId));
  };

  return (
    <>
      <PageTitle
        eyebrow="Catálogo"
        title="Produtos"
        description="Gerencie seus produtos, preços e níveis de estoque."
        action={
          <button
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white hover:brightness-110"
          >
            <Plus size={17} />
            Novo produto
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#e4e8df] bg-white p-3 shadow-soft sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-full rounded-xl bg-[#f7f8f3] py-3 pl-10 pr-3 text-sm outline-none ring-[var(--brand-accent)]/20 transition focus:ring-2"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-full appearance-none rounded-xl border border-[#e4e8df] bg-white py-3 pl-3 pr-9 text-xs font-semibold outline-none"
            >
              {allCategories.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/45" />
          </div>

          <button className="grid w-12 place-items-center rounded-xl border border-[#e4e8df] text-ink/55 hover:bg-[#f7f8f3]" aria-label="Filtros">
            <SlidersHorizontal size={17} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e4e8df] bg-white p-4">
          <p className="text-xs text-ink/50">Total de produtos</p>
          <p className="mt-1 text-2xl font-bold">{inventory.length}</p>
        </div>
        <div className="rounded-2xl border border-[#e4e8df] bg-white p-4">
          <p className="text-xs text-ink/50">Valor em estoque</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(inventory.reduce((sum, product) => sum + product.price * product.stock, 0))}</p>
        </div>
        <div className="rounded-2xl border border-[#f5d7c9] bg-[#fff8f4] p-4">
          <p className="text-xs text-[#a95c3f]">Estoque baixo</p>
          <p className="mt-1 text-2xl font-bold text-[#a95c3f]">
            {inventory.filter((product) => product.stock < 10).length} <span className="text-sm font-medium">produtos</span>
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#e4e8df] bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-[#fafbf8]">
              <tr className="border-b border-[#eef0eb] text-[10px] uppercase tracking-wider text-ink/40">
                <th className="px-5 py-4 font-bold">Produto</th>
                <th className="py-4 font-bold">Categoria</th>
                <th className="py-4 font-bold">Preço</th>
                <th className="py-4 font-bold">Estoque</th>
                <th className="py-4 font-bold">Status</th>
                <th className="py-4 pr-5 text-right font-bold">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-[#f1f2ef] last:border-0 hover:bg-[#fbfcfa]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-ink" style={{ background: product.accent }}>
                        {product.name.slice(0, 1)}
                      </div>
                      <div>
                        <p className="font-bold">{product.name}</p>
                        <p className="mt-0.5 text-xs text-ink/40">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-ink/55">{product.category}</td>
                  <td className="py-4 font-semibold">{formatCurrency(product.price)}</td>
                  <td className="py-4">
                    <span className={product.stock < 10 ? "font-bold text-[#c76542]" : "font-medium"}>{product.stock} un.</span>
                    {product.stock < 10 && <span className="ml-2 rounded-full bg-[#fff0e9] px-2 py-1 text-[10px] font-bold text-[#c76542]">Repor</span>}
                  </td>
                  <td className="py-4">
                    <span className="rounded-full bg-[#eaf8ee] px-2.5 py-1 text-[10px] font-bold text-[#23804d]">Ativo</span>
                  </td>
                  <td className="py-4 pr-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-ink/40 hover:bg-[#f1f4ed] hover:text-ink"
                        aria-label={`Editar ${product.name}`}
                        onClick={() => openEditForm(product)}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-ink/40 hover:bg-[#f1f4ed] hover:text-ink"
                        aria-label={`Excluir ${product.name}`}
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && <div className="p-10 text-center text-sm text-ink/50">Nenhum produto encontrado.</div>}

        <div className="flex items-center justify-between border-t border-[#eef0eb] px-5 py-4 text-xs text-ink/45">
          <span>Mostrando {filtered.length} de {inventory.length} produtos</span>
          <span className="flex items-center gap-1"><Archive size={14} /> Catálogo local</span>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-5 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.25)]">
            <div className="bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-sidebar)] to-[var(--brand-accent)] px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">Catálogo</p>
                  <h2 className="mt-2 text-2xl font-black">{editingId ? "Editar produto" : "Novo produto"}</h2>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/12 text-white transition hover:bg-white/20"
                  aria-label="Fechar formulário"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600">
                {editingId ? "Atualize o produto e o estoque do item selecionado." : "Adicione um item ao catálogo para começar a vender."}
              </p>

              <div className="mt-5 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Nome do produto
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((current) => ({ ...current, name: e.target.value }))}
                    placeholder="Ex: Café especial"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--brand-accent)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-accent)]/10"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Categoria
                  <select
                    value={draft.category}
                    onChange={(e) => setDraft((current) => ({ ...current, category: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--brand-accent)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-accent)]/10"
                  >
                    {allCategories.filter((categoryOption) => categoryOption !== "Todas").map((categoryOption) => (
                      <option key={categoryOption} value={categoryOption}>{categoryOption}</option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Preço
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={draft.price}
                      onChange={(e) => setDraft((current) => ({ ...current, price: e.target.value }))}
                      placeholder="R$ 0,00"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--brand-accent)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-accent)]/10"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Estoque
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={draft.stock}
                      onChange={(e) => setDraft((current) => ({ ...current, stock: e.target.value }))}
                      placeholder="0"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--brand-accent)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-accent)]/10"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  className="flex-1 rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--brand-primary)]/20 transition hover:brightness-110"
                >
                  {editingId ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
