import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized } from "@/lib/auth";

/** Change the logged-in admin's password (requires the current one). */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();
  try {
    const body = await req.json();
    const current = String(body.currentPassword ?? "");
    const next = String(body.newPassword ?? "");

    if (next.length < 8) {
      return NextResponse.json({ error: "The new password must be at least 8 characters." }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({ where: { id: session.id } });
    if (!user || !bcrypt.compareSync(current, user.passwordHash)) {
      return NextResponse.json({ error: "The current password is incorrect." }, { status: 401 });
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: bcrypt.hashSync(next, 10) },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not change the password." }, { status: 500 });
  }
}
