// One-shot migration: local PostgreSQL -> Supabase (database + storage).
//
// Usage:
//   node scripts/migrate-to-supabase.mjs --db      # copy database rows
//   node scripts/migrate-to-supabase.mjs --media   # upload media + rewrite URLs
//   node scripts/migrate-to-supabase.mjs --all     # both
//
// Required environment (reads .env automatically; CLI env overrides win):
//   SUPABASE_DB_URL   PostgreSQL connection string from Supabase
//                     (Dashboard -> Connect -> Connection string)
//   SUPABASE_URL      https://<ref>.supabase.co
//   SUPABASE_SERVICE_KEY  service_role key
//   SUPABASE_BUCKET   defaults to "media"
//
// Safe to re-run: data copy uses createMany skipDuplicates, media upload is
// deduped by SHA-256 and upserted, and URL rewriting is idempotent.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

// ---------- .env helpers (same pattern as backup-database.mjs) ----------
function envVar(name, fallback = "") {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  try {
    const m = fs.readFileSync(".env", "utf8").match(new RegExp(`^${name}="?([^"\\n]+)` + '"?', "m"));
    return m ? m[1] : fallback;
  } catch {
    return fallback;
  }
}

const SUPABASE_DB_URL = envVar("SUPABASE_DB_URL");
const SUPABASE_URL = (envVar("SUPABASE_URL") || "").replace(/\/$/, "");
const SUPABASE_SERVICE_KEY = envVar("SUPABASE_SERVICE_KEY");
const BUCKET = envVar("SUPABASE_BUCKET", "media");
const LOCAL_DB_URL = envVar("DATABASE_URL");

const stage = process.argv[2] || "--all";

if (stage !== "--db" && stage !== "--media" && stage !== "--all") {
  console.error("Usage: node scripts/migrate-to-supabase.mjs --db | --media | --all");
  process.exit(1);
}

// ---------- media helpers ----------
const IMAGE_EXT = ["png", "jpg", "jpeg", "webp", "gif", "svg", "avif"];
const VIDEO_EXT = ["mp4", "webm", "mov", "m4v"];
const AUDIO_EXT = ["mp3", "wav", "ogg", "m4a"];

function folderFor(file) {
  const ext = file.split(".").pop().toLowerCase();
  if (VIDEO_EXT.includes(ext)) return "videos";
  if (AUDIO_EXT.includes(ext)) return "audio";
  if (IMAGE_EXT.includes(ext)) return "images";
  return "documents";
}

function contentTypeFor(file) {
  const ext = file.split(".").pop().toLowerCase();
  const types = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
    gif: "image/gif", svg: "image/svg+xml", avif: "image/avif",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/x-m4v",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4",
    pdf: "application/pdf", zip: "application/zip", txt: "text/plain",
  };
  return types[ext] || "application/octet-stream";
}

async function uploadToStorage(buffer, objectPath, contentType) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`upload ${objectPath} failed (${res.status}): ${text.slice(0, 300)}`);
  }
}

async function storageUsage() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
  });
  return res.ok;
}

// ---------- main ----------
async function runDb() {
  if (!SUPABASE_DB_URL) {
    console.error("[X] SUPABASE_DB_URL is not set (Dashboard -> Connect -> Connection string)");
    process.exit(1);
  }
  if (!LOCAL_DB_URL) {
    console.error("[X] DATABASE_URL not found in .env");
    process.exit(1);
  }

  console.log("[1/3] Pushing Prisma schema to Supabase…");
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: SUPABASE_DB_URL },
  });

  const src = new PrismaClient({ datasources: { db: { url: LOCAL_DB_URL } } });
  const dst = new PrismaClient({ datasources: { db: { url: SUPABASE_DB_URL } } });

  try {
    console.log("[2/3] Copying rows local -> Supabase…");
    // Order respects foreign keys: Category before Project, Project before Rating.
    const tables = [
      ["adminUser", "AdminUser"],
      ["category", "Category"],
      ["siteContent", "SiteContent"],
      ["service", "Service"],
      ["skill", "Skill"],
      ["project", "Project"],
      ["post", "Post"],
      ["pageView", "PageView"],
      ["testimonial", "Testimonial"],
      ["cvExperience", "CvExperience"],
      ["rating", "Rating"],
      ["contactMessage", "ContactMessage"],
    ];
    for (const [model, label] of tables) {
      const rows = await src[model].findMany();
      if (!rows.length) {
        console.log(`    ${label}: 0 rows, skipped`);
        continue;
      }
      await dst[model].createMany({ data: rows, skipDuplicates: true });
      console.log(`    ${label}: ${rows.length} rows copied`);
    }

    console.log("[3/3] Verifying…");
    const projects = await dst.project.count();
    const admin = await dst.adminUser.count();
    console.log(`[OK] Supabase DB ready — ${projects} projects, admin user present: ${admin > 0}`);
  } finally {
    await src.$disconnect();
    await dst.$disconnect();
  }
}

