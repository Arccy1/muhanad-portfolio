/**
 * Builds a fully static export of the visitor-facing site for GitHub Pages.
 *
 * Strategy: copy the project to a temp build directory (excluding server-only
 * routes and heavy dirs), patch the copy, and build there. This avoids all
 * Windows file-locking issues with the running dev server.
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUILD = join(ROOT, ".static-build");
const SITE_DIR = join(BUILD, "src", "app", "(site)");
const DYNAMIC = 'export const dynamic = "force-dynamic";';
const STATIC = 'export const dynamic = "force-static";';

// Directories excluded from the static build copy (server-only)
const EXCLUDE_DIRS = new Set([
  join("src", "app", "api"),
  join("src", "app", "admin"),
  join("src", "app", "rate"),
  "node_modules",
  ".next",
  ".git",
  ".static-build",
  ".gh-pages-deploy",
  "backups",
  "logs",
  "out",
]);

// Files/dirs to copy into the build directory
const COPY_ROOT = [
  "src",
  "public",
  "prisma",
  "scripts",
  "next.config.mjs",
  "tsconfig.json",
  "tailwind.config.ts",
  "postcss.config.mjs",
  ".env",
  "package.json",
  "package-lock.json",
  "next-env.d.ts",
];

function copyDir(src, dest, excludeRel) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    const rel = relative(ROOT, s).replace(/\\/g, "/");
    if (excludeRel.has(rel)) continue;
    if (statSync(s).isDirectory()) copyDir(s, d, excludeRel);
    else copyFileSync(s, d);
  }
}

function walkPatch(dir, from, to) {
  let patched = 0;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) patched += walkPatch(p, from, to);
    else if (p.endsWith(".tsx")) {
      const src = readFileSync(p, "utf8");
      if (src.includes(from)) {
        writeFileSync(p, src.split(from).join(to));
        patched++;
      }
    }
  }
  return patched;
}

function postProcessOut() {
  const out = join(BUILD, "out");
  if (!existsSync(out)) throw new Error("Build did not produce out/ — did next build succeed?");
  writeFileSync(join(out, ".nojekyll"), "");
  if (!existsSync(join(out, "404.html")) && existsSync(join(out, "index.html"))) {
    copyFileSync(join(out, "index.html"), join(out, "404.html"));
  }
  return out;
}

// --- main ---
console.log("> Static export build for GitHub Pages");

// 1. Clean and create the build directory
rmSync(BUILD, { recursive: true, force: true });
mkdirSync(BUILD, { recursive: true });

// 2. Copy the project (excluding server-only routes and heavy dirs)
const exclude = new Set(EXCLUDE_DIRS);
for (const item of COPY_ROOT) {
  const src = join(ROOT, item);
  if (!existsSync(src)) continue;
  const dest = join(BUILD, item);
  if (statSync(src).isDirectory()) copyDir(src, dest, exclude);
  else copyFileSync(src, dest);
}

// Remove server-only routes from the copy
for (const dir of ["src/app/api", "src/app/admin", "src/app/rate"]) {
  const d = join(BUILD, dir);
  if (existsSync(d)) rmSync(d, { recursive: true, force: true });
}

// 3. Patch force-dynamic → force-static in the copy
const patched = walkPatch(SITE_DIR, DYNAMIC, STATIC);
console.log(`> Copied project, patched ${patched} page(s) to force-static`);

// 4. Create a junction for node_modules (no need to copy 500 MB of deps)
const nmSource = join(ROOT, "node_modules");
const nmTarget = join(BUILD, "node_modules");
if (existsSync(nmSource) && !existsSync(nmTarget)) {
  // Use cmd mklink junction — works without admin on Windows
  spawnSync("cmd", ["/c", "mklink", "/j", nmTarget, nmSource], { shell: false });
}

// 5. Build
const env = {
  ...process.env,
  STATIC_EXPORT: "1",
  NEXT_PUBLIC_STATIC: "1",
  NEXT_PUBLIC_BASE_PATH: "/muhanad-portfolio",
  NEXT_PUBLIC_SITE_URL: "https://arccy1.github.io/muhanad-portfolio",
};

const nextBin = join(BUILD, "node_modules", "next", "dist", "bin", "next");
const res = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: BUILD,
  env,
  stdio: "inherit",
  shell: false,
});

if (res.status !== 0) {
  console.error("\n[X] Static build FAILED — nothing was deployed.");
  // Clean up the junction before removing the directory
  spawnSync("cmd", ["/c", "rmdir", nmTarget], { shell: false });
  rmSync(BUILD, { recursive: true, force: true });
  process.exit(1);
}

// 6. Copy the output back to the main project
const outSource = join(BUILD, "out");
const outTarget = join(ROOT, "out");
rmSync(outTarget, { recursive: true, force: true });
cpSync(outSource, outTarget, { recursive: true });

// Clean up the junction and build directory
spawnSync("cmd", ["/c", "rmdir", nmTarget], { shell: false });
rmSync(BUILD, { recursive: true, force: true });

// 7. Post-process
writeFileSync(join(outTarget, ".nojekyll"), "");
if (!existsSync(join(outTarget, "404.html")) && existsSync(join(outTarget, "index.html"))) {
  copyFileSync(join(outTarget, "index.html"), join(outTarget, "404.html"));
}

console.log(`\n[OK] Static site ready in out/ (${readdirSync(outTarget).length} entries)`);
console.log("     Deploy it with: npm run deploy:pages");
