import { DeviceMobile } from "@phosphor-icons/react/dist/ssr";
import { CourseCard } from "@/components/course-card";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";

export default async function Learn() {
  const lang = await currentLang();
  const t = translator(lang);
  const s = await getSession();

  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: {
      lessons: { orderBy: { order: "asc" }, select: { id: true, progress: { where: { userId: s?.id ?? "-" } } } },
      quiz: { select: { id: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("learn.title")} subtitle={t("learn.subtitle")} icon={<DeviceMobile size={36} weight="fill" />} />
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