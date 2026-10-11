"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import ImageUpload, { MultiImageUpload } from "./ImageUpload";
import { slugify } from "@/lib/utils";
import type { CategoryDTO, ProjectDTO, ProcessStep } from "@/lib/types";

export type ProjectFormValues = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  duration: string;
  software: string;
  videoUrl: string;
  thumbnailUrl: string;
  gallery: string[];
  beforeAfter: { before: string; after: string };
  process: ProcessStep[];
  clientQuote: string;
  results: { label: string; value: string }[];
  tags: string;
  client: string;
  year: string;
  featured: boolean;
  published: boolean;
  order: number;
};

export function emptyProject(): ProjectFormValues {
  return {
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    categoryId: "",
    duration: "",
    software: "",
    videoUrl: "",
    thumbnailUrl: "",
    gallery: [],
    beforeAfter: { before: "", after: "" },
    process: [{ title: "", description: "" }],
    clientQuote: "",
    results: [],
    tags: "",
    client: "",
    year: String(new Date().getFullYear()),
    featured: false,
    published: true,
    order: 0,
  };
}

export function projectToForm(p: ProjectDTO): ProjectFormValues {
  return {
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    categoryId: p.category?.id ?? "",
    duration: p.duration,
    software: p.software.join(", "),
    videoUrl: p.videoUrl,
    thumbnailUrl: p.thumbnailUrl,
    gallery: p.gallery,
    beforeAfter: { before: p.beforeAfter?.before ?? "", after: p.beforeAfter?.after ?? "" },
    process: p.process.length ? p.process : [{ title: "", description: "" }],
    clientQuote: p.clientQuote,
    results: p.results,
    tags: p.tags.join(", "),
    client: p.client,
    year: p.year,
    featured: p.featured,
    published: p.published,
    order: p.order,
  };
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500";

type Props = {
  categories: CategoryDTO[];
  initial: ProjectFormValues;
  saving: boolean;
  error: string;
  onSave: (values: ProjectFormValues) => void;
  onCancel: () => void;
};

export default function ProjectForm({ categories, initial, saving, error, onSave, onCancel }: Props) {
  const [v, setV] = useState<ProjectFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));

  // Auto-slug from the title until the admin edits the slug manually.
  useEffect(() => {
    if (!slugTouched) setV((prev) => ({ ...prev, slug: slugify(prev.title) }));
  }, [v.title, slugTouched]);

  const set = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(v);
      }}
      className="space-y-8"
    >
      {/* Basics */}
      <section className="glass rounded-2xl p-6">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">Basics</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="p-title">Title *</label>
            <input id="p-title" className={inputCls} required value={v.title} onChange={(e) => set("title", e.target.value)} placeholder="Project title" />
          </div>
          <div>
            <label className={labelCls} htmlFor="p-slug">Slug (URL)</label>
            <input id="p-slug" className={inputCls} value={v.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} placeholder="auto-from-title" />
          </div>
          <div>
            <label className={labelCls} htmlFor="p-cat">Category</label>
            <select id="p-cat" className={inputCls} value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="" className="bg-ink-800">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-ink-800">{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="p-client">Client</label>
            <input id="p-client" className={inputCls} value={v.client} onChange={(e) => set("client", e.target.value)} placeholder="Client or brand" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls} htmlFor="p-year">Year</label>
              <input id="p-year" className={inputCls} value={v.year} onChange={(e) => set("year", e.target.value)} />
            </div>
            <div>
              <label className={labelCls} htmlFor="p-dur">Duration</label>
              <input id="p-dur" className={inputCls} value={v.duration} onChange={(e) => set("duration", e.target.value)} placeholder="1:30" />
            </div>
            <div>
              <label className={labelCls} htmlFor="p-order">Order</label>
              <input id="p-order" type="number" className={inputCls} value={v.order} onChange={(e) => set("order", Number(e.target.value))} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="p-short">Short description (card preview)</label>
            <input id="p-short" className={inputCls} value={v.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="One sentence shown on project cards" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="p-desc">Full description</label>
            <textarea id="p-desc" rows={5} className={`${inputCls} resize-none`} value={v.description} onChange={(e) => set("description", e.target.value)} placeholder="The story of the edit — footage, approach, results…" />
          </div>
        </div>
      </section>

      {/* Media */}
      <section className="glass rounded-2xl p-6">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">Media</h3>
        <div className="space-y-6">
          <ImageUpload label="Thumbnail *" value={v.thumbnailUrl} onChange={(url) => set("thumbnailUrl", url)} hint="Recommended 16:9 — shown on cards and as the video poster." />
          <ImageUpload label="Video" accept="video/*,image/*" value={v.videoUrl} onChange={(url) => set("videoUrl", url)} hint="MP4/WebM upload or a YouTube link. Leave empty to show a private-link card." />
          <MultiImageUpload label="Gallery" values={v.gallery} onChange={(urls) => set("gallery", urls)} />
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageUpload label="Before (raw frame)" value={v.beforeAfter.before} onChange={(url) => set("beforeAfter", { ...v.beforeAfter, before: url })} />
            <ImageUpload label="After (graded frame)" value={v.beforeAfter.after} onChange={(url) => set("beforeAfter", { ...v.beforeAfter, after: url })} />
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="glass rounded-2xl p-6">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">Details</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="p-sw">Software used (comma-separated)</label>
            <input id="p-sw" className={inputCls} value={v.software} onChange={(e) => set("software", e.target.value)} placeholder="Premiere Pro, After Effects" />
          </div>
          <div>
            <label className={labelCls} htmlFor="p-tags">Tags (comma-separated)</label>
            <input id="p-tags" className={inputCls} value={v.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Reels, Fashion, Transitions" />
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className={labelCls}>Editing process steps</span>
            <button
              type="button"
              onClick={() => set("process", [...v.process, { title: "", description: "" }])}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-brand-500/50 hover:text-brand-400"
            >
              <Plus size={13} /> Add step
            </button>
          </div>
          <div className="space-y-3">
            {v.process.map((step, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                <span className="mt-2.5 font-display text-xl text-brand-500/70">0{i + 1}</span>
                <div className="grid flex-1 gap-2">
                  <input
                    className={inputCls}
                    value={step.title}
                    placeholder="Step title"
                    onChange={(e) => {
                      const next = [...v.process];
                      next[i] = { ...next[i], title: e.target.value };
                      set("process", next);
                    }}
                  />
                  <input
                    className={inputCls}
                    value={step.description}
                    placeholder="Step description"
                    onChange={(e) => {
                      const next = [...v.process];
                      next[i] = { ...next[i], description: e.target.value };
                      set("process", next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  aria-label={`Remove step ${i + 1}`}
                  onClick={() => set("process", v.process.filter((_, j) => j !== i))}
                  className="mt-1.5 rounded-lg p-2 text-zinc-600 transition hover:text-brand-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300">
            <input type="checkbox" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-[#3B82F6]" />
            Featured on homepage
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300">
            <input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-[#3B82F6]" />
            Published
          </label>
        </div>
      </section>

      {/* Case study */}
      <section className="glass rounded-2xl p-6">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">Case Study</h3>
        <div className="space-y-5">
          <div>
            <label className={labelCls} htmlFor="p-quote">Client quote</label>
            <textarea
              id="p-quote"
              rows={3}
              className={`${inputCls} resize-none`}
              value={v.clientQuote}
              onChange={(e) => set("clientQuote", e.target.value)}
              placeholder={'e.g. "The edit tripled our watch time" — Founder, Company'}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className={labelCls}>Results &amp; metrics</span>
              <button
                type="button"
                onClick={() => set("results", [...v.results, { label: "", value: "" }])}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-brand-500/50 hover:text-brand-400"
              >
                <Plus size={13} /> Add metric
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {v.results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-3">
                  <input
                    className={inputCls}
                    value={r.label}
                    placeholder="e.g. Watch time"
                    aria-label={`Metric ${i + 1} label`}
                    onChange={(e) => {
                      const next = [...v.results];
                      next[i] = { ...next[i], label: e.target.value };
                      set("results", next);
                    }}
                  />
                  <input
                    className={`${inputCls} max-w-[110px] text-center font-display`}
                    value={r.value}
                    placeholder="+42%"
                    aria-label={`Metric ${i + 1} value`}
                    onChange={(e) => {
                      const next = [...v.results];
                      next[i] = { ...next[i], value: e.target.value };
                      set("results", next);
                    }}
                  />
                  <button
                    type="button"
                    aria-label={`Remove metric ${i + 1}`}
                    onClick={() => set("results", v.results.filter((_, j) => j !== i))}
                    className="rounded-lg p-2 text-zinc-600 transition hover:text-brand-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {v.results.length === 0 && (
                <p className="text-xs text-zinc-600 sm:col-span-2">Optional — add numbers that show the impact of this edit.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-brand-500/40 bg-brand-950/40 px-4 py-3 text-sm text-brand-300">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-300 transition hover:border-white/40"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-2.5 text-sm font-semibold uppercase tracking-widest text-onbrand shadow-glow transition hover:shadow-glow-lg disabled:opacity-60"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Save Project
        </button>
      </div>
    </form>
  );
}
