import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { isStorageConfigured, uploadToSupabase, SUPABASE_BUCKET } from "@/lib/supabase";
import { clientIp, rateLimit, tooMany } from "@/lib/rateLimit";

export const runtime = "nodejs";

const IMAGE_EXT = ["png", "jpg", "jpeg", "webp", "gif", "svg", "avif"];
const VIDEO_EXT = ["mp4", "webm", "mov", "m4v"];
const AUDIO_EXT = ["mp3", "wav", "ogg", "m4a"];
const DOC_EXT = ["pdf", "doc", "docx", "txt", "zip"];
const ALLOWED_EXT = [...IMAGE_EXT, ...VIDEO_EXT, ...AUDIO_EXT, ...DOC_EXT];
const MAX_SIZE = 200 * 1024 * 1024; // 200 MB (free plan: 50 MB per Supabase upload)

function folderFor(isImage: boolean, isVideo: boolean, isAudio: boolean): string {
  if (isVideo) return "videos";
  if (isAudio) return "audio";
  if (isImage) return "images";
  return "documents";
}

function contentTypeFor(ext: string): string {
  const types: Record<string, string> = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
    gif: "image/gif", svg: "image/svg+xml", avif: "image/avif",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/x-m4v",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4",
    pdf: "application/pdf", doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain", zip: "application/zip",
  };
  return types[ext] || "application/octet-stream";
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();
  const rl = rateLimit(`upload:${clientIp(req)}`, 30, 60 * 60 * 1000);
  if (!rl.ok) return tooMany(rl.retryAfterSeconds);
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File is larger than 200 MB." }, { status: 413 });
    }

    const rawExt = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const isImage = file.type.startsWith("image/") || IMAGE_EXT.includes(rawExt);
    const isVideo = file.type.startsWith("video/") || VIDEO_EXT.includes(rawExt);
    const isAudio = file.type.startsWith("audio/") || AUDIO_EXT.includes(rawExt);
    const isDoc = DOC_EXT.includes(rawExt);
    if (!isImage && !isVideo && !isAudio && !isDoc) {
      return NextResponse.json({ error: "Only image, video, audio, or document files are allowed." }, { status: 415 });
    }
    const ext = ALLOWED_EXT.includes(rawExt) ? rawExt : isVideo ? "mp4" : isImage ? "png" : "bin";

    const contentType = contentTypeFor(ext) || file.type || "application/octet-stream";
    const buffer = Buffer.from(await file.arrayBuffer());

    if (isStorageConfigured()) {
      // Supabase free plan caps a single upload at 50 MB — fail early with a
      // clear message instead of a raw storage error mid-request.
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File exceeds 50 MB (storage free-plan limit). Compress the video first." },
          { status: 413 }
        );
      }
      // Upload to Supabase Storage
      const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
      const folder = folderFor(isImage, isVideo, isAudio);
      const { url } = await uploadToSupabase(buffer, filename, contentType, folder);
      return NextResponse.json({ url, type: isVideo ? "video" : isImage ? "image" : "document" }, { status: 201 });
    }

    // Fallback: local filesystem (for local development without Supabase)
    const { mkdir, writeFile } = await import("node:fs/promises");
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    await writeFile(join(uploadsDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}`, type: isVideo ? "video" : isImage ? "image" : "document" }, { status: 201 });
  } catch (e) {
    console.error("[upload] error:", e);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
