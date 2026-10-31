import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { requireAdmin, unauthorized } from "@/lib/auth";

const WORKER_BAT = path.join(process.cwd(), "scripts", "deploy-worker.bat");

/**
 * Triggers a publish: spawns a detached worker that stops the dev server,
 * builds the static site, pushes to GitHub Pages, and restarts the dev server.
 * The admin panel briefly goes offline during this process.
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();

  if (!existsSync(WORKER_BAT)) {
    return NextResponse.json({ error: "Worker script not found." }, { status: 500 });
  }

  const child = spawn("cmd", ["/c", WORKER_BAT], {
    cwd: process.cwd(),
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();

  return NextResponse.json({ started: true });
}
