import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";

type Ctx = { params: { id: string } };

/** Approve / unapprove a submitted review (admin). */
export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = await req.json();
    const rating = await prisma.rating.update({
      where: { id: ctx.params.id },
      data: { approved: Boolean(body.approved) },
    });
    return NextResponse.json({ rating });
  } catch {
    return NextResponse.json({ error: "Could not update the review." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    await prisma.rating.delete({ where: { id: ctx.params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete the review." }, { status: 500 });
  }
}
