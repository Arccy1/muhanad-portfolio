import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";

type Ctx = { params: { id: string } };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = await req.json();
    const message = await prisma.contactMessage.update({
      where: { id: ctx.params.id },
      data: { read: Boolean(body.read) },
    });
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "Could not update message." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    await prisma.contactMessage.delete({ where: { id: ctx.params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete message." }, { status: 500 });
  }
}
