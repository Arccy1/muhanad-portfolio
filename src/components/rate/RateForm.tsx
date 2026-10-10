"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Send, Star } from "lucide-react";

type Props = { token: string; projectName: string | null };

const RATING_LABELS = ["", "Not great", "Okay", "Good", "Excellent!", "Absolutely amazing!"];

export default function RateForm({ token, projectName }: Props) {
  const [hovered, setHovered] = useState(0);
  const [value, setValue] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (value < 1) {
      setError("Please choose a star rating first.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/ratings/token/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value, name, email, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not submit the review.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSending(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60 focus:bg-white/[0.05]";

  return (
    <div className="glass rounded-3xl p-8 sm:p-10">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[380px] flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            >
              <CheckCircle2 size={64} className="text-brand-500" />
            </motion.div>
            <h1 className="mt-6 font-display text-3xl tracking-wide text-white">THANK YOU!</h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
              Your review was submitted{projectName ? ` for "${projectName}"` : ""}. It means a
              lot — clients like you make this work possible.
            </p>
            <a
              href="/"
              className="mt-8 rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-300 transition hover:border-brand-500/60 hover:text-brand-400"
            >
              Back to the website
            </a>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={submit}
            className="space-y-6"
          >
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-400">
                Client review
              </p>
              <h1 className="mt-3 font-display text-3xl tracking-wide text-white sm:text-4xl">
                HOW DID I DO?
              </h1>
              {projectName && (
                <p className="mt-2 text-sm text-zinc-400">
                  Project: <span className="font-medium text-zinc-200">{projectName}</span>
                </p>
              )}
            </div>

            {/* Stars */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex gap-2"
                onMouseLeave={() => setHovered(0)}
                role="radiogroup"
                aria-label="Your rating"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onClick={() => setValue(star)}
                    className="rounded-lg p-1 transition-transform hover:scale-110"
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      size={40}
                      className={
                        star <= (hovered || value)
                          ? "fill-brand-500 text-brand-500 drop-shadow-[0_0_10px_rgb(var(--c-brand-500)/0.5)] transition"
                          : "text-zinc-700 transition"
                      }
                    />
                  </button>
                ))}
              </div>
              <p className="h-5 text-sm font-medium text-brand-400">
                {(hovered || value) > 0 ? RATING_LABELS[hovered || value] : ""}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="r-name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Your name *
                </label>
                <input
                  id="r-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={120}
                  placeholder="e.g. Sara Al-Rashid"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="r-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Email (optional, never shown)
                </label>
                <input
                  id="r-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={200}
                  placeholder="you@company.com"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="r-content" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Your review (optional)
              </label>
              <textarea
                id="r-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="How was the process, the communication, the final result?"
                className={`${inputCls} resize-none`}
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-brand-500/40 bg-brand-950/40 px-4 py-3 text-sm text-brand-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-onbrand shadow-glow transition hover:shadow-glow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send size={17} /> Submit Review
                </>
              )}
            </button>
            <p className="text-center text-xs text-zinc-600">
              Reviews appear on the website after a quick check.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
