import { ShieldCheck, MagnifyingGlass, Warning } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { CourseCard } from "@/components/course-card";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";

export default async function Academy() {
  const lang = await currentLang();
  const t = translator(lang);
  const s = await getSession();

  const courses = await prisma.course.findMany({
    where: { published: true, category: { in: ["CYBER_SAFETY", "SCAM_AWARENESS"] } },
    orderBy: { order: "asc" },
    include: {
      lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, titleHi: true, progress: { where: { userId: s?.id ?? "-" } } } },
      quiz: { select: { id: true, passMark: true } },
    },
  });

  const tools = [
    { href: "/safety/simulator", label: t("safety.simulator"), desc: t("sim.subtitle"), icon: Warning },
    { href: "/safety/check-message", label: t("safety.checkMessage"), desc: t("check.subtitle"), icon: MagnifyingGlass },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("safety.academy")}
        subtitle={t("safety.subtitle")}
        icon={<ShieldCheck size={36} weight="fill" />}
        back={{ href: "/safety", label: t("safety.title") }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Card key={tool.href}>
            <CardContent className="flex items-start gap-4 p-5">
              <span className="rounded-2xl bg-secondary p-3 text-primary"><tool.icon size={28} /></span>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{tool.label}</h2>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
                <Button asChild className="mt-3" size="sm"><a href={tool.href}>{t("common.viewAll")}</a></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  );
}