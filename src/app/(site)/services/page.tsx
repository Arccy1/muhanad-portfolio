import { Metadata } from "next";
import {
  AudioLines,
  Film,
  Gamepad2,
  Megaphone,
  Palette,
  Smartphone,
  Sparkles,
  Youtube,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import CTABand from "@/components/home/CTABand";
import { getServices } from "@/lib/data";
import { getSiteContent } from "@/lib/content";
import type { ServiceDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Video editing, short-form content, YouTube editing, motion graphics, commercial editing, gaming edits, color grading and sound design.",
};

const ICONS: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  film: Film,
  smartphone: Smartphone,
  youtube: Youtube,
  sparkles: Sparkles,
  megaphone: Megaphone,
  "gamepad-2": Gamepad2,
  palette: Palette,
  "audio-lines": AudioLines,
};

function ServiceCard({ service, index }: { service: ServiceDTO; index: number }) {
  const Icon = ICONS[service.icon] ?? Film;
  const num = String(index + 1).padStart(2, "0");
  return (
    <Reveal delay={0.05 * index} className="h-full">
      <div className="group relative h-full overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-500/50 hover:bg-white/[0.04] hover:shadow-glow">
        <span
          aria-hidden
          className="text-stroke absolute -right-2 -top-5 select-none font-display text-7xl opacity-60 transition group-hover:opacity-100"
        >
          {num}
        </span>
        <span
          aria-hidden
          className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-brand-600/10 blur-2xl transition duration-500 group-hover:bg-brand-600/25"
        />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-400 transition duration-300 group-hover:bg-brand-600 group-hover:text-white group-hover:shadow-glow">
          <Icon size={26} />
        </span>
        <h3 className="relative mt-6 font-display text-2xl tracking-wide text-white">{service.title}</h3>
        <p className="relative mt-3 text-sm leading-relaxed text-zinc-500">{service.description}</p>
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-brand-600 to-[#FF8A5C] transition-all duration-500 group-hover:w-full"
        />
      </div>
    </Reveal>
  );
}

export default async function ServicesPage() {
  const [services, content] = await Promise.all([getServices(), getSiteContent()]);

  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/4 h-[420px] w-[680px] rounded-full bg-brand-900/30 blur-[150px]"
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            kicker="Services"
            title={
              <>
                EVERYTHING THE <span className="text-gradient">TIMELINE NEEDS</span>
              </>
            }
            description="From a single Reel to a full campaign — pick the service that fits, and get a dedicated editor who treats your footage like their own."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:pb-32">
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </section>

      <CTABand heading={content["cta.heading"]} subtext={content["cta.subtext"]} />
    </>
  );
}
