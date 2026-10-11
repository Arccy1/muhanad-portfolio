"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      router.replace(params.get("from") || "/admin");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[150px]"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative w-full max-w-md rounded-3xl p-8 sm:p-10"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-500/50 bg-brand-600/10 font-display text-2xl text-brand-500 shadow-glow-sm">
            M
          </span>
          <div>
            <h1 className="font-display text-2xl tracking-wide text-white">ADMIN PANEL</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-400">Muhanad Wael El-Mahdy</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input id="email" name="email" type="email" required placeholder="admin@muhanad.dev" className={inputCls} autoComplete="username" />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input id="password" name="password" type="password" required placeholder="••••••••" className={inputCls} autoComplete="current-password" />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-brand-500/40 bg-brand-950/40 px-4 py-3 text-sm text-brand-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-onbrand shadow-glow transition hover:shadow-glow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Authorized use only. Credentials are stored in the project&apos;s .env file.
        </p>
        <p className="mt-4 text-center text-xs text-zinc-600">
          <Link href="/" className="transition hover:text-brand-400">← Back to website</Link>
        </p>
      </motion.div>
    </main>
  );
}
