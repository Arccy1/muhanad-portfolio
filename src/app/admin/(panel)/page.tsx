"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clapperboard, FolderTree, Mail, MessageSquareQuote } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { MessageDTO, ProjectDTO } from "@/lib/types";

type Stats = { projects: number; categories: number; testimonials: number; messages: number; unread: number };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentMessages, setRecentMessages] = useState<MessageDTO[]>([]);
  const [recentProjects, setRecentProjects] = useState<(ProjectDTO & { category?: { name: string } })[]>([]);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setRecentMessages(data.recentMessages ?? []);
        setRecentProjects(data.recentProjects ?? []);
      })
      .catch(() => {});
  }, []);

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

      {/* Quick actions */}
      <section className="mt-8 rounded-2xl border border-white/8 bg-white/[0.02] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Quick Actions</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admin/projects"
            className="rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:shadow-glow-lg"
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
