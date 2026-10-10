import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { toJsonArray } from "@/lib/utils";

type Ctx = { params: { id: string } };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = await req.json();
    const role = String(body.role ?? "").trim();
    if (!role) return NextResponse.json({ error: "Role is required." }, { status: 400 });
    const entry = await prisma.cvExperience.update({
      where: { id: ctx.params.id },
      data: {
        role,
        org: String(body.org ?? "").trim(),
        period: String(body.period ?? "").trim(),
        points: toJsonArray(body.points),
        order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
      },
    });
    return NextResponse.json({ entry });
  } catch {
    return NextResponse.json({ error: "Could not update entry." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    await prisma.cvExperience.delete({ where: { id: ctx.params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete entry." }, { status: 500 });
  }
}
