import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import VideoPlayer from "@/components/portfolio/VideoPlayer";

type Props = {
  title: string;
  description: string;
  videoUrl?: string;
  poster?: string;
};

/** Full-width cinematic showreel band with a big player. */
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

        <Reveal delay={0.15} className="mt-12">
          {videoUrl ? (
            <VideoPlayer src={videoUrl} poster={poster} title={title} className="mx-auto max-w-5xl" />
          ) : (
            <Link
              href="/showreel"
              className="group relative mx-auto flex aspect-video max-w-5xl items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-ink-800"
            >
              {poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={poster} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
              ) : null}
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
              <span className="relative flex items-center gap-3 rounded-full bg-brand-600 px-8 py-4 font-semibold uppercase tracking-widest text-white shadow-glow transition group-hover:shadow-glow-lg">
                Watch Showreel <ArrowRight size={18} />
              </span>
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}
