import Link from "next/link";
import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { TKey } from "@/lib/i18n";

export type CourseCardProps = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  lessons: number;
  done: number;
  hasQuiz: boolean;
  href?: string;
  t: (k: TKey) => string;
};

/** One course tile used by /learn, /training and /safety. */
export function CourseCard({ slug, title, summary, category, lessons, done, hasQuiz, href, t }: CourseCardProps) {
  const percent = lessons ? Math.round((done / lessons) * 100) : 0;
  const started = done > 0;
  const complete = lessons > 0 && done === lessons;
  return (
    <Link href={href ?? `/learn/${slug}`} className="block h-full">
      <Card className="flex h-full flex-col transition hover:border-primary hover:shadow-md">
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-bold leading-snug">{title}</h2>
            {complete ? <SealCheck size={26} weight="fill" className="shrink-0 text-teal-600" aria-label={t("learn.completed")} /> : null}
          </div>
          <p className="flex-1 text-muted-foreground">{summary}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{category.replace(/_/g, " ")}</Badge>
            <Badge variant="outline">{lessons} {t("common.lessons")}</Badge>
            {hasQuiz ? <Badge variant="outline">Quiz</Badge> : null}
          </div>
          {started ? (
            <div className="space-y-1">
              <Progress value={percent} aria-label={`${percent}%`} />
              <p className="text-sm text-muted-foreground">
                {done}/{lessons} · {percent}% · {complete ? t("learn.completed") : t("learn.continueCourse")}
              </p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-primary">{t("learn.startCourse")}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}