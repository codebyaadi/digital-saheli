import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";
import { Simulator } from "./simulator";

export default async function SimulatorPage() {
  const lang = await currentLang();
  const t = translator(lang);
  const s = await getSession();

  const [items, myAttempts] = await Promise.all([
    prisma.scamScenario.findMany({ orderBy: { order: "asc" } }),
    s
      ? prisma.simulatorAttempt.findMany({ where: { userId: s.id }, select: { correct: true } })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("sim.title")} subtitle={t("sim.subtitle")} />
      <Simulator
        items={items.map((x) => ({ id: x.id, type: x.type, message: x.message, messageHi: x.messageHi, isScam: x.isScam, explanation: x.explanation, explanationHi: x.explanationHi }))}
        loggedIn={Boolean(s)}
        savedScore={myAttempts.length ? { correct: myAttempts.filter((a) => a.correct).length, total: myAttempts.length } : null}
        lang={lang}
      />
    </div>
  );
}