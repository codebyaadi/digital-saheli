"use client";
import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle, Info } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { submitReport } from "@/app/actions";
import type { FormState } from "@/lib/action-types";
import { translator, type Lang } from "@/lib/i18n";

type Props = {
  lang: Lang;
  types: { value: string; label: string; labelHi: string }[];
};

export function ReportForm({ lang, types }: Props) {
  const t = translator(lang);
  const [state, action, pending] = useActionState<FormState, FormData>(submitReport, null);

  return (
    <Card>
      <CardContent className="space-y-4 p-5 sm:p-6">
        <h2 className="text-2xl font-bold">{t("help.reportTitle")}</h2>

        <Alert variant="warning">
          <Info size={24} className="shrink-0" aria-hidden />
          <AlertDescription>{t("help.reportNotice")}</AlertDescription>
        </Alert>

        {state?.ok ? (
          <p role="status" className="flex items-center gap-2 rounded-xl border border-teal-300 bg-teal-50 p-3 font-bold text-teal-800">
            <CheckCircle size={24} weight="fill" />{t("help.sent")}
          </p>
        ) : null}
        {state?.error ? (
          <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 font-bold text-red-800">{t(state.error)}</p>
        ) : null}

        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">{t("help.reportType")}</Label>
            <NativeSelect id="type" name="type" defaultValue={types[0]?.value} required>
              {types.map((type) => (
                <option key={type.value} value={type.value}>{lang === "hi" ? type.labelHi : type.label}</option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("help.description")}</Label>
            <Textarea id="description" name="description" rows={6} required minLength={10} maxLength={4000} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="incidentDate">
              {t("help.date")} <span className="font-normal text-muted-foreground">({t("common.optional")})</span>
            </Label>
            <DatePicker
              id="incidentDate"
              name="incidentDate"
              placeholder={lang === "hi" ? "तारीख चुनें" : "Pick a date"}
            />
          </div>

          <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
            {pending ? t("common.saving") : t("help.submit")}
          </Button>
        </form>

        <Link href="/help" className="inline-block font-semibold text-primary underline">{t("common.back")}</Link>
      </CardContent>
    </Card>
  );
}
