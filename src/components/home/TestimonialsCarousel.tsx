"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import type { TestimonialDTO } from "@/lib/types";

const AUTOPLAY_MS = 7000;

export default function TestimonialsCarousel({ testimonials }: { testimonials: TestimonialDTO[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const count = testimonials.length;

  const go = useCallback(
    (next: number) => {
      setDir(next > index || (index === count - 1 && next === 0) ? 1 : -1);
      setIndex(((next % count) + count) % count);
    },
    [index, count]
  );

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;
  const current = testimonials[index];

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-brand-900/20 blur-[140px]"
      />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <p className="section-kicker justify-center">Testimonials</p>
        <h2 className="heading-display mt-4 text-4xl text-white sm:text-5xl lg:text-6xl">
          WHAT CLIENTS <span className="text-gradient">SAY</span>
        </h2>

        <div className="relative mt-14 min-h-[320px] sm:min-h-[280px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.figure
              key={current.id}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="glass relative rounded-3xl p-8 sm:p-12"
            >
              <Quote aria-hidden size={44} className="absolute -top-5 left-10 fill-brand-600 text-brand-600" />
              <div className="flex justify-center gap-1" aria-label={`Rated ${current.rating} out of 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < current.rating ? "fill-brand-500 text-brand-500" : "text-zinc-700"}
                  />
                ))}
              </div>
              <blockquote className="mt-6 text-lg leading-relaxed text-zinc-200 sm:text-xl">
                &ldquo;{current.content}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex items-center justify-center gap-4">
                {current.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={current.avatarUrl}
                    alt=""
                    className="h-14 w-14 rounded-full border-2 border-brand-500/60 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600/20 font-display text-xl text-brand-400">
                    {current.name.charAt(0)}
                  </span>
                )}
                <span className="text-left">
                  <span className="block font-semibold text-white">{current.name}</span>
                  <span className="block text-sm text-zinc-500">{current.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-brand-500/60 hover:text-brand-400"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? "w-8 bg-brand-500 shadow-glow-sm" : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-brand-500/60 hover:text-brand-400"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
