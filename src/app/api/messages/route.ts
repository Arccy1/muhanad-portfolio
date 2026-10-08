import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth";

// Public contact submissions and the admin inbox share this route.
export async function GET() {
  if (!(await requireAdmin())) return unauthorized();
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (message.length > 5000 || name.length > 120 || email.length > 200) {
      return NextResponse.json({ error: "One of the fields is too long." }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
        projectType: String(body.projectType ?? "").trim(),
        budget: String(body.budget ?? "").trim(),
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 500 });
  }
}
