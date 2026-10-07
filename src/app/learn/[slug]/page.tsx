import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle, ClipboardText, Lock } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { LessonBody } from "@/components/learn/lesson-body";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await currentLang();
  const t = translator(lang);
  const s = await getSession();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      lessons: { orderBy: { order: "asc" }, include: { progress: { where: { userId: s?.id ?? "-" } } } },
      quiz: { select: { id: true, passMark: true } },
    },
  });
  if (!course || !course.published) notFound();

  const lessons = course.lessons;
  const done = lessons.filter((l) => l.progress.length).length;
  const percent = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  const allDone = lessons.length > 0 && done === lessons.length;
  // Open the first unfinished lesson, or the first one if everything is done.
  const firstOpen = lessons.find((l) => !l.progress.length) ?? lessons[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={pick(lang, course, "title")}
        subtitle={pick(lang, course, "summary")}
        back={{ href: "/learn", label: t("learn.backToLearn") }}
        icon={<ClipboardText size={36} weight="fill" />}
        actions={<Badge variant="secondary">{course.category.replace(/_/g, " ")}</Badge>}
      />

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex-1">
            <p className="font-semibold">{t("learn.lessonProgress")}</p>
            <p className="text-sm text-muted-foreground">
              {done}/{lessons.length} {t("common.lessons")} · {percent}%
            </p>
            <Progress value={percent} className="mt-2 max-w-md" aria-label={`${percent}%`} />
          </div>
          {course.quiz ? (
            allDone ? (
              <Button asChild size="lg"><Link href={`/training/${course.slug}/quiz`}>{t("learn.takeQuiz")}<ArrowRight size={20} /></Link></Button>
            ) : (
              <p className="flex max-w-xs items-start gap-2 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
                <Lock size={20} className="mt-0.5 shrink-0" />{t("learn.quizLocked")}
              </p>
            )
          ) : null}
        </CardContent>
      </Card>

      {lessons.map((l, i) => {
        const isDone = l.progress.length > 0;
        const isOpen = firstOpen?.id === l.id;
        return (
          <section key={l.id} aria-labelledby={`lesson-${l.id}`} className="rounded-3xl border bg-card p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 id={`lesson-${l.id}`} className="text-xl font-bold">
                {t("common.lesson")} {i + 1}
                {isDone ? <span className="ml-2 inline-flex items-center gap-1 align-middle text-base font-semibold text-teal-700">
                  <CheckCircle size={22} weight="fill" />{t("learn.completed")}
                </span> : null}
              </h2>
              <Button asChild variant={isDone ? "outline" : "default"}>
                <Link href={`/learn/${course.slug}/${l.slug}`}>{isOpen ? t("learn.continueCourse") : t("learn.title")}<ArrowRight size={18} /></Link>
              </Button>
            </div>
            <LessonBody lesson={l} lang={lang} />
          </section>
        );
      })}
    </div>
  );
}