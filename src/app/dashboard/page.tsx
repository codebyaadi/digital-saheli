import Link from "next/link";
import {
  House, Bell, Lightbulb, GraduationCap, SealCheck, CalendarBlank, ArrowRight,
  ClipboardText, UsersThree, Storefront, WarningOctagon,
} from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { CourseCard } from "@/components/course-card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import { courseProgress, dateLong, dateTimeLong } from "@/lib/data";
import { pickTipOfDay } from "@/lib/tip-of-day";

export default async function Dashboard() {
  const u = await requireUser();
  const lang = await currentLang();
  const t = translator(lang);

  const [alerts, tips, courses, certs, upcoming, reportCount] = await Promise.all([
    prisma.alert.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.safetyTip.findMany(),
    prisma.course.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      include: {
        lessons: { select: { id: true, title: true, progress: { where: { userId: u.id } } } },
        quiz: { select: { id: true } },
      },
    }),
    prisma.certificate.findMany({ where: { userId: u.id }, include: { course: true }, orderBy: { issuedAt: "desc" } }),
    prisma.meeting.findMany({
      where: { startsAt: { gte: new Date(Date.now() - 86_400_000) }, group: { members: { some: { userId: u.id } } } },
      include: { group: true },
      orderBy: { startsAt: "asc" },
      take: 3,
    }),
    prisma.report.count({ where: { userId: u.id } }),
  ]);

  const progress = await courseProgress(u.id);
  const tip = pickTipOfDay(tips);
  const myGroups = await prisma.shgMember.count({ where: { userId: u.id } });

  const stats = [
    { label: t("home.lessonsCompleted"), value: `${progress.done}/${progress.total}`, icon: GraduationCap },
    { label: t("profile.certificates"), value: certs.length, icon: SealCheck },
    { label: t("shg.myGroups"), value: myGroups, icon: UsersThree },
    { label: t("help.myReports"), value: reportCount, icon: ClipboardText },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={`${t("nav.home")}, ${u.name.split(" ")[0]}`} subtitle={t("home.subtitle")} icon={<House size={36} weight="fill" />} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="rounded-2xl bg-secondary p-3 text-primary"><s.icon size={28} /></span>
              <div>
                <p className="text-3xl font-bold leading-none">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2"><GraduationCap size={24} weight="fill" className="text-primary" />{t("home.learningProgress")}</CardTitle>
          <span className="text-2xl font-bold">{progress.percent}%</span>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <Progress value={progress.percent} aria-label={`${progress.percent}%`} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => {
              const done = c.lessons.filter((l) => l.progress.length).length;
              return (
                <CourseCard
                  key={c.id}
                  id={c.id}
                  slug={c.slug}
                  title={pick(lang, c, "title")}
                  summary={pick(lang, c, "summary")}
                  category={c.category}
                  lessons={c.lessons.length}
                  done={done}
                  hasQuiz={Boolean(c.quiz)}
                  t={t}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell size={24} weight="fill" className="text-primary" />{t("home.latestAlerts")}</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            {alerts.length === 0 ? <p className="text-muted-foreground">{t("common.empty")}</p> : null}
            {alerts.map((a) => (
              <div key={a.id} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={a.severity === "HIGH" ? "destructive" : a.severity === "MEDIUM" ? "default" : "secondary"}>{a.severity}</Badge>
                  <p className="font-semibold">{pick(lang, a, "title")}</p>
                </div>
                {a.body ? <p className="mt-1 text-sm text-muted-foreground">{a.body}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {tip ? (
            <Card className="border-l-8 border-l-teal-600">
              <CardContent className="flex gap-4 p-5">
                <Lightbulb size={32} weight="fill" className="shrink-0 text-teal-600" aria-hidden />
                <div>
                  <p className="font-bold">{t("home.tipOfDay")}</p>
                  <p className="mt-1">{pick(lang, tip, "text")}</p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2"><CalendarBlank size={24} weight="fill" className="text-primary" />{t("shg.meetings")}</CardTitle>
              <Button asChild size="sm" variant="ghost"><Link href="/shg">{t("common.viewAll")}<ArrowRight size={16} /></Link></Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {upcoming.length === 0 ? <p className="text-muted-foreground">{t("common.empty")}</p> : null}
              {upcoming.map((m) => (
                <div key={m.id} className="rounded-xl border p-3">
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-sm text-muted-foreground">{m.group.name} · {dateTimeLong(m.startsAt)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2"><SealCheck size={24} weight="fill" className="text-teal-600" />{t("profile.certificates")}</CardTitle>
            <Button asChild size="sm" variant="ghost"><Link href="/training/certificates">{t("common.viewAll")}<ArrowRight size={16} /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {certs.length === 0 ? (
              <p className="text-muted-foreground">{t("training.allLessonsDone")}</p>
            ) : (
              certs.map((c) => (
                <Link key={c.id} href={`/training/certificate/${c.id}`} className="flex items-center gap-3 rounded-xl border p-3 hover:border-primary">
                  <SealCheck size={26} weight="fill" className="shrink-0 text-teal-600" />
                  <span className="flex-1">
                    <span className="block font-semibold">{pick(lang, c.course, "title")}</span>
                    <span className="block text-sm text-muted-foreground">{c.code} · {dateLong(c.issuedAt)}</span>
                  </span>
                  <ArrowRight size={20} className="text-muted-foreground" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><WarningOctagon size={24} weight="fill" className="text-destructive" />{t("safety.title")}</CardTitle></CardHeader>
          <CardContent className="grid gap-3 pt-0">
            <Button asChild size="lg" variant="outline" className="justify-start"><Link href="/safety/check-message"><WarningOctagon size={22} />{t("safety.checkMessage")}</Link></Button>
            <Button asChild size="lg" variant="outline" className="justify-start"><Link href="/safety/simulator">{t("safety.simulator")}</Link></Button>
            <Button asChild size="lg" variant="outline" className="justify-start"><Link href="/shg/business"><Storefront size={22} />{t("shg.business")}</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}