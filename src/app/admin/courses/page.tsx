import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/nav";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import { setCoursePublished } from "@/app/actions";

export default async function AdminCourses() {
  await requireAdmin();
  const lang = await currentLang();
  const t = translator(lang);

  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: { orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, titleHi: true, progress: { select: { id: true } } } },
      quiz: { include: { questions: { select: { id: true } }, attempts: { select: { passed: true, score: true, total: true } } } },
    },
  });

  return (
    <div className="space-y-4">
      <PageHeader title={t("admin.courses")} subtitle={t("admin.subtitle")} />

      <div className="space-y-4">
        {courses.map((c) => {
          const completions = c.lessons.reduce((n, l) => n + l.progress.length, 0);
          const attempts = c.quiz?.attempts ?? [];
          const passed = attempts.filter((a) => a.passed).length;
          return (
            <div key={c.id} className="rounded-2xl border bg-card">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{pick(lang, c, "title")}</h2>
                    <Badge variant={c.published ? "secondary" : "outline"}>{c.published ? t("admin.active") : t("common.no")}</Badge>
                    <Badge variant="outline">{c.category.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{pick(lang, c, "summary")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">/learn/{c.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild size="sm" variant="ghost"><Link href={`/learn/${c.slug}`}>{t("common.viewAll")}</Link></Button>
                  <form action={setCoursePublished}>
                    <input type="hidden" name="courseId" value={c.id} />
                    <input type="hidden" name="published" value={String(!c.published)} />
                    <Button type="submit" size="sm" variant="outline">
                      {c.published ? t("common.no") : t("common.yes")} · {t("admin.active")}
                    </Button>
                  </form>
                </div>
              </div>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeadCell>#</TableHeadCell>
                    <TableHeadCell>{t("common.lesson")}</TableHeadCell>
                    <TableHeadCell>{t("admin.lessonCompletions")}</TableHeadCell>
                    <TableHeadCell>Slug</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {c.lessons.map((l, i) => (
                    <TableRow key={l.id}>
                      <TableCell className="tabular-nums">{i + 1}</TableCell>
                      <TableCell>{pick(lang, l, "title")}</TableCell>
                      <TableCell className="tabular-nums">{l.progress.length}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{l.slug}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-wrap gap-3 border-t p-4 text-sm text-muted-foreground">
                <span><b>{c.lessons.length}</b> {t("common.lessons")}</span>
                <span><b>{c.quiz?.questions.length ?? 0}</b> {lang === "hi" ? "सवाल" : "questions"}</span>
                <span><b>{completions}</b> {t("admin.lessonCompletions").toLowerCase()}</span>
                <span><b>{passed}/{attempts.length}</b> {t("training.passed").toLowerCase()}</span>
                <span>{t("training.passMark")} <b>{c.quiz?.passMark ?? "—"}%</b></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}