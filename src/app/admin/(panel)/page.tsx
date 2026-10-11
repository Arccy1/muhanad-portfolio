"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Clapperboard,
  Eye,
  FolderTree,
  KeyRound,
  Loader2,
  Mail,
  MessageSquareQuote,
  Save,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { MessageDTO, ProjectDTO } from "@/lib/types";

type Stats = { projects: number; categories: number; testimonials: number; messages: number; unread: number };
type Views = { total: number; last7: number; top: { path: string; count: number }[] };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [views, setViews] = useState<Views | null>(null);
  const [recentMessages, setRecentMessages] = useState<MessageDTO[]>([]);
  const [recentProjects, setRecentProjects] = useState<(ProjectDTO & { category?: { name: string } })[]>([]);

  // account form
  const [acctName, setAcctName] = useState("");
  const [acctEmail, setAcctEmail] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [acctBusy, setAcctBusy] = useState<string | null>(null);
  const [acctMsg, setAcctMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setRecentMessages(data.recentMessages ?? []);
        setRecentProjects(data.recentProjects ?? []);
      })
      .catch(() => {});
    fetch("/api/analytics")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => setViews(data.views))
      .catch(() => {});
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        setAcctName(d.user?.name ?? "");
        setAcctEmail(d.user?.email ?? "");
      })
      .catch(() => {});
  }, []);

  async function saveAccount(kind: "profile" | "password") {
    setAcctBusy(kind);
    setAcctMsg(null);
    try {
      if (kind === "profile") {
        const res = await fetch("/api/auth/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: acctName, email: acctEmail }),
        });
        const data = await res.json();
        setAcctMsg(res.ok ? { ok: true, text: "Account details saved." } : { ok: false, text: data.error || "Save failed." });
      } else {
        if (newPw !== confirmPw) {
          setAcctMsg({ ok: false, text: "The two new passwords do not match." });
          return;
        }
        const res = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
        });
        const data = await res.json();
        setAcctMsg(res.ok ? { ok: true, text: "Password changed." } : { ok: false, text: data.error || "Change failed." });
        if (res.ok) {
          setCurrentPw("");
          setNewPw("");
          setConfirmPw("");
        }
      }
    } finally {
      setAcctBusy(null);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500";

  const cards = [
    { label: "Projects", value: stats?.projects, href: "/admin/projects", icon: Clapperboard },
    { label: "Categories", value: stats?.categories, href: "/admin/categories", icon: FolderTree },
    { label: "Testimonials", value: stats?.testimonials, href: "/admin/testimonials", icon: MessageSquareQuote },
    { label: "Unread Messages", value: stats?.unread, href: "/admin/messages", icon: Mail, accent: true },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-white">DASHBOARD</h1>
        <p className="mt-1 text-sm text-zinc-500">Welcome back — here&apos;s the state of the portfolio.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`group rounded-2xl border p-6 transition hover:-translate-y-0.5 ${
              card.accent && (card.value ?? 0) > 0
                ? "border-brand-500/40 bg-brand-950/30 hover:border-brand-500/70"
                : "border-white/8 bg-white/[0.02] hover:border-brand-500/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <card.icon size={20} className={card.accent ? "text-brand-400" : "text-zinc-500"} />
              <ArrowRight size={15} className="text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-brand-400" />
            </div>
            <p className="mt-5 font-display text-4xl text-white">{card.value ?? "—"}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent messages */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Recent Messages</h2>
            <Link href="/admin/messages" className="text-xs text-brand-400 transition hover:text-brand-300">
              View all →
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-600">No messages yet.</p>
          ) : (
            <ul className="space-y-4">
              {recentMessages.map((m) => (
                <li key={m.id} className="flex items-start gap-3.5">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      m.read ? "bg-zinc-700" : "bg-brand-500 shadow-glow-sm"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-2.5">
                      <span className="text-sm font-medium text-white">{m.name}</span>
                      <span className="text-xs text-zinc-600">{formatDate(m.createdAt)}</span>
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500">{m.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent projects */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Recent Projects</h2>
            <Link href="/admin/projects" className="text-xs text-brand-400 transition hover:text-brand-300">
              Manage →
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-600">No projects yet.</p>
          ) : (
            <ul className="space-y-4">
              {recentProjects.map((p) => (
                <li key={p.id} className="flex items-center gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbnailUrl || "/images/profile.svg"}
                    alt=""
                    className="h-11 w-20 shrink-0 rounded-md border border-white/10 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{p.title}</p>
                    <p className="text-xs text-zinc-600">
                      {p.category?.name ?? "Uncategorized"} · {p.published ? "Published" : "Draft"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Site traffic */}
      <section className="mt-8 rounded-2xl border border-white/8 bg-white/[0.02] p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
          <Eye size={16} className="text-brand-400" /> Site Traffic
        </h2>
        {views ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1.4fr]">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 text-center">
                <p className="font-display text-3xl text-white">{views.total}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Total views</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 text-center">
                <p className="font-display text-3xl text-brand-400">{views.last7}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Last 7 days</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Top pages</p>
              {views.top.length === 0 ? (
                <p className="text-sm text-zinc-600">No page views recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {views.top.map((t) => (
                    <li key={t.path} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-zinc-300">{t.path}</span>
                      <span className="font-display text-lg text-brand-400">{t.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-zinc-600">Loading traffic stats…</p>
        )}
      </section>

      {/* Account settings */}
      <section className="mt-8 rounded-2xl border border-white/8 bg-white/[0.02] p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
          <KeyRound size={16} className="text-brand-400" /> Account &amp; Password
        </h2>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <p className={labelCls}>Profile</p>
            <div className="space-y-3">
              <input aria-label="Admin name" className={inputCls} value={acctName} onChange={(e) => setAcctName(e.target.value)} placeholder="Name" />
              <input aria-label="Admin email" className={inputCls} value={acctEmail} onChange={(e) => setAcctEmail(e.target.value)} placeholder="Email" type="email" />
              <button
                type="button"
                onClick={() => saveAccount("profile")}
                disabled={acctBusy === "profile"}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-300 transition hover:border-brand-500/60 hover:text-brand-400 disabled:opacity-60"
              >
                {acctBusy === "profile" ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save profile
              </button>
            </div>
          </div>
          <div>
            <p className={labelCls}>Change password</p>
            <div className="space-y-3">
              <input aria-label="Current password" type="password" className={inputCls} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" autoComplete="current-password" />
              <input aria-label="New password" type="password" className={inputCls} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password (min. 8 characters)" autoComplete="new-password" />
              <input aria-label="Confirm new password" type="password" className={inputCls} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" autoComplete="new-password" />
              <button
                type="button"
                onClick={() => saveAccount("password")}
                disabled={acctBusy === "password" || !currentPw || !newPw}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-onbrand shadow-glow disabled:opacity-60"
              >
                {acctBusy === "password" ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />} Update password
              </button>
            </div>
          </div>
        </div>
        {acctMsg && (
          <p
            role="status"
            className={cn(
              "mt-4 rounded-xl px-4 py-2.5 text-sm",
              acctMsg.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-brand-950/40 text-brand-300 border border-brand-500/40"
            )}
          >
            {acctMsg.text}
          </p>
        )}
      </section>

      {/* Quick actions */}
      <section className="mt-8 rounded-2xl border border-white/8 bg-white/[0.02] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Quick Actions</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admin/projects"
            className="rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-onbrand shadow-glow transition hover:shadow-glow-lg"
          >
            + Add a new project
          </Link>
          <Link
            href="/admin/content"
            className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-300 transition hover:border-brand-500/60 hover:text-brand-400"
          >
            Edit homepage content
          </Link>
          <Link
            href="/"
            target="_blank"
            className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-300 transition hover:border-brand-500/60 hover:text-brand-400"
          >
            View live site ↗
          </Link>
        </div>
      </section>
    </div>
  );
}
