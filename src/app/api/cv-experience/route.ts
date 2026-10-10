import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { toJsonArray } from "@/lib/utils";

export async function GET() {
  if (!(await requireAdmin())) return unauthorized();
  const rows = await prisma.cvExperience.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({
    entries: rows.map((r) => ({
      id: r.id,
      role: r.role,
      org: r.org,
      period: r.period,
      points: toJsonArray(r.points) === "[]" ? [] : JSON.parse(r.points),
      order: r.order,
    })),
  });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = await req.json();
    const role = String(body.role ?? "").trim();
    if (!role) return NextResponse.json({ error: "Role is required." }, { status: 400 });

    const last = await prisma.cvExperience.findFirst({ orderBy: { order: "desc" } });
    const entry = await prisma.cvExperience.create({
      data: {
        role,
        org: String(body.org ?? "").trim(),
        period: String(body.period ?? "").trim(),
        points: toJsonArray(body.points),
        order: Number.isFinite(Number(body.order)) ? Number(body.order) : (last?.order ?? 0) + 1,
      },
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not create entry." }, { status: 500 });
  }
}
