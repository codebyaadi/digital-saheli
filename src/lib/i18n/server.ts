import { cache } from "react";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isLang, type Lang } from "./index";

/**
 * Server-only: resolves the active language from the signed-in user, falling back
 * to the `lang` cookie. `cache()` dedupes the extra queries within one render.
 */
export const currentLang = cache(async (): Promise<Lang> => {
  const s = await getSession();
  if (s) {
    const u = await prisma.user.findUnique({ where: { id: s.id }, select: { language: true } });
    if (isLang(u?.language)) return u.language;
  }
  const cookie = (await cookies()).get("lang")?.value;
  return isLang(cookie) ? cookie : "en";
});