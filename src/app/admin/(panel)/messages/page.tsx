"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CheckCheck, ChevronDown, Mail, MailOpen, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { MessageDTO } from "@/lib/types";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/messages");
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleRead(m: MessageDTO) {
    await fetch(`/api/messages/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !m.read }),
    });
    await load();
  }

  async function markAllRead() {
    const unread = messages.filter((m) => !m.read);
    await Promise.all(
      unread.map((m) =>
        fetch(`/api/messages/${m.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        })
      )
    );
    await load();
  }

  async function remove(m: MessageDTO) {
    if (!window.confirm(`Delete message from "${m.name}"?`)) return;
    await fetch(`/api/messages/${m.id}`, { method: "DELETE" });
    await load();
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-white">MESSAGES</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {messages.length} total · {unreadCount > 0 ? <span className="text-brand-400">{unreadCount} unread</span> : "all read"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-300 transition hover:border-brand-500/60 hover:text-brand-400"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <p className="py-20 text-center text-sm text-zinc-500">Loading messages…</p>
      ) : messages.length === 0 ? (
        <div className="glass flex flex-col items-center rounded-2xl py-20 text-center">
          <MailOpen size={38} className="text-zinc-600" />
          <p className="mt-4 font-display text-2xl tracking-wide text-zinc-300">INBOX ZERO</p>
          <p className="mt-2 text-sm text-zinc-500">New contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const open = openId === m.id;
            return (
              <div
                key={m.id}
                className={cn(
                  "rounded-2xl border transition",
                  m.read ? "border-white/8 bg-white/[0.02]" : "border-brand-500/30 bg-brand-950/20"
                )}
              >
                <button
                  type="button"
                  onClick={async () => {
                    setOpenId(open ? null : m.id);
                    if (!m.read && !open) await toggleRead(m);
                  }}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className={cn("shrink-0 rounded-full p-2", m.read ? "text-zinc-600" : "bg-brand-600/15 text-brand-400")}>
                    {m.read ? <MailOpen size={17} /> : <Mail size={17} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3">
                      <span className={cn("truncate text-sm", m.read ? "text-zinc-300" : "font-semibold text-white")}>
                        {m.name}
                      </span>
                      <span className="truncate text-xs text-zinc-600">{m.email}</span>
                      {!m.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500 shadow-glow-sm" />}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-zinc-500">{m.message}</span>
                  </span>
                  <span className="hidden shrink-0 text-xs text-zinc-600 sm:block">{formatDate(m.createdAt)}</span>
                  <ChevronDown
                    size={16}
                    className={cn("shrink-0 text-zinc-600 transition-transform", open && "rotate-180")}
                  />
                </button>

                {open && (
                  <div className="border-t border-white/5 px-5 py-5">
                    <div className="flex flex-wrap gap-2">
                      {m.projectType && (
                        <span className="rounded-md border border-brand-500/25 bg-brand-600/10 px-2.5 py-1 text-[11px] text-brand-300">
                          {m.projectType}
                        </span>
                      )}
                      {m.budget && (
                        <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-400">
                          Budget: {m.budget}
                        </span>
                      )}
                      <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-500">
                        {formatDate(m.createdAt)}
                      </span>
                    </div>
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-300">{m.message}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <a
                        href={`mailto:${m.email}?subject=Re: your project inquiry`}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow-glow"
                      >
                        Reply by email
                      </a>
                      <button
                        type="button"
                        onClick={() => toggleRead(m)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-xs text-zinc-300 transition hover:border-brand-500/50 hover:text-brand-400"
                      >
                        <Check size={14} /> Mark as {m.read ? "unread" : "read"}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(m)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-xs text-zinc-400 transition hover:border-brand-500/60 hover:bg-brand-600/10 hover:text-brand-400"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
