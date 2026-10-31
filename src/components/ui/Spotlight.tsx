"use client";

import { useEffect, useRef } from "react";

/**
 * Desktop mouse-following spotlight. A fixed-size gradient disc is moved
 * with `transform` (compositor-only) instead of repainting a full-surface
 * gradient — no paint, no layout, one rAF-throttled update per frame.
 */
export default function Spotlight({ className = "" }: { className?: string }) {
  const discRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const disc = discRef.current;
    const wrap = wrapRef.current;
    if (!disc || !wrap) return;
    // Touch-only devices: no fine pointer, no spotlight.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    let active = false;

    const apply = () => {
      raf = 0;
      disc.style.transform = `translate(${x}px, ${y}px)`;
    };

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      if (!active) {
        active = true;
        wrap.classList.add("spotlight--on");
      }
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      active = false;
      wrap.classList.remove("spotlight--on");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Same DOM on server and client — the effect decides whether it runs.
  return (
    <div ref={wrapRef} className={`spotlight ${className}`} aria-hidden="true">
      <div ref={discRef} className="spotlight__disc" />
    </div>
  );
}
