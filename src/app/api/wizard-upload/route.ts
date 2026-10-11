import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { clientIp, rateLimit, tooMany } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

// Public uploads for the start-a-project wizard: reference files clients
// attach. Heavily restricted: 10 MB max, 8 per hour per IP, documents/images
// only (no videos — those come after first contact).
const ALLOWED = ["pdf", "doc", "docx", "txt", "png", "jpg", "jpeg", "webp", "zip"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const rl = rateLimit(`wizard:${clientIp(req)}`, 8, 60 * 60 * 1000);
  if (!rl.ok) return tooMany(rl.retryAfterSeconds);
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Files must be under 10 MB." }, { status: 413 });
    }
    const ext = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!ALLOWED.includes(ext)) {
      return NextResponse.json(
        { error: "Allowed file types: PDF, Word, TXT, images, ZIP." },
        { status: 415 }
      );
    }

    const dir = join(process.cwd(), "public", "uploads", "briefs");
    await mkdir(dir, { recursive: true });
    const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ url: `/uploads/briefs/${name}` }, { status: 201 });
  } catch (e) {
    logError("wizard-upload", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
