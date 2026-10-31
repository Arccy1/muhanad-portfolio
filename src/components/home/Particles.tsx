"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
};

/**
 * Cinematic background: drifting embers connected by faint lines, gently
 * attracted toward the pointer. Pure canvas — no dependencies.
 *
 * Performance notes: dots are drawn from a pre-rendered glow sprite
 * (ctx.shadowBlur per dot is extremely slow), the device pixel ratio is
 * capped, and the whole loop pauses whenever the section scrolls out of
 * view so nothing burns frames off-screen.
 */
export default function Particles({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let sprite: HTMLCanvasElement | null = null;
    const pointer = { x: -9999, y: -9999 };
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // Pre-render the glowing dot once; per-frame drawImage is ~20x cheaper
    // than ctx.shadowBlur for every dot.
    const makeSprite = (light: boolean) => {
      const size = 24;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const g = c.getContext("2d");
      if (!g) return c;
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, light ? "rgba(37, 99, 235, 0.9)" : "rgba(140, 190, 255, 0.9)");
      grad.addColorStop(0.35, light ? "rgba(37, 99, 235, 0.35)" : "rgba(59, 130, 246, 0.45)");
      grad.addColorStop(1, "rgba(59, 130, 246, 0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      return c;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(80, Math.floor((width * height) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.6,
        a: Math.random() * 0.5 + 0.2,
      }));
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const LINK_DIST = 110;

    const tick = () => {
      // Re-read each frame so toggling the theme updates the canvas live.
      const light = document.documentElement.classList.contains("light");
      if (!sprite) sprite = makeSprite(light);
      const line = (alpha: number) =>
        light ? `rgba(37, 99, 235, ${alpha * 0.5})` : `rgba(59, 130, 246, ${alpha})`;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        // gentle attraction toward pointer
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 220 && dist > 0.001) {
          p.vx += (dx / dist) * 0.012;
          p.vy += (dy / dist) * 0.012;
        }
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      }

      // link lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.14;
            ctx.strokeStyle = line(alpha);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // glowing dots via sprite
      for (const p of particles) {
        const size = p.r * 8;
        ctx.globalAlpha = p.a;
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };

    // Pause the loop entirely when the section is off-screen.
    let inView = true;
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !raf) raf = requestAnimationFrame(tick);
      if (!inView && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(canvas);

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
