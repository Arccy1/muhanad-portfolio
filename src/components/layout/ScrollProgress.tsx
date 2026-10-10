"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Thin red progress bar fixed to the top of the viewport. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="no-print fixed inset-x-0 top-0 z-[90] h-[3px] origin-left bg-gradient-to-r from-brand-700 via-brand-500 to-brand-300"
    />
  );
}
