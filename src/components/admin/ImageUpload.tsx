"use client";

import { useRef, useState } from "react";
import { FileVideo, ImagePlus, Loader2, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label: string;
  accept?: string;
  hint?: string;
};

/** Upload (or paste a URL for) a single image / video. */
export default function ImageUpload({ value, onChange, label, accept = "image/*", hint }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isVideo = accept.includes("video");

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
      } else {
        onChange(data.url);
      }
    } catch {
      setError("Upload failed — check your connection.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">{label}</span>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/[0.02] transition hover:border-brand-500/60 disabled:opacity-60"
          aria-label={`Upload ${label}`}
        >
          {value ? (
            isVideo ? (
              <span className="flex flex-col items-center gap-1.5 text-brand-400">
                <FileVideo size={22} />
                <span className="max-w-[130px] truncate text-[10px] text-zinc-500">{value}</span>
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="h-full w-full object-cover" />
            )
          ) : uploading ? (
            <Loader2 size={22} className="animate-spin text-brand-500" />
          ) : (
            <span className="flex flex-col items-center gap-1.5 text-zinc-600">
              <ImagePlus size={22} />
              <span className="text-[10px] uppercase tracking-widest">Upload</span>
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60"
          />
          {hint && <p className="mt-1.5 text-[11px] text-zinc-600">{hint}</p>}
          {error && <p className="mt-1.5 text-[11px] text-brand-400">{error}</p>}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-zinc-600 transition hover:text-brand-400"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Upload (or paste) multiple gallery images. */
export function MultiImageUpload({
  values,
  onChange,
  label,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
  label: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList) {
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (res.ok) uploaded.push(data.url);
      }
      onChange([...values, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">{label}</span>
      <div className="flex flex-wrap gap-3">
        {values.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative h-20 w-32 overflow-hidden rounded-lg border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-onbrand opacity-0 transition group-hover:opacity-100"
              aria-label={`Remove image ${i + 1}`}
            >
              <X size={13} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-white/15 text-zinc-600 transition hover:border-brand-500/60 hover:text-brand-400 disabled:opacity-60"
          aria-label={`Add ${label}`}
        >
          {uploading ? <Loader2 size={18} className="animate-spin text-brand-500" /> : <ImagePlus size={18} />}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) upload(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
