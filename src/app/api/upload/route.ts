import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { clientIp, rateLimit, tooMany } from "@/lib/rateLimit";

export const runtime = "nodejs";

const IMAGE_EXT = ["png", "jpg", "jpeg", "webp", "gif", "svg", "avif"];
const VIDEO_EXT = ["mp4", "webm", "mov", "m4v"];
const MAX_SIZE = 200 * 1024 * 1024; // 200 MB

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
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Only image or video files are allowed." }, { status: 415 });
    }
    const ext = [...IMAGE_EXT, ...VIDEO_EXT].includes(rawExt) ? rawExt : isImage ? "png" : "mp4";

    const dir = join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ url: `/uploads/${name}`, type: isImage ? "image" : "video" }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
