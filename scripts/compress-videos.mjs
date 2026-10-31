// Compresses oversized videos in public/uploads so they fit Supabase's free
// plan (50 MB per-file upload limit).
//
//   node scripts/compress-videos.mjs [maxMB]
//
// - Only touches videos LARGER than maxMB (default 45).
// - Re-encodes to H.264 MP4, scales down to 720p, CRF 27, AAC 96k.
// - If the result is still too big, retries at 480p / CRF 31.
// - Writes <name>.compressed.mp4 next to the original and prints a rename
//   command summary; originals are kept until you confirm the swap.
//
// Requires ffmpeg at C:\Users\mohan\ffmpeg\bin\ffmpeg.exe
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const FFMPEG = "C:/Users/mohan/ffmpeg/bin/ffmpeg.exe";
const FFPROBE = "C:/Users/mohan/ffmpeg/bin/ffprobe.exe";
const MAX_MB = Number(process.argv[2] || 45);
const UPLOADS = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(FFMPEG)) {
  console.error(`[X] ffmpeg not found at ${FFMPEG} — install it first (see DEPLOY-VERCEL.md)`);
  process.exit(1);
}

const videos = fs
  .readdirSync(UPLOADS)
  .filter((f) => /\.(mp4|mov|m4v|webm)$/i.test(f))
  .map((f) => ({ file: f, size: fs.statSync(path.join(UPLOADS, f)).size }))
  .filter((v) => v.size > MAX_MB * 1024 * 1024);

if (!videos.length) {
  console.log(`[i] No videos over ${MAX_MB} MB — nothing to do`);
  process.exit(0);
}

function probe(file) {
  try {
    const out = execFileSync(
      FFPROBE,
      ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file],
      { encoding: "utf8" }
    ).trim();
    const [w, h] = out.split(",").map(Number);
    return { w: w || 1920, h: h || 1080 };
  } catch {
    return { w: 1920, h: 1080 };
  }
}

function run(args) {
  execFileSync(FFMPEG, ["-y", "-v", "error", ...args], { stdio: "inherit" });
}

function compress(src, dst, targetHeight, crf) {
  const { h } = probe(src);
  const scale = h > targetHeight ? `scale=-2:${targetHeight}` : "scale=trunc(iw/2)*2:trunc(ih/2)*2";
  run([
    "-i", src,
    "-vf", scale,
    "-c:v", "libx264", "-preset", "medium", "-crf", String(crf), "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "96k",
    "-movflags", "+faststart",
    dst,
  ]);
}

console.log(`${videos.length} video(s) over ${MAX_MB} MB:\n`);
const results = [];
for (const { file, size } of videos) {
  const src = path.join(UPLOADS, file);
  const outName = file.replace(/\.[^.]+$/, "") + ".compressed.mp4";
  const dst = path.join(UPLOADS, outName);
  const before = (size / 1048576).toFixed(1);

  console.log(`→ ${file} (${before} MB)`);
  let ok = false;
  // Pass 1: 720p CRF 27. Pass 2 (if still too big): 480p CRF 31.
  for (const [h, crf] of [[720, 27], [480, 31]]) {
    try {
      compress(src, dst, h, crf);
      const outSize = fs.statSync(dst).size;
      if (outSize <= MAX_MB * 1024 * 1024) {
        console.log(`  [OK] ${(outSize / 1048576).toFixed(1)} MB (${h}p CRF${crf}) → ${outName}`);
        results.push({ file, outName, ok: true });
        ok = true;
        break;
      }
      console.log(`  [i] still ${(outSize / 1048576).toFixed(1)} MB — retrying smaller…`);
    } catch (e) {
      console.error(`  [X] ffmpeg failed: ${e.message}`);
      break;
    }
  }
  if (!ok && !fs.existsSync(dst)) results.push({ file, outName, ok: false });
  if (ok === false && fs.existsSync(dst) && fs.statSync(dst).size > MAX_MB * 1024 * 1024) {
    console.log(`  [!] Best effort output kept (${outName}) — still over ${MAX_MB} MB`);
    results.push({ file, outName, ok: false });
  }
}

console.log("\n=== Summary ===");
for (const r of results) {
  console.log(`${r.ok ? "[OK]" : "[!]"} ${r.file} -> ${r.outName}`);
}
console.log("\nNext: verify the compressed files play correctly, then replace the originals:");
console.log("  (each compressed file must replace its original BEFORE running the media migration)");
