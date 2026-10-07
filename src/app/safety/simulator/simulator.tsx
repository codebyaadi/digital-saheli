"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { recordSimulatorAttempt } from "@/app/actions";
import { translator, type Lang } from "@/lib/i18n";

export type Scenario = {
  id: string; type: string; message: string; messageHi: string | null;
  isScam: boolean; explanation: string; explanationHi: string | null;
};

type Props = {
  items: Scenario[];
  loggedIn: boolean;
  savedScore: { correct: number; total: number } | null;
  lang: Lang;
};

export function Simulator({ items, loggedIn, savedScore, lang }: Props) {
  const t = translator(lang);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [saved, setSaved] = useState(savedScore);
  const [, startTransition] = useTransition();

  if (items.length === 0) return <p className="text-muted-foreground">{t("sim.noExamples")}</p>;
  const s = items[i % items.length];
  const text = (lang === "hi" ? s.messageHi : null) ?? s.message;
  const why = (lang === "hi" ? s.explanationHi : null) ?? s.explanation;
  const done = answered >= items.length;

  function choose(saysScam: boolean) {
    if (answer !== null) return;
    setAnswer(saysScam);
    const ok = saysScam === s.isScam;
    if (ok) setRoundCorrect((n) => n + 1);
    setAnswered((n) => n + 1);
    if (loggedIn) {
      startTransition(async () => {
        const r = await recordSimulatorAttempt(s.id, saysScam);
        if (r.saved) setSaved({ correct: r.correct, total: r.total });
      });
    }
  }

  function restart() {
    setI(0); setAnswer(null); setRoundCorrect(0); setAnswered(0);
  }

  const percent = answered ? Math.round((roundCorrect / answered) * 100) : 0;
  const best = saved && saved.total > 0 ? Math.round((saved.correct / saved.total) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge2>{s.type}</Badge2>
            <span className="text-sm text-muted-foreground">{t("training.questionOf")} {Math.min(i + 1, items.length)} / {items.length}</span>
          </div>

          {/* The message is shown like a real WhatsApp bubble. */}
          <div className="rounded-2xl rounded-bl-sm bg-[#dcf8c6] p-4 text-[#0b3d1a] shadow-sm">
            <p className="whitespace-pre-wrap">{text}</p>
          </div>

          {!done && answer === null ? (
            <div>
              <h2 className="mb-3 text-xl font-bold">{t("sim.question")}</h2>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700" onClick={() => choose(false)}>{t("sim.safe")}</Button>
                <Button size="lg" variant="destructive" onClick={() => choose(true)}>{t("sim.suspicious")}</Button>
              </div>
            </div>
          ) : null}

          {answer !== null ? (
            <div className={`rounded-2xl border p-4 ${answer === s.isScam ? "border-teal-300 bg-teal-50" : "border-amber-300 bg-amber-50"}`}>
              <p className={`flex items-center gap-2 text-lg font-bold ${answer === s.isScam ? "text-teal-800" : "text-amber-900"}`}>
                {answer === s.isScam ? <CheckCircle size={26} weight="fill" /> : <XCircle size={26} weight="fill" />}
                {answer === s.isScam ? t("sim.correct") : t("sim.notQuite")}
              </p>
              <p className="mt-2">{why}</p>
              {answered < items.length ? (
                <Button className="mt-4" size="lg" onClick={() => { setAnswer(null); setI((n) => n + 1); }}>
                  {t("common.next")}<ArrowRight size={20} />
                </Button>
              ) : (
                <Button className="mt-4" size="lg" variant="secondary" onClick={restart}>{t("sim.retake")}</Button>
              )}
            </div>
          ) : null}

          {done && answer === null ? (
            <div className="rounded-2xl bg-secondary p-5">
              <h2 className="text-xl font-bold">{t("sim.yourScore")}</h2>
              <p className="text-3xl font-bold">{roundCorrect} / {items.length}</p>
              <Progress value={percent} className="mt-3" aria-label={`${percent}%`} />
              <Button className="mt-4" size="lg" variant="outline" onClick={restart}>{t("sim.retake")}</Button>
            </div>
          ) : null}

          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Warning size={18} className="mt-0.5 shrink-0" />{t("sim.disclaimer")}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-2 p-5">
            <h2 className="text-lg font-bold">{t("sim.yourScore")}</h2>
            <p className="text-4xl font-bold">{answered} {t("common.of")} {items.length}</p>
            <Progress value={percent} aria-label={`${percent}%`} />
            <p className="text-sm text-muted-foreground">{percent}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-5">
            <h2 className="text-lg font-bold">{loggedIn ? t("profile.activity") : t("common.loginNeeded")}</h2>
            {loggedIn && saved ? (
              <>
                <p className="text-3xl font-bold">{saved.correct} / {saved.total}</p>
                <Progress value={best} aria-label={`${best}%`} />
                <p className="text-sm text-muted-foreground">{best}%</p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{t("sim.logInToSave")}</p>
                <Button asChild size="sm"><Link href="/login">{t("nav.login")}</Link></Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Badge2({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">{children}</span>;
}
