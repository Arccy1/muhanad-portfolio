import Reveal from "@/components/ui/Reveal";
import GlowButton from "@/components/ui/GlowButton";

type Props = { heading: string; subtext: string };

/** Big closing CTA band shown at the bottom of pages. */
export default function CTABand({ heading, subtext }: Props) {
  return (
    <section className="relative overflow-hidden border-t border-white/5 py-24 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/15 blur-[150px]"
      />
      <span
        aria-hidden
        className="text-stroke-red pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[13rem] opacity-20 lg:block"
      >
        CREATE
      </span>
      <Reveal className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="heading-display text-5xl text-white sm:text-6xl lg:text-7xl">
          {heading.split(" ").slice(0, -2).join(" ")}{" "}
          <span className="text-gradient">{heading.split(" ").slice(-2).join(" ")}</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base text-zinc-400 sm:text-lg">{subtext}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <GlowButton href="/contact">Start a Project</GlowButton>
          <GlowButton href="/portfolio" variant="ghost">
            See the Work
          </GlowButton>
        </div>
      </Reveal>
    </section>
  );
}
