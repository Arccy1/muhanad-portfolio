/**
 * Deploys the static site to GitHub Pages:
 *  1. Runs scripts/build-static.mjs (full static export into out/)
 *  2. Publishes out/ to the `gh-pages` branch (force-pushed snapshot branch)
 *  3. Enables GitHub Pages from that branch via the GitHub API
 *     (uses your saved GitHub credential; no interaction needed)
 *  4. Polls the live URL until it responds
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEPLOY = join(ROOT, ".gh-pages-deploy");
const PAGES_PATH = "/muhanad-portfolio";
const LIVE_URL = "https://arccy1.github.io/muhanad-portfolio/";

function git(args, opts = {}) {
  const res = spawnSync("git", args, { cwd: ROOT, encoding: "utf8", shell: false, ...opts });
  return { ok: res.status === 0, out: (res.stdout || "") + (res.stderr || ""), status: res.status };
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", shell: false, ...opts });
  return res.status === 0;
}

// --- 1. Build the static site ---
console.log("== Step 1/4: building static site ==");
// Invoke Node directly (spawning npm.cmd fails silently on modern Node).
if (!run(process.execPath, [join(ROOT, "scripts", "build-static.mjs")])) {
  console.error("[X] Static build failed — aborting deploy.");
  process.exit(1);
}
const OUT = join(ROOT, "out");

// --- 2. Publish out/ to the gh-pages branch ---
console.log("\n== Step 2/4: publishing gh-pages branch ==");
const remote = git(["remote", "get-url", "origin"]).out.trim();
if (!remote) {
  console.error("[X] No origin remote configured.");
  process.exit(1);
}

rmSync(DEPLOY, { recursive: true, force: true });
mkdirSync(DEPLOY, { recursive: true });
// Fresh orphan history each deploy — the branch is a build artifact snapshot.
if (
  !run("git", ["init", "-q", "-b", "gh-pages", DEPLOY]) ||
  !git(["-C", DEPLOY, "remote", "add", "origin", remote]).ok
) {
  console.error("[X] Could not initialize deploy directory.");
  process.exit(1);
}

let files = 0;
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    if (statSync(s).isDirectory()) copyDir(s, d);
    else {
      copyFileSync(s, d);
      files++;
    }
  }
}
copyDir(OUT, DEPLOY);

const commit = git([
  "-C", DEPLOY,
  "-c", "user.name=Muhanad Wael Mahdy",
  "-c", "user.email=admin@muhanad.dev",
  "add", "-A",
]);
if (!commit.ok) {
  console.error("[X] git add failed:\n" + commit.out);
  process.exit(1);
}
const ci = git([
  "-C", DEPLOY,
  "-c", "user.name=Muhanad Wael Mahdy",
  "-c", "user.email=admin@muhanad.dev",
  "commit", "-q", "-m", `Deploy portfolio: ${new Date().toISOString()}`,
]);
if (!ci.ok && !/nothing to commit/.test(ci.out)) {
  console.error("[X] git commit failed:\n" + ci.out);
  process.exit(1);
}
if (!run("git", ["-C", DEPLOY, "push", "-qf", "origin", "gh-pages"])) {
  console.error("[X] git push failed. Check your internet connection and GitHub login");
  console.error("    (run push-to-github.bat once to refresh the saved login).");
  process.exit(1);
}
console.log(`> Published ${files} files to the gh-pages branch`);

// --- 3. Make sure GitHub Pages is enabled (source: gh-pages branch) ---
console.log("\n== Step 3/4: enabling GitHub Pages ==");
const cred = spawnSync("git", ["credential", "fill"], {
  input: "protocol=https\nhost=github.com\n\n",
  encoding: "utf8",
});
let token = "";
let ghUser = "";
for (const line of cred.stdout.split(/\r?\n/)) {
  if (line.startsWith("password=")) token = line.slice("password=".length);
  if (line.startsWith("username=")) ghUser = line.slice("username=".length);
}
if (!token) {
  console.error("[!] Could not read your saved GitHub credential — enable Pages manually:");
  console.error(`    ${remote.replace(/\.git$/, "")}/settings/pages → Source: "Deploy from a branch" → Branch: gh-pages`);
} else {
  const api = (path, method, body) =>
    fetch(`https://api.github.com${path}`, {
      method,
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "portfolio-deploy",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

  const pagesRes = await api(`/repos/${ghUser}/${PAGES_PATH.replace(/^\//, "")}/pages`, "POST", {
    source: { branch: "gh-pages", path: "/" },
  });
  if (pagesRes.status === 201 || pagesRes.status === 204) {
    console.log("> GitHub Pages enabled (source: gh-pages branch)");
  } else if (pagesRes.status === 409) {
    // Already enabled — make sure it points at gh-pages (it may be on main,
    // which GitHub renders via Jekyll instead of our static site).
    const cur = await api(`/repos/${ghUser}/${PAGES_PATH.replace(/^\//, "")}/pages`, "GET");
    if (cur.ok) {
      const cfg = await cur.json();
      if (cfg.source?.branch === "gh-pages") {
        console.log("> GitHub Pages already enabled (source: gh-pages branch)");
      } else {
        console.log(`> Pages source was "${cfg.source?.branch}" — switching to gh-pages`);
        await api(`/repos/${ghUser}/${PAGES_PATH.replace(/^\//, "")}/pages`, "PUT", {
          source: { branch: "gh-pages", path: "/" },
        });
      }
    }
    await api(`/repos/${ghUser}/${PAGES_PATH.replace(/^\//, "")}/pages/builds`, "POST");
    console.log("> Build requested");
  } else if (pagesRes.status === 403) {
    console.error("[!] Your GitHub token cannot manage Pages — enable it manually:");
    console.error(`    ${remote.replace(/\.git$/, "")}/settings/pages → Source: "Deploy from a branch" → Branch: gh-pages`);
  } else {
    const text = await pagesRes.text();
    console.error(`[!] Pages API returned ${pagesRes.status}: ${text.slice(0, 200)}`);
  }
}

// --- 4. Wait for the live site ---
console.log("\n== Step 4/4: waiting for the live site ==");
console.log(`> ${LIVE_URL} (first deploys can take 1-3 minutes)`);
let live = false;
for (let i = 0; i < 24; i++) {
  await new Promise((r) => setTimeout(r, 10000));
  try {
    const res = await fetch(LIVE_URL, { redirect: "follow" });
    if (res.ok) {
      live = true;
      break;
    }
    console.log(`   ...still building (${res.status}), retrying...`);
  } catch {
    console.log("   ...not reachable yet, retrying...");
  }
}

rmSync(DEPLOY, { recursive: true, force: true });
if (live) {
  console.log(`\n[DONE] Your website is live at ${LIVE_URL}`);
} else {
  console.log(`\n[OK] Deployed. Open ${LIVE_URL} in a minute — GitHub is still building the site.`);
}
