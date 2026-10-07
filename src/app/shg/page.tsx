import Link from "next/link";
import { UsersThree, Storefront, CheckCircle, UserPlus } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";
import { joinShg } from "@/app/actions";

export default async function ShgPage() {
  const lang = await currentLang();
  const t = translator(lang);
  const s = await getSession();

  const groups = await prisma.shgGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { members: true, meetings: true, resources: true } },
      members: s ? { where: { userId: s.id }, select: { id: true } } : { where: { userId: "-" }, select: { id: true } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("shg.title")}
        subtitle={t("shg.subtitle")}
        icon={<UsersThree size={36} weight="fill" />}
        actions={
          <Button asChild><Link href="/shg/business"><Storefront size={20} />{t("shg.business")}</Link></Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => {
          const joined = g.members.length > 0;
          return (
            <Card key={g.id} className="flex h-full flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold leading-snug">{g.name}</h2>
                  {joined ? <Badge variant="secondary"><CheckCircle size={14} weight="fill" />{t("shg.joined")}</Badge> : null}
                </div>
                {g.village ? <p className="text-sm text-muted-foreground">{g.village}</p> : null}
                {g.description ? <p className="flex-1 text-muted-foreground">{g.description}</p> : null}
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>{g._count.members} {t("shg.members")}</span>
                  <span>· {g._count.meetings} {t("shg.meetings")}</span>
                  <span>· {g._count.resources} {t("shg.resources")}</span>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button asChild variant="outline"><Link href={`/shg/${g.id}`}>{t("common.viewAll")}</Link></Button>
                  {!joined && s ? (
                    <form action={joinShg}>
                      <input type="hidden" name="groupId" value={g.id} />
                      <Button type="submit" size="sm"><UserPlus size={18} />{t("shg.join")}</Button>
                    </form>
                  ) : null}
                  {!joined && !s ? (
                    <Button asChild size="sm"><Link href="/login">{t("shg.join")}</Link></Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}