"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Desktop mouse-following spotlight. Renders an absolutely-positioned layer
 * whose radial gradient tracks the pointer via CSS variables (rAF-throttled,
 * transform-free — just two custom property updates per frame).
 */
export default function Spotlight({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    // Touch-only devices: no fine pointer, no spotlight.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    let active = false;

    const apply = () => {
      raf = 0;
      el.style.setProperty("--spot-x", `${x}px`);
      el.style.setProperty("--spot-y", `${y}px`);
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      if (!active) {
        active = true;
        el.classList.add("spotlight--on");
      }
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      active = false;
      el.classList.remove("spotlight--on");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  // Always render the same DOM (server and client) — the effect above
  // decides whether the spotlight ever turns on.
  return <div ref={ref} className={`spotlight ${className}`} aria-hidden="true" />;
}
