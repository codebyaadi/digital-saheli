import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";
import { MessageChecker } from "./checker";

export default async function CheckMessagePage() {
  const lang = await currentLang();
  const t = translator(lang);
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("check.title")}
        subtitle={t("check.subtitle")}
        icon={<MagnifyingGlass size={36} weight="fill" />}
        back={{ href: "/safety", label: t("safety.title") }}
      />
      <MessageChecker lang={lang} />
    </div>
  );
}