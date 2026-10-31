"use client";

import { motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  /**
   * "fade" — soft rise + fade (default).
   * "cinematic" — adds a clip-path curtain wipe and a whisper of scale,
   * like a shot sliding onto the timeline. Use for hero visuals:
   * project grids, showreel frames, media.
   */
  variant?: "fade" | "cinematic";
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-triggered reveal used across all sections. The DOM structure is
 * identical on server and client; framer's MotionConfig (reducedMotion
 * ="user") strips the motion for reduced-motion visitors at runtime.
 */
export default function Reveal({ children, className, delay = 0, y = 28, once = true, variant = "fade" }: Props) {
  if (variant === "cinematic") {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: y * 0.6, clipPath: "inset(12% 6% 12% 6% round 16px)", scale: 0.985 }}
        whileInView={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 16px)", scale: 1 }}
        viewport={{ once, margin: "-60px" }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
