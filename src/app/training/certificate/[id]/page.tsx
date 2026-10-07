import { notFound } from "next/navigation";
import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { PrintButton } from "@/components/print-button";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import { dateLong } from "@/lib/data";

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await currentLang();
  const t = translator(lang);
  const u = await requireUser();

  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, village: true } }, course: true },
  });
  if (!cert) notFound();
  // Only the owner (or an admin) may open a certificate.
  if (cert.userId !== u.id && u.role !== "ADMIN") notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("training.certificate")}</h1>
        <PrintButton label={t("common.print")} />
      </div>

      <Card className="overflow-hidden border-4 border-double border-primary print:border-2">
        <CardContent className="space-y-6 p-8 text-center sm:p-12">
          <div className="flex items-center justify-center gap-3">
            <SealCheck size={44} weight="fill" className="text-teal-600" aria-hidden />
            <span className="text-2xl font-bold text-primary">{t("appName")}</span>
          </div>

          <div>
            <p className="text-lg uppercase tracking-wide text-muted-foreground">{t("training.certificate")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>

          <p className="text-lg">{lang === "hi" ? "यह प्रमाणपत्र" : "This certificate is"}</p>
          <p className="text-4xl font-bold text-primary sm:text-5xl">{cert.user.name}</p>
          {cert.user.village ? <p className="text-lg text-muted-foreground">{cert.user.village}</p> : null}

          <p className="mx-auto max-w-xl text-lg">
            {lang === "hi"
              ? "ने सफलतापूर्वक पूरा किया"
              : "has successfully completed the course"}
          </p>
          <p className="text-3xl font-bold">{pick(lang, cert.course, "title")}</p>
          <p className="text-muted-foreground">{pick(lang, cert.course, "summary")}</p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4 text-sm">
            <span><b>{t("training.certificateId")}:</b> {cert.code}</span>
            <span><b>{t("training.issuedOn")}:</b> {dateLong(cert.issuedAt)}</span>
            <span><b>{t("common.category")}:</b> {cert.course.category.replace(/_/g, " ")}</span>
          </div>

          <div className="flex items-center justify-center gap-3 border-t-4 border-double border-primary pt-6">
            <SealCheck size={36} weight="fill" className="text-teal-600" aria-hidden />
            <span className="font-bold text-primary">{t("appName")}</span>
          </div>
        </CardContent>
      </Card>

      <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-center text-amber-950">
        <b>{t("common.demo")}:</b> {t("training.demoCert")}
      </p>
    </div>
  );
}