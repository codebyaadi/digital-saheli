import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/nav";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";
import { dateLong } from "@/lib/data";

export default async function AdminShgs() {
  await requireAdmin();
  const lang = await currentLang();
  const t = translator(lang);

  const groups = await prisma.shgGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      members: { include: { user: { select: { name: true } } } },
      _count: { select: { meetings: true, announcements: true, resources: true } },
    },
  });

  return (
    <div className="space-y-4">
      <PageHeader title={t("admin.shgs")} subtitle={t("shg.subtitle")} />
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t("common.name")}</TableHeadCell>
            <TableHeadCell>{t("profile.village")}</TableHeadCell>
            <TableHeadCell>{t("shg.members")}</TableHeadCell>
            <TableHeadCell>{t("shg.leader")}</TableHeadCell>
            <TableHeadCell>{t("shg.meetings")}</TableHeadCell>
            <TableHeadCell>{t("shg.resources")}</TableHeadCell>
            <TableHeadCell>{t("common.date")}</TableHeadCell>
            <TableHeadCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((g) => {
            const leaders = g.members.filter((m) => m.isLeader).map((m) => m.user.name);
            return (
              <TableRow key={g.id}>
                <TableCell className="font-semibold">{g.name}</TableCell>
                <TableCell>{g.village ?? "—"}</TableCell>
                <TableCell className="tabular-nums">{g.members.length}</TableCell>
                <TableCell className="text-sm">{leaders.length ? leaders.join(", ") : "—"}</TableCell>
                <TableCell className="tabular-nums">{g._count.meetings}</TableCell>
                <TableCell className="tabular-nums">{g._count.resources}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{dateLong(g.createdAt)}</TableCell>
                <TableCell><Button asChild size="sm" variant="outline"><Link href={`/shg/${g.id}`}>{t("common.viewAll")}</Link></Button></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}