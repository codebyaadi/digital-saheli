import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) throw new Error("AUTH_SECRET must be set in production");
const key = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret");
export type Session = { id: string; role: string };

export async function setSession(id: string, role: string) {
  const t = await new SignJWT({ id, role }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(key);
  (await cookies()).set("ds", t, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7 });
}
export async function getSession(): Promise<Session | null> {
  const t = (await cookies()).get("ds")?.value; if (!t) return null;
  try { return (await jwtVerify(t, key)).payload as unknown as Session; } catch { return null; }
}
/** Use in server components/actions: returns the DB user or redirects to /login. */
export async function requireUser() {
  const s = await getSession(); if (!s) redirect("/login");
  const u = await prisma.user.findUnique({ where: { id: s.id } });
  if (!u) redirect("/login");
  return u;
}
/** Role is re-read from the DB (not the cookie) so a demoted admin loses access immediately. */
export async function requireAdmin() {
  const u = await requireUser(); if (u.role !== "ADMIN") redirect("/");
  return u;
}
