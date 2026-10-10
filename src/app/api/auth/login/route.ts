import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, TOKEN_NAME } from "@/lib/jwt";
import { TOKEN_COOKIE } from "@/lib/auth";
import { clientIp, rateLimit, tooMany } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Brute-force protection: 5 attempts per IP per 15 minutes.
  const rl = rateLimit(`login:${clientIp(req)}`, 5, 15 * 60 * 1000);
  if (!rl.ok) return tooMany(rl.retryAfterSeconds);

  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await signToken({ id: user.id, email: user.email, name: user.name });
    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    res.cookies.set({ ...TOKEN_COOKIE, name: TOKEN_NAME, value: token });
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
