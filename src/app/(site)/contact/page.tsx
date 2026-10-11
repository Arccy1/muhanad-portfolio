import { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Instagram, Linkedin, Mail, MessageCircle } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/contact/ContactForm";
import { getSiteContent, getSocials } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Muhanad Wael El-Mahdy for video editing and motion design projects — email, WhatsApp, Instagram and LinkedIn.",
};

export default async function ContactPage() {
  const content = await getSiteContent();
  const socials = getSocials(content);

  const channels = [
    { label: "Email", value: socials.email, href: `mailto:${socials.email}`, icon: Mail },
    { label: "WhatsApp", value: "Chat instantly", href: socials.whatsapp, icon: MessageCircle },
    { label: "Instagram", value: "@muhanad.mahdy", href: socials.instagram, icon: Instagram },
    { label: "LinkedIn", value: "muhanad-mahdy", href: socials.linkedin, icon: Linkedin },
  ];

  return (
    <section className="relative overflow-hidden pb-24 pt-40 lg:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/3 h-[460px] w-[820px] rounded-full bg-brand-900/30 blur-[160px]"
      />
      <span
        aria-hidden
        className="text-stroke pointer-events-none absolute -right-8 top-24 hidden select-none font-display text-[10rem] leading-none opacity-30 xl:block"
      >
        LET'S TALK
      </span>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="section-kicker">Contact</p>
          <h1 className="heading-display mt-5 text-5xl text-white sm:text-6xl lg:text-7xl">
            LET&apos;S CREATE <span className="text-gradient">SOMETHING GREAT</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-400">{content["cta.subtext"]}</p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          {/* Channels */}
          <div className="space-y-4">
            {channels.map((ch, i) => (
              <Reveal key={ch.label} delay={0.05 * i}>
                <a
                  href={ch.href}
                  target={ch.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4.5 px-5 py-4 transition duration-300 hover:border-brand-500/50 hover:bg-white/[0.04] hover:shadow-glow-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600/10 text-brand-400 transition group-hover:bg-brand-600 group-hover:text-white">
                    <ch.icon size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">{ch.label}</span>
                    <span className="block truncate text-sm text-zinc-500 transition group-hover:text-zinc-300">
                      {ch.value}
                    </span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>

          {/* Form */}
          <Reveal delay={0.1}>
            <Suspense
              fallback={
                <div className="glass h-[640px] animate-pulse rounded-3xl" aria-hidden />
              }
            >
              <ContactForm contactEmail={socials.email} />
            </Suspense>
            <p className="mt-5 text-center text-sm text-zinc-500">
              Want a more guided experience?{" "}
              <Link href="/start" className="font-medium text-brand-400 hover:underline">
                Start a project →
              </Link>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
