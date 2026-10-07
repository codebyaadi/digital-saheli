import Link from "next/link";
import { FileX } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";

export default async function NotFound() {
  const t = translator(await currentLang());
  return (
    <div className="mx-auto max-w-lg py-10 text-center">
      <Card>
        <CardContent className="space-y-4 p-8">
          <FileX size={56} className="mx-auto text-primary" aria-hidden />
          <h1 className="text-3xl font-bold">{t("common.notFound")}</h1>
          <p className="text-muted-foreground">{t("common.notFoundBody")}</p>
          <Button asChild size="lg"><Link href="/">{t("nav.home")}</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}