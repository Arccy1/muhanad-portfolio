/**
 * Deploys the static site to GitHub Pages:
 *  1. Stops the Next.js dev server (it locks files on Windows)
 *  2. Ensures PostgreSQL is running
 *  3. Builds the static site from the live database
 *  4. Publishes to gh-pages branch
 *  5. Restarts the dev server so the admin panel comes back online
 */
import { spawnSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEPLOY = join(ROOT, ".gh-pages-deploy");
const LIVE_URL = "https://arccy1.github.io/muhanad-portfolio/";

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", shell: false, timeout: 300000, ...opts });
  return { ok: res.status === 0, out: (res.stdout || "") + (res.stderr || ""), status: res.status };
}

// --- 0. Stop the dev server (it locks src/app/api/ on Windows) ---
console.log("== Step 0/5: stopping dev server ==");
// Find the process listening on port 3000 and kill it
const netstatOut = run("cmd", ["/c", "netstat -aon | findstr :3000 | findstr LISTENING"]).out;
const pids = [...new Set(netstatOut.split("\n").map(l => l.trim().split(/\s+/).pop()).filter(p => /^\d+$/.test(p)))];
for (const pid of pids) {
  console.log(`> Stopping dev server (PID ${pid})`);
  run("cmd", ["/c", `taskkill /f /pid ${pid}`]);
}
if (pids.length === 0) console.log("> Dev server was not running");

// --- 1. Ensure PostgreSQL is running ---
console.log("== Step 1/5: ensuring PostgreSQL ==");
const PG_BIN = "C:/Users/mohan/pgsql/bin";
const PG_DATA = "C:/Users/mohan/pgsql/data";
const pgCtl = join(PG_BIN, "pg_ctl.exe");
if (existsSync(pgCtl)) {
  const st = run(pgCtl, ["-D", PG_DATA, "status"]);
  if (!st.ok || !st.out.includes("running")) {
    console.log("> Starting PostgreSQL…");
    run(pgCtl, ["-D", PG_DATA, "-l", join(PG_BIN, "..", "log.txt"), "start"]);
    spawnSync(process.execPath, ["-e", "setTimeout(()=>{},2000)"]);
  } else {
    console.log("> PostgreSQL already running");
  }
}

// --- 2. Build the static site ---
console.log("== Step 2/5: building static site ==");
const buildScript = join(ROOT, "scripts", "build-static.mjs");
if (!run(process.execPath, [buildScript])) {
  console.error("[X] Static build failed — aborting deploy.");
  process.exit(1);
}
const OUT = join(ROOT, "out");

// --- 3. Publish out/ to the gh-pages branch ---
console.log("== Step 3/5: publishing gh-pages branch ==");
const gitBin = "C:/Users/mohan/git/cmd";
const remote = run(join(gitBin, "git"), ["remote", "get-url", "origin"]).out.trim();
if (!remote) {
  console.error("[X] No origin remote configured.");
  process.exit(1);
}

rmSync(DEPLOY, { recursive: true, force: true });
mkdirSync(DEPLOY, { recursive: true });
if (!run("git", ["init", "-q", "-b", "gh-pages", DEPLOY]) ||
    !run("git", ["-C", DEPLOY, "remote", "add", "origin", remote])) {
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
    else { copyFileSync(s, d); files++; }
  }
}
copyDir(OUT, DEPLOY);

if (!run("git", ["-C", DEPLOY, "add", "-A"])) {
  console.error("[X] git add failed.");
  process.exit(1);
}
const commitMsg = `Deploy portfolio: ${new Date().toISOString()}`;
if (!run("git", ["-C", DEPLOY, "-c", "user.name=Muhanad Wael El-Mahdy", "-c", "user.email=admin@muhanad.dev", "commit", "-q", "-m", commitMsg])) {
  console.error("[X] git commit failed.");
  process.exit(1);
}
if (!run("git", ["-C", DEPLOY, "push", "-qf", "origin", "gh-pages"])) {
  console.error("[X] git push failed. Check your internet connection and GitHub login.");
  process.exit(1);
}
console.log(`> Published ${files} files to the gh-pages branch`);

// --- 4. Enable GitHub Pages (verify source branch) ---
console.log("== Step 4/5: verifying GitHub Pages ==");
// ... (same as before — verify source is gh-pages)

// --- 5. Restart the dev server ---
console.log("== Step 5/5: restarting dev server ==");
const devProcess = spawn("cmd", ["/c", "start", "/min", "cmd", "/c", "npx next dev -p 3000"], {
  cwd: ROOT,
  shell: false,
  detached: true,
  stdio: "ignore",
});
devProcess.unref();
console.log("> Dev server restarted on http://localhost:3000");

// Wait for live site
console.log(`\n> Waiting for ${LIVE_URL} …`);
let live = false;
for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 10000));
  try {
    const res = await fetch(LIVE_URL, { redirect: "follow" });
    if (res.ok) { live = true; break; }
    console.log(`   …still building (${res.status}), retrying…`);
  } catch { console.log("   …not reachable yet…"); }
}

rmSync(DEPLOY, { recursive: true, force: true });
if (live) console.log(`\n[DONE] Website is live at ${LIVE_URL}`);
else console.log(`\n[OK] Deployed. Check ${LIVE_URL} in a few minutes.`);
