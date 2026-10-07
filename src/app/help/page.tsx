import Link from "next/link";
import { Lifebuoy, ArrowSquareOut, ClipboardText, WarningOctagon } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import { lines } from "@/lib/data";

export default async function HelpPage() {
  const lang = await currentLang();
  const t = translator(lang);
  const s = await getSession();

  const [topics, myReports] = await Promise.all([
    prisma.helpTopic.findMany({ orderBy: { order: "asc" } }),
    s
      ? prisma.report.findMany({ where: { userId: s.id }, orderBy: { createdAt: "desc" }, take: 5 })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader title={t("help.title")} subtitle={t("help.subtitle")} icon={<Lifebuoy size={36} weight="fill" />} />

      <Alert variant="danger">
        <WarningOctagon size={28} weight="fill" className="shrink-0" aria-hidden />
        <div>
          <AlertTitle>{t("privacy.emergencyNumbers")}</AlertTitle>
          <AlertDescription className="mt-1">
            <p className="text-lg font-bold">{t("help.emergency")}</p>
            <p>{t("help.emergencyNote")}</p>
          </AlertDescription>
        </div>
      </Alert>

      <section aria-labelledby="help-topics">
        <h2 id="help-topics" className="mb-4 text-2xl font-bold">{t("help.topics")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((topic) => {
            const steps = lines(pick(lang, topic, "steps"));
            return (
              <Card key={topic.id} className="flex h-full flex-col">
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold leading-snug">{pick(lang, topic, "title")}</h3>
                    <Badge variant="secondary" className="shrink-0">{topic.type.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="text-muted-foreground">{pick(lang, topic, "guidance")}</p>
                  {steps.length > 0 ? (
                    <div>
                      <p className="mb-2 font-bold">{t("help.steps")}</p>
                      <ol className="space-y-2">
                        {steps.map((step, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">{i + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}
                  <Button asChild variant="outline" className="mt-auto w-fit">
                    <a href={topic.officialUrl} target="_blank" rel="noopener noreferrer">
                      {t("help.officialSite")}<ArrowSquareOut size={18} />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-56">
            <h2 className="flex items-center gap-2 text-xl font-bold"><ClipboardText size={24} />{t("help.reportTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("help.reportNotice")}</p>
          </div>
          <Button asChild size="lg"><Link href="/help/report">{t("help.submit")}</Link></Button>
        </CardContent>
      </Card>

      {s && myReports.length > 0 ? (
        <Card>
          <CardContent className="space-y-3 p-5">
            <h2 className="text-xl font-bold">{t("help.myReports")}</h2>
            {myReports.map((r) => (
              <div key={r.id} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant={r.status === "NEW" ? "destructive" : "secondary"}>{r.status}</Badge>
                  <span className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                <p className="mt-2">{r.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}