import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, ListChecks } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { LessonBody } from "@/components/learn/lesson-body";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import { completeLesson } from "@/app/actions";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const lang = await currentLang();
  const t = translator(lang);
  const s = await getSession();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      lessons: { orderBy: { order: "asc" }, include: { progress: { where: { userId: s?.id ?? "-" } } } },
      quiz: { select: { id: true } },
    },
  });
  if (!course || !course.published) notFound();

  const idx = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx < 0) notFound();
  const lesson = course.lessons[idx];
  const prev = course.lessons[idx - 1];
  const next = course.lessons[idx + 1];

  const done = course.lessons.filter((l) => l.progress.length).length;
  const percent = course.lessons.length ? Math.round((done / course.lessons.length) * 100) : 0;
  const isDone = lesson.progress.length > 0;
  const allDone = done === course.lessons.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={pick(lang, course, "title")}
        subtitle={`${t("common.lesson")} ${idx + 1} ${t("common.of")} ${course.lessons.length}`}
        back={{ href: `/learn/${course.slug}`, label: t("learn.backToLearn") }}
        icon={<ListChecks size={36} weight="fill" />}
      />

      <Card>
        <CardContent className="space-y-2 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{t("learn.lessonProgress")}</p>
            <p className="text-sm text-muted-foreground">{done}/{course.lessons.length} · {percent}%</p>
          </div>
          <Progress value={percent} aria-label={`${percent}%`} />
        </CardContent>
      </Card>

      <article className="rounded-3xl border bg-card p-5 sm:p-7">
        <LessonBody lesson={lesson} lang={lang} />

        <div className="mt-7 border-t pt-5">
          {isDone ? (
            <p className="flex items-center gap-2 text-lg font-bold text-teal-700">
              <CheckCircle size={28} weight="fill" />{t("learn.alreadyDone")}
            </p>
          ) : s ? (
            /* Guests read the lesson but cannot save progress, so they are sent to login instead. */
            <form action={completeLesson}>
              <input type="hidden" name="lessonId" value={lesson.id} />
              <Button type="submit" size="lg" className="w-full sm:w-auto">{t("learn.markComplete")}</Button>
            </form>
          ) : (
            <div className="rounded-2xl bg-secondary p-4">
              <p className="font-semibold">{t("common.loginNeeded")}</p>
              <p className="text-sm text-secondary-foreground">{t("common.loginNeededBody")}</p>
              <Button asChild size="lg" className="mt-3"><Link href="/login">{t("nav.login")}</Link></Button>
            </div>
          )}
        </div>
      </article>

      {allDone && course.quiz ? (
        <Card className="border-l-8 border-l-teal-600">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="font-semibold">{t("learn.quizReady")}</p>
            <Button asChild><Link href={`/training/${course.slug}/quiz`}>{t("learn.takeQuiz")}</Link></Button>
          </CardContent>
        </Card>
      ) : null}

      <nav aria-label="Lesson navigation" className="flex flex-wrap justify-between gap-3">
        {prev ? (
          <Button asChild variant="outline" size="lg">
            <Link href={`/learn/${course.slug}/${prev.slug}`}><ArrowLeft size={20} />{t("common.previous")}</Link>
          </Button>
        ) : <span />}
        {next ? (
          <Button asChild size="lg">
            <Link href={`/learn/${course.slug}/${next.slug}`}>{t("common.next")}<ArrowRight size={20} /></Link>
          </Button>
        ) : (
          <Button asChild variant="secondary" size="lg"><Link href={`/learn/${course.slug}`}>{t("learn.backToLearn")}</Link></Button>
        )}
      </nav>
    </div>
  );
}