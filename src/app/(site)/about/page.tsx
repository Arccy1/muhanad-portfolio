import { Metadata } from "next";
import {
  Award,
  Clapperboard,
  Film,
  Flame,
  Gamepad2,
  Megaphone,
  Music4,
  Palette,
  Scissors,
  Share2,
  Sparkles,
  Wand2,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import SkillsSection from "@/components/home/SkillsSection";
import CTABand from "@/components/home/CTABand";
import { getSkills } from "@/lib/data";
import { getSiteContent } from "@/lib/content";
import { asset } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Muhanad Wael Mahdy — video editor and motion designer with 2+ years of experience across short-form, documentary, commercial and esports editing.",
};

const SPECIALTIES = [
  { icon: Scissors, label: "Narrative Editing" },
  { icon: Flame, label: "Retention-Driven Cuts" },
  { icon: Sparkles, label: "Motion Graphics" },
  { icon: Palette, label: "Cinematic Color" },
  { icon: Music4, label: "Sound Design" },
  { icon: Gamepad2, label: "Esports Montages" },
  { icon: Megaphone, label: "Brand Storytelling" },
  { icon: Share2, label: "Platform Optimization" },
];

const TOOLS = [
  { name: "Adobe Premiere Pro", use: "Primary NLE — assembly to final cut" },
  { name: "Adobe After Effects", use: "Motion graphics, VFX, compositing" },
  { name: "DaVinci Resolve", use: "Color grading & finishing" },
  { name: "Adobe Photoshop", use: "Thumbnails, matte work, textures" },
  { name: "Adobe Audition", use: "Dialogue cleanup & sound design" },
];

const PROCESS = [
  { title: "Discover", description: "Every project starts with the story — goals, audience, references and the feeling the final cut should leave behind." },
  { title: "Assemble", description: "Selects are pulled and structured into a timeline that already works before a single effect is added." },
  { title: "Refine", description: "Rhythm, pacing, graphics and sound are layered in — with review loops so you're never guessing where things stand." },
  { title: "Deliver", description: "Color, mix and export matrix for every platform, on time and organized for your team." },
];

export default async function AboutPage() {
  const [content, skills] = await Promise.all([getSiteContent(), getSkills()]);

  const stats = [
    { label: "Years Experience", value: content["stats.years"] },
    { label: "Projects Completed", value: content["stats.projects"] },
    { label: "Happy Clients", value: content["stats.clients"] },
    { label: "Total Views", value: content["stats.views"] },
  ];

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-1/4 h-[420px] w-[680px] rounded-full bg-brand-900/30 blur-[150px]"
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-[440px_1fr]">
            <Reveal>
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-brand-600/40 via-transparent to-brand-900/40 blur-lg"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(content["about.image"])}
                  alt="Portrait of Muhanad Wael Mahdy"
                  className="relative aspect-square w-full rounded-3xl border border-white/10 object-cover shadow-card"
                />
                <div className="glass absolute -bottom-5 -right-4 flex items-center gap-3 rounded-2xl px-5 py-3.5">
                  <Award className="text-brand-500" size={22} />
                  <div>
                    <p className="font-display text-lg leading-none text-white">
                      {content["stats.years"]} YEARS
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-zinc-500">In the timeline</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <div>
              <SectionHeading
                kicker="About Me"
                title={
                  <>
                    THE EDITOR BEHIND <span className="text-gradient">THE CUT</span>
                  </>
                }
              />
              <Reveal delay={0.1}>
                <p className="mt-6 text-lg leading-relaxed text-zinc-300">{content["about.intro"]}</p>
                <p className="mt-5 leading-relaxed text-zinc-500">{content["about.approach"]}</p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {stats.map((s) => (
                    <div key={s.label} className="glass rounded-2xl p-4 text-center">
                      <p className="heading-display text-3xl text-brand-400">{s.value}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            kicker="Specialties"
            title={
              <>
                WHAT I DO <span className="text-gradient">BEST</span>
              </>
            }
            align="center"
          />
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {SPECIALTIES.map((s, i) => (
              <Reveal key={s.label} delay={0.05 * i}>
                <div className="glass group flex flex-col items-center gap-3.5 rounded-2xl px-4 py-8 text-center transition duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-glow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/10 text-brand-400 transition group-hover:bg-brand-600 group-hover:text-onbrand">
                    <s.icon size={22} />
                  </span>
                  <span className="text-sm font-medium text-zinc-200">{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Software */}
      <section className="border-y border-white/5 bg-ink-800/50 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            kicker="Toolkit"
            title={
              <>
                SOFTWARE &amp; <span className="text-gradient">TOOLS</span>
              </>
            }
            description="Industry-standard tools, mastered end to end."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TOOLS.map((tool, i) => (
              <Reveal key={tool.name} delay={0.06 * i}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/8 bg-ink-700 p-6 transition duration-300 hover:border-brand-500/50">
                  <span
                    aria-hidden
                    className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-600/10 blur-2xl transition group-hover:bg-brand-600/30"
                  />
                  <Film className="text-brand-500" size={20} />
                  <h3 className="mt-4 font-display text-xl tracking-wide text-white">{tool.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">{tool.use}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Creative approach / process */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
            <SectionHeading
              kicker="Creative Approach"
              title={
                <>
                  HOW A PROJECT <span className="text-gradient">COMES TO LIFE</span>
                </>
              }
              description="A process refined over hundreds of projects — fast feedback loops, no surprises, and a cut that always serves the story."
            />
            <div className="space-y-5">
              {PROCESS.map((step, i) => (
                <Reveal key={step.title} delay={0.08 * i}>
                  <div className="relative flex gap-6 rounded-2xl border border-white/8 bg-white/[0.02] p-6 transition hover:border-brand-500/40">
                    <span className="heading-display text-5xl text-brand-500/70">0{i + 1}</span>
                    <div>
                      <h3 className="font-semibold text-white">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{step.description}</p>
                    </div>
                    <Clapperboard aria-hidden size={18} className="absolute right-5 top-5 text-zinc-700" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SkillsSection skills={skills} />
      <CTABand heading={content["cta.heading"]} subtext={content["cta.subtext"]} />
    </>
  );
}
