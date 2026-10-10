"use client";

import { useState } from "react";
import { AlertTriangle, Play } from "lucide-react";
import { asset, cn } from "@/lib/utils";

type Props = {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
};

/** True for YouTube/Vimeo links which render as privacy-friendly iframes. */
function isEmbed(src: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(src);
}

function youtubeEmbed(src: string): string {
  const m = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0` : src;
}

/**
 * Cinematic video player: shows the poster with a glowing play button,
 * then swaps in the native player (or an embed) on click.
 */
export default function VideoPlayer({ src, poster, title, className }: Props) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const resolvedSrc = asset(src);

  return (
    <div className={cn("group relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-card", className)}>
      {playing ? (
        failed ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
            <AlertTriangle size={40} className="text-brand-400" />
            <p className="font-display text-2xl tracking-wide text-white">VIDEO CAN&apos;T BE PLAYED</p>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400">
              This video format isn&apos;t supported by your browser, or the file moved.
              Try a different browser, or contact me and I&apos;ll send the file directly.
            </p>
            <button
              type="button"
              onClick={() => {
                setFailed(false);
                setPlaying(false);
              }}
              className="mt-2 rounded-full border border-white/20 px-6 py-2.5 text-sm text-zinc-200 transition hover:border-brand-500/60 hover:text-brand-400"
            >
              Go back
            </button>
          </div>
        ) : isEmbed(resolvedSrc) ? (
          <iframe
            src={youtubeEmbed(resolvedSrc)}
            title={title || "Video player"}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={resolvedSrc}
            poster={poster}
            controls
            autoPlay
            playsInline
            preload="metadata"
            onError={() => setFailed(true)}
            className="h-full w-full"
          />
        )
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="relative block h-full w-full"
          aria-label={title ? `Play video: ${title}` : "Play video"}
        >
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-ink-900 to-brand-950" />
          )}
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-brand-500/70 group-hover:shadow-glow-lg sm:h-24 sm:w-24">
              <span aria-hidden className="absolute inset-0 animate-ping rounded-full border border-brand-500/40" />
              <Play size={30} className="ml-1.5 fill-brand-500 text-brand-500" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

