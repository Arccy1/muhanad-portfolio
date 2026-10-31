import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit, tooMany } from "@/lib/rateLimit";

type Ctx = { params: { token: string } };

/** Public: fetch the review invite state for the /rate/<token> page. */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const rating = await prisma.rating.findUnique({
    where: { token: ctx.params.token },
    include: { project: { select: { title: true } } },
  });
  if (!rating) return NextResponse.json({ error: "not-found" }, { status: 404 });
  return NextResponse.json({
    projectName: rating.project?.title ?? null,
    alreadyRated: rating.rating > 0,
    rating: rating.rating,
    name: rating.name,
  });
}

/** Public: the client submits their rating + optional review. */
export async function POST(req: NextRequest, ctx: Ctx) {
  // Spam protection: 3 submissions per IP per hour.
  const rl = rateLimit(`rate:${clientIp(req)}`, 3, 60 * 60 * 1000);
  if (!rl.ok) return tooMany(rl.retryAfterSeconds);

  try {
    const body = await req.json();
    const ratingValue = Number(body.rating);
    const name = String(body.name ?? "").trim();
    const content = String(body.content ?? "").trim();
    const email = String(body.email ?? "").trim().slice(0, 200);

    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json({ error: "Please choose a star rating." }, { status: 400 });
    }
    if (!name || name.length > 120) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (content.length > 1000) {
      return NextResponse.json({ error: "The review is too long." }, { status: 400 });
    }

    const invite = await prisma.rating.findUnique({ where: { token: ctx.params.token } });
    if (!invite) {
      return NextResponse.json({ error: "This review link is not valid." }, { status: 404 });
    }
    if (invite.rating > 0) {
      return NextResponse.json({ error: "A review was already submitted with this link." }, { status: 409 });
    }

    await prisma.rating.update({
      where: { token: ctx.params.token },
      data: { rating: ratingValue, name, email, content },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not submit the review." }, { status: 500 });
  }
}
