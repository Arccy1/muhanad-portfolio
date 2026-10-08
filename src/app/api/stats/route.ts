import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";

export async function GET() {
  if (!(await requireAdmin())) return unauthorized();
  const [projects, categories, testimonials, messages, unread] = await Promise.all([
    prisma.project.count(),
    prisma.category.count(),
    prisma.testimonial.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);
  const recentMessages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const recentProjects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { category: { select: { name: true } } },
  });
  return NextResponse.json({
    stats: { projects, categories, testimonials, messages, unread },
    recentMessages,
    recentProjects,
  });
}
