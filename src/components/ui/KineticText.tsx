"use client";

import { motion } from "framer-motion";

type Props = {
  text: string;
  className?: string;
  /** Delay before the first letter animates in. */
  delay?: number;
  /** Seconds between letters. */
  stagger?: number;
  /** Render the final word with the brand glow + gradient (the "tail"). */
  highlightTail?: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Kinetic typography: each word wraps as an unbreakable unit and every
 * letter rises in with a blur-to-sharp reveal. The DOM structure is
 * identical on server and client (no useReducedMotion render branches —
 * framer's MotionConfig strips the motion for reduced-motion users).
 */
export default function KineticText({ text, className, delay = 0, stagger = 0.028, highlightTail = false }: Props) {
  const words = text.trim().split(/\s+/);
  let letterIndex = 0;

  return (
    <span className={className} aria-label={text}>
      {words.map((word, wi) => {
        const isTail = highlightTail && wi === words.length - 1;
        const letters = Array.from(word);
        const nodes = letters.map((ch, li) => {
          const i = letterIndex++;
          return (
            <motion.span
              key={`${wi}-${li}`}
              aria-hidden
              className={`kinetic-letter ${isTail ? "text-gradient" : ""}`}
              initial={{ opacity: 0, y: "0.65em", rotateX: -55, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: delay + i * stagger, ease: EASE }}
            >
              {ch}
            </motion.span>
          );
        });
        // count the space between words as a beat
        if (wi < words.length - 1) letterIndex++;
        return (
          <span key={wi} className={`kinetic-word ${isTail ? "kinetic-tail drop-shadow-[0_0_30px_rgb(var(--c-brand-500)/0.35)]" : ""}`}>
            {nodes}
            {wi < words.length - 1 ? "\u00A0" : null}
          </span>
        );
      })}
    </span>
  );
}
