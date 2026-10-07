import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/nav";
import { BarList, ColumnChart } from "@/components/admin/charts";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";
import { reportTypeLabel } from "@/lib/data";

export default async function AdminAnalytics() {
  await requireAdmin();
  const lang = await currentLang();
  const t = translator(lang);

  const [courses, lessonRows, byType, byStatus, byRole, certByCourse, simAttempts, msgByVerdict, quizAttempts, groups] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      select: { id: true, title: true, titleHi: true, category: true, lessons: { select: { progress: { select: { userId: true } } } } },
    }),
    prisma.lessonProgress.findMany({ select: { completedAt: true } }),
    prisma.report.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.report.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.certificate.groupBy({ by: ["courseId"], _count: { _all: true } }),
    prisma.simulatorAttempt.groupBy({ by: ["correct"], _count: { _all: true } }),
    prisma.messageCheck.groupBy({ by: ["verdict"], _count: { _all: true } }),
    prisma.quizAttempt.aggregate({ _count: { _all: true }, _sum: { score: true, total: true } }),
    prisma.shgGroup.count(),
  ]);

  // Completions per course, plus the number of distinct learners per course.
  const perCourse = courses.map((c) => ({
    label: lang === "hi" ? (c.titleHi ?? c.title) : c.title,
    value: c.lessons.reduce((n, l) => n + l.progress.length, 0),
    learners: new Set(c.lessons.flatMap((l) => l.progress.map((p) => p.userId))).size,
    lessons: c.lessons.length,
  }));

  // Lesson completions per day for the last 10 days.
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 9);
  const daily = Array.from({ length: 10 }, (_, i) => {
    const day = new Date(since);
    day.setDate(since.getDate() + i);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    return {
      label: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      value: lessonRows.filter((r) => r.completedAt >= day && r.completedAt < next).length,
    };
  });

  const courseTitle = new Map(courses.map((c) => [c.id, lang === "hi" ? (c.titleHi ?? c.title) : c.title]));
  const certPoints = certByCourse.map((c) => ({ label: courseTitle.get(c.courseId) ?? c.courseId, value: c._count._all }));
  const simCorrect = simAttempts.find((s) => s.correct)?._count._all ?? 0;
  const simTotal = simCorrect + (simAttempts.find((s) => !s.correct)?._count._all ?? 0);
  const avgQuiz = quizAttempts._count._all > 0 && quizAttempts._sum.total
    ? Math.round((quizAttempts._sum.score! / quizAttempts._sum.total) * 100)
    : 0;

  const cards: { title: string; body: React.ReactNode }[] = [
    { title: t("admin.lessonCompletions"), body: <ColumnChart points={daily} /> },
    { title: t("admin.topCourses"), body: <BarList points={[...perCourse].sort((a, b) => b.value - a.value)} /> },
    { title: t("admin.totalCertificates"), body: <BarList points={certPoints} /> },
    { title: t("admin.reportBreakdown"), body: <BarList points={byType.map((r) => ({ label: reportTypeLabel(r.type, lang), value: r._count._all })).sort((a, b) => b.value - a.value)} /> },
    { title: t("common.status"), body: <BarList points={byStatus.map((r) => ({ label: r.status, value: r._count._all }))} /> },
    { title: t("admin.role"), body: <BarList points={byRole.map((r) => ({ label: r.role, value: r._count._all }))} /> },
    {
      title: t("safety.simulator"),
      body: (
        <div className="space-y-2">
          <BarList points={[{ label: t("sim.correct"), value: simCorrect }, { label: t("sim.notQuite"), value: simTotal - simCorrect }]} />
          <p className="text-sm text-muted-foreground">{simTotal ? `${Math.round((simCorrect / simTotal) * 100)}%` : "—"}</p>
        </div>
      ),
    },
    {
      title: t("safety.checkMessage"),
      body: <BarList points={msgByVerdict.map((m) => ({ label: t(`check.${m.verdict}` as "check.LIKELY_SAFE"), value: m._count._all }))} />,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={t("admin.analytics")} subtitle={t("admin.subtitle")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-3xl font-bold">{avgQuiz}%</p><p className="text-sm text-muted-foreground">{t("training.yourScore")} ({lang === "hi" ? "औसत" : "average"})</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-3xl font-bold">{lessonRows.length}</p><p className="text-sm text-muted-foreground">{t("admin.lessonCompletions")}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-3xl font-bold">{groups}</p><p className="text-sm text-muted-foreground">{t("admin.totalShgs")}</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader><CardTitle>{c.title}</CardTitle></CardHeader>
            <CardContent>{c.body}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>{t("admin.topCourses")}</CardTitle></CardHeader>
        <CardContent>
          <BarList points={perCourse.map((c) => ({ label: `${c.label} (${c.learners}/${c.lessons})`, value: c.learners }))} />
        </CardContent>
      </Card>
    </div>
  );
}