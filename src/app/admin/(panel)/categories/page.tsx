"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { CategoryDTO } from "@/lib/types";

type FormState = { id?: string; name: string; description: string; subcategories: string; order: number } | null;

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!form) return;
    setSaving(true);
    setError("");
    try {
      const res = form.id
        ? await fetch(`/api/categories/${form.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed.");
        return;
      }
      setForm(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(cat: CategoryDTO) {
    if (!window.confirm(`Delete category "${cat.name}"? Projects keep existing but lose this category.`)) return;
    await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-white">CATEGORIES</h1>
          <p className="mt-1 text-sm text-zinc-500">The filters visitors use to browse your portfolio.</p>
        </div>
        {!form && (
          <button
            type="button"
            onClick={() => setForm({ name: "", description: "", subcategories: "", order: categories.length + 1 })}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-onbrand shadow-glow transition hover:shadow-glow-lg"
          >
            <Plus size={16} /> Add Category
          </button>
        )}
      </div>

      {form && (
        <div className="glass mb-8 rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
              {form.id ? "Edit category" : "New category"}
            </h2>
            <button type="button" onClick={() => setForm(null)} aria-label="Close form" className="rounded-lg p-1.5 text-zinc-500 hover:text-white">
              <X size={17} />
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="c-name">Name *</label>
              <input id="c-name" className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Short Form" />
            </div>
            <div>
              <label className={labelCls} htmlFor="c-order">Order</label>
              <input id="c-order" type="number" className={inputCls} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="c-desc">Description</label>
              <input id="c-desc" className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="One line shown in admin and meta contexts" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="c-sub">Subcategories (comma-separated)</label>
              <input id="c-sub" className={inputCls} value={form.subcategories} onChange={(e) => setForm({ ...form, subcategories: e.target.value })} placeholder="TikTok, Instagram Reels, YouTube Shorts" />
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-brand-500/40 bg-brand-950/40 px-4 py-3 text-sm text-brand-300">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setForm(null)} className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-300 transition hover:border-white/40">
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-2.5 text-sm font-semibold uppercase tracking-widest text-onbrand shadow-glow disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />} Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-20 text-center text-sm text-zinc-500">Loading categories…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((cat) => (
            <div key={cat.id} className="group rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition hover:border-brand-500/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl tracking-wide text-white">{cat.name}</h3>
                  <p className="mt-0.5 text-xs text-zinc-600">/{cat.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        id: cat.id,
                        name: cat.name,
                        description: cat.description,
                        subcategories: cat.subcategories.join(", "),
                        order: cat.order,
                      })
                    }
                    className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-brand-500/50 hover:text-brand-400"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(cat)}
                    className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-brand-500/60 hover:text-brand-400"
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {cat.description && <p className="mt-2.5 text-sm text-zinc-500">{cat.description}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {cat.subcategories.map((sub) => (
                  <span key={sub} className="rounded-md border border-brand-500/25 bg-brand-600/10 px-2 py-0.5 text-[11px] text-brand-300">
                    {sub}
                  </span>
                ))}
                <span className="ml-auto text-xs text-zinc-600">{cat.projectCount ?? 0} projects</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
