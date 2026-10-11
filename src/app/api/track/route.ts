import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit, tooMany } from "@/lib/rateLimit";

// Cookieless analytics: records a page view (public pages only — the
// PageTracker component skips admin/API/static-export builds).
export async function POST(req: NextRequest) {
  const rl = rateLimit(`track:${clientIp(req)}`, 60, 60 * 1000);
  if (!rl.ok) return tooMany(rl.retryAfterSeconds);
  try {
    const body = await req.json();
    let path = String(body.path ?? "/").slice(0, 300);
    if (!path.startsWith("/")) path = "/" + path;
    // ignore internal Next artifacts and obvious noise
    if (path.startsWith("/_") || path.includes("favicon")) {
      return NextResponse.json({ ok: true });
    }
    await prisma.pageView.create({ data: { path } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
