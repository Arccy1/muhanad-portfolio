"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Global error boundary — reports to the local error log, then offers a reload.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: error.message, digest: error.digest, path: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#04070e", color: "#e4e4e7", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 12 }}>SOMETHING WENT WRONG</h1>
            <p style={{ color: "#a1a1aa", marginBottom: 24 }}>
              An unexpected error occurred{error.digest ? ` (ref: ${error.digest})` : ""}. It has been logged.
            </p>
            <button
              onClick={reset}
              style={{
                background: "linear-gradient(90deg,#2563EB,#3B82F6)",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "12px 28px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
