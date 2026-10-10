"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

const GROUPS: { title: string; fields: { key: string; label: string; type?: "text" | "textarea" | "image" }[] }[] = [
  {
    title: "Hero (homepage)",
    fields: [
      { key: "hero.badge", label: "Badge" },
      { key: "hero.heading", label: "Heading" },
      { key: "hero.subheading", label: "Subheading" },
      { key: "hero.description", label: "Description", type: "textarea" },
      { key: "hero.videoUrl", label: "Background video URL (optional)" },
    ],
  },
  {
    title: "Stats",
    fields: [
      { key: "stats.years", label: "Years experience" },
      { key: "stats.projects", label: "Projects completed" },
      { key: "stats.clients", label: "Happy clients" },
      { key: "stats.views", label: "Total views" },
    ],
  },
  {
    title: "Showreel",
    fields: [
      { key: "showreel.title", label: "Title" },
      { key: "showreel.description", label: "Description", type: "textarea" },
      { key: "showreel.videoUrl", label: "Showreel video URL" },
    ],
  },
  {
    title: "About",
    fields: [
      { key: "about.image", label: "Profile image", type: "image" },
      { key: "about.intro", label: "Introduction", type: "textarea" },
      { key: "about.approach", label: "Creative approach", type: "textarea" },
    ],
  },
  {
    title: "Call to action",
    fields: [
      { key: "cta.heading", label: "Heading" },
      { key: "cta.subtext", label: "Subtext", type: "textarea" },
    ],
  },
  {
    title: "Contact & socials",
    fields: [
      { key: "socials.email", label: "Email" },
      { key: "socials.whatsapp", label: "WhatsApp link" },
      { key: "socials.instagram", label: "Instagram link" },
      { key: "socials.youtube", label: "YouTube link" },
      { key: "socials.tiktok", label: "TikTok link" },
      { key: "socials.behance", label: "Behance link" },
      { key: "socials.linkedin", label: "LinkedIn link" },
    ],
  },
];

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500";

export default function AdminContentPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/content");
    const data = await res.json();
    setValues(data.content ?? {});
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: values }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="py-20 text-center text-sm text-zinc-500">Loading content…</p>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-white">SITE CONTENT</h1>
          <p className="mt-1 text-sm text-zinc-500">Homepage hero, stats, showreel, about text and social links.</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-7 py-2.5 text-sm font-semibold uppercase tracking-widest text-onbrand shadow-glow transition hover:shadow-glow-lg disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {GROUPS.map((group) => (
          <section key={group.title} className="glass rounded-2xl p-6">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">{group.title}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {group.fields.map((field) => (
                <div
                  key={field.key}
                  className={field.type === "textarea" || field.type === "image" ? "sm:col-span-2" : ""}
                >
                  {field.type === "image" ? (
                    <ImageUpload
                      label={field.label}
                      value={values[field.key] ?? ""}
                      onChange={(url) => setValues((prev) => ({ ...prev, [field.key]: url }))}
                    />
                  ) : (
                    <>
                      <label className={labelCls} htmlFor={`f-${field.key}`}>
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          id={`f-${field.key}`}
                          rows={3}
                          className={`${inputCls} resize-none`}
                          value={values[field.key] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        />
                      ) : (
                        <input
                          id={`f-${field.key}`}
                          className={inputCls}
                          value={values[field.key] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
