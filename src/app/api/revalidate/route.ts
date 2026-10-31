import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, unauthorized } from "@/lib/auth";

/**
 * Manually revalidate all public pages.
 * On Vercel, pages use force-dynamic so they query the DB fresh on every
 * request. This endpoint is a safety net — it forces Vercel's CDN to
 * invalidate cached responses after content changes.
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ revalidated: false }, { status: 500 });
  }
}
