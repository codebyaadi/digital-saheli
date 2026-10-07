import { Lifebuoy } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";
import { REPORT_TYPES } from "@/lib/data";
import { ReportForm } from "./report-form";

export default async function ReportPage() {
  const lang = await currentLang();
  const t = translator(lang);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={t("help.reportTitle")}
        subtitle={t("help.subtitle")}
        icon={<Lifebuoy size={36} weight="fill" />}
        back={{ href: "/help", label: t("help.title") }}
      />
      <ReportForm lang={lang} types={REPORT_TYPES.map((r) => ({ ...r }))} />
    </div>
  );
}