import Link from "next/link";
import { GraduationCap, ArrowRight, Lock, CheckCircle, SealCheck, ListChecks } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import { parseList } from "@/lib/data";

export default async function TrainingPage() {
  const lang = await currentLang();
  const t = translator(lang);
  const s = await getSession();

  const [courses, attempts, certs] = await Promise.all([
    prisma.course.findMany({
      where: { published: true, quiz: { isNot: null } },
      orderBy: { order: "asc" },
      include: {
        lessons: { select: { id: true, progress: { where: { userId: s?.id ?? "-" } } } },
        quiz: { include: { questions: { select: { id: true } } } },
      },
    }),
    s ? prisma.quizAttempt.findMany({ where: { userId: s.id }, orderBy: { createdAt: "desc" } }) : Promise.resolve([]),
    s ? prisma.certificate.findMany({ where: { userId: s.id }, include: { course: true } }) : Promise.resolve([]),
  ]);

  const bestScore = new Map<string, number>();
  for (const a of attempts) {
    const pct = Math.round((a.score / Math.max(a.total, 1)) * 100);
    if ((bestScore.get(a.quizId) ?? -1) < pct) bestScore.set(a.quizId, pct);
  }

  return (
    <div className="space-y-8">
      <PageHeader title={t("training.title")} subtitle={t("training.subtitle")} icon={<GraduationCap size={36} weight="fill" />} />

      {s && certs.length > 0 ? (
        <Card className="border-l-8 border-l-teal-600">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="flex items-center gap-2 font-semibold">
              <SealCheck size={24} weight="fill" className="text-teal-600" />
              {t("profile.certificates")}: {certs.length}
            </p>
            <Button asChild variant="outline"><Link href="/training/certificates">{t("common.viewAll")}</Link></Button>
          </CardContent>
        </Card>
      ) : null}

      <section aria-labelledby="training-courses">
        <h2 id="training-courses" className="mb-4 flex items-center gap-2 text-2xl font-bold">
          <ListChecks size={28} weight="fill" className="text-primary" />{t("training.courses")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((c) => {
            const total = c.lessons.length;
            const done = c.lessons.filter((l) => l.progress.length).length;
            const percent = total ? Math.round((done / total) * 100) : 0;
            const allDone = total > 0 && done === total;
            const quizId = c.quiz?.id ?? "";
            const score = bestScore.get(quizId);
            const hasCert = certs.some((x) => x.courseId === c.id);
            const totalQuestions = c.quiz?.questions.length ?? 0;

            return (
              <Card key={c.id} className="flex h-full flex-col">
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold leading-snug">{pick(lang, c, "title")}</h3>
                    {hasCert ? <Badge variant="secondary"><CheckCircle size={12} weight="fill" />{t("training.passed")}</Badge> : null}
                  </div>
                  <p className="flex-1 text-muted-foreground">{pick(lang, c, "summary")}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline">{total} {t("common.lessons")}</Badge>
                    <Badge variant="outline">{totalQuestions} {lang === "hi" ? "सवाल" : "questions"}</Badge>
                    {c.quiz ? <Badge variant="outline">{t("training.passMark")} {c.quiz.passMark}%</Badge> : null}
                  </div>
                  <Progress value={percent} aria-label={`${percent}%`} />
                  <p className="text-sm text-muted-foreground">{done}/{total} {t("common.lesson")} · {percent}%</p>

                  {score !== undefined ? (
                    <p className="text-sm font-semibold">
                      {t("training.yourScore")}: {score}% ·{" "}
                      <span className={score >= (c.quiz?.passMark ?? 60) ? "text-teal-700" : "text-amber-700"}>
                        {score >= (c.quiz?.passMark ?? 60) ? t("training.passed") : t("training.failed")}
                      </span>
                    </p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap gap-2">
                    {!allDone ? (
                      <Button asChild size="lg" className="w-full sm:w-auto">
                        <Link href={`/learn/${c.slug}`}><Lock size={18} />{t("training.finishLessons")}</Link>
                      </Button>
                    ) : (
                      <Button asChild size="lg" className="w-full sm:w-auto">
                        <Link href={`/training/${c.slug}/quiz`}>
                          {score !== undefined ? t("training.retryQuiz") : t("training.startQuiz")}<ArrowRight size={18} />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}