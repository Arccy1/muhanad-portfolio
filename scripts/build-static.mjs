/**
 * Builds a fully static export of the visitor-facing site for GitHub Pages.
 *
 * What it does:
 *  1. Temporarily hides src/app/api and src/app/admin (route handlers and the
 *     admin panel cannot exist in a static export — they keep running locally).
 *  2. Temporarily switches public pages from force-dynamic to force-static.
 *  3. Runs `next build` with STATIC_EXPORT=1 (output: export + basePath).
 *  4. Restores everything, then post-processes out/ (adds .nojekyll, ensures
 *     a 404 page).
 *
 * Everything is restored even if the build fails.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TMP = join(ROOT, ".static-build-tmp");
const HIDE = [
  { from: join(ROOT, "src", "app", "api"), to: join(TMP, "api") },
  { from: join(ROOT, "src", "app", "admin"), to: join(TMP, "admin") },
];
const SITE_DIR = join(ROOT, "src", "app", "(site)");
const DYNAMIC = 'export const dynamic = "force-dynamic";';
const STATIC = 'export const dynamic = "force-static";';

function restoreHidden() {
  for (const { from, to } of HIDE) {
    if (existsSync(to) && !existsSync(from)) renameSync(to, from);
  }
  if (existsSync(TMP) && readdirSync(TMP).length === 0) rmSync(TMP, { recursive: true });
}

function walk(dir, fn) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, fn);
    else fn(p);
  }
}

function patchDynamic(mode) {
  const from = mode === "static" ? DYNAMIC : STATIC;
  const to = mode === "static" ? STATIC : DYNAMIC;
  let patched = 0;
  walk(SITE_DIR, (p) => {
    if (!p.endsWith(".tsx")) return;
    const src = readFileSync(p, "utf8");
    if (src.includes(from)) {
      writeFileSync(p, src.split(from).join(to));
      patched++;
    }
  });
  return patched;
}

function postProcessOut() {
  const out = join(ROOT, "out");
  if (!existsSync(out)) throw new Error("Build did not produce out/ — did next build succeed?");
  // .nojekyll: stop GitHub Pages from ignoring _next/* paths via Jekyll
  writeFileSync(join(out, ".nojekyll"), "");
  // Ensure a 404 page exists for broken links
  if (!existsSync(join(out, "404.html")) && existsSync(join(out, "index.html"))) {
    copyFileSync(join(out, "index.html"), join(out, "404.html"));
  }
  return out;
}

// --- main ---
console.log("> Static export build for GitHub Pages");

// Recover from any previously interrupted run
restoreHidden();
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

let patched = 0;
let failed = false;
try {
  for (const { from, to } of HIDE) {
    if (!existsSync(from)) throw new Error(`Expected ${from} to exist`);
    renameSync(from, to);
  }
  patched = patchDynamic("static");
  console.log(`> Patched ${patched} public page(s) to force-static, hid api/ and admin/`);

  const env = {
    ...process.env,
    STATIC_EXPORT: "1",
    NEXT_PUBLIC_STATIC: "1",
    NEXT_PUBLIC_BASE_PATH: "/muhanad-portfolio",
    NEXT_PUBLIC_SITE_URL: "https://arccy1.github.io/muhanad-portfolio",
  };

  // Invoke Next's binary directly — spawning npm.cmd fails silently on modern
  // Node (EINVAL for .cmd without a shell), and prisma generate already ran.
  const nextBin = join(ROOT, "node_modules", "next", "dist", "bin", "next");
  const res = spawnSync(process.execPath, [nextBin, "build"], { cwd: ROOT, env, stdio: "inherit", shell: false });
  if (res.error) console.error(res.error);
  if (res.status !== 0) failed = true;
} catch (err) {
  failed = true;
  console.error(err);
} finally {
  restoreHidden();
  if (patched > 0) patchDynamic("dynamic");
  console.log("> Restored api/, admin/ and dynamic rendering config");
}

if (failed) {
  console.error("\n[X] Static build FAILED — nothing was deployed.");
  process.exit(1);
}

const out = postProcessOut();
console.log(`\n[OK] Static site ready in ${relative(process.cwd(), out)}`);
console.log("     Deploy it with: npm run deploy:pages");
