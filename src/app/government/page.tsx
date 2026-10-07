import Link from "next/link";
import { Bank, ArrowSquareOut, ShieldCheck, Info } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";
import { dateLong } from "@/lib/data";
import type { TKey } from "@/lib/i18n";

const CATEGORIES: { value: string; key: TKey }[] = [
  { value: "SCHEMES", key: "nav.government" },
  { value: "SHG", key: "shg.title" },
  { value: "WOMEN_WELFARE", key: "privacy.emergencyNumbers" },
  { value: "CERTIFICATES", key: "training.certificate" },
  { value: "EMPLOYMENT", key: "business.title" },
  { value: "DIGITAL", key: "nav.learn" },
];

export default async function GovernmentPage() {
  const lang = await currentLang();
  const t = translator(lang);
  const resources = await prisma.govResource.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });

  return (
    <div className="space-y-8">
      <PageHeader title={t("gov.title")} subtitle={t("gov.subtitle")} icon={<Bank size={36} weight="fill" />} />

      <Alert variant="success">
        <ShieldCheck size={26} weight="fill" className="shrink-0" aria-hidden />
        <AlertDescription>
          <p>{t("common.demoLong")}</p>
          <p className="mt-1 font-bold">{t("gov.verify")}</p>
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((r) => (
          <Card key={r.id} className="flex h-full flex-col">
            <CardContent className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold leading-snug">{r.name}</h2>
                <Badge variant="secondary" className="shrink-0">{r.category.replace(/_/g, " ")}</Badge>
              </div>
              <p className="text-muted-foreground">{r.description}</p>
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-sm font-bold text-secondary-foreground">{t("gov.eligibility")}</p>
                <p className="text-sm">{r.eligibility}</p>
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <span className="truncate text-sm text-muted-foreground">{r.officialUrl.replace(/^https?:\/\//, "")}</span>
                <Button asChild>
                  {/* Demo link list: only official .gov.in / .nic.in hosts are seeded. */}
                  <a href={r.officialUrl} target="_blank" rel="noopener noreferrer">
                    {t("gov.open")}<ArrowSquareOut size={18} />
                  </a>
                </Button>
              </div>
              {r.verifiedAt ? (
                <p className="text-xs text-muted-foreground">{t("common.date")}: {dateLong(r.verifiedAt)}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
        {t("gov.verify")}{" "}
        <Link href="/help" className="font-semibold text-primary underline">{t("help.title")}</Link>
      </p>
    </div>
  );
}