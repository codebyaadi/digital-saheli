import Link from "next/link";
import { UserCircle, SealCheck, ClipboardText, GraduationCap, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentLang } from "@/lib/i18n/server";
import { translator, pick } from "@/lib/i18n";
import { courseProgress, dateLong } from "@/lib/data";
import { updateProfile } from "@/app/actions";

export default async function Profile() {
  const u = await requireUser();
  const lang = await currentLang();
  const t = translator(lang);

  const [certs, reports, sims, messages] = await Promise.all([
    prisma.certificate.findMany({ where: { userId: u.id }, include: { course: true }, orderBy: { issuedAt: "desc" } }),
    prisma.report.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.simulatorAttempt.count({ where: { userId: u.id } }),
    prisma.messageCheck.count({ where: { userId: u.id } }),
  ]);
  const progress = await courseProgress(u.id);

  const stats = [
    { label: t("home.lessonsCompleted"), value: `${progress.done}/${progress.total}`, icon: GraduationCap, href: "/learn" },
    { label: t("profile.certificates"), value: certs.length, icon: SealCheck, href: "/training/certificates" },
    { label: t("help.myReports"), value: reports.length, icon: ClipboardText, href: "/help" },
    { label: t("safety.simulator"), value: sims, icon: ShieldCheck, href: "/safety/simulator" },
    { label: t("safety.checkMessage"), value: messages, icon: ShieldCheck, href: "/safety/check-message" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title={t("profile.title")} subtitle={u.email} icon={<UserCircle size={36} weight="fill" />} />

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="block">
            <Card className="h-full transition hover:border-primary">
              <CardContent className="space-y-1 p-4">
                <s.icon size={24} className="text-primary" />
                <p className="text-2xl font-bold leading-none">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <h2 className="text-xl font-bold">{t("profile.title")}</h2>
          <form action={updateProfile} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("profile.name")}</Label>
              <Input id="name" name="name" defaultValue={u.name} required minLength={2} maxLength={60} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="village">{t("profile.village")} <span className="font-normal text-muted-foreground">({t("common.optional")})</span></Label>
              <Input id="village" name="village" defaultValue={u.village ?? ""} maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t("profile.language")}</Label>
              <NativeSelect id="language" name="language" defaultValue={u.language}>
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label>{t("profile.role")}</Label>
              <p><Badge variant="secondary">{u.role}</Badge></p>
            </div>
            <Button type="submit" size="lg" className="sm:w-fit">{t("common.save")}</Button>
          </form>
        </CardContent>
      </Card>

      {certs.length > 0 ? (
        <Card>
          <CardContent className="space-y-3 p-5">
            <h2 className="text-xl font-bold">{t("profile.certificates")}</h2>
            {certs.map((c) => (
              <Link key={c.id} href={`/training/certificate/${c.id}`} className="flex items-center gap-3 rounded-xl border p-3 hover:border-primary">
                <SealCheck size={24} weight="fill" className="shrink-0 text-teal-600" />
                <span className="flex-1">
                  <span className="block font-semibold">{pick(lang, c.course, "title")}</span>
                  <span className="block text-sm text-muted-foreground">{c.code} · {dateLong(c.issuedAt)}</span>
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="space-y-3 p-5">
          <h2 className="text-xl font-bold">{t("home.learningProgress")}</h2>
          <Progress value={progress.percent} aria-label={`${progress.percent}%`} />
          <p className="text-sm text-muted-foreground">{progress.done}/{progress.total} · {progress.percent}%</p>
        </CardContent>
      </Card>
    </div>
  );
}
