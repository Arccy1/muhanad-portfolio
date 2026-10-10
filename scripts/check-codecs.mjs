// Diagnostic: walk MP4 boxes to find the video codec (avc1 = H.264,
// hvc1/hev1 = HEVC, etc.) and whether moov is at the start (faststart).
import fs from "node:fs";

function walk(buf, start, end, depth, out) {
  let pos = start;
  while (pos + 8 <= end) {
    let size = buf.readUInt32BE(pos);
    const type = buf.toString("latin1", pos + 4, pos + 8);
    let headerSize = 8;
    if (size === 1) {
      // 64-bit size
      size = Number(buf.readBigUInt64BE(pos + 8));
      headerSize = 16;
    }
    if (size < headerSize || pos + size > end) break;
    out.push({ type, pos, size, depth });
    if (["moov", "trak", "mdia", "minf", "stbl", "stsd"].includes(type) && depth < 6) {
      walk(buf, pos + headerSize, pos + size, depth + 1, out);
    }
    pos += size;
  }
}

for (const file of fs.readdirSync("public/uploads").filter((f) => f.endsWith(".mp4"))) {
  const buf = fs.readFileSync(join("public/uploads", file));
  const s = buf.toString("latin1");
  let codec = "unknown";
  if (s.includes("avc1")) codec = "avc1 = H.264 ✓ browsers play this";
  else if (s.includes("hvc1") || s.includes("hev1")) codec = "HEVC ✗ browsers usually CANNOT play this";
  else if (s.includes("av01")) codec = "av01 = AV1";
  else if (s.includes("vp09")) codec = "vp09 = VP9";
  const sizeMB = (buf.length / 1048576).toFixed(1);
  console.log(`${file} => codec: ${codec} | ${sizeMB}MB`);
}

function join(a, b) {
  return a + "/" + b;
}
