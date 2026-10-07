import { CheckCircle, Circle } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { lines } from "@/lib/data";
import type { Lang } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

type Body = { title: string; titleHi?: string | null; body: string; bodyHi?: string | null; steps: string; stepsHi?: string | null };

/** Renders one lesson: the explanation text plus the numbered, step-by-step list. */
export function LessonBody({ lesson, lang }: { lesson: Body; lang: Lang }) {
  const steps = lines(pick(lang, lesson, "steps"));
  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-2 text-2xl font-bold">{pick(lang, lesson, "title")}</h2>
        <p className="text-lg leading-relaxed">{pick(lang, lesson, "body")}</p>
      </div>
      {steps.length > 0 ? (
        <Card className="bg-secondary/60">
          <CardContent className="p-5">
            <h3 className="mb-3 text-lg font-bold">{lang === "hi" ? "कदम-दर-कदम करें" : "Do it step by step"}</h3>
            <ol className="space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-lg">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export function LessonTick({ done }: { done: boolean }) {
  return done ? (
    <CheckCircle size={26} weight="fill" className="shrink-0 text-teal-600" aria-label="done" />
  ) : (
    <Circle size={26} className="shrink-0 text-muted-foreground" aria-label="not done" />
  );
}

export { Progress };