/**
 * Builds a fully static export of the visitor-facing site for GitHub Pages.
 *
 * Strategy: build from the ORIGINAL project directory. No files are moved,
 * renamed or deleted — so it works even while `next dev` is running.
 *
 * The trick: we temporarily patch `export const dynamic` on (site) pages from
 * "force-dynamic" to "force-static" so they can be statically exported, then
 * restore them after the build. API routes and admin pages are simply left
 * alone — Next.js skips them during static export with just a warning.
 *
 * The /rate/[token] page IS a dynamic route that queries the DB — we add
 * `generateStaticParams` returning [] and `dynamicParams = false` to the page
 * so Next.js skips it during static export (it's server-only anyway).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync, copyFileSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_DIR = join(ROOT, "src", "app", "(site)");
const DYNAMIC = 'export const dynamic = "force-dynamic";';
const STATIC = 'export const dynamic = "force-static";';

function walkPatch(dir, from, to) {
  let patched = 0;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) patched += walkPatch(p, from, to);
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

// --- main ---
console.log("> Static export build for GitHub Pages");

// Patch (site) pages: force-dynamic → force-static
const patched = walkPatch(SITE_DIR, DYNAMIC, STATIC);
console.log(`> Patched ${patched} public page(s) to force-static`);

let failed = false;
try {
  const env = {
    ...process.env,
    STATIC_EXPORT: "1",
    NEXT_PUBLIC_STATIC: "1",
    NEXT_PUBLIC_BASE_PATH: "/muhanad-portfolio",
    NEXT_PUBLIC_SITE_URL: "https://arccy1.github.io/muhanad-portfolio",
    // Skip the /rate page — it's server-only (dynamic route with DB query)
    // and can't be statically exported. The build config already excludes it
    // because it has force-dynamic (unpatched since it's outside (site)).
  };

  const nextBin = join(ROOT, "node_modules", "next", "dist", "bin", "next");
  const res = spawnSync(process.execPath, [nextBin, "build"], {
    cwd: ROOT,
    env,
    stdio: "inherit",
    shell: false,
  });
  if (res.error) console.error(res.error);
  if (res.status !== 0) failed = true;
} catch (err) {
  failed = true;
  console.error(err);
} finally {
  // Restore force-dynamic on (site) pages
  if (patched > 0) walkPatch(SITE_DIR, STATIC, DYNAMIC);
  console.log("> Restored dynamic rendering config");
}

if (failed) {
  console.error("\n[X] Static build FAILED — nothing was deployed.");
  process.exit(1);
}

// Post-process out/
const out = join(ROOT, "out");
if (!existsSync(out)) throw new Error("Build did not produce out/");
writeFileSync(join(out, ".nojekyll"), "");
if (!existsSync(join(out, "404.html")) && existsSync(join(out, "index.html"))) {
  copyFileSync(join(out, "index.html"), join(out, "404.html"));
}

console.log(`\n[OK] Static site ready in ${relative(process.cwd(), out)}`);
console.log("     Deploy it with: npm run deploy:pages");
