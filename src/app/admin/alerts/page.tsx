import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/nav";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import { dateLong } from "@/lib/data";
import { createAlert, toggleAlert } from "@/app/actions";

const SEVERITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export default async function AdminAlerts({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const lang = await currentLang();
  const t = translator(lang);
  const { saved } = await searchParams;

  const alerts = await prisma.alert.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeader title={t("admin.alerts")} subtitle={t("admin.subtitle")} />

      {saved ? <p role="status" className="rounded-xl border border-teal-300 bg-teal-50 p-3 font-bold text-teal-800">{t("common.saved")}</p> : null}

      <Card>
        <CardHeader><CardTitle>{t("admin.newAlert")}</CardTitle></CardHeader>
        <CardContent>
          <form action={createAlert} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">{t("admin.alertTitle")}</Label>
              <Input id="title" name="title" required minLength={4} maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">{t("admin.severity")}</Label>
              <NativeSelect id="severity" name="severity" defaultValue="LOW">
                {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="body">{t("help.description")} <span className="font-normal text-muted-foreground">({t("common.optional")})</span></Label>
              <Textarea id="body" name="body" rows={2} maxLength={500} />
            </div>
            <Button type="submit" size="lg" className="sm:w-fit">{t("admin.add")}</Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t("admin.alertTitle")}</TableHeadCell>
            <TableHeadCell>{t("admin.severity")}</TableHeadCell>
            <TableHeadCell>{t("admin.active")}</TableHeadCell>
            <TableHeadCell>{t("common.date")}</TableHeadCell>
            <TableHeadCell>{t("common.status")}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <p className="font-semibold">{pick(lang, a, "title")}</p>
                {a.body ? <p className="text-sm text-muted-foreground">{a.body}</p> : null}
              </TableCell>
              <TableCell>
                <Badge variant={a.severity === "HIGH" ? "destructive" : a.severity === "MEDIUM" ? "default" : "secondary"}>{a.severity}</Badge>
              </TableCell>
              <TableCell>{a.active ? t("common.yes") : t("common.no")}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{dateLong(a.createdAt)}</TableCell>
              <TableCell>
                <form action={toggleAlert}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="active" value={String(!a.active)} />
                  <Button type="submit" size="sm" variant="outline">
                    {a.active ? t("common.no") : t("common.yes")}
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
