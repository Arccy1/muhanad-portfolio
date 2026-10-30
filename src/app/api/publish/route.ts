import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { requireAdmin, unauthorized } from "@/lib/auth";

const DEPLOY_DIR = path.join(process.cwd(), "backups");
const STATUS_FILE = path.join(process.cwd(), ".deploy-status.json");
const LOG_FILE = path.join(process.cwd(), "deploy.log");

function readStatus() {
  try {
    return JSON.parse(fs.readFileSync(STATUS_FILE, "utf8"));
  } catch {
    return { running: false, lastFinished: null, lastError: null };
  }
}

function writeStatus(data: Record<string, unknown>) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(data));
}

/** Current deploy status. */
export async function GET() {
  if (!(await requireAdmin())) return unauthorized();
  return NextResponse.json(readStatus());
}

/** Triggers a full static rebuild + GitHub Pages deploy. */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();

  const status = readStatus();
  if (status.running) {
    return NextResponse.json({ started: true, alreadyRunning: true, startedAt: status.startedAt });
  }

  writeStatus({
    running: true,
    startedAt: new Date().toISOString(),
    lastFinished: status.lastFinished,
    lastError: null,
  });

  // Spawn the deploy as a fully detached process so it survives this request.
  const nodeExe = process.execPath;
  const script = path.join(process.cwd(), "scripts", "deploy-pages.mjs");
  const logFd = fs.openSync(LOG_FILE, "a");
  fs.appendFileSync(LOG_FILE, `\n--- Deploy started ${new Date().toISOString()} ---\n`);

  const child = spawn(nodeExe, [script], {
    cwd: process.cwd(),
    detached: true,
    stdio: ["ignore", logFd, logFd],
    env: {
      ...process.env,
      PATH: `C:\\Users\\mohan\\nodejs;C:\\Users\\mohan\\git\\cmd;${process.env.PATH}`,
    },
  });
  child.unref();
  fs.closeSync(logFd);

  // Watcher: when the child exits, update the status file
  child.on("exit", (code) => {
    const s = readStatus();
    writeStatus({
      ...s,
      running: false,
      lastFinished: new Date().toISOString(),
      lastError: code === 0 ? null : `Deploy exited with code ${code} — check deploy.log`,
    });
  });

  return NextResponse.json({ started: true, startedAt: new Date().toISOString() });
}
