"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Maximum vertical drift in px across the element's trip through the viewport. */
  distance?: number;
};

/**
 * Subtle scroll parallax: children drift `distance` px (±) as the element
 * travels through the viewport. Disabled on touch devices (coarse pointers)
 * where compositing headroom is lower and every frame counts for scroll.
 */
export default function Parallax({ children, className, distance = 18 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // null while SSR/hydrating so the DOM structure never differs; resolved
  // after mount. Touch devices keep the full image (no drift).
  const [drift, setDrift] = useState(distance);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [drift, -drift]);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) setDrift(0);
  }, []);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
