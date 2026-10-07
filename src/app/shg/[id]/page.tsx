import Link from "next/link";
import { notFound } from "next/navigation";
import {
  UsersThree, CalendarBlank, Megaphone, Paperclip, UserPlus, Crown, VideoCamera, MapPin, CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";
import { dateLong, dateTimeLong } from "@/lib/data";
import { joinShg } from "@/app/actions";

export default async function ShgDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await currentLang();
  const t = translator(lang);
  const s = await getSession();

  const group = await prisma.shgGroup.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true, village: true, role: true } } } },
      meetings: { orderBy: { startsAt: "asc" } },
      announcements: { orderBy: { createdAt: "desc" } },
      resources: true,
    },
  });
  if (!group) notFound();

  const joined = s ? group.members.some((m) => m.userId === s.id) : false;
  const now = Date.now();

  return (
    <div className="space-y-8">
      <PageHeader
        title={group.name}
        subtitle={group.description ?? t("shg.subtitle")}
        icon={<UsersThree size={36} weight="fill" />}
        back={{ href: "/shg", label: t("shg.allGroups") }}
        actions={group.village ? <Badge variant="secondary"><MapPin size={14} />{group.village}</Badge> : undefined}
      />

      {!joined ? (
        <Card className="border-l-8 border-l-teal-600">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="font-semibold">{s ? t("shg.join") : t("common.loginNeededBody")}</p>
            {s ? (
              <form action={joinShg}>
                <input type="hidden" name="groupId" value={group.id} />
                <Button type="submit" size="lg"><UserPlus size={20} />{t("shg.join")}</Button>
              </form>
            ) : (
              <Button asChild size="lg"><Link href="/login">{t("nav.login")}</Link></Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <p className="flex items-center gap-2 font-semibold text-teal-700">
          <CheckCircle size={24} weight="fill" />{t("shg.joined")}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarBlank size={24} weight="fill" className="text-primary" />{t("shg.meetings")}</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            {group.meetings.length === 0 ? <p className="text-muted-foreground">{t("common.empty")}</p> : null}
            {group.meetings.map((m) => {
              const past = m.startsAt.getTime() < now;
              return (
                <div key={m.id} className={`rounded-xl border p-3 ${past ? "opacity-70" : ""}`}>
                  <p className="font-semibold">{m.title}</p>
                  <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarBlank size={16} />{dateTimeLong(m.startsAt)}
                    <Badge variant={m.mode === "ONLINE" ? "secondary" : "outline"}>
                      {m.mode === "ONLINE" ? <VideoCamera size={12} /> : <MapPin size={12} />}
                      {m.mode === "ONLINE" ? t("shg.online") : t("shg.inPerson")}
                    </Badge>
                  </p>
                  {m.agenda ? <p className="mt-1 text-sm">{m.agenda}</p> : null}
                  {m.location ? <p className="text-sm text-muted-foreground">{m.location}</p> : null}
                  {m.link ? (
                    <Button asChild size="sm" variant="ghost" className="mt-1 px-0 hover:bg-transparent hover:text-primary hover:underline">
                      <a href={m.link} target="_blank" rel="noopener noreferrer">{t("help.officialSite")}</a>
                    </Button>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone size={24} weight="fill" className="text-primary" />{t("shg.announcements")}</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            {group.announcements.length === 0 ? <p className="text-muted-foreground">{t("common.empty")}</p> : null}
            {group.announcements.map((a) => (
              <div key={a.id} className="rounded-xl border p-3">
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{dateLong(a.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UsersThree size={24} weight="fill" className="text-primary" />{t("shg.members")} ({group.members.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {group.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border p-2.5">
                <Avatar name={m.user.name} />
                <div className="flex-1">
                  <p className="font-semibold leading-tight">{m.user.name}</p>
                  <p className="text-sm text-muted-foreground">{m.user.village ?? ""}</p>
                </div>
                {m.isLeader ? <Badge variant="secondary"><Crown size={12} weight="fill" />{t("shg.leader")}</Badge> : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Paperclip size={24} weight="fill" className="text-primary" />{t("shg.resources")}</CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0">
            {group.resources.length === 0 ? <p className="text-muted-foreground">{t("common.empty")}</p> : null}
            {group.resources.map((r) => (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border p-3 hover:border-primary">
                <Badge variant="outline">{r.kind}</Badge>
                <span className="flex-1 font-semibold">{r.title}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}