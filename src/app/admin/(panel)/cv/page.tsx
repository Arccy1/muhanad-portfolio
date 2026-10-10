"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  FileText,
  Languages,
  Loader2,
  MonitorPlay,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { CvExperienceDTO } from "@/lib/types";

type Draft = {
  id?: string;
  role: string;
  org: string;
  period: string;
  points: string; // one bullet per line
};

const blank = (): Draft => ({ role: "", org: "", period: "", points: "" });

const toDraft = (e: CvExperienceDTO): Draft => ({
  id: e.id,
  role: e.role,
  org: e.org,
  period: e.period,
  points: e.points.join("\n"),
});

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500";

export default function AdminCvPage() {
  const [entries, setEntries] = useState<CvExperienceDTO[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [languages, setLanguages] = useState("");
  const [tools, setTools] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [eRes, cRes] = await Promise.all([fetch("/api/cv-experience"), fetch("/api/content")]);
    const eData = await eRes.json();
    const cData = await cRes.json();
    const list: CvExperienceDTO[] = eData.entries ?? [];
    setEntries(list);
    setDrafts(list.map(toDraft));
    const content: Record<string, string> = cData.content ?? {};
    setLanguages(content["cv.languages"] ?? "");
    setTools(content["cv.tools"] ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(msg: string) {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(null), 2500);
  }

  function setDraft(id: string | undefined, patch: Partial<Draft>) {
    setDrafts((prev) => prev.map((d, i) => (d.id === id || (!id && i === prev.length - 1 && !prev[i].id) ? { ...d, ...patch } : d)));
  }

  async function saveDraft(draft: Draft) {
    if (!draft.role.trim()) {
      setError("Role is required.");
      return;
    }
    setError("");
    setBusyId(draft.id ?? "new");
    const payload = {
      role: draft.role,
      org: draft.org,
      period: draft.period,
      points: draft.points
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      const res = draft.id
        ? await fetch(`/api/cv-experience/${draft.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/cv-experience", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed.");
        return;
      }
      flash(draft.id ? "Experience entry saved." : "Experience entry added.");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this experience entry?")) return;
    setBusyId(id);
    await fetch(`/api/cv-experience/${id}`, { method: "DELETE" });
    await load();
    setBusyId(null);
  }

  async function move(index: number, dir: -1 | 1) {
    const a = entries[index];
    const b = entries[index + dir];
    if (!a || !b) return;
    await Promise.all([
      fetch(`/api/cv-experience/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...a, order: b.order }),
      }),
      fetch(`/api/cv-experience/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...b, order: a.order }),
      }),
    ]);
    await load();
  }

  async function saveListSetting(key: string, value: string, label: string) {
    setBusyId(key);
    const res = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates: { [key]: value } }),
    });
    setBusyId(null);
    if (res.ok) flash(`${label} saved.`);
    else setError("Save failed.");
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 font-display text-3xl tracking-wide text-white">
            <FileText size={24} className="text-brand-500" /> CV EDITOR
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Everything here updates the /cv page. Save, then redeploy to publish.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDrafts((prev) => [...prev, blank()]);
            setError("");
          }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-onbrand shadow-glow transition hover:shadow-glow-lg"
        >
          <Plus size={16} /> Add Experience
        </button>
      </div>

      {savedFlash && (
        <p className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          {savedFlash}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-brand-500/40 bg-brand-950/40 px-4 py-3 text-sm text-brand-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-20 text-center text-sm text-zinc-500">Loading CV content…</p>
      ) : (
        <>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
            Experience
          </h2>
          <div className="space-y-4">
            {drafts.map((draft, i) => (
              <div key={draft.id ?? `new-${i}`} className="glass rounded-2xl p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-display text-lg tracking-wide text-white">
                    {draft.role || "New entry"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {draft.id && (
                      <>
                        <button
                          type="button"
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                          className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition hover:border-brand-500/50 hover:text-brand-400 disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i, 1)}
                          disabled={i === drafts.length - 1 || drafts[i + 1]?.id === undefined}
                          className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition hover:border-brand-500/50 hover:text-brand-400 disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </>
                    )}
                    {draft.id && (
                      <button
                        type="button"
                        onClick={() => remove(draft.id!)}
                        className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition hover:border-brand-500/60 hover:bg-brand-600/10 hover:text-brand-400"
                        aria-label="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    {!draft.id && (
                      <button
                        type="button"
                        onClick={() => setDrafts((prev) => prev.filter((_, j) => !(j === i && !prev[j].id)))}
                        className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition hover:text-white"
                        aria-label="Discard new entry"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor={`role-${i}`}>Role *</label>
                    <input
                      id={`role-${i}`}
                      className={inputCls}
                      value={draft.role}
                      onChange={(e) => setDraft(draft.id, { role: e.target.value })}
                      placeholder="e.g. Video Editor"
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`org-${i}`}>Company / org</label>
                    <input
                      id={`org-${i}`}
                      className={inputCls}
                      value={draft.org}
                      onChange={(e) => setDraft(draft.id, { org: e.target.value })}
                      placeholder="e.g. Reachhacks"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls} htmlFor={`period-${i}`}>Period</label>
                    <input
                      id={`period-${i}`}
                      className={inputCls}
                      value={draft.period}
                      onChange={(e) => setDraft(draft.id, { period: e.target.value })}
                      placeholder="e.g. 2024 — Present"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls} htmlFor={`points-${i}`}>
                      Bullet points (one per line)
                    </label>
                    <textarea
                      id={`points-${i}`}
                      rows={3}
                      className={`${inputCls} resize-none`}
                      value={draft.points}
                      onChange={(e) => setDraft(draft.id, { points: e.target.value })}
                      placeholder={"What you did there — one point per line"}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => saveDraft(draft)}
                    disabled={busyId !== null}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2 text-xs font-semibold uppercase tracking-widest text-onbrand shadow-glow disabled:opacity-60"
                  >
                    {busyId === (draft.id ?? "new") ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    {draft.id ? "Save entry" : "Add entry"}
                  </button>
                </div>
              </div>
            ))}
            {drafts.length === 0 && (
              <p className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-10 text-center text-sm text-zinc-500">
                No experience entries yet — click “Add Experience”.
              </p>
            )}
          </div>

          <h2 className="mb-4 mt-10 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
            <Languages size={16} /> Languages
          </h2>
          <div className="glass rounded-2xl p-5">
            <label className={labelCls} htmlFor="cv-languages">
              Comma-separated list
            </label>
            <input
              id="cv-languages"
              className={inputCls}
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="Arabic — Native, English — Fluent"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => saveListSetting("cv.languages", languages, "Languages")}
                disabled={busyId === "cv.languages"}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2 text-xs font-semibold uppercase tracking-widest text-onbrand shadow-glow disabled:opacity-60"
              >
                {busyId === "cv.languages" ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
              </button>
            </div>
          </div>

          <h2 className="mb-4 mt-10 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
            <MonitorPlay size={16} /> Software
          </h2>
          <div className="glass rounded-2xl p-5">
            <label className={labelCls} htmlFor="cv-tools">
              Comma-separated list
            </label>
            <input
              id="cv-tools"
              className={inputCls}
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              placeholder="Adobe Premiere Pro, After Effects, …"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => saveListSetting("cv.tools", tools, "Software")}
                disabled={busyId === "cv.tools"}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2 text-xs font-semibold uppercase tracking-widest text-onbrand shadow-glow disabled:opacity-60"
              >
                {busyId === "cv.tools" ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
