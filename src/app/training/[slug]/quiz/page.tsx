import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ListChecks, Lock } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import { parseList } from "@/lib/data";
import { QuizRunner } from "./quiz-runner";

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await currentLang();
  const t = translator(lang);
  const u = await requireUser();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      quiz: { include: { questions: { orderBy: { order: "asc" } } } },
      lessons: { select: { id: true, progress: { where: { userId: u.id } } } },
    },
  });
  if (!course) notFound();
  if (!course.quiz || course.quiz.questions.length === 0) redirect(`/learn/${course.slug}`);

  const quiz = course.quiz;
  const total = course.lessons.length;
  const done = course.lessons.filter((l) => l.progress.length).length;
  const allDone = total > 0 && done === total;

  // The quiz is locked until every lesson is finished (server-side gate, not just hidden UI).
  if (!allDone) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader title={pick(lang, course, "title")} back={{ href: "/training", label: t("training.title") }} icon={<ListChecks size={36} weight="fill" />} />
        <Card>
          <CardContent className="space-y-4 p-6 text-center">
            <Lock size={48} className="mx-auto text-primary" aria-hidden />
            <p className="text-xl font-bold">{t("training.finishLessons")}</p>
            <p className="text-muted-foreground">{done}/{total} {t("common.lesson")}</p>
            <Button asChild size="lg"><Link href={`/learn/${course.slug}`}>{t("learn.continueCourse")}</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={pick(lang, course, "title")}
        subtitle={t("training.subtitle")}
        icon={<ListChecks size={36} weight="fill" />}
        back={{ href: "/training", label: t("training.title") }}
        actions={<Badge variant="secondary">{t("training.passMark")} {quiz.passMark}%</Badge>}
      />
      {/* correctIdx is intentionally not sent to the browser: scoring happens in submitQuiz. */}
      <QuizRunner
        quizId={quiz.id}
        passMark={quiz.passMark}
        courseSlug={course.slug}
        questions={quiz.questions.map((q) => ({
          id: q.id,
          text: lang === "hi" ? (q.textHi ?? q.text) : q.text,
          options: parseList<string>(q.options),
        }))}
        lang={lang}
      />
    </div>
  );
}