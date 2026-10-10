"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const PROJECT_TYPES = [
  "Short-Form Content",
  "Long-Form / YouTube",
  "Commercial / Brand",
  "Motion Graphics",
  "Gaming / Esports",
  "Social Media Campaign",
  "Other",
];

const BUDGETS = ["Under $250", "$250 – $500", "$500 – $1,000", "$1,000 – $5,000", "$5,000+", "Let's discuss"];

// Static builds (GitHub Pages) have no server inbox — submissions open the
// visitor's email app instead. Dynamic builds POST to /api/messages.
const STATIC_MODE = process.env.NEXT_PUBLIC_STATIC === "1";

type Status = "idle" | "sending" | "success" | "error";

type Props = { contactEmail?: string };

export default function ContactForm({ contactEmail = "" }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      projectType: form.get("projectType"),
      budget: form.get("budget"),
      message: form.get("message"),
    };

    if (STATIC_MODE) {
      const subject = encodeURIComponent(`Project inquiry from ${payload.name}`);
      const body = encodeURIComponent(
        [
          `Name: ${payload.name}`,
          `Email: ${payload.email}`,
          `Project type: ${payload.projectType || "-"}`,
          `Budget: ${payload.budget || "-"}`,
          "",
          String(payload.message ?? ""),
        ].join("\n")
      );
      const to = contactEmail || "hello@muhanadmahdy.com";
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      setStatus("success");
      return;
    }

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      formEl.reset();
    } catch {
      setError("Network error — please check your connection and try again.");
      setStatus("error");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60 focus:bg-white/[0.05]";

  return (
    <div className="glass relative rounded-3xl p-7 sm:p-9">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[420px] flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            >
              <CheckCircle2 size={64} className="text-brand-500" />
            </motion.div>
            <h3 className="mt-6 font-display text-3xl tracking-wide text-white">
              {STATIC_MODE ? "OPENING YOUR EMAIL APP" : "MESSAGE SENT"}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
              {STATIC_MODE
                ? `Your email app should open with the message pre-filled for ${contactEmail || "me"}. If nothing happens, write to ${contactEmail || "me"} directly.`
                : "Thanks for reaching out — your message landed in my inbox. I usually reply within 24 hours."}
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-8 rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-300 transition hover:border-brand-500/60 hover:text-brand-400"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={onSubmit}
            className="space-y-5"
            noValidate={false}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Name
                </label>
                <input id="name" name="name" required placeholder="Your name" className={inputCls} maxLength={120} />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Email
                </label>
                <input id="email" name="email" type="email" required placeholder="you@email.com" className={inputCls} maxLength={200} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="projectType" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Project Type
                </label>
                <select id="projectType" name="projectType" className={inputCls} defaultValue="">
                  <option value="" disabled className="bg-ink-800">
                    Select a project type
                  </option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-ink-800">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="budget" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Budget
                </label>
                <select id="budget" name="budget" className={inputCls} defaultValue="">
                  <option value="" disabled className="bg-ink-800">
                    Select your budget
                  </option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b} className="bg-ink-800">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                placeholder="Tell me about your project — footage, deadlines, references, anything helps."
                className={`${inputCls} resize-none`}
                maxLength={5000}
              />
            </div>

            {status === "error" && (
              <p role="alert" className="rounded-xl border border-brand-500/40 bg-brand-950/40 px-4 py-3 text-sm text-brand-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-onbrand shadow-glow transition hover:shadow-glow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending" ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send size={17} /> Send Message
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
