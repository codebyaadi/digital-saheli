"use client";
import Link from "next/link";
import { useState } from "react";
import { List, UserCircle } from "@phosphor-icons/react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { LangSwitch } from "@/components/layout/lang-switch";
import { logout } from "@/app/actions";
import { ICONS, type NavGroupData } from "@/lib/nav";
import { translator, type Lang } from "@/lib/i18n";

type Props = { groups: NavGroupData[]; lang: Lang; user: string | null };

export function MobileMenu({ groups, lang, user }: Props) {
  const [open, setOpen] = useState(false);
  const t = translator(lang);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t("nav.menu")}>
          <List size={26} />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-4/5 max-w-sm overflow-y-auto">
        <SheetTitle className="sr-only">{t("nav.menu")}</SheetTitle>
        <div className="mb-4"><Logo label={t("appName")} /></div>
        <nav className="flex flex-col gap-1 pb-6">
          {groups.map((g) => {
            const Icon = ICONS[g.icon];
            return (
              <div key={g.href} className="border-b pb-2 last:border-0">
                <Link href={g.href} onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-3 text-lg font-bold">
                  <Icon size={26} className="text-primary" />{t(g.labelKey)}
                </Link>
                <div className="pl-6">
                  {(g.items ?? []).filter((i) => i.href !== g.href).map((it) => {
                    const Sub = ICONS[it.icon];
                    return (
                      <Link
                        key={it.href + it.labelKey}
                        href={it.href}
                        onClick={close}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base text-muted-foreground hover:bg-accent"
                      >
                        <Sub size={20} className="text-teal-600" />{t(it.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <LangSwitch lang={lang} />
            {user ? (
              <>
                <Link href="/profile" onClick={close} className="flex items-center gap-2 rounded-full border px-3 py-2 font-semibold">
                  <UserCircle size={22} weight="fill" className="text-primary" />{user}
                </Link>
                <form action={logout}><Button variant="outline" onClick={close}>{t("nav.logout")}</Button></form>
              </>
            ) : (
              <>
                <Button asChild variant="outline"><Link href="/register" onClick={close}>{t("nav.register")}</Link></Button>
                <Button asChild><Link href="/login" onClick={close}>{t("nav.login")}</Link></Button>
              </>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}