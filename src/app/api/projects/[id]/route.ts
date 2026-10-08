import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { normalizeProjectBody, uniqueSlug } from "@/lib/projectPayload";
import { serializeProject } from "@/lib/data";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const project = await prisma.project.findUnique({
    where: { id: ctx.params.id },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project: serializeProject(project) });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const existing = await prisma.project.findUnique({ where: { id: ctx.params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const normalized = normalizeProjectBody(body);
    if ("error" in normalized) {
      return NextResponse.json({ error: normalized.error }, { status: 400 });
    }
    const slug = await uniqueSlug(normalized.slug, prisma, ctx.params.id);
    const project = await prisma.project.update({
      where: { id: ctx.params.id },
      data: { ...normalized, slug },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json({ project: serializeProject(project) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not update project." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    await prisma.project.delete({ where: { id: ctx.params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete project." }, { status: 500 });
  }
}
