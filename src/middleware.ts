import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_NAME, verifyToken } from "@/lib/jwt";

// Protects the /admin area at the edge. The admin panel layout also verifies
// the session client-side, and every mutating API route re-checks the session.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get(TOKEN_NAME)?.value;
    const session = token ? await verifyToken(token) : null;
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
