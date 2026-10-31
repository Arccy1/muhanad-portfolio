"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Maximum vertical drift in px across the element's trip through the viewport. */
  distance?: number;
};

/**
 * Subtle scroll parallax: children drift `distance` px (±) as the element
 * travels through the viewport. Structure is identical on server and client;
 * the drift is zeroed for reduced-motion visitors at runtime.
 */
export default function Parallax({ children, className, distance = 18 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [distance, -distance]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
