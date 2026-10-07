// Next.js 16 replacement for middleware.ts. Coarse gate only; pages still call requireUser()/requireAdmin().
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
const key = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret");
export async function proxy(req: NextRequest) {
  const t = req.cookies.get("ds")?.value;
  let role: string | null = null;
  if (t) { try { role = ((await jwtVerify(t, key)).payload as { role?: string }).role ?? null; } catch {} }
  if (!role) return NextResponse.redirect(new URL("/login", req.url));
  if (req.nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*", "/profile/:path*"] };
