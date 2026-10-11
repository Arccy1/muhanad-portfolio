import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";

/** Extend /api/stats with page-view analytics (cookieless, local). */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, last7, top] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: since } } }),
    prisma.pageView.groupBy({
      by: ["path"],
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    views: {
      total,
      last7,
      top: top.map((t) => ({ path: t.path, count: t._count._all })),
    },
  });
}
