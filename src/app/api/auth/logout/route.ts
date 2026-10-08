import { NextResponse } from "next/server";
import { TOKEN_NAME } from "@/lib/jwt";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: TOKEN_NAME, value: "", httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
