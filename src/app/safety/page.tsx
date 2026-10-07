import Link from "next/link";
import { ShieldCheck, Warning, MagnifyingGlass, LockKey, GraduationCap } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { CourseCard } from "@/components/course-card";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n";
import type { IconType } from "@/lib/icon";

export default async function SafetyPage() {
  const lang = await currentLang();
  const t = translator(lang);
  const s = await getSession();

  const tools: { titleKey: TKey; descKey: TKey; href: string; icon: IconType; accent: string }[] = [
    { titleKey: "safety.checkMessage", descKey: "check.subtitle", href: "/safety/check-message", icon: MagnifyingGlass, accent: "bg-teal-600" },
    { titleKey: "safety.simulator", descKey: "sim.subtitle", href: "/safety/simulator", icon: Warning, accent: "bg-amber-500" },
    { titleKey: "safety.academy", descKey: "safety.subtitle", href: "/safety/academy", icon: ShieldCheck, accent: "bg-primary" },
  ];

  const courses = await prisma.course.findMany({
    where: { published: true, category: { in: ["CYBER_SAFETY", "SCAM_AWARENESS", "PAYMENTS"] } },
    orderBy: { order: "asc" },
    include: {
      lessons: { select: { id: true, progress: { where: { userId: s?.id ?? "-" } } } },
      quiz: { select: { id: true } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader title={t("safety.title")} subtitle={t("safety.subtitle")} icon={<ShieldCheck size={36} weight="fill" />} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="block h-full">
            <Card className="flex h-full flex-col transition hover:border-primary hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <span className={`w-fit rounded-2xl p-3 text-white ${tool.accent}`}><tool.icon size={30} /></span>
                <h2 className="text-lg font-bold leading-snug">{t(tool.titleKey)}</h2>
                <p className="flex-1 text-sm text-muted-foreground">{t(tool.descKey)}</p>
                <Button asChild variant="ghost" className="w-fit px-0 hover:bg-transparent hover:text-primary hover:underline">
                  <Link href={tool.href}>{t("common.viewAll")} →</Link>
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <section aria-labelledby="safety-courses">
        <h2 id="safety-courses" className="mb-4 flex items-center gap-2 text-2xl font-bold">
          <GraduationCap size={28} weight="fill" className="text-primary" />{t("common.courses")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              id={c.id}
              slug={c.slug}
              title={pick(lang, c, "title")}
              summary={pick(lang, c, "summary")}
              category={c.category}
              lessons={c.lessons.length}
              done={c.lessons.filter((l) => l.progress.length).length}
              hasQuiz={Boolean(c.quiz)}
              t={t}
            />
          ))}
        </div>
      </section>

      <Card className="border-l-8 border-l-primary">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="flex items-center gap-2 font-semibold"><LockKey size={22} className="text-primary" />{t("check.disclaimer")}</p>
          <Button asChild variant="outline"><Link href="/help">{t("help.title")}</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}