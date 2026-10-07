"use server";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, setSession, requireUser, requireAdmin } from "@/lib/auth";
import { score } from "@/lib/scoring";
import { nextCertificateCode } from "@/lib/data";
import type { FormState, QuizResult } from "@/lib/action-types";
import type { TKey } from "@/lib/i18n";

const FAIL = (error: TKey): FormState => ({ ok: false, error });
const invalid: FormState = FAIL("error.Invalid data.");
const notLoggedIn: FormState = FAIL("error.Not logged in.");

/** Kick every page back to a fresh render after a write. */
function revalidateAll() {
  revalidatePath("/", "layout");
}

const emailSchema = z.string().trim().toLowerCase().email().max(160);

/* ------------------------------------------------------------------ auth */

export async function register(_: unknown, f: FormData): Promise<FormState> {
  const d = z.object({
    name: z.string().trim().min(2, "x").max(60),
    email: emailSchema,
    password: z.string().min(6, "x").max(100),
    village: z.string().trim().max(80).optional(),
    language: z.enum(["en", "hi"]).default("en"),
  }).safeParse(Object.fromEntries(f));
  if (!d.success) return FAIL("error.Please check your details (password needs 6+ characters).");
  if (await prisma.user.findUnique({ where: { email: d.data.email } })) return FAIL("error.This email is already registered.");

  const u = await prisma.user.create({
    data: { name: d.data.name, email: d.data.email, password: await bcrypt.hash(d.data.password, 10), village: d.data.village || null, language: d.data.language },
  });
  await setSession(u.id, u.role);
  redirect("/dashboard");
}

export async function login(_: unknown, f: FormData): Promise<FormState> {
  const email = emailSchema.safeParse(f.get("email"));
  const u = email.success ? await prisma.user.findUnique({ where: { email: email.data } }) : null;
  if (!u || !(await bcrypt.compare(String(f.get("password") ?? ""), u.password))) return FAIL("error.Wrong email or password.");
  await setSession(u.id, u.role);
  redirect("/dashboard");
}

export async function logout() {
  (await cookies()).delete("ds");
  redirect("/");
}

