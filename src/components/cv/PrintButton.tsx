"use client";

import { Printer } from "lucide-react";

/** Opens the browser print dialog — visitors can save the CV as a PDF. */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-onbrand shadow-glow transition hover:shadow-glow-lg hover:brightness-110"
    >
      <Printer size={15} />
      Print / Save as PDF
    </button>
  );
}
