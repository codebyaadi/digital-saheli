import { prisma } from "@/lib/prisma";

/** Indian digit grouping (lakh/crore) — use for every number shown in the UI. */
export const num = (n: number) => new Intl.NumberFormat("en-IN").format(n);
export const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

export const dateLong = (d: Date | string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));

export const dateTimeLong = (d: Date | string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));

/** SQLite has no Json type, so list-shaped columns hold JSON text. */
export const parseList = <T,>(raw: string | null | undefined): T[] => {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
};

export const lines = (raw: string | null | undefined): string[] =>
  (raw ?? "").split("\n").map((s) => s.trim()).filter(Boolean);

/** Percentage of a course's lessons the user has completed. */
export async function courseProgress(userId: string | null | undefined) {
  if (!userId) return { done: 0, total: 0, percent: 0 };
  const [done, total] = await Promise.all([
    prisma.lessonProgress.count({ where: { userId, lesson: { course: { published: true } } } }),
    prisma.lesson.count({ where: { course: { published: true } } }),
  ]);
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

/** Per-course done/total for the learn grid and the dashboard. */
export async function progressByCourse(userId: string | null | undefined) {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    select: { id: true, lessons: { select: { id: true, progress: userId ? { where: { userId } } : { where: { userId: "-" } } } } },
  });
  return new Map(
    courses.map((c) => {
      const total = c.lessons.length;
      const done = c.lessons.filter((l) => l.progress.length > 0).length;
      return [c.id, { done, total, percent: total ? Math.round((done / total) * 100) : 0 }];
    }),
  );
}

/** Certificate codes look like DS-2026-000123. */
export async function nextCertificateCode(): Promise<string> {
  const year = new Date().getFullYear();
  const n = await prisma.certificate.count({ where: { code: { startsWith: `DS-${year}-` } } });
  let seq = n + 1;
  for (;;) {
    const code = `DS-${year}-${String(seq).padStart(6, "0")}`;
    if (!(await prisma.certificate.findUnique({ where: { code } }))) return code;
    seq++;
  }
}

export const REPORT_TYPES = [
  { value: "CYBER_FRAUD", label: "Cyber fraud / money lost", labelHi: "साइबर ठगी / पैसे डूबे" },
  { value: "SUSPICIOUS_CALL", label: "Suspicious call", labelHi: "संदिग्ध कॉल" },
  { value: "SUSPICIOUS_MESSAGE", label: "Suspicious message", labelHi: "संदिग्ध संदेश" },
  { value: "ACCOUNT_HACKED", label: "My account was hacked", labelHi: "मेरा अकाउंट हैक हुआ" },
  { value: "PAYMENT_FRAUD", label: "Payment fraud / wrong transfer", labelHi: "भुगतान ठगी / गलत ट्रांसफ़र" },
  { value: "LOST_PHONE", label: "Lost or stolen phone", labelHi: "फ़ोन खो गया या चोरी हुआ" },
  { value: "HARASSMENT", label: "Harassment or online abuse", labelHi: "उत्पीड़न या ऑनलाइन अभद्रता" },
  { value: "GENERAL", label: "Something else", labelHi: "कुछ और" },
] as const;

export type ReportTypeValue = (typeof REPORT_TYPES)[number]["value"];

export const reportTypeLabel = (type: string, lang: "en" | "hi" = "en") => {
  const found = (REPORT_TYPES as readonly { value: string; label: string; labelHi: string }[]).find((r) => r.value === type);
  if (!found) return type;
  return lang === "hi" ? found.labelHi : found.label;
};