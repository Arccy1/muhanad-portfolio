import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { asset } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";
import VideoPlayer from "@/components/portfolio/VideoPlayer";

type Props = {
  title: string;
  description: string;
  videoUrl?: string;
  poster?: string;
};

/** Full-width cinematic showreel band — framed like a film preview. */
export default function ShowreelTeaser({ title, description, videoUrl, poster }: Props) {
  return (
    <section className="relative py-24 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-900/25 blur-[150px]"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="section-kicker justify-center">Showreel</p>
          <h2 className="heading-display mt-4 text-4xl text-white sm:text-5xl lg:text-6xl">{title}</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">{description}</p>
        </Reveal>

        <Reveal delay={0.15} variant="cinematic" className="mt-12">
          {videoUrl ? (
            <div className="viewfinder relative mx-auto max-w-5xl">
              <VideoPlayer src={videoUrl} poster={poster} title={title} className="mx-auto" />
              <TimelineStrip />
            </div>
          ) : (
            <Link
              href="/showreel"
              className="viewfinder group relative mx-auto flex aspect-video max-w-5xl items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-ink-800"
            >
              {poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset(poster)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
              ) : null}
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
              <span className="sheen" aria-hidden />
              {/* centered play ring with a slow sonar pulse */}
              <span className="relative flex items-center justify-center">
                <span
                  aria-hidden
                  className="absolute h-24 w-24 rounded-full border border-brand-500/50 opacity-0 transition group-hover:animate-ping group-hover:opacity-60"
                />
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/25 bg-black/45 shadow-glow backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-brand-400/70 group-hover:shadow-glow-lg">
                  <Play size={26} className="ml-1 fill-brand-500 text-brand-500" />
                </span>
              </span>
              <span className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-brand-600 px-8 py-3.5 font-semibold uppercase tracking-widest text-onbrand shadow-glow transition group-hover:shadow-glow-lg group-hover:brightness-110">
                Watch Showreel <ArrowRight size={18} />
              </span>
              <TimelineStrip />
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/** Thin timeline ruler under the frame — clips badge + playhead ticks. */
function TimelineStrip() {
  return (
    <div aria-hidden className="pointer-events-none absolute -bottom-7 left-0 right-0 hidden items-center gap-3 px-2 sm:flex">
      <span className="rounded border border-brand-500/30 bg-ink-900/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-brand-400">
        00:00:00:00
      </span>
      <span className="relative h-px flex-1 bg-white/10">
        {[...Array(9)].map((_, i) => (
          <span
            key={i}
            className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-white/15"
            style={{ left: `${(i + 1) * 10}%` }}
          />
        ))}
        {/* playhead resting where the reel starts */}
        <span className="absolute left-[10%] top-1/2 h-3.5 w-0.5 -translate-y-1/2 bg-brand-500 shadow-glow-sm" />
      </span>
      <span className="rounded border border-white/10 bg-ink-900/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500">
        REEL_2026
      </span>
    </div>
  );
}
