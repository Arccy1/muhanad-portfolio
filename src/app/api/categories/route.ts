import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { slugify, toJsonArray, parseJsonArray } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { projects: { where: { published: true } } } } },
  });
  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      subcategories: parseJsonArray(c.subcategories),
      order: c.order,
      projectCount: c._count.projects,
    })),
  });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    const slug = slugify(String(body.slug ?? "") || name);
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: String(body.description ?? "").trim(),
        subcategories: toJsonArray(body.subcategories),
        order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
      },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error && e.message.includes("Unique") ? "A category with that name or slug already exists." : "Could not create category.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
