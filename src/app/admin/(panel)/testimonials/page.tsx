"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import type { TestimonialDTO } from "@/lib/types";

type FormState = {
  id?: string;
  name: string;
  role: string;
  avatarUrl: string;
  rating: number;
  content: string;
  order: number;
  published: boolean;
} | null;

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<TestimonialDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/testimonials");
    const data = await res.json();
    setItems(data.testimonials ?? []);
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
        ? await fetch(`/api/testimonials/${form.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/testimonials", {
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

  async function remove(t: TestimonialDTO) {
    if (!window.confirm(`Delete testimonial from "${t.name}"?`)) return;
    await fetch(`/api/testimonials/${t.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-white">TESTIMONIALS</h1>
          <p className="mt-1 text-sm text-zinc-500">What clients say — shown in the homepage carousel.</p>
        </div>
        {!form && (
          <button
            type="button"
            onClick={() =>
              setForm({ name: "", role: "", avatarUrl: "", rating: 5, content: "", order: items.length + 1, published: true })
            }
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:shadow-glow-lg"
          >
            <Plus size={16} /> Add Testimonial
          </button>
        )}
      </div>

      {form && (
        <div className="glass mb-8 rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
              {form.id ? "Edit testimonial" : "New testimonial"}
            </h2>
            <button type="button" onClick={() => setForm(null)} aria-label="Close form" className="rounded-lg p-1.5 text-zinc-500 hover:text-white">
              <X size={17} />
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="t-name">Client name *</label>
              <input id="t-name" className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className={labelCls} htmlFor="t-role">Role / company</label>
              <input id="t-role" className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div>
              <label className={labelCls} htmlFor="t-rating">Rating</label>
              <select id="t-rating" className={inputCls} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r} className="bg-ink-800">{r} star{r > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="t-order">Order</label>
              <input id="t-order" type="number" className={inputCls} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="t-content">Testimonial *</label>
              <textarea id="t-content" rows={4} className={`${inputCls} resize-none`} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload label="Profile image" value={form.avatarUrl} onChange={(url) => setForm({ ...form, avatarUrl: url })} hint="Square image works best." />
            </div>
          </div>
          <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4 accent-[#E50914]" />
            Published (visible on the website)
          </label>
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
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-2.5 text-sm font-semibold uppercase tracking-widest text-white shadow-glow disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />} Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-20 text-center text-sm text-zinc-500">Loading testimonials…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((t) => (
            <div key={t.id} className="group rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition hover:border-brand-500/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  {t.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatarUrl} alt="" className="h-12 w-12 rounded-full border border-white/10 object-cover" />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600/20 font-display text-lg text-brand-400">
                      {t.name.charAt(0)}
                    </span>
                  )}
                  <div>
                    <p className="font-medium text-white">{t.name}</p>
                    <p className="text-xs text-zinc-600">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        id: t.id,
                        name: t.name,
                        role: t.role,
                        avatarUrl: t.avatarUrl,
                        rating: t.rating,
                        content: t.content,
                        order: t.order,
                        published: true,
                      })
                    }
                    className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-brand-500/50 hover:text-brand-400"
                    aria-label={`Edit ${t.name}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(t)}
                    className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-brand-500/60 hover:text-brand-400"
                    aria-label={`Delete ${t.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={13} className={i < t.rating ? "fill-brand-500 text-brand-500" : "text-zinc-700"} />
                ))}
              </div>
              <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-zinc-500">&ldquo;{t.content}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