export async function updateProfile(f: FormData): Promise<void> {
  const u = await requireUser();
  const d = z.object({
    name: z.string().trim().min(2).max(60),
    village: z.string().trim().max(80).optional(),
    language: z.enum(["en", "hi"]),
  }).safeParse(Object.fromEntries(f));
  if (!d.success) redirect("/profile");

  await prisma.user.update({ where: { id: u.id }, data: { name: d.data.name, village: d.data.village || null, language: d.data.language } });
  (await cookies()).set("lang", d.data.language, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidateAll();
  redirect("/profile?saved=1");
}

export async function setLanguage(lang: string) {
  const l = lang === "hi" ? "hi" : "en";
  (await cookies()).set("lang", l, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  const s = await getSession();
  if (s) await prisma.user.update({ where: { id: s.id }, data: { language: l } });
  revalidateAll();
}

/* -------------------------------------------------------------- lessons */

/** Plain <form action> shape: the lesson id arrives as a hidden field. */
export async function completeLesson(f: FormData): Promise<void> {
  const s = await getSession();
  if (!s) redirect("/login");
  const lessonId = String(f.get("lessonId") ?? "");
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) return;

  await prisma.lessonProgress.upsert({ where: { userId_lessonId: { userId: s.id, lessonId } }, update: {}, create: { userId: s.id, lessonId } });
  revalidatePath("/", "layout");
}

/* ------------------------------------------------------- message checker */

export async function checkMessage(text: string) {
  const r = score(text);
  const s = await getSession();
  // Only a hash is stored: we never keep the user's message (spec §4 module 12).
  await prisma.messageCheck.create({
    data: {
      userId: s?.id ?? null,
      textHash: createHash("sha256").update(text).digest("hex"),
      indicators: r.indicators.map((i) => i.key).join(","),
      verdict: r.verdict,
    },
  });
  return { verdict: r.verdict, count: r.count, indicators: r.indicators.map((i) => ({ key: i.key, label: i.label, labelHi: i.labelHi })) };
}

/* -------------------------------------------------------- help & reports */

const REPORT_TYPES = [
  "CYBER_FRAUD", "SUSPICIOUS_CALL", "SUSPICIOUS_MESSAGE", "ACCOUNT_HACKED",
  "PAYMENT_FRAUD", "LOST_PHONE", "HARASSMENT", "GENERAL",
] as const;

export async function submitReport(_: unknown, f: FormData): Promise<FormState> {
  const d = z.object({
    type: z.enum(REPORT_TYPES),
    description: z.string().trim().min(10).max(4000),
    incidentDate: z.string().max(20).optional(),
  }).safeParse(Object.fromEntries(f));
  if (!d.success) return invalid;

  const s = await getSession();
  // DEMO ONLY: stored in this app's database. Never forwarded to any authority.
  await prisma.report.create({
    data: { userId: s?.id ?? null, type: d.data.type, description: d.data.description, incidentDate: d.data.incidentDate || null },
  });
  revalidatePath("/help");
  revalidatePath("/profile");
  return { ok: true, notice: "help.sent" };
}

/* --------------------------------------------------------------- quiz */

export async function submitQuiz(_: unknown, f: FormData): Promise<QuizResult> {
  const empty: QuizResult = { ok: false, score: 0, total: 0, percent: 0, passed: false, certificateId: null, review: [] };
  const s = await getSession();
  if (!s) return { ...empty, error: "error.Not logged in." };

  const quizId = String(f.get("quizId") ?? "");
  let raw: unknown = [];
  try { raw = JSON.parse(String(f.get("answers") ?? "[]")); } catch { raw = []; }
  const parsed = z.array(z.coerce.number().int().min(-1)).max(100).safeParse(raw);
  if (!parsed.success) return { ...empty, error: "error.Invalid data." };

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { course: { include: { lessons: { select: { id: true } } } }, questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz || quiz.questions.length === 0) return { ...empty, error: "error.Course not found." };

  // Score is computed on the server. The client only sends which option was tapped.
  const review = quiz.questions.map((q, i) => ({
    index: i,
    chosen: parsed.data[i] ?? -1,
    correct: q.correctIdx,
    explanation: q.explanation,
  }));
  const scoreHits = review.filter((r) => r.chosen === r.correct).length;
  const total = quiz.questions.length;
  const percent = Math.round((scoreHits / total) * 100);
  const passed = percent >= quiz.passMark;

  await prisma.quizAttempt.create({ data: { userId: s.id, quizId: quiz.id, score: scoreHits, total, passed } });

  let certificateId: string | null = null;
  if (passed) {
    const allLessonsDone = await prisma.lessonProgress.count({ where: { userId: s.id, lessonId: { in: quiz.course.lessons.map((l) => l.id) } } }) === total;
    if (allLessonsDone) {
      const cert = await prisma.certificate.upsert({
        where: { userId_courseId: { userId: s.id, courseId: quiz.courseId } },
        update: {},
        create: { code: await nextCertificateCode(), userId: s.id, courseId: quiz.courseId },
      });
      certificateId = cert.id;
    }
  }

  revalidatePath("/", "layout");
  return { ok: true, score: scoreHits, total, percent, passed, certificateId, review };
}

/* --------------------------------------------------------- scam simulator */

export async function recordSimulatorAttempt(scenarioId: string, answeredScam: boolean) {
  const s = await getSession();
  if (!s) return { saved: false, correct: 0, total: 0 };

  const sc = await prisma.scamScenario.findUnique({ where: { id: scenarioId }, select: { isScam: true } });
  if (!sc) return { saved: false, correct: 0, total: 0 };

  const correct = answeredScam === sc.isScam;
  await prisma.simulatorAttempt.create({ data: { userId: s.id, scenarioId, answeredScam, correct } });
  const [correctCount, totalCount] = await Promise.all([
    prisma.simulatorAttempt.count({ where: { userId: s.id, correct: true } }),
    prisma.simulatorAttempt.count({ where: { userId: s.id } }),
  ]);
  revalidatePath("/", "layout");
  return { saved: true, correct: correctCount, total: totalCount };
}

/* ---------------------------------------------------------------- SHG */

/** Plain <form action> shape: the group id arrives as a hidden field. */
export async function joinShg(f: FormData): Promise<void> {
  const s = await getSession();
  if (!s) redirect("/login");
  const groupId = String(f.get("groupId") ?? "");
  const g = await prisma.shgGroup.findUnique({ where: { id: groupId }, select: { id: true } });
  if (!g) return;
  await prisma.shgMember.upsert({ where: { userId_groupId: { userId: s.id, groupId } }, update: {}, create: { userId: s.id, groupId } });
  revalidatePath("/shg");
  revalidatePath("/", "layout");
}

export async function leaveShg(f: FormData): Promise<void> {
  const s = await getSession();
  if (!s) return;
  await prisma.shgMember.deleteMany({ where: { userId: s.id, groupId: String(f.get("groupId") ?? "") } });
  revalidatePath("/shg");
}

/* ------------------------------------------------- digital business (13) */

export async function addProduct(_: unknown, f: FormData): Promise<FormState> {
  const s = await getSession();
  if (!s) redirect("/login");
  const d = z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(500).optional(),
    priceInr: z.coerce.number().int().min(1).max(1_000_000),
  }).safeParse(Object.fromEntries(f));
  if (!d.success) return invalid;

  await prisma.product.create({
    data: { ownerId: s.id, name: d.data.name, description: d.data.description || null, priceInr: d.data.priceInr },
  });
  revalidatePath("/shg/business");
  return { ok: true, notice: "business.added" };
}

