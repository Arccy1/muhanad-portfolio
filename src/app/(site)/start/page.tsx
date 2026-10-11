import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CloudUpload, FileText, MessageSquareText, SlidersHorizontal } from "lucide-react";
import StartWizard from "@/components/start/StartWizard";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Start a project",
  description: "Tell Muhanad about your project in a couple of minutes — attach references and get a quote.",
};

const STEPS = [
  { icon: SlidersHorizontal, title: "The basics", text: "What kind of edit you need and your budget." },
  { icon: FileText, title: "The details", text: "Tell the story — footage, deadlines, references." },
  { icon: CloudUpload, title: "Attachments", text: "Drop reference files or links (optional)." },
];

export default function StartProjectPage() {
  return (
    <section className="relative overflow-hidden pb-24 pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[780px] -translate-x-1/2 rounded-full bg-brand-900/30 blur-[150px]"
      />
      <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-brand-400"
          >
            <ArrowLeft size={16} /> Prefer a simple form?
          </Link>
          <h1 className="heading-display mt-5 text-5xl text-white sm:text-6xl">
            START A <span className="text-gradient">PROJECT</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-400">
            Three quick steps — takes about two minutes. You&apos;ll get a reply within 24 hours.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="glass flex items-start gap-3 rounded-2xl p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600/15 font-display text-brand-400">
                  {i + 1}
                </span>
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-white">
                    <s.icon size={15} className="text-brand-400" /> {s.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">{s.text}</span>
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <StartWizard />
        </Reveal>

        <p className="no-print mt-8 text-center text-xs text-zinc-600">
          Prefer email? Write to us from the{" "}
          <Link href="/contact" className="text-brand-400 hover:underline">
            contact page
          </Link>{" "}
          — or use <MessageSquareText size={12} className="inline" /> WhatsApp.
        </p>
      </div>
    </section>
  );
}
