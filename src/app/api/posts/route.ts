import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { serializePost } from "@/lib/data";

export async function GET() {
  if (!(await requireAdmin())) return unauthorized();
  const posts = await prisma.post.findMany({ orderBy: { publishedAt: "desc" } });
  return NextResponse.json({ posts: posts.map(serializePost) });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    const slug = slugify(String(body.slug ?? "") || title);
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: String(body.excerpt ?? "").trim(),
        content: String(body.content ?? ""),
        coverImage: String(body.coverImage ?? "").trim(),
        readMinutes: Math.max(1, Number(body.readMinutes) || 3),
        published: body.published === undefined ? true : Boolean(body.published),
      },
    });
    return NextResponse.json({ post: serializePost(post) }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error && e.message.includes("Unique") ? "A post with that slug already exists." : "Could not create the post.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
