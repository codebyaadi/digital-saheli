import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/nav";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import { dateLong } from "@/lib/data";

export default async function AdminCertificates() {
  await requireAdmin();
  const lang = await currentLang();
  const t = translator(lang);

  const certs = await prisma.certificate.findMany({
    orderBy: { issuedAt: "desc" },
    include: { user: { select: { name: true, email: true } }, course: true },
  });

  return (
    <div className="space-y-4">
      <PageHeader title={t("admin.certificates")} subtitle={t("training.demoCert")} />
      {certs.length === 0 ? (
        <p className="text-muted-foreground">{t("common.empty")}</p>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>{t("training.certificateId")}</TableHeadCell>
              <TableHeadCell>{t("common.name")}</TableHeadCell>
              <TableHeadCell>{t("common.course")}</TableHeadCell>
              <TableHeadCell>{t("training.issuedOn")}</TableHeadCell>
              <TableHeadCell>{t("training.demoCert")}</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certs.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-sm">{c.code}</TableCell>
                <TableCell>
                  {c.user.name}
                  <span className="block text-xs text-muted-foreground">{c.user.email}</span>
                </TableCell>
                <TableCell>{pick(lang, c.course, "title")}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{dateLong(c.issuedAt)}</TableCell>
                <TableCell><Button asChild size="sm" variant="outline"><Link href={`/training/certificate/${c.id}`}>{t("common.viewAll")}</Link></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}