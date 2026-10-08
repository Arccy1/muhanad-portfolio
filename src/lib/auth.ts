// Server-side session helpers for route handlers and server components.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TOKEN_NAME, verifyToken, type SessionPayload } from "./jwt";

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<SessionPayload | null> {
  return getSession();
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const TOKEN_COOKIE = {
  name: TOKEN_NAME,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
