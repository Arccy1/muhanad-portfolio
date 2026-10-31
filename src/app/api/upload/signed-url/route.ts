import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { createSignedUploadUrl, isStorageConfigured } from "@/lib/supabase";
import { clientIp, rateLimit, tooMany } from "@/lib/rateLimit";

export const runtime = "nodejs";

// Same whitelists as /api/upload — validation happens BEFORE signing so the
// client can only ever receive a URL scoped to an allowed file type.
const IMAGE_EXT = ["png", "jpg", "jpeg", "webp", "gif", "svg", "avif"];
const VIDEO_EXT = ["mp4", "webm", "mov", "m4v"];
const AUDIO_EXT = ["mp3", "wav", "ogg", "m4a"];
const DOC_EXT = ["pdf", "doc", "docx", "txt", "zip"];
const ALLOWED_EXT = [...IMAGE_EXT, ...VIDEO_EXT, ...AUDIO_EXT, ...DOC_EXT];

function folderFor(ext: string): string {
  if (VIDEO_EXT.includes(ext)) return "videos";
  if (AUDIO_EXT.includes(ext)) return "audio";
  if (IMAGE_EXT.includes(ext)) return "images";
  return "documents";
}

/**
 * Returns a short-lived signed upload URL for ONE object. The browser then
 * uploads the file straight to Supabase Storage — needed for files larger
 * than Vercel's 4.5 MB serverless request limit (videos).
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();
  const rl = rateLimit(`upload-sign:${clientIp(req)}`, 60, 60 * 60 * 1000);
  if (!rl.ok) return tooMany(rl.retryAfterSeconds);

  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "Direct large uploads need Supabase Storage configured. Use a file under 3 MB." },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const rawName = String(body.filename ?? "");
    const rawExt = (rawName.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!ALLOWED_EXT.includes(rawExt)) {
      return NextResponse.json({ error: "File type not allowed." }, { status: 415 });
    }

    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${rawExt}`;
    const { uploadUrl, publicUrl } = await createSignedUploadUrl(filename, folderFor(rawExt));
    return NextResponse.json({ uploadUrl, publicUrl, contentType: body.contentType || null }, { status: 201 });
  } catch (e) {
    console.error("[upload/signed-url] error:", e);
    return NextResponse.json({ error: "Could not prepare the upload. Please try again." }, { status: 500 });
  }
}
