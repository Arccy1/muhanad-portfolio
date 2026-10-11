"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CloudUpload,
  Loader2,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATIC_MODE = process.env.NEXT_PUBLIC_STATIC === "1";

const SERVICES = [
  "Short-Form Content",
  "Long-Form / YouTube",
  "Commercial / Brand",
  "Motion Graphics",
  "Gaming / Esports",
  "Social Media Campaign",
  "Other",
];

const BUDGETS = ["Under $250", "$250 – $500", "$500 – $1,000", "$1,000 – $5,000", "$5,000+", "Let's discuss"];

type Files = { url: string; name: string }[];

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60 focus:bg-white/[0.05]";

export default function StartWizard() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(SERVICES[0]);
  const [budget, setBudget] = useState(BUDGETS[2]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<Files>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/wizard-upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) setUploadError(data.error || "Upload failed.");
      else setFiles((prev) => [...prev, { url: data.url, name: file.name }]);
    } catch {
      setUploadError("Upload failed — check your connection.");
    } finally {
      setUploading(false);
    }
  }

  function next() {
    if (step === 1 && !service) {
      setError("Pick the kind of edit you need.");
      return;
    }
    setError("");
    setStep((s) => Math.min(3, s + 1));
  }

  async function submit() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Name, email and the project description are required.");
      return;
    }
    // Static (GitHub Pages) build has no API — hand off to the email app.
    if (STATIC_MODE) {
      const subject = encodeURIComponent(`Project brief: ${service} (${budget})`);
      const body = encodeURIComponent(
        [
          `Name: ${name}`,
          `Email: ${email}`,
          `Service: ${service}`,
          `Budget: ${budget}`,
          deadline ? `Deadline: ${deadline}` : "",
          "",
          message,
          files.length ? `\nReferences: ${files.map((f) => f.name).join(", ")}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      );
      window.location.href = `mailto:mohannadwael1000@gmail.com?subject=${subject}&body=${body}`;
      setDone(true);
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          projectType: service,
          budget,
          message: `${message}${deadline ? `\n\nDeadline: ${deadline}` : ""}${
            files.length ? `\n\nAttached references: ${files.map((f) => f.name).join(", ")} (${files.map((f) => f.url).join(", ")})` : ""
          }`,
          files: files.map((f) => f.url),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSending(false);
    }
  }

  const dot = (n: number) =>
    cn(
      "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition",
      step >= n ? "border-brand-500 bg-brand-600/20 text-brand-400" : "border-white/15 text-zinc-600"
    );

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-7 sm:p-10">
      {/* Step indicator */}
      {!done && (
        <div className="mb-8 flex items-center justify-center gap-3" aria-hidden>
          <span className={dot(1)}>1</span>
          <span className={cn("h-px w-10", step >= 2 ? "bg-brand-500" : "bg-white/15")} />
          <span className={dot(2)}>2</span>
          <span className={cn("h-px w-10", step >= 3 ? "bg-brand-500" : "bg-white/15")} />
          <span className={dot(3)}>3</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[420px] flex-col items-center justify-center text-center"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}>
              <CheckCircle2 size={64} className="text-brand-500" />
            </motion.div>
            <h2 className="mt-6 font-display text-3xl tracking-wide text-white">PROJECT SENT</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
              Thanks {name.split(" ")[0]} — everything landed safely, including your attachments.
              Expect a reply within 24 hours.
            </p>
          </motion.div>
        ) : (
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">What do you need?</p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {SERVICES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setService(s)}
                        className={cn(
                          "rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
                          service === s
                            ? "border-brand-500 bg-brand-600/15 text-white"
                            : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-brand-500/40 hover:text-white"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Budget</p>
                  <div className="flex flex-wrap gap-2.5">
                    {BUDGETS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBudget(b)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-xs font-medium transition",
                          budget === b
                            ? "border-brand-500 bg-brand-600/20 text-white"
                            : "border-white/10 text-zinc-400 hover:border-brand-500/40 hover:text-white"
                        )}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="w-name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Name *</label>
                    <input id="w-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name" maxLength={120} />
                  </div>
                  <div>
                    <label htmlFor="w-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Email *</label>
                    <input id="w-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@company.com" maxLength={200} />
                  </div>
                </div>
                <div>
                  <label htmlFor="w-deadline" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Deadline (optional)</label>
                  <input id="w-deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} placeholder="e.g. Needed before Ramadan" maxLength={120} />
                </div>
                <div>
                  <label htmlFor="w-message" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">The project *</label>
                  <textarea
                    id="w-message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`${inputCls} resize-none`}
                    maxLength={4000}
                    placeholder="What's the video for? What footage do you have? What does success look like?"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white">
                    <CloudUpload size={16} className="text-brand-400" /> Attach reference files
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Briefs, scripts, moodboards, past videos — anything that helps (max 10 MB per file: PDF, Word, images, ZIP).
                  </p>
                  <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-5 text-sm text-zinc-400 transition hover:border-brand-500/60 hover:text-brand-400">
                    <CloudUpload size={17} />
                    {uploading ? "Uploading…" : "Click to add files"}
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.zip"
                      onChange={(e) => {
                        const list = e.target.files;
                        if (list) for (const f of Array.from(list)) upload(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {uploadError && <p className="mt-2 text-xs text-brand-400">{uploadError}</p>}
                  {files.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {files.map((f) => (
                        <li key={f.url} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-2 text-sm">
                          <span className="truncate text-zinc-300">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => setFiles((prev) => prev.filter((x) => x.url !== f.url))}
                            aria-label={`Remove ${f.name}`}
                            className="rounded p-1 text-zinc-600 transition hover:text-brand-400"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm">
                  <p className="mb-2 font-semibold text-white">Quick summary</p>
                  <p className="text-zinc-400">Service: <span className="text-zinc-200">{service}</span></p>
                  <p className="text-zinc-400">Budget: <span className="text-zinc-200">{budget}</span></p>
                  <p className="text-zinc-400">From: <span className="text-zinc-200">{name} ({email})</span></p>
                  {deadline && <p className="text-zinc-400">Deadline: <span className="text-zinc-200">{deadline}</span></p>}
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="mt-5 rounded-xl border border-brand-500/40 bg-brand-950/40 px-4 py-3 text-sm text-brand-300">
                {error}
              </p>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-300 transition hover:border-white/40 disabled:opacity-30"
              >
                <ArrowLeft size={15} /> Back
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-2.5 text-sm font-semibold text-onbrand shadow-glow transition hover:shadow-glow-lg"
                >
                  Continue <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-2.5 text-sm font-semibold text-onbrand shadow-glow transition hover:shadow-glow-lg disabled:opacity-60"
                >
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {sending ? "Sending…" : "Send project brief"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
