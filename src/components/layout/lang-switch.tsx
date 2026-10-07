"use client";
import { useTransition } from "react";
import { Translate } from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setLanguage } from "@/app/actions";
import { translator, type Lang } from "@/lib/i18n";

export function LangSwitch({ lang }: { lang: Lang }) {
  const [pending, go] = useTransition();
  const t = translator(lang);

  return (
    <div className="flex shrink-0 items-center gap-1">
      <Translate size={16} className="text-primary shrink-0" aria-hidden />
      <Select
        value={lang === "hi" ? "hi" : "en"}
        disabled={pending}
        onValueChange={(v) => go(() => setLanguage(v))}
      >
        <SelectTrigger
          className="h-8 w-auto min-w-[70px] rounded-full border bg-card px-2.5 text-xs font-semibold"
          aria-label={t("nav.language")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="hi">हिन्दी</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
