import Link from "next/link";
import {
  DeviceMobile, ShieldCheck, CreditCard, MagnifyingGlass, Lifebuoy, GlobeHemisphereWest,
  Warning, Bell, Lightbulb, UsersThree, GraduationCap, ArrowRight, SealCheck,
} from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import { courseProgress } from "@/lib/data";
import { pickTipOfDay } from "@/lib/tip-of-day";
import type { IconType } from "@/lib/icon";

export default async function Home() {
  const lang = await currentLang();
  const t = translator(lang);
  const s = await getSession();

  const [alerts, tips, sUser, announcements] = await Promise.all([
    prisma.alert.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.safetyTip.findMany(),
    prisma.user.findUnique({ where: { id: s?.id ?? "-" }, select: { id: true, name: true, certificates: { include: { course: true }, orderBy: { issuedAt: "desc" }, take: 3 } } }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  const tip = pickTipOfDay(tips);
  const progress = await courseProgress(s?.id);

  const quick: [string, string, string, IconType][] = [
    [t("nav.learn"), t("home.subtitle"), "/learn", DeviceMobile],
    [t("safety.title"), t("safety.subtitle"), "/safety", ShieldCheck],
    [t("payments.title"), t("payments.subtitle"), "/payments", CreditCard],
    [t("safety.checkMessage"), t("check.subtitle"), "/safety/check-message", MagnifyingGlass],
    [t("shg.title"), t("shg.subtitle"), "/shg", UsersThree],
    [t("help.title"), t("help.subtitle"), "/help", Lifebuoy],
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-primary p-6 text-primary-foreground sm:p-10">
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{t("home.title")}</h1>
        <p className="mt-4 max-w-2xl text-lg">{t("home.subtitle")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary"><Link href="/learn">{t("home.startLearning")}</Link></Button>
          <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700"><Link href="/safety">{t("home.staySafe")}</Link></Button>
          <Button asChild size="lg" variant="destructive"><Link href="/help">{t("home.getHelp")}</Link></Button>
        </div>
      </section>

      <section aria-labelledby="quick">
        <h2 id="quick" className="mb-4 text-2xl font-bold">{t("home.quickLinks")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quick.map(([title, desc, href, Icon]) => (
            <Link key={href + title} href={href} className="block h-full">
              <Card className="flex h-full items-start gap-4 transition hover:border-primary hover:shadow-md">
                <CardContent className="flex w-full items-start gap-4 p-5">
                  <span className="rounded-2xl bg-secondary p-3 text-primary"><Icon size={32} /></span>
                  <span className="flex-1">
                    <span className="block text-lg font-bold leading-snug">{title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{desc}</span>
                  </span>
                  <ArrowRight size={22} className="mt-1 shrink-0 text-muted-foreground" aria-hidden />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {tip ? (
          <Card className="border-l-8 border-l-teal-600">
            <CardContent className="flex gap-4 p-5">
              <Lightbulb size={34} weight="fill" className="shrink-0 text-teal-600" aria-hidden />
              <div>
                <h2 className="text-xl font-bold">{t("home.tipOfDay")}</h2>
                <p className="mt-1">{pick(lang, tip, "text")}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2"><Bell size={24} weight="fill" className="text-primary" />{t("home.latestAlerts")}</CardTitle>
            {sUser ? <Badge variant="secondary">{alerts.length}</Badge> : null}
          </CardHeader>
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
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2"><GraduationCap size={26} weight="fill" className="text-primary" />{t("home.learningProgress")}</CardTitle>
          {sUser ? <Button asChild size="sm" variant="ghost"><Link href="/dashboard">{t("nav.profile")}<ArrowRight size={18} /></Link></Button> : null}
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {sUser ? (
            <>
              <p className="text-muted-foreground">{progress.done} / {progress.total} {t("home.lessonsCompleted")}</p>
              <Progress value={progress.percent} aria-label={`${progress.percent}%`} />
              {sUser.certificates.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <SealCheck size={22} weight="fill" className="text-teal-600" />
                  <span className="font-semibold">{t("home.myCertificates")}:</span>
                  {sUser.certificates.map((c) => <Badge key={c.id} variant="secondary">{pick(lang, c.course, "title")}</Badge>)}
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-muted-foreground">
              {t("home.loginToTrack")}{" "}
              <Link href="/login" className="font-semibold text-primary underline">{t("nav.login")}</Link>
            </p>
          )}
        </CardContent>
      </Card>

      {announcements.length > 0 ? (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Warning size={24} weight="fill" className="text-amber-600" />{t("home.announcements")}</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-xl border p-3">
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        <GlobeHemisphereWest size={16} className="mr-1 inline" aria-hidden />{t("common.demoLong")}
      </p>
    </div>
  );
}