import Link from "next/link";
import { Users, BookOpen, UsersThree, SealCheck, Siren, ClipboardText, WarningOctagon } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard } from "@/components/admin/nav";
import { BarList, ColumnChart } from "@/components/admin/charts";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";
import { dateLong, reportTypeLabel } from "@/lib/data";

export default async function AdminOverview() {
  await requireAdmin();
  const lang = await currentLang();
  const t = translator(lang);

  const [users, courses, lessons, shgs, certs, alerts, reports, questions, recentReports] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.lessonProgress.count(),
    prisma.shgGroup.count(),
    prisma.certificate.count(),
    prisma.alert.count({ where: { active: true } }),
    prisma.report.count(),
    prisma.question.count(),
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { name: true } } } }),
  ]);

  // Sign-ups per day for the last 7 days.
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);
  const recentUsers = await prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } });
  const signups = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(since);
    day.setDate(since.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    return {
      label: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      value: recentUsers.filter((u) => new Date(u.createdAt).toISOString().slice(0, 10) === key).length,
    };
  });

  // Completions per course.
  const courseRows = await prisma.course.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    select: { id: true, title: true, titleHi: true, lessons: { select: { progress: { select: { id: true } } } } },
  });
  const completions = courseRows
    .map((c) => ({ label: lang === "hi" ? (c.titleHi ?? c.title) : c.title, value: c.lessons.reduce((n, l) => n + l.progress.length, 0) }))
    .sort((a, b) => b.value - a.value);

  // Reports grouped by type.
  const byType = await prisma.report.groupBy({ by: ["type"], _count: { _all: true } });
  const reportPoints = byType
    .map((r) => ({ label: reportTypeLabel(r.type, lang), value: r._count._all }))
    .sort((a, b) => b.value - a.value);

  const stats = [
    { label: t("admin.totalUsers"), value: users, icon: Users, href: "/admin/users" },
    { label: t("common.courses"), value: courses, icon: BookOpen, href: "/admin/courses" },
    { label: t("common.lessons"), value: lessons, icon: BookOpen, href: "/admin/analytics" },
    { label: t("admin.totalShgs"), value: shgs, icon: UsersThree, href: "/admin/shgs" },
    { label: t("admin.totalCertificates"), value: certs, icon: SealCheck, href: "/admin/certificates" },
    { label: t("admin.totalAlerts"), value: alerts, icon: Siren, href: "/admin/alerts" },
    { label: t("admin.reports"), value: reports, icon: ClipboardText, href: "/admin/reports" },
    { label: t("training.title"), value: questions, icon: WarningOctagon, href: "/admin/courses" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("admin.overview")} subtitle={t("admin.subtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="h-full"><StatCard {...s} /></Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t("admin.signups")}</CardTitle></CardHeader>
          <CardContent><ColumnChart points={signups} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("admin.topCourses")}</CardTitle></CardHeader>
          <CardContent><BarList points={completions} /></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t("admin.reportBreakdown")}</CardTitle></CardHeader>
          <CardContent><BarList points={reportPoints} /></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t("admin.recentReports")}
              <Link href="/admin/reports" className="text-sm text-primary underline">{t("common.viewAll")}</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentReports.length === 0 ? <p className="text-muted-foreground">{t("common.empty")}</p> : null}
            {recentReports.map((r) => (
              <div key={r.id} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant={r.status === "NEW" ? "destructive" : "secondary"}>{r.status}</Badge>
                  <span className="text-xs text-muted-foreground">{dateLong(r.createdAt)}</span>
                </div>
                <p className="mt-1 font-semibold">{reportTypeLabel(r.type, lang)}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.user?.name ?? "Guest"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}