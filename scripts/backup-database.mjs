// Backs up the PostgreSQL database with pg_dump into backups/<timestamp>.dump
// and prunes old backups, keeping the newest KEEP_LAST files.
// Run: npm run db:backup   (or the daily Windows scheduled task)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const KEEP_LAST = 30;
const PG = "C:/Users/mohan/pgsql/bin";
const DATA_DIR = "C:/Users/mohan/pgsql/data";

function envVar(name, fallback) {
  const v = fs.readFileSync(".env", "utf8").match(new RegExp(`^${name}="?([^"\\n]+)` + '"?', "m"));
  return v ? v[1] : fallback;
}

// Parse DATABASE_URL from .env (no dotenv dependency needed here)
const envText = fs.readFileSync(".env", "utf8");
const urlMatch = envText.match(/^DATABASE_URL="?postgresql:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/([^"?]+)/m);
if (!urlMatch) {
  console.error("[X] Could not parse DATABASE_URL from .env");
  process.exit(1);
}
const [, user, password, host, port, database] = urlMatch;

const outDir = path.join(process.cwd(), "backups");
fs.mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outFile = path.join(outDir, `muhanad-portfolio-${stamp}.dump`);

console.log(`Backing up "${database}" -> ${path.basename(outFile)}`);
try {
  execFileSync(
    path.join(PG, "pg_dump.exe"),
    [
      "-h", host,
      "-p", port,
      "-U", user,
      "-d", database,
      "-F", "c", // custom format (compressed, restorable with pg_restore)
      "-f", outFile,
    ],
    { env: { ...process.env, PGPASSWORD: password }, stdio: "inherit" }
  );
} catch (e) {
  console.error("[X] pg_dump failed:", e.message);
  process.exit(1);
}

const size = (fs.statSync(outFile).size / 1024).toFixed(0);
console.log(`[OK] Backup written (${size} KB)`);

// Prune old backups
const dumps = fs
  .readdirSync(outDir)
  .filter((f) => f.startsWith("muhanad-portfolio-") && f.endsWith(".dump"))
  .sort();
let pruned = 0;
while (dumps.length > KEEP_LAST) {
  const oldest = dumps.shift();
  fs.unlinkSync(path.join(outDir, oldest));
  pruned++;
}
if (pruned) console.log(`Pruned ${pruned} old backup(s), keeping the last ${KEEP_LAST}.`);
