import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { getSiteContent } from "@/lib/content";

export async function GET() {
  return NextResponse.json({ content: await getSiteContent() });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = await req.json();
    const updates = body.updates as Record<string, unknown> | undefined;
    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ error: "No updates provided." }, { status: 400 });
    }
    for (const [key, value] of Object.entries(updates)) {
      if (!/^[a-z0-9.]+$/i.test(key)) continue;
      await prisma.siteContent.upsert({
        where: { key },
        update: { value: String(value ?? "") },
        create: { key, value: String(value ?? "") },
      });
    }
    return NextResponse.json({ content: await getSiteContent() });
  } catch {
    return NextResponse.json({ error: "Could not save content." }, { status: 500 });
  }
}
