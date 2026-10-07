import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/nav";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";
import { dateLong, num } from "@/lib/data";
import { setUserRole } from "@/app/actions";
import type { TKey } from "@/lib/i18n";

const ROLES: { value: string; labelKey: TKey }[] = [
  { value: "LEARNER", labelKey: "nav.learn" },
  { value: "SHG_LEADER", labelKey: "shg.leader" },
  { value: "ADMIN", labelKey: "nav.admin" },
];

export default async function AdminUsers() {
  const me = await requireAdmin();
  const lang = await currentLang();
  const t = translator(lang);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { progress: true, certificates: true, reports: true, simAttempts: true } } },
  });

  return (
    <div className="space-y-4">
      <PageHeader title={t("admin.users")} subtitle={`${num(users.length)} ${t("admin.users").toLowerCase()}`} />
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t("common.name")}</TableHeadCell>
            <TableHeadCell>{t("common.email")}</TableHeadCell>
            <TableHeadCell>{t("profile.role")}</TableHeadCell>
            <TableHeadCell>{t("admin.lessonCompletions")}</TableHeadCell>
            <TableHeadCell>{t("profile.certificates")}</TableHeadCell>
            <TableHeadCell>{t("common.date")}</TableHeadCell>
            <TableHeadCell>{t("common.status")}</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-semibold">
                {u.name}
                {u.village ? <span className="block text-xs font-normal text-muted-foreground">{u.village}</span> : null}
              </TableCell>
              <TableCell className="text-sm">{u.email}</TableCell>
              <TableCell>
                {u.id === me.id ? (
                  <Badge variant="secondary">{u.role}</Badge>
                ) : (
                  <form action={setUserRole}>
                    <input type="hidden" name="userId" value={u.id} />
                    <label className="sr-only" htmlFor={`role-${u.id}`}>{t("admin.role")}</label>
                    <select
                      id={`role-${u.id}`}
                      name="role"
                      defaultValue={u.role}
                      onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      aria-label={`${t("admin.role")}: ${u.name}`}
                      className="h-9 rounded-full border bg-card px-3 text-sm font-semibold"
                    >
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.value} · {t(r.labelKey)}</option>)}
                    </select>
                  </form>
                )}
              </TableCell>
              <TableCell className="tabular-nums">{u._count.progress}</TableCell>
              <TableCell className="tabular-nums">{u._count.certificates}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{dateLong(u.createdAt)}</TableCell>
              <TableCell><Badge variant="outline">{u.language}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}