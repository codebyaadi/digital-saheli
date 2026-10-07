"use client";
import { useState, useTransition } from "react";
import { ShieldCheck, Warning, XCircle, Eraser } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { checkMessage } from "@/app/actions";
import { translator, type Lang } from "@/lib/i18n";
import type { IconType } from "@/lib/icon";

type Result = {
  verdict: "LIKELY_SAFE" | "BE_CAREFUL" | "POTENTIAL_SCAM";
  count: number;
  indicators: { key: string; label: string; labelHi: string }[];
};

const STYLE: Record<Result["verdict"], { box: string; text: string; icon: IconType }> = {
  LIKELY_SAFE: { box: "border-teal-300 bg-teal-50", text: "text-teal-800", icon: ShieldCheck },
  BE_CAREFUL: { box: "border-amber-300 bg-amber-50", text: "text-amber-900", icon: Warning },
  POTENTIAL_SCAM: { box: "border-red-300 bg-red-50", text: "text-red-900", icon: XCircle },
};

export function MessageChecker({ lang }: { lang: Lang }) {
  const t = translator(lang);
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [pending, run] = useTransition();

  function check() {
    if (!text.trim()) return;
    run(async () => setResult(await checkMessage(text)));
  }

  const style = result ? STYLE[result.verdict] : null;
  const Icon = result ? STYLE[result.verdict].icon : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <Label htmlFor="m" className="text-lg">{t("check.label")}</Label>
          <Textarea
            id="m"
            rows={6}
            value={text}
            onChange={(e) => { setText(e.target.value); setResult(null); }}
            placeholder={t("check.placeholder")}
            aria-describedby="check-disclaimer"
          />
          <div className="flex flex-wrap gap-3">
            <Button size="lg" disabled={pending || !text.trim()} onClick={check}>
              {pending ? t("common.loading") : t("check.button")}
            </Button>
            <Button size="lg" variant="outline" disabled={!text} onClick={() => { setText(""); setResult(null); }}>
              <Eraser size={20} />{t("check.clear")}
            </Button>
          </div>
          <p id="check-disclaimer" className="rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
            {t("check.disclaimer")}
          </p>
        </CardContent>
      </Card>

      {result && style && Icon ? (
        <Card className={`border-2 ${style.box}`} role="status" aria-live="polite">
          <CardContent className="space-y-3 p-5 sm:p-6">
            <p className={`flex items-center gap-3 text-3xl font-bold ${style.text}`}>
              <Icon size={40} weight="fill" />{t(`check.${result.verdict}` as Parameters<typeof t>[0])}
            </p>
            <div>
              <p className="font-bold">{t("check.indicators")}</p>
              {result.indicators.length === 0 ? (
                <p className="text-muted-foreground">{t("check.noIndicators")}</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {result.indicators.map((ind) => (
                    <li key={ind.key} className="flex items-start gap-2 text-lg">
                      <Warning size={20} className="mt-1 shrink-0" aria-hidden />
                      {lang === "hi" ? ind.labelHi : ind.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}