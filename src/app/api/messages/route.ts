import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { clientIp, rateLimit, tooMany } from "@/lib/rateLimit";
import { notifyNewMessage } from "@/lib/mailer";
import { logError } from "@/lib/logger";

// Public contact submissions and the admin inbox share this route.
export async function GET() {
  if (!(await requireAdmin())) return unauthorized();
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  // Spam protection: 5 messages per IP per hour + honeypot field below.
  const rl = rateLimit(`contact:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (!rl.ok) return tooMany(rl.retryAfterSeconds);

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = String(body.message ?? "").trim();

    // Honeypot: hidden field that bots fill and humans never see.
    // Pretend success so bots don't learn anything.
    if (String(body.website ?? "").trim()) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (message.length > 5000 || name.length > 120 || email.length > 200) {
      return NextResponse.json({ error: "One of the fields is too long." }, { status: 400 });
    }

    const created = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
        projectType: String(body.projectType ?? "").trim(),
        budget: String(body.budget ?? "").trim(),
      },
    });

    // Email notification (only when SMTP is configured in .env) — never blocks
    // the form and never fails the request.
    notifyNewMessage({
      name,
      email,
      projectType: created.projectType,
      budget: created.budget,
      message: created.message,
    }).catch((e) => logError("notify", e));

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    logError("messages", e);
    return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 500 });
  }
}
