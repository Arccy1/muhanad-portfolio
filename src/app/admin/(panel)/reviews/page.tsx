"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  CheckCheck,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import type { RatingDTO } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type ProjectOption = { id: string; title: string };

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={14} className={i < value ? "fill-brand-500 text-brand-500" : "text-zinc-700"} />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [ratings, setRatings] = useState<RatingDTO[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [rRes, pRes] = await Promise.all([fetch("/api/ratings"), fetch("/api/projects")]);
    const rData = await rRes.json();
    const pData = await pRes.json();
    setRatings(rData.ratings ?? []);
    setProjects(
      (pData.projects ?? []).map((p: { id: string; title: string }) => ({ id: p.id, title: p.title }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createInvite() {
    setBusy("create");
    setError("");
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: projectId || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create the link.");
        return;
      }
      await load();
      // copy the fresh link right away
      const link = `${window.location.origin}/rate/${data.rating.token}`;
      try {
        await navigator.clipboard.writeText(link);
        setCopied(data.rating.token);
        setTimeout(() => setCopied(null), 3000);
      } catch {
        /* clipboard unavailable — the row still shows a copy button */
      }
    } finally {
      setBusy(null);
    }
  }

  async function copyLink(token: string) {
    const link = `${window.location.origin}/rate/${token}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.open(link, "_blank");
      return;
    }
    setCopied(token);
    setTimeout(() => setCopied(null), 3000);
  }

  async function toggleApproved(r: RatingDTO) {
    setBusy(r.id);
    await fetch(`/api/ratings/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !r.approved }),
    });
    await load();
    setBusy(null);
  }

  async function remove(r: RatingDTO) {
    if (!window.confirm("Delete this review link / review permanently?")) return;
    setBusy(r.id);
    await fetch(`/api/ratings/${r.id}`, { method: "DELETE" });
    await load();
    setBusy(null);
  }

  const invites = ratings.filter((r) => r.rating === 0);
  const pending = ratings.filter((r) => r.rating > 0 && !r.approved);
  const published = ratings.filter((r) => r.rating > 0 && r.approved);

  function LinkRow({ r }: { r: RatingDTO }) {
    const link = `${window.location.origin}/rate/${r.token}`;
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-3.5">
        <Link2 size={16} className="shrink-0 text-brand-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">
            {r.projectName || "General review link"}
          </p>
          <p className="truncate text-xs text-zinc-600">/rate/{r.token}</p>
        </div>
        <span className="rounded-full bg-zinc-500/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-400">
          Awaiting response
        </span>
        <button
          type="button"
          onClick={() => copyLink(r.token)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-brand-500/60 hover:text-brand-400"
        >
          {copied === r.token ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied === r.token ? "Copied!" : "Copy link"}
        </button>
        <a
          href={`/rate/${r.token}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white/10 p-2 text-zinc-500 transition hover:text-brand-400"
          aria-label="Open review page"
          title="Open review page"
        >
          <ExternalLink size={14} />
        </a>
        <button
          type="button"
          onClick={() => remove(r)}
          className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-brand-500/60 hover:bg-brand-600/10 hover:text-brand-400"
          aria-label="Delete review link"
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 font-display text-3xl tracking-wide text-white">
            <Star size={24} className="text-brand-500" /> CLIENT REVIEWS
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Generate a private link after finishing a project — the client rates it and, after
            your approval, the review joins the homepage carousel.
          </p>
        </div>
      </div>

      {/* Create invite */}
      <div className="glass mb-8 rounded-2xl p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="rv-project" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
              Project (optional)
            </label>
            <select
              id="rv-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-brand-500/60"
            >
              <option value="" className="bg-ink-800">General — no specific project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-ink-800">{p.title}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={createInvite}
            disabled={busy === "create"}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-onbrand shadow-glow transition hover:shadow-glow-lg disabled:opacity-60"
          >
            {busy === "create" ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Create review link
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-brand-500/40 bg-brand-950/40 px-4 py-3 text-sm text-brand-300">
            {error}
          </p>
        )}
      </div>

      {loading ? (
        <p className="py-20 text-center text-sm text-zinc-500">Loading reviews…</p>
      ) : (
        <div className="space-y-10">
          {/* Pending approval */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
              Pending approval
              {pending.length > 0 && (
                <span className="rounded-full bg-brand-600/20 px-2 py-0.5 text-[10px] text-brand-300">
                  {pending.length}
                </span>
              )}
            </h2>
            {pending.length === 0 ? (
              <p className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-8 text-center text-sm text-zinc-600">
                Nothing waiting — new client reviews will appear here for your approval.
              </p>
            ) : (
              <div className="space-y-4">
                {pending.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-brand-500/30 bg-brand-950/20 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{r.name}</p>
                        <p className="text-xs text-zinc-600">
                          {r.projectName || "General"} · {formatDate(r.createdAt)}
                          {r.email ? ` · ${r.email}` : ""}
                        </p>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    {r.content && (
                      <p className="mt-3 text-sm leading-relaxed text-zinc-300">&ldquo;{r.content}&rdquo;</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleApproved(r)}
                        disabled={busy === r.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-onbrand shadow-glow disabled:opacity-60"
                      >
                        {busy === r.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        Approve &amp; publish
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r)}
                        disabled={busy === r.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2 text-xs text-zinc-400 transition hover:border-brand-500/60 hover:text-brand-400"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Published */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
              <CheckCheck size={16} /> Published on the website
              {published.length > 0 && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                  {published.length}
                </span>
              )}
            </h2>
            {published.length === 0 ? (
              <p className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-8 text-center text-sm text-zinc-600">
                Approved reviews will show here and in the homepage carousel.
              </p>
            ) : (
              <div className="space-y-4">
                {published.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{r.name}</p>
                        <p className="text-xs text-zinc-600">
                          {r.projectName || "General"} · {formatDate(r.createdAt)}
                        </p>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    {r.content && (
                      <p className="mt-3 text-sm leading-relaxed text-zinc-400">&ldquo;{r.content}&rdquo;</p>
                    )}
                    <div className="mt-4 flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleApproved(r)}
                        disabled={busy === r.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2 text-xs text-zinc-400 transition hover:border-brand-500/60 hover:text-brand-400"
                      >
                        Unpublish
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r)}
                        disabled={busy === r.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2 text-xs text-zinc-400 transition hover:border-brand-500/60 hover:bg-brand-600/10 hover:text-brand-400"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Awaiting response */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
              <Link2 size={16} /> Review links sent
              {invites.length > 0 && (
                <span className="rounded-full bg-zinc-500/10 px-2 py-0.5 text-[10px] text-zinc-400">
                  {invites.length}
                </span>
              )}
            </h2>
            {invites.length === 0 ? (
              <p className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-8 text-center text-sm text-zinc-600">
                No open links — create one above when a project is done.
              </p>
            ) : (
              <div className="space-y-3">
                {invites.map((r) => (
                  <LinkRow key={r.id} r={r} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
