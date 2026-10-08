import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { normalizeProjectBody, uniqueSlug } from "@/lib/projectPayload";
import { serializeProject } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category") ?? undefined;
  const featured = searchParams.get("featured");
  const includeUnpublished = searchParams.get("all") === "1";

  if (includeUnpublished && !(await requireAdmin())) return unauthorized();

  const projects = await prisma.project.findMany({
    where: {
      ...(includeUnpublished ? {} : { published: true }),
      ...(featured === "true" ? { featured: true } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ projects: projects.map(serializeProject) });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = await req.json();
    const normalized = normalizeProjectBody(body);
    if ("error" in normalized) {
      return NextResponse.json({ error: normalized.error }, { status: 400 });
    }
    const slug = await uniqueSlug(normalized.slug, prisma);
    const project = await prisma.project.create({
      data: { ...normalized, slug },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json({ project: serializeProject(project) }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not create project." }, { status: 500 });
  }
}
