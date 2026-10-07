"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, SealCheck, Printer, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { submitQuiz } from "@/app/actions";
import type { QuizResult } from "@/lib/action-types";
import { translator, type Lang } from "@/lib/i18n";

type Q = { id: string; text: string; options: string[] };

type Props = {
  quizId: string;
  passMark: number;
  courseSlug: string;
  questions: Q[];
  lang: Lang;
};

export function QuizRunner({ quizId, passMark, courseSlug, questions, lang }: Props) {
  const t = translator(lang);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [result, setResult] = useState<QuizResult | null>(null);
  const [pending, startTransition] = useTransition();

  const q = questions[i];
  const answeredAll = answers.every((a) => a >= 0);

  function submit() {
    startTransition(async () => setResult(await submitQuiz(null, formData())));
  }

  // The client only ever sends indexes; the server owns the answer key.
  function formData() {
    const fd = new FormData();
    fd.set("quizId", quizId);
    fd.set("answers", JSON.stringify(answers));
    return fd;
  }

  if (result) {
    const qText = lang === "hi" ? "सही उत्तर" : "Correct answer";
    return (
      <div className="space-y-6">
        <Card className={result.passed ? "border-2 border-teal-400" : "border-2 border-amber-400"}>
          <CardContent className="space-y-4 p-6 text-center">
            <p className={`text-5xl font-bold ${result.passed ? "text-teal-700" : "text-amber-700"}`}>
              {result.score}/{result.total}
            </p>
            <Progress value={result.percent} aria-label={`${result.percent}%`} />
            <p className="text-xl font-bold">
              {result.passed ? t("training.passed") : t("training.failed")} · {result.percent}% ({t("training.passMark")} {passMark}%)
            </p>
            {result.passed && !result.certificateId ? (
              <p className="flex items-start justify-center gap-2 text-sm text-muted-foreground">
                <Warning size={18} className="mt-0.5 shrink-0" />{t("training.finishLessons")}
              </p>
            ) : null}
            <div className="flex flex-wrap justify-center gap-3">
              {result.certificateId ? (
                <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700">
                  <Link href={`/training/certificate/${result.certificateId}`}><SealCheck size={20} weight="fill" />{t("training.getCertificate")}</Link>
                </Button>
              ) : null}
              <Button asChild size="lg" variant="outline"><Link href="/training">{t("training.courses")}</Link></Button>
              <Button size="lg" variant="secondary" onClick={() => { setResult(null); setI(0); setAnswers(questions.map(() => -1)); }}>
                {t("training.retryQuiz")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <section aria-labelledby="review">
          <h2 id="review" className="mb-3 text-xl font-bold">{t("training.reviewAnswers")}</h2>
          <div className="space-y-4">
            {questions.map((question, idx) => {
              const rev = result.review[idx];
              const chosen = rev?.chosen ?? -1;
              const correct = rev?.correct ?? -1;
              const ok = chosen === correct;
              return (
                <Card key={question.id}>
                  <CardContent className="space-y-3 p-5">
                    <p className="flex items-start gap-2 font-semibold">
                      {ok ? <CheckCircle size={24} weight="fill" className="mt-0.5 shrink-0 text-teal-600" /> : <XCircle size={24} weight="fill" className="mt-0.5 shrink-0 text-destructive" />}
                      {idx + 1}. {question.text}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {question.options.map((opt, oi) => {
                        const isCorrect = oi === correct;
                        const isChosen = oi === chosen;
                        return (
                          <p key={oi} className={`rounded-xl border p-2.5 text-sm ${
                            isCorrect ? "border-teal-400 bg-teal-50 font-semibold text-teal-900"
                            : isChosen ? "border-red-300 bg-red-50 text-red-900"
                            : "border-border"
                          }`}>
                            {isCorrect ? <Badge variant="secondary" className="mr-1.5">{qText}</Badge> : null}
                            {isChosen && !isCorrect ? <Badge variant="destructive" className="mr-1.5">{t("training.yourAnswer")}</Badge> : null}
                            {opt}
                          </p>
                        );
                      })}
                    </div>
                    {rev?.explanation ? (
                      <p className="rounded-xl bg-secondary p-3 text-sm">
                        <b>{t("training.explanation")}: </b>{rev.explanation}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">
            {t("training.questionOf")} {i + 1} {t("common.of")} {questions.length}
          </p>
          <p className="text-sm text-muted-foreground">
            {answers.filter((a) => a >= 0).length}/{questions.length}
          </p>
        </div>
        <Progress value={((i + 1) / questions.length) * 100} aria-label={`${Math.round(((i + 1) / questions.length) * 100)}%`} />
      </div>

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <fieldset>
            <legend className="text-xl font-bold leading-snug">{q.text}</legend>
            <div className="mt-4 grid gap-3">
              {q.options.map((opt, oi) => {
                const selected = answers[i] === oi;
                return (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-lg transition ${
                      selected ? "border-primary bg-secondary font-semibold" : "hover:border-primary"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q${i}`}
                      value={oi}
                      checked={selected}
                      onChange={() => setAnswers((prev) => prev.map((a, idx) => (idx === i ? oi : a)))}
                      className="size-5 accent-[var(--primary)]"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-between gap-3">
        <Button variant="outline" size="lg" disabled={i === 0} onClick={() => setI(i - 1)}>
          <ArrowLeft size={20} />{t("common.previous")}
        </Button>
        {i < questions.length - 1 ? (
          <Button size="lg" onClick={() => setI(i + 1)}>{t("common.next")}<ArrowRight size={20} /></Button>
        ) : (
          <Button size="lg" disabled={!answeredAll || pending} onClick={submit} className="bg-teal-600 hover:bg-teal-700">
            {pending ? t("common.loading") : t("training.showResults")}
          </Button>
        )}
      </div>
    </div>
  );
}
