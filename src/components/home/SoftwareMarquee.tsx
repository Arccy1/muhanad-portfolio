const TOOLS = [
  "Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Photoshop",
  "Audition",
  "Illustrator",
  "Cinema 4D",
  "Media Encoder",
];

/** Infinite marquee of the tools used daily. */
export default function SoftwareMarquee() {
  const row = [...TOOLS, ...TOOLS];
  return (
    <section aria-label="Software tools" className="relative overflow-hidden border-b border-white/5 py-7">
      <div className="pause-on-hover pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-ink to-transparent" />
      <div className="pause-on-hover pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-ink to-transparent" />
      <div className="flex w-max animate-marquee items-center gap-10 pl-10">
        {row.map((tool, i) => (
          <span key={`${tool}-${i}`} className="flex items-center gap-10">
            <span className="whitespace-nowrap font-display text-2xl tracking-[0.15em] text-zinc-600 transition-colors hover:text-brand-400">
              {tool.toUpperCase()}
            </span>
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-600/70 shadow-glow-sm" />
          </span>
        ))}
      </div>
    </section>
  );
}
