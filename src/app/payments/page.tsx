import Link from "next/link";
import { CreditCard, ArrowRight, LockKey, Lifebuoy } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import type { Lang, TKey } from "@/lib/i18n";

type StageKey = "payments.before" | "payments.during" | "payments.after";
const STAGES: { key: StageKey; points: Record<Lang, string[]> }[] = [
  {
    key: "payments.before",
    points: {
      en: [
        "Check the receiver's name on the screen before confirming.",
        "Check the amount twice. Small mistakes cost real money.",
        "Never enter your UPI PIN to receive money — you only need it to send.",
      ],
      hi: [
        "भुगतान की पुष्टि से पहले स्क्रीन पर पाने वाले का नाम देखें।",
        "रकम दो बार जाँचें। छोटी गलती से बड़ा नुकसान हो सकता है।",
        "पैसे पाने के लिए कभी यूपीआई पिन न डालें — पिन सिर्फ़ भेजने के लिए चाहिए।",
      ],
    },
  },
  {
    key: "payments.during",
    points: {
      en: [
        "Use only the app or the QR code from someone you know.",
        "Turn on two-step verification for your bank app.",
        "Do not accept 'collect request' requests from strangers.",
      ],
      hi: [
        "सिर्फ़ जाने-पहचाने व्यक्ति का ऐप या क्यूआर कोड इस्तेमाल करें।",
        "अपने बैंक ऐप में टू-स्टेप जाँच चालू रखें।",
        "अजनबियों से आने वाली 'कलेक्ट रिक्वेस्ट' स्वीकार न करें।",
      ],
    },
  },
  {
    key: "payments.after",
    points: {
      en: [
        "Save the screenshot, then check your own bank app — not the one they send you.",
        "Call the number printed on your card or passbook, never a number from a message.",
        "Report quickly: the first 24 hours matter most.",
      ],
      hi: [
        "स्क्रीनशॉट सेव करें, फिर अपने बैंक ऐप में जाँचें — उनका भेजा स्क्रीनशॉट नहीं।",
        "अपने कार्ड या पैसबुक पर छपा नंबर डालें, संदेश वाला नंबर कभी नहीं।",
        "जल्दी रिपोर्ट करें: पहले 24 घंटे सबसे ज़रूरी हैं।",
      ],
    },
  },
];

export default async function Payments() {
  const lang = await currentLang();
  const t = translator(lang);
  const s = await getSession();

  const course = await prisma.course.findFirst({
    where: { category: "PAYMENTS", published: true },
    include: {
      lessons: { orderBy: { order: "asc" }, include: { progress: { where: { userId: s?.id ?? "-" } } } },
      quiz: { select: { id: true } },
    },
  });
  const done = course?.lessons.filter((l) => l.progress.length).length ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("payments.title")}
        subtitle={t("payments.subtitle")}
        icon={<CreditCard size={36} weight="fill" />}
        back={{ href: "/learn", label: t("learn.backToLearn") }}
      />

      {course ? (
        <Card className="border-l-8 border-l-teal-600">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div className="min-w-56">
              <h2 className="text-xl font-bold">{pick(lang, course, "title")}</h2>
              <p className="mt-1 text-muted-foreground">{pick(lang, course, "summary")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{course.lessons.length} {t("common.lessons")}</Badge>
                <Badge variant="outline">{done}/{course.lessons.length} {t("common.lesson")}</Badge>
              </div>
            </div>
            <Button asChild size="lg">
              <Link href={`/learn/${course.slug}`}>
                {done ? t("learn.continueCourse") : t("learn.startCourse")}
                <ArrowRight size={20} />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {STAGES.map((stage, i) => (
          <Card key={stage.key} className="h-full">
            <CardContent className="space-y-3 p-5">
              <h2 className="flex items-center gap-3 text-lg font-bold">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">{i + 1}</span>
                {t(stage.key as TKey)}
              </h2>
              <ul className="space-y-2">
                {stage.points[lang].map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <LockKey size={20} className="mt-1 shrink-0 text-teal-600" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="flex items-center gap-2 font-semibold">
            <Lifebuoy size={22} className="text-destructive" />{t("help.emergency")}
          </p>
          <Button asChild variant="destructive"><Link href="/help">{t("help.title")}</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}