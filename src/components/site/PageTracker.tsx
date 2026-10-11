"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Cookieless page-view tracking for the public site. Disabled in static
// (GitHub Pages) builds — there is no API there to receive the events.
export default function PageTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_STATIC === "1") return;
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/rate")) return;
    if (last.current === pathname) return;
    last.current = pathname;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      /* analytics must never break the page */
    });
  }, [pathname]);

  return null;
}
