import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/nav";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";
import { dateTimeLong, reportTypeLabel } from "@/lib/data";
import { setReportStatus } from "@/app/actions";

const STATUSES = ["NEW", "REVIEWED", "ESCALATED", "CLOSED"] as const;

export default async function AdminReports() {
  await requireAdmin();
  const lang = await currentLang();
  const t = translator(lang);

  const reports = await prisma.report.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true } } } });

  return (
    <div className="space-y-4">
      <PageHeader title={t("admin.reports")} subtitle={t("help.reportNotice")} />

      {reports.length === 0 ? <p className="text-muted-foreground">{t("common.empty")}</p> : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>{t("common.date")}</TableHeadCell>
              <TableHeadCell>{t("help.reportType")}</TableHeadCell>
              <TableHeadCell>{t("help.description")}</TableHeadCell>
              <TableHeadCell>{t("common.name")}</TableHeadCell>
              <TableHeadCell>{t("common.status")}</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-sm text-muted-foreground">{dateTimeLong(r.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{reportTypeLabel(r.type, lang)}</Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="whitespace-pre-wrap">{r.description}</p>
                  {r.incidentDate ? <p className="mt-1 text-xs text-muted-foreground">{t("help.date")}: {r.incidentDate}</p> : null}
                </TableCell>
                <TableCell className="text-sm">{r.user?.name ?? "Guest"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={r.status === "NEW" ? "destructive" : "secondary"}>{r.status}</Badge>
                    <form action={setReportStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value={r.status === "NEW" ? "REVIEWED" : "NEW"} />
                      <Button type="submit" size="sm" variant="outline">
                        {r.status === "NEW" ? t("admin.markReviewed") : t("admin.reopen")}
                      </Button>
                    </form>
                    <form action={setReportStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="CLOSED" />
                      <Button type="submit" size="sm" variant="ghost">CLOSED</Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}