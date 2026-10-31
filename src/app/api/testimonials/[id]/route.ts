import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";

type Ctx = { params: { id: string } };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = await req.json();
    const testimonial = await prisma.testimonial.update({
      where: { id: ctx.params.id },
      data: {
        name: String(body.name ?? "").trim(),
        role: String(body.role ?? "").trim(),
        avatarUrl: String(body.avatarUrl ?? "").trim(),
        rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
        content: String(body.content ?? "").trim(),
        order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
        published: body.published === undefined ? true : Boolean(body.published),
      },
    });
    return NextResponse.json({ testimonial });
  } catch {
    return NextResponse.json({ error: "Could not update testimonial." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    await prisma.testimonial.delete({ where: { id: ctx.params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete testimonial." }, { status: 500 });
  }
}
