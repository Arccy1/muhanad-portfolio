import Link from "next/link";
import { Instagram, Linkedin, Mail, MessageCircle } from "lucide-react";
import { getSiteContent, getSocials, type SiteContent } from "@/lib/content";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/showreel", label: "Showreel" },
  { href: "/cv", label: "CV" },
  { href: "/contact", label: "Contact" },
];

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/60 hover:text-brand-400 hover:shadow-glow-sm"
    >
      {children}
    </a>
  );
}

export default async function Footer() {
  const content: SiteContent = await getSiteContent();
  const socials = getSocials(content);

  return (
    <footer className="relative border-t border-white/5 bg-ink-800">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-600/60 to-transparent"
      />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-500/50 bg-brand-600/10 font-display text-2xl text-brand-500">
              M
            </span>
            <span className="leading-tight">
              <span className="block font-display text-xl tracking-wider text-white">MUHANAD MAHDY</span>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-brand-400">
                Video Editor & Motion Designer
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-500">
            Transforming raw footage into engaging visual stories through editing, motion graphics,
            sound design and creative storytelling.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Navigate</h3>
          <ul className="mt-5 grid grid-cols-2 gap-2.5 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-zinc-400 transition hover:text-brand-400">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Connect</h3>
          <a
            href={`mailto:${socials.email}`}
            className="mt-5 block text-sm text-zinc-300 transition hover:text-brand-400"
          >
            {socials.email}
          </a>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <SocialIcon href={socials.instagram} label="Instagram"><Instagram size={17} /></SocialIcon>
            <SocialIcon href={socials.linkedin} label="LinkedIn"><Linkedin size={17} /></SocialIcon>
            <SocialIcon href={socials.whatsapp} label="WhatsApp"><MessageCircle size={17} /></SocialIcon>
            <SocialIcon href={`mailto:${socials.email}`} label="Email"><Mail size={17} /></SocialIcon>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-zinc-600 sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} Muhanad Wael Mahdy. All rights reserved.</p>
          <p>
            Edited, graded &amp; delivered with <span className="text-brand-500">●</span> by Muhanad
          </p>
        </div>
      </div>
    </footer>
  );
}
