"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type Props = { images: string[]; title: string };

/** Gallery grid with a simple lightbox. */
export default function GalleryGrid({ images, title }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-ink-800"
            aria-label={`Open image ${i + 1} of ${title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${title} — still ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-brand-400 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
              VIEW
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 p-5 backdrop-blur-sm"
            onClick={() => setOpenIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
          >
            <motion.button
              type="button"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative max-h-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[openIndex]}
                alt={`${title} — still ${openIndex + 1}`}
                className="max-h-[85vh] w-auto rounded-xl border border-white/10 shadow-glow"
              />
            </motion.button>
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-brand-500 hover:text-brand-400"
              aria-label="Close image viewer"
            >
              <X size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((openIndex - 1 + images.length) % images.length);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm text-white transition hover:border-brand-500 hover:text-brand-400"
              aria-label="Previous image"
            >
              ‹ Prev
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((openIndex + 1) % images.length);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm text-white transition hover:border-brand-500 hover:text-brand-400"
              aria-label="Next image"
            >
              Next ›
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
