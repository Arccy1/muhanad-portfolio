import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const content = String(body.content ?? "").trim();
    if (!name || !content) {
      return NextResponse.json({ error: "Name and testimonial text are required." }, { status: 400 });
    }
    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role: String(body.role ?? "").trim(),
        avatarUrl: String(body.avatarUrl ?? "").trim(),
        rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
        content,
        order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
        published: body.published === undefined ? true : Boolean(body.published),
      },
    });
    return NextResponse.json({ testimonial }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create testimonial." }, { status: 500 });
  }
}
