// Edge-safe JWT helpers (used by middleware and server routes alike).
import { SignJWT, jwtVerify } from "jose";

export const TOKEN_NAME = "mwm_token";

const secret = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

export type SessionPayload = { id: string; email: string; name: string };

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.id !== "string" || typeof payload.email !== "string") return null;
    return { id: payload.id, email: payload.email, name: String(payload.name ?? "Admin") };
  } catch {
    return null;
  }
}
