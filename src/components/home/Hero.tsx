"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Play } from "lucide-react";
import Particles from "./Particles";
import GlowButton from "@/components/ui/GlowButton";

type Props = {
  badge: string;
  heading: string;
  subheading: string;
  description: string;
  videoUrl?: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Hero({ badge, heading, subheading, description, videoUrl }: Props) {
  const reduce = useReducedMotion();

  // Highlight the last word of the name in brand red.
  const words = heading.trim().split(/\s+/);
  const head = words.slice(0, -1).join(" ");
  const tail = words[words.length - 1] ?? "";

  return (
    <section className="grain relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Background video (optional, admin-managed) */}
      {videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          src={videoUrl}
          autoPlay={!reduce}
          muted
          loop
          playsInline
          aria-hidden
        />
      ) : null}

      {/* Backdrop layers */}
      <div aria-hidden className="absolute inset-0 bg-ink/70" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[160px]"
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-brand-800/30 blur-[120px]"
      />
      <Particles className="absolute inset-0 h-full w-full" />

      {/* Giant watermark */}
      <span
        aria-hidden
        className="text-stroke pointer-events-none absolute -right-6 top-1/2 hidden -translate-y-1/2 select-none font-display text-[11rem] leading-none opacity-40 xl:block"
      >
        2026
      </span>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-28 pt-36 sm:px-8 lg:pb-32">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="inline-flex items-center gap-2.5 rounded-full border border-brand-500/40 bg-brand-600/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-400 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
          </span>
          {badge}
        </motion.p>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
          className="heading-display mt-7 text-[15vw] text-white sm:text-7xl lg:text-8xl xl:text-[7.5rem]"
        >
          {head}{" "}
          <span className="text-gradient drop-shadow-[0_0_30px_rgba(229,9,20,0.35)]">{tail}</span>
        </motion.h1>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
          className="mt-6 flex items-center gap-4"
        >
          <span aria-hidden className="h-px w-14 bg-gradient-to-r from-brand-500 to-transparent" />
          <p className="font-display text-xl tracking-[0.3em] text-brand-400 sm:text-2xl">{subheading}</p>
        </motion.div>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
        >
          {description}
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <GlowButton href="/portfolio">
            <Play size={16} className="fill-current" />
            View My Work
          </GlowButton>
          <GlowButton href="/contact" variant="ghost">
            Contact Me
          </GlowButton>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#featured"
        aria-label="Scroll down"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
      >
        <span className="flex flex-col items-center gap-2 text-zinc-500 transition-colors hover:text-brand-400">
          <span className="text-[10px] font-semibold uppercase tracking-[0.4em]">Scroll</span>
          <motion.span animate={reduce ? {} : { y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ChevronDown size={18} />
          </motion.span>
        </span>
      </motion.a>
    </section>
  );
}