export async function toggleProduct(f: FormData): Promise<void> {
  const u = await requireUser();
  const id = String(f.get("id") ?? "");
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return;
  if (p.ownerId !== u.id && u.role !== "ADMIN") return; // only the owner (or an admin) may pause a listing
  await prisma.product.update({ where: { id }, data: { active: !p.active } });
  revalidatePath("/shg/business");
}

/* ------------------------------------------------------------- admin (16) */
/* These use the plain <form action> shape, so they take a single FormData and
   return void. Pages pass the target id through hidden inputs. */

export async function createAlert(f: FormData): Promise<void> {
  await requireAdmin();
  const d = z.object({
    title: z.string().trim().min(4).max(120),
    body: z.string().trim().max(500).optional(),
    severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  }).safeParse(Object.fromEntries(f));
  if (!d.success) redirect("/admin/alerts");

  await prisma.alert.create({ data: { title: d.data.title, body: d.data.body || null, severity: d.data.severity, active: true } });
  revalidatePath("/admin/alerts");
  revalidatePath("/", "layout");
  redirect("/admin/alerts?saved=1");
}

export async function toggleAlert(f: FormData): Promise<void> {
  await requireAdmin();
  await prisma.alert.update({ where: { id: String(f.get("id") ?? "") }, data: { active: f.get("active") === "true" } });
  revalidatePath("/admin/alerts");
  revalidatePath("/", "layout");
}

export async function setUserRole(f: FormData): Promise<void> {
  const me = await requireAdmin();
  const userId = String(f.get("userId") ?? "");
  const role = String(f.get("role") ?? "");
  if (!["LEARNER", "SHG_LEADER", "ADMIN"].includes(role)) return;
  if (userId === me.id && role !== "ADMIN") return; // never lock yourself out of the demo
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function setReportStatus(f: FormData): Promise<void> {
  await requireAdmin();
  const status = String(f.get("status") ?? "");
  if (!["NEW", "REVIEWED", "ESCALATED", "CLOSED"].includes(status)) return;
  await prisma.report.update({ where: { id: String(f.get("id") ?? "") }, data: { status } });
  revalidatePath("/admin/reports");
  revalidatePath("/");
}

export async function setCoursePublished(f: FormData): Promise<void> {
  await requireAdmin();
  await prisma.course.update({ where: { id: String(f.get("courseId") ?? "") }, data: { published: f.get("published") === "true" } });
  revalidatePath("/admin/courses");
  revalidatePath("/", "layout");
}