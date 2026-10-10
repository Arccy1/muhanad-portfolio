import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";

/** List all review invites + submitted reviews (admin). */
export async function GET() {
  if (!(await requireAdmin())) return unauthorized();
  const rows = await prisma.rating.findMany({
    orderBy: { createdAt: "desc" },
    include: { project: { select: { title: true } } },
  });
  return NextResponse.json({
    ratings: rows.map((r) => ({
      id: r.id,
      token: r.token,
      projectId: r.projectId,
      projectName: r.project?.title ?? null,
      rating: r.rating,
      name: r.name,
      email: r.email,
      content: r.content,
      approved: r.approved,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

/** Create a private review link (admin). Optionally tied to a project. */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId ? String(body.projectId) : null;
    if (projectId) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) return NextResponse.json({ error: "Project not found." }, { status: 400 });
    }
    const rating = await prisma.rating.create({
      data: { token: randomUUID().replace(/-/g, ""), projectId },
      include: { project: { select: { title: true } } },
    });
    return NextResponse.json(
      { rating: { ...rating, projectName: rating.project?.title ?? null } },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not create the review link." }, { status: 500 });
  }
}
