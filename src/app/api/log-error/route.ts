import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, tooMany } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

// Client-side error reports from global-error.tsx land in logs/client-error.log
export async function POST(req: NextRequest) {
  const rl = rateLimit(`logerr:${clientIp(req)}`, 20, 60 * 60 * 1000);
  if (!rl.ok) return tooMany(rl.retryAfterSeconds);
  try {
    const body = await req.json();
    const message = String(body.message ?? "unknown").slice(0, 1000);
    const digest = String(body.digest ?? "").slice(0, 100);
    const path = String(body.path ?? "/").slice(0, 300);
    logError("client", `${message} | digest=${digest} | path=${path}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    logError("log-error-route", e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
