import Link from "next/link";
import { LockKey, Lifebuoy, ArrowRight, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import { lines } from "@/lib/data";

const NUMBERS = [
  { n: "112", use: { en: "All emergencies, police, ambulance, fire", hi: "हर आपातकाल — पुलिस, एम्बुलेंस, दमकल" }, icon: Lifebuoy },
  { n: "1930", use: { en: "Cyber fraud / online financial fraud", hi: "साइबर ठगी / ऑनलाइन वित्तीय ठगी" }, icon: LockKey },
  { n: "181", use: { en: "Women helpline", hi: "महिला हेल्पलाइन" }, icon: Lifebuoy },
];

export default async function PrivacyPage() {
  const lang = await currentLang();
  const t = translator(lang);
  const guides = await prisma.privacyGuide.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-8">
      <PageHeader title={t("privacy.title")} subtitle={t("privacy.subtitle")} icon={<LockKey size={36} weight="fill" />} />

      <section aria-labelledby="numbers">
        <h2 id="numbers" className="mb-4 text-2xl font-bold">{t("privacy.emergencyNumbers")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {NUMBERS.map((item) => (
            <Card key={item.n} className="border-l-8 border-l-destructive">
              <CardContent className="space-y-2 p-5">
                <a href={`tel:${item.n}`} className="block text-4xl font-bold text-primary underline-offset-4 hover:underline">
                  {item.n}
                </a>
                <p className="flex items-start gap-2 text-muted-foreground">
                  <item.icon size={20} className="mt-1 shrink-0" aria-hidden />
                  {item.use[lang]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{t("help.emergencyNote")}</p>
      </section>

      <section aria-labelledby="guides">
        <h2 id="guides" className="mb-4 text-2xl font-bold">{t("privacy.guide")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {guides.map((g) => {
            const steps = lines(pick(lang, g, "steps"));
            return (
              <Card key={g.id} className="flex h-full flex-col">
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-lg font-bold leading-snug">
                      <EyeSlash size={22} className="shrink-0 text-teal-600" aria-hidden />
                      {pick(lang, g, "title")}
                    </h3>
                    <Badge variant="secondary" className="shrink-0">{g.topic.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="text-muted-foreground">{pick(lang, g, "body")}</p>
                  <div>
                    <p className="mb-2 font-bold">{t("privacy.settings")}</p>
                    <ol className="space-y-2">
                      {steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="font-semibold">{t("help.subtitle")}</p>
          <Button asChild><Link href="/help">{t("help.title")}<ArrowRight size={20} /></Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}