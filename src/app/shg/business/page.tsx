import Link from "next/link";
import { Storefront, Package, Eye, EyeSlash, Info } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";
import { inr } from "@/lib/data";
import { ProductForm } from "./product-form";
import { toggleProduct } from "@/app/actions";
import type { TKey } from "@/lib/i18n";

const TIPS: { en: string; hi: string }[] = [
  { en: "Take photos in daylight against a plain background.", hi: "फ़ोटो दिन के उजाले में और सादे बैकग्राउंड के सामने लें।" },
  { en: "Confirm the payment in your own bank app before you send the goods.", hi: "सामान भेजने से पहले अपने बैंक ऐप में भुगतान की पुष्टि करें।" },
  { en: "Never share your UPI PIN with a customer, even for a 'test' payment.", hi: "'टेस्ट' भुगतान के लिए भी ग्राहक से अपना यूपीआई पिन न बताएँ।" },
  { en: "Keep a written record of every order: name, item, amount, date.", hi: "हर ऑर्डर की लिखित रिकॉर्ड रखें: नाम, सामान, रकम, तारीख़।" },
  { en: "Meet new customers in a public place, or deliver through a trusted person.", hi: "नए ग्राहक से सार्वजनिक जगह मिलें, या भरोसेमंद व्यक्ति से डिलीवरी कराएँ।" },
];

export default async function BusinessPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const lang = await currentLang();
  const t = translator(lang);
  const s = await getSession();

  const [products, mine] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, include: { owner: { select: { name: true, village: true } } } }),
    s ? prisma.product.findMany({ where: { ownerId: s.id }, orderBy: { createdAt: "desc" }, include: { owner: { select: { name: true, village: true } } } }) : Promise.resolve([]),
  ]);

  const showMine = tab === "mine" && Boolean(s);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("business.title")}
        subtitle={t("business.subtitle")}
        icon={<Storefront size={36} weight="fill" />}
        back={{ href: "/shg", label: t("shg.title") }}
      />

      <Tabs>
        <TabsList>
          <TabsTrigger href="/shg/business" active={!showMine}>{t("business.all")}</TabsTrigger>
          <TabsTrigger href="/shg/business?tab=mine" active={showMine}>{t("business.mine")}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {s ? <ProductForm lang={lang} /> : (
            <Card>
              <CardContent className="space-y-3 p-5">
                <p className="font-semibold">{t("business.loginToSell")}</p>
                <Button asChild><Link href="/login">{t("nav.login")}</Link></Button>
              </CardContent>
            </Card>
          )}

          {(showMine ? mine : products).length === 0 ? (
            <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">{t("common.empty")}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {(showMine ? mine : products).map((p) => {
                const isOwner = s && p.ownerId === s.id;
                return (
                  <Card key={p.id} className="flex h-full flex-col">
                    <CardContent className="flex flex-1 flex-col gap-2 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-lg font-bold leading-snug">{p.name}</h2>
                        <Badge variant={p.active ? "secondary" : "outline"}>
                          {p.active ? <Package size={12} /> : <EyeSlash size={12} />}
                          {inr(p.priceInr)}
                        </Badge>
                      </div>
                      {p.description ? <p className="flex-1 text-muted-foreground">{p.description}</p> : <span />}
                      {!showMine ? (
                        <p className="text-sm text-muted-foreground">
                          {p.owner.name}{p.owner.village ? ` · ${p.owner.village}` : ""}
                        </p>
                      ) : null}
                      {isOwner ? (
                        <form action={toggleProduct}>
                          <input type="hidden" name="id" value={p.id} />
                          <Button type="submit" size="sm" variant="outline">
                            {p.active ? <EyeSlash size={16} /> : <Eye size={16} />}
                            {p.active ? t("common.no") : t("common.yes")}
                          </Button>
                        </form>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <Card className="h-fit border-l-8 border-l-teal-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info size={22} className="text-teal-600" />{t("business.safeSelling")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {TIPS.map((tip, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">{i + 1}</span>
                  <span>{lang === "hi" ? tip.hi : tip.en}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}