import Link from "next/link";
import { SealCheck, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import { dateLong } from "@/lib/data";

export default async function MyCertificates() {
  const u = await requireUser();
  const lang = await currentLang();
  const t = translator(lang);

  const certs = await prisma.certificate.findMany({
    where: { userId: u.id },
    include: { course: true },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("profile.certificates")}
        subtitle={t("training.subtitle")}
        icon={<SealCheck size={36} weight="fill" />}
        back={{ href: "/training", label: t("training.title") }}
      />

      {certs.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 p-6 text-center">
            <p className="text-lg font-semibold">{t("common.empty")}</p>
            <p className="text-muted-foreground">{t("training.finishLessons")}</p>
            <Button asChild><Link href="/training">{t("training.courses")}</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certs.map((c) => (
            <Link key={c.id} href={`/training/certificate/${c.id}`} className="block h-full">
              <Card className="flex h-full flex-col transition hover:border-primary hover:shadow-md">
                <CardContent className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-bold leading-snug">{pick(lang, c.course, "title")}</h2>
                    <SealCheck size={26} weight="fill" className="shrink-0 text-teal-600" />
                  </div>
                  <p className="flex-1 text-muted-foreground">{pick(lang, c.course, "summary")}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{c.code}</Badge>
                    <Badge variant="outline">{dateLong(c.issuedAt)}</Badge>
                  </div>
                  <span className="mt-2 inline-flex items-center gap-1 font-semibold text-primary">
                    {t("training.getCertificate")}<ArrowRight size={18} />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}