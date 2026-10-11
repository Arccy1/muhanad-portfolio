"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { PostDTO } from "@/lib/types";
import { cn, formatDate, slugify } from "@/lib/utils";

type Draft = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  readMinutes: number;
  published: boolean;
} | null;

const blank = (): Draft => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  readMinutes: 4,
  published: true,
});

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [draft, setDraft] = useState<Draft>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!draft) return;
    if (!draft.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = draft.id
        ? await fetch(`/api/posts/${draft.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft),
          })
        : await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft),
          });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed.");
        return;
      }
      setDraft(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(post: PostDTO) {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 font-display text-3xl tracking-wide text-white">
            <FileText size={24} className="text-brand-500" /> BLOG
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Editing breakdowns and behind-the-scenes posts — great for SEO.
          </p>
        </div>
        {!draft && (
          <button
            type="button"
            onClick={() => setDraft(blank())}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-onbrand shadow-glow transition hover:shadow-glow-lg"
          >
            <Plus size={16} /> New post
          </button>
        )}
      </div>

      {draft && (
        <div className="glass mb-8 rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
              {draft.id ? "Edit post" : "New post"}
            </h2>
            <button type="button" onClick={() => setDraft(null)} aria-label="Close editor" className="rounded-lg p-1.5 text-zinc-500 hover:text-white">
              <X size={17} />
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="b-title">Title *</label>
              <input id="b-title" className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. How I edited a 3-second hook that hit 2M views" />
            </div>
            <div>
              <label className={labelCls} htmlFor="b-slug">Slug (URL)</label>
              <input id="b-slug" className={inputCls} value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} placeholder="auto-from-title" />
            </div>
            <div>
              <label className={labelCls} htmlFor="b-read">Read minutes</label>
              <input id="b-read" type="number" min={1} className={inputCls} value={draft.readMinutes} onChange={(e) => setDraft({ ...draft, readMinutes: Number(e.target.value) || 1 })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="b-cover">Cover image URL (optional)</label>
              <input id="b-cover" className={inputCls} value={draft.coverImage} onChange={(e) => setDraft({ ...draft, coverImage: e.target.value })} placeholder="/images/showreel-poster.svg or an /uploads/... file" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="b-excerpt">Excerpt (shown on the blog list)</label>
              <textarea id="b-excerpt" rows={2} className={`${inputCls} resize-none`} value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="b-content">
                Content — blank line = new paragraph, lines starting with ## are headings
              </label>
              <textarea id="b-content" rows={12} className={`${inputCls} resize-none font-mono text-xs leading-relaxed`} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} placeholder={"Intro paragraph…\n\n## A section heading\n\nMore text…"} />
            </div>
          </div>
          <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300">
            <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} className="h-4 w-4 accent-[#3B82F6]" />
            Published (visible on /blog)
          </label>
          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-brand-500/40 bg-brand-950/40 px-4 py-3 text-sm text-brand-300">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setDraft(null)} className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-300 transition hover:border-white/40">
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-2.5 text-sm font-semibold uppercase tracking-widest text-onbrand shadow-glow disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />} Save post
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-20 text-center text-sm text-zinc-500">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-16 text-center text-sm text-zinc-500">
          No posts yet — write your first editing breakdown.
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2.5 font-medium text-white">
                  {p.title}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      p.published ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-500"
                    )}
                  >
                    {p.published ? "Published" : "Draft"}
                  </span>
                </p>
                <p className="truncate text-xs text-zinc-600">/blog/{p.slug} · {p.readMinutes} min read</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      id: p.id,
                      title: p.title,
                      slug: p.slug,
                      excerpt: p.excerpt,
                      content: p.content,
                      coverImage: p.coverImage,
                      readMinutes: p.readMinutes,
                      published: p.published,
                    })
                  }
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-brand-500/50 hover:text-brand-400"
                  aria-label={`Edit ${p.title}`}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(p)}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-brand-500/60 hover:bg-brand-600/10 hover:text-brand-400"
                  aria-label={`Delete ${p.title}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
