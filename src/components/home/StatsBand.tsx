"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/** Animated stat: counts up when scrolled into view (supports "250+", "50M+"). */
export function StatNumber({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const match = value.match(/^(\d+)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }
    const target = parseInt(match[1], 10);
    const suffix = match[2];
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(`${Math.round(target * eased)}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

type StatsProps = { stats: { label: string; value: string }[] };

export function StatsBand({ stats }: StatsProps) {
  return (
    <section className="relative border-y border-white/5 bg-ink-800/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-5 sm:px-8 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="relative px-4 py-10 text-center">
            <StatNumber
              value={stat.value}
              className="heading-display block text-4xl text-white sm:text-5xl"
            />
            <span
              aria-hidden
              className="mx-auto mt-2 block h-px w-10 bg-gradient-to-r from-transparent via-brand-500 to-transparent"
            />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