async function runMedia() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("[X] SUPABASE_URL / SUPABASE_SERVICE_KEY not set in .env");
    process.exit(1);
  }
  if (!(await storageUsage())) {
    console.error("[X] Cannot reach Supabase Storage — check URL/key, and that the 'media' bucket exists");
    process.exit(1);
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const files = fs.readdirSync(uploadsDir).filter((f) => f !== ".gitkeep");
  if (!files.length) {
    console.log("[i] public/uploads is empty — nothing to upload");
    return;
  }

  // 1. Upload with SHA-256 dedupe (identical files upload once).
  console.log(`[1/3] Uploading ${files.length} files (deduped)…`);
  const byHash = new Map(); // hash -> objectPath
  const byName = new Map(); // original filename -> public URL
  let uploaded = 0;
  let saved = 0;
  for (const file of files) {
    const buf = fs.readFileSync(path.join(uploadsDir, file));
    const hash = createHash("sha256").update(buf).digest("hex");
    const folder = folderFor(file);
    const objectPath = `${folder}/${file}`;
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;

    if (byHash.has(hash)) {
      byName.set(file, byHash.get(hash).publicUrl);
      saved++;
      continue;
    }
    process.stdout.write(`    ${file} (${(buf.length / 1048576).toFixed(1)} MB) → ${objectPath}… `);
    await uploadToStorage(buf, objectPath, contentTypeFor(file));
    console.log("done");
    byHash.set(hash, { objectPath, publicUrl });
    byName.set(file, publicUrl);
    uploaded++;
  }
  console.log(`[OK] ${uploaded} uploaded, ${saved} duplicates skipped`);

  // 2. Persist the mapping for reference.
  const mapFile = path.join(process.cwd(), "scripts", "media-mapping.json");
  fs.writeFileSync(mapFile, JSON.stringify(Object.fromEntries(byName), null, 2));
  console.log(`[OK] URL mapping written to scripts/media-mapping.json`);

  // 3. Rewrite /uploads/<name> references in the Supabase database.
  if (!SUPABASE_DB_URL) {
    console.log("[2/3] Skipping database rewrite — SUPABASE_DB_URL not set");
    return;
  }
  console.log("[2/3] Rewriting media URLs in Supabase database…");
  const dst = new PrismaClient({ datasources: { db: { url: SUPABASE_DB_URL } } });
  try {
    const replaceIn = (text) => {
      if (!text) return text;
      let out = text;
      for (const [name, url] of byName) {
        out = out.split(`/uploads/${name}`).join(url);
      }
      return out;
    };

    const jobs = [
      ["project", ["videoUrl", "thumbnailUrl", "gallery", "beforeAfter", "process", "description"]],
      ["post", ["coverImage", "content"]],
      ["testimonial", ["avatarUrl"]],
      ["contactMessage", ["files"]],
      ["siteContent", ["value"]],
    ];
    for (const [model, fields] of jobs) {
      const rows = await dst[model].findMany();
      let changed = 0;
      for (const row of rows) {
        const data = {};
        for (const f of fields) {
          const next = replaceIn(row[f]);
          if (next !== row[f]) data[f] = next;
        }
        if (Object.keys(data).length) {
          await dst[model].update({ where: { id: row.id }, data });
          changed++;
        }
      }
      console.log(`    ${model}: ${changed} row(s) updated`);
    }
    console.log("[OK] Database now points at Supabase Storage URLs");
  } finally {
    await dst.$disconnect();
  }

  console.log("[3/3] Done. Local public/uploads kept as backup (not needed by the live site).");
}

(async () => {
  console.log("=== Migration to Supabase ===");
  if (stage === "--db" || stage === "--all") await runDb();
  if (stage === "--media" || stage === "--all") await runMedia();
  console.log("=== Migration finished ===");
})().catch((e) => {
  console.error("[X] Migration failed:", e.message);
  process.exit(1);
});
