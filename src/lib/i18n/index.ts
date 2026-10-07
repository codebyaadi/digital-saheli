import en from "./en.json";
import hi from "./hi.json";

/**
 * Pure i18n helpers. Safe to import from both server and client components:
 * the dictionaries are plain JSON, and no Next.js/Prisma API is referenced here.
 * (Language *detection* lives in ./server.ts, which is server-only.)
 */
export type Lang = "en" | "hi";
export type TKey = keyof typeof en;

const dicts = { en, hi: hi as Record<TKey, string> } satisfies Record<Lang, Record<TKey, string>>;

export const isLang = (v: unknown): v is Lang => v === "hi" || v === "en";

/** Build a translator for one language. Missing keys fall back to English. */
export function translator(lang: Lang) {
  const d = dicts[lang] ?? dicts.en;
  return (key: TKey) => d[key] ?? en[key] ?? key;
}

/** Pick the right side of an `…En` / `…Hi` column pair stored in the database. */
export function pick<T extends Record<string, unknown>>(lang: Lang, row: T, base: keyof T & string): string {
  const hiKey = `${base}Hi` as keyof T & string;
  const hiVal = lang === "hi" ? row[hiKey] : undefined;
  return String(hiVal ?? row[base] ?? "");
}