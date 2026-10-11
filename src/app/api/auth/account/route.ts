import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized } from "@/lib/auth";

// Change the logged-in admin's display name and/or email.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const existing = await prisma.adminUser.findFirst({
      where: { email, id: { not: session.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "That email is already used by another admin." }, { status: 409 });
    }

    const updated = await prisma.adminUser.update({
      where: { id: session.id },
      data: { email, name: name || session.name },
    });
    return NextResponse.json({ ok: true, user: { id: updated.id, email: updated.email, name: updated.name } });
  } catch {
    return NextResponse.json({ error: "Could not update the account." }, { status: 500 });
  }
}
