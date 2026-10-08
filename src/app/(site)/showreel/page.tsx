import { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import VideoPlayer from "@/components/portfolio/VideoPlayer";
import ProjectCard from "@/components/portfolio/ProjectCard";
import CTABand from "@/components/home/CTABand";
import { getProjects } from "@/lib/data";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Showreel",
  description:
    "Selected work showcasing my editing style, motion graphics, transitions, visual effects, and storytelling.",
};

export default async function ShowreelPage() {
  const [content, featured] = await Promise.all([
    getSiteContent(),
    getProjects({ featured: true, take: 3 }),
  ]);

  const videoUrl = content["showreel.videoUrl"];

  return (
    <>
      <section className="relative overflow-hidden pb-20 pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[460px] w-[900px] -translate-x-1/2 rounded-full bg-brand-900/30 blur-[160px]"
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="section-kicker justify-center">Showreel 2026</p>
            <h1 className="heading-display mt-5 text-6xl text-white sm:text-7xl lg:text-8xl">
              MY <span className="text-gradient">SHOWREEL</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400">{content["showreel.description"]}</p>
          </Reveal>

          <Reveal delay={0.15} className="mt-14">
            {videoUrl ? (
              <VideoPlayer
                src={videoUrl}
                poster="/images/showreel-poster.svg"
                title="Showreel 2026"
                className="shadow-glow-lg"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/showreel-poster.svg" alt="Showreel poster" className="h-full w-full object-cover" />
              </div>
            )}
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.25em] text-zinc-600">
              <span className="rounded-full border border-white/10 px-4 py-1.5">Editing</span>
              <span className="rounded-full border border-white/10 px-4 py-1.5">Motion Graphics</span>
              <span className="rounded-full border border-white/10 px-4 py-1.5">Transitions</span>
              <span className="rounded-full border border-white/10 px-4 py-1.5">VFX</span>
              <span className="rounded-full border border-white/10 px-4 py-1.5">Storytelling</span>
            </div>
          </Reveal>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:pb-32">
          <Reveal>
            <h2 className="heading-display text-3xl text-white sm:text-4xl">
              FROM THE <span className="text-gradient">REEL</span>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project, i) => (
              <Reveal key={project.id} delay={0.06 * i}>
                <ProjectCard project={project} className="h-full" />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <CTABand heading={content["cta.heading"]} subtext={content["cta.subtext"]} />
    </>
  );
}
