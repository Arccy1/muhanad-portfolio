/**
 * Generates cinematic SVG placeholder assets for the portfolio into /public/images
 * and writes prisma/placeholder-manifest.json for the seed script to consume.
 *
 * Run: npm run placeholders
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "images");
mkdirSync(OUT, { recursive: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const PROJECTS = [
  { slug: "neon-nights", title: "NEON NIGHTS", tag: "SHORT FORM" },
  { slug: "street-style-reels", title: "STREET STYLE", tag: "SHORT FORM" },
  { slug: "echoes-of-the-desert", title: "ECHOES OF THE DESERT", tag: "DOCUMENTARY" },
  { slug: "founders-journey", title: "THE FOUNDER'S JOURNEY", tag: "PODCAST" },
  { slug: "pulse-energy-ad", title: "PULSE ENERGY", tag: "COMMERCIAL" },
  { slug: "aurora-skincare", title: "AURORA SKINCARE", tag: "BRAND FILM" },
  { slug: "mwm-logo-reveal", title: "MWM LOGO REVEAL", tag: "MOTION GRAPHICS" },
  { slug: "kinetic-typography", title: "KINETIC TYPE", tag: "MOTION GRAPHICS" },
  { slug: "valorant-ace-montage", title: "ACE MONTAGE", tag: "GAMING" },
  { slug: "fps-highlight-reel", title: "HIGHLIGHT REEL", tag: "GAMING" },
  { slug: "ramadan-campaign", title: "RAMADAN CAMPAIGN", tag: "SOCIAL MEDIA" },
  { slug: "launch-promo-pack", title: "LAUNCH PROMO", tag: "SOCIAL MEDIA" },
];

// dark gradient bases (all warm / neutral — stays on brand)
const BACKDROPS = [
  ["#0b0b0d", "#1c0909"],
  ["#0d0a08", "#22100a"],
  ["#08080a", "#190606"],
  ["#0c0b0a", "#1f0d08"],
];
const ACCENTS = ["#E50914", "#FF4D3D", "#C60712", "#FF6B4A"];

function defs(seed) {
  const [a, b] = BACKDROPS[seed % BACKDROPS.length];
  const accent = ACCENTS[seed % ACCENTS.length];
  return `
  <defs>
    <linearGradient id="bg${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
    <radialGradient id="glow${seed}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade${seed}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="redline${seed}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E50914"/>
      <stop offset="100%" stop-color="#FF6B4A"/>
    </linearGradient>
  </defs>`;
}

function composition(seed, w = 1600, h = 900) {
  const accent = ACCENTS[seed % ACCENTS.length];
  const gx = seed % 2 === 0 ? w - 380 : 380;
  const rot = -18 + (seed % 3) * 6;
  const shapes = [];
  // diagonal light streaks
  for (let i = 0; i < 3; i++) {
    shapes.push(
      `<rect x="${-200 + i * 260}" y="${-100}" width="60" height="${h + 300}" fill="${accent}" opacity="0.05" transform="rotate(${rot} ${w / 2} ${h / 2})"/>`
    );
  }
  // ring
  shapes.push(
    `<circle cx="${gx}" cy="${Math.round(h * 0.32)}" r="${170 + (seed % 3) * 24}" fill="none" stroke="${accent}" stroke-opacity="0.28" stroke-width="2"/>`
  );
  shapes.push(
    `<circle cx="${gx}" cy="${Math.round(h * 0.32)}" r="${70 + (seed % 4) * 10}" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1.5"/>`
  );
  // grid dots
  shapes.push(
    `<g opacity="0.16">${Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 14 }, (_, c) => `<circle cx="${70 + c * 42}" cy="${60 + r * 42}" r="2" fill="#ffffff"/>`).join("")
    ).join("")}</g>`
  );
  return shapes.join("\n");
}

function playButton(cx, cy, r = 64) {
  return `
  <g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E50914" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="8 6"/>
    <path d="M ${cx - 18} ${cy - 26} L ${cx + 30} ${cy} L ${cx - 18} ${cy + 26} Z" fill="#E50914" fill-opacity="0.92"/>
  </g>`;
}

function filmStrip(y, w) {
  const holes = Array.from({ length: Math.floor(w / 56) }, (_, i) => {
    const x = 20 + i * 56;
    return `<rect x="${x}" y="${y}" width="30" height="16" rx="3" fill="#ffffff" opacity="0.08"/>`;
  }).join("");
  return `<rect x="0" y="${y - 14}" width="${w}" height="44" fill="#000" opacity="0.55"/>${holes}`;
}

function thumbSvg({ title, tag, seed, index }) {
  const w = 1600, h = 900;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs(seed)}
  <rect width="${w}" height="${h}" fill="url(#bg${seed})"/>
  ${composition(seed, w, h)}
  <ellipse cx="${seed % 2 === 0 ? w - 380 : 380}" cy="${Math.round(h * 0.32)}" rx="420" ry="300" fill="url(#glow${seed})"/>
  ${playButton(w / 2, h / 2 - 20)}
  ${filmStrip(h - 30, w)}
  <rect width="${w}" height="${h}" fill="url(#fade${seed})" opacity="0.75"/>
  <text x="80" y="60" font-family="Arial Black, Arial, sans-serif" font-size="34" fill="#E50914" letter-spacing="6">MWM</text>
  <text x="${w - 80}" y="60" text-anchor="end" font-family="Arial, sans-serif" font-size="30" fill="#ffffff" fill-opacity="0.35" letter-spacing="4">${esc(index)}</text>
  <text x="80" y="${h - 190}" font-family="Arial, sans-serif" font-weight="bold" font-size="28" fill="#FF4D48" letter-spacing="10">${esc(tag)}</text>
  <text x="78" y="${h - 110}" font-family="Arial Black, Arial, sans-serif" font-size="76" fill="#ffffff">${esc(title)}</text>
  <rect x="80" y="${h - 84}" width="140" height="6" rx="3" fill="url(#redline${seed})"/>
</svg>`;
}

function gallerySvg({ seed, frame, label }) {
  const w = 1600, h = 900;
  const accent = ACCENTS[(seed + frame) % ACCENTS.length];
  const variants = [
    `<circle cx="${w / 2}" cy="${h / 2}" r="220" fill="none" stroke="${accent}" stroke-opacity="0.5" stroke-width="3"/>
     <circle cx="${w / 2}" cy="${h / 2}" r="120" fill="${accent}" fill-opacity="0.12"/>`,
    `<path d="M 200 700 L ${w / 2} 220 L ${w - 200} 700 Z" fill="none" stroke="${accent}" stroke-opacity="0.55" stroke-width="3"/>
     <path d="M 340 700 L ${w / 2} 400 L ${w - 340} 700 Z" fill="${accent}" fill-opacity="0.1"/>`,
    `<g stroke="${accent}" stroke-opacity="0.5" stroke-width="3" fill="none">
       <rect x="${w / 2 - 260}" y="${h / 2 - 160}" width="520" height="320" rx="24"/>
       <rect x="${w / 2 - 200}" y="${h / 2 - 100}" width="400" height="200" rx="12" fill="${accent}" fill-opacity="0.1"/>
     </g>`,
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs(seed + frame)}
  <rect width="${w}" height="${h}" fill="url(#bg${seed + frame})"/>
  ${composition(seed + frame, w, h)}
  ${variants[frame % variants.length]}
  <ellipse cx="${w / 2}" cy="${h / 2}" rx="500" ry="320" fill="url(#glow${seed + frame})"/>
  <text x="80" y="810" font-family="Arial Black, Arial, sans-serif" font-size="120" fill="#ffffff" fill-opacity="0.14">0${frame + 1}</text>
  <text x="${w - 80}" y="810" text-anchor="end" font-family="Arial, sans-serif" font-size="26" fill="#ffffff" fill-opacity="0.4" letter-spacing="6">${esc(label)}</text>
</svg>`;
}

function beforeAfterSvg(mode, seed) {
  const w = 1600, h = 900;
  const before = mode === "before";
  const skyTop = before ? "#3c3c40" : "#160405";
  const skyBot = before ? "#8f8f94" : "#E50914";
  const m1 = before ? "#5a5a5e" : "#7A2210";
  const m2 = before ? "#717175" : "#A63A12";
  const m3 = before ? "#8b8b90" : "#D8541E";
  const rim = before ? "#9c9ca0" : "#FFB37A";
  const sun = before ? "#c9c9cd" : "#FFC873";
  const bars = before ? 0 : 56;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky${mode}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${skyTop}"/>
      <stop offset="100%" stop-color="${skyBot}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky${mode})"/>
  <circle cx="${w * 0.62}" cy="${h * 0.44}" r="110" fill="${sun}" opacity="${before ? 0.5 : 0.95}"/>
  ${before ? "" : `<circle cx="${w * 0.62}" cy="${h * 0.44}" r="190" fill="${sun}" opacity="0.2"/>`}
  <path d="M0 ${h * 0.72} L ${w * 0.22} ${h * 0.5} L ${w * 0.4} ${h * 0.72} Z" fill="${m3}"/>
  <path d="M ${w * 0.3} ${h * 0.78} L ${w * 0.55} ${h * 0.42} L ${w * 0.82} ${h * 0.78} Z" fill="${m1}"/>
  <path d="M ${w * 0.3} ${h * 0.78} L ${w * 0.55} ${h * 0.42} L ${w * 0.82} ${h * 0.78}" fill="none" stroke="${rim}" stroke-opacity="${before ? 0.25 : 0.8}" stroke-width="4"/>
  <path d="M ${w * 0.6} ${h * 0.82} L ${w * 0.82} ${h * 0.58} L ${w} ${h * 0.82} Z" fill="${m2}"/>
  <path d="M0 ${h} L ${w * 0.28} ${h * 0.74} L ${w} ${h} Z" fill="${before ? "#26262a" : "#120302"}"/>
  <g opacity="${before ? 0.35 : 0.75}" stroke="${before ? "#5d5d61" : "#1a0505"}" stroke-width="4" fill="none">
    <path d="M ${w * 0.2} ${h * 0.3} q 14 -16 28 0 q 14 -16 28 0"/>
  </g>
  ${before ? "" : `<rect x="0" y="0" width="${w}" height="${bars}" fill="#000"/>
  <rect x="0" y="${h - bars}" width="${w}" height="${bars}" fill="#000"/>`}
</svg>`;
}

function avatarSvg(initials, seed) {
  const s = 400;
  const accent = ACCENTS[seed % ACCENTS.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="ag${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141416"/>
      <stop offset="100%" stop-color="#230b0b"/>
    </linearGradient>
  </defs>
  <rect width="${s}" height="${s}" fill="url(#ag${seed})"/>
  <circle cx="${s / 2}" cy="${s * 0.42}" r="72" fill="#2a2a2e"/>
  <path d="M ${s * 0.5 - 130} ${s} a 130 110 0 0 1 260 0 Z" fill="#2a2a2e"/>
  <circle cx="${s / 2}" cy="${s * 0.42}" r="72" fill="none" stroke="${accent}" stroke-opacity="0.6" stroke-width="3"/>
  <text x="${s / 2}" y="${s - 34}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="72" fill="#ffffff" fill-opacity="0.92">${esc(initials)}</text>
  <rect x="0" y="0" width="${s}" height="6" fill="url(#redline${seed})"/>
</svg>`;
}

function profileSvg() {
  const s = 800;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="pbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#101012"/>
      <stop offset="100%" stop-color="#220a0a"/>
    </linearGradient>
    <radialGradient id="pglow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#E50914" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#E50914" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${s}" height="${s}" fill="url(#pbg)"/>
  <ellipse cx="${s / 2}" cy="${s * 0.3}" rx="320" ry="260" fill="url(#pglow)"/>
  <g opacity="0.1">${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 80}" y="0" width="1.5" height="${s}" fill="#fff"/>`).join("")}</g>
  <circle cx="${s / 2}" cy="${s * 0.38}" r="150" fill="#1d1d20"/>
  <path d="M ${s * 0.5 - 250} ${s} a 250 190 0 0 1 500 0 Z" fill="#1d1d20"/>
  <circle cx="${s / 2}" cy="${s * 0.38}" r="150" fill="none" stroke="#E50914" stroke-opacity="0.75" stroke-width="4"/>
  <path d="M ${s * 0.5 - 250} ${s} a 250 190 0 0 1 500 0" fill="none" stroke="#E50914" stroke-opacity="0.75" stroke-width="4"/>
  <text x="${s / 2}" y="${s * 0.36}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="120" fill="#ffffff" fill-opacity="0.9">MW</text>
  <text x="${s / 2}" y="${s - 92}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="44" fill="#ffffff" letter-spacing="4">MUHANAD WAEL MAHDY</text>
  <text x="${s / 2}" y="${s - 48}" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#FF4D48" letter-spacing="8">VIDEO EDITOR &amp; MOTION DESIGNER</text>
</svg>`;
}

function showreelPosterSvg() {
  const w = 1920, h = 1080;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs(3)}
  <rect width="${w}" height="${h}" fill="url(#bg3)"/>
  ${composition(3, w, h)}
  <ellipse cx="${w / 2}" cy="${h / 2}" rx="720" ry="420" fill="url(#glow3)"/>
  ${playButton(w / 2, h / 2, 96)}
  <rect x="0" y="0" width="${w}" height="90" fill="#000"/>
  <rect x="0" y="${h - 90}" width="${w}" height="90" fill="#000"/>
  <text x="80" y="150" font-family="Arial, sans-serif" font-size="30" fill="#FF4D48" letter-spacing="12">REC</text>
  <circle cx="52" cy="140" r="10" fill="#E50914">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite"/>
  </circle>
  <text x="${w - 80}" y="150" text-anchor="end" font-family="Consolas, monospace" font-size="30" fill="#ffffff" fill-opacity="0.5">00:00:59:24</text>
  <text x="${w / 2}" y="${h / 2 + 210}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="150" fill="none" stroke="#ffffff" stroke-opacity="0.85" stroke-width="2.5" letter-spacing="24">SHOWREEL</text>
  <text x="${w / 2}" y="${h / 2 + 300}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="64" fill="#E50914" letter-spacing="30">2026</text>
  <text x="80" y="${h - 40}" font-family="Arial, sans-serif" font-size="26" fill="#ffffff" fill-opacity="0.4" letter-spacing="6">MUHANAD WAEL MAHDY — EDITOR &amp; MOTION DESIGNER</text>
</svg>`;
}

// ---------- generate ----------
const manifest = { thumbs: {}, gallery: {}, beforeAfter: {}, avatars: [] };

PROJECTS.forEach((p, i) => {
  const seed = i;
  const index = String(i + 1).padStart(2, "0");
  const thumbFile = `thumb-${p.slug}.svg`;
  writeFileSync(join(OUT, thumbFile), thumbSvg({ ...p, seed, index }));
  manifest.thumbs[p.slug] = `/images/${thumbFile}`;

  const gallery = [];
  for (let f = 0; f < 3; f++) {
    const gFile = `gallery-${p.slug}-${f + 1}.svg`;
    writeFileSync(join(OUT, gFile), gallerySvg({ seed, frame: f, label: p.title }));
    gallery.push(`/images/${gFile}`);
  }
  manifest.gallery[p.slug] = gallery;

  manifest.beforeAfter[p.slug] = {
    before: `/images/ba-${p.slug}-before.svg`,
    after: `/images/ba-${p.slug}-after.svg`,
  };
  writeFileSync(join(OUT, `ba-${p.slug}-before.svg`), beforeAfterSvg("before", seed));
  writeFileSync(join(OUT, `ba-${p.slug}-after.svg`), beforeAfterSvg("after", seed));
});

const AVATARS = [
  ["S.A", "Sara Al-Rashid"],
  ["J.M", "James Miller"],
  ["L.K", "Layla Kareem"],
  ["O.F", "Omar Farouk"],
  ["E.T", "Emma Thompson"],
  ["K.N", "Khalid Nasser"],
];
AVATARS.forEach(([initials], i) => {
  const file = `avatar-${i + 1}.svg`;
  writeFileSync(join(OUT, file), avatarSvg(initials, i));
  manifest.avatars.push(`/images/${file}`);
});

writeFileSync(join(OUT, "profile.svg"), profileSvg());
writeFileSync(join(OUT, "showreel-poster.svg"), showreelPosterSvg());

writeFileSync(join(ROOT, "prisma", "placeholder-manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Generated placeholders for ${PROJECTS.length} projects (+avatars, profile, showreel poster) into public/images`);
