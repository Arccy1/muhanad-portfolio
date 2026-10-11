import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { serializePost } from "@/lib/data";

type Ctx = { params: { id: string } };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    const post = await prisma.post.update({
      where: { id: ctx.params.id },
      data: {
        title,
        slug: slugify(String(body.slug ?? "") || title),
        excerpt: String(body.excerpt ?? "").trim(),
        content: String(body.content ?? ""),
        coverImage: String(body.coverImage ?? "").trim(),
        readMinutes: Math.max(1, Number(body.readMinutes) || 3),
        published: body.published === undefined ? true : Boolean(body.published),
      },
    });
    return NextResponse.json({ post: serializePost(post) });
  } catch {
    return NextResponse.json({ error: "Could not update the post." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    await prisma.post.delete({ where: { id: ctx.params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete the post." }, { status: 500 });
  }
}
