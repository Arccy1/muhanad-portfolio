import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { slugify, toJsonArray } from "@/lib/utils";

type Ctx = { params: { id: string } };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    const category = await prisma.category.update({
      where: { id: ctx.params.id },
      data: {
        name,
        slug: slugify(String(body.slug ?? "") || name),
        description: String(body.description ?? "").trim(),
        subcategories: toJsonArray(body.subcategories),
        order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
      },
    });
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ error: "Could not update category." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    await prisma.category.delete({ where: { id: ctx.params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete category." }, { status: 500 });
  }
}
