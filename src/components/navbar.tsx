"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UserCircle, CaretDown } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/layout/logo";
import { LangSwitch } from "@/components/layout/lang-switch";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { logout } from "@/app/actions";
import { ICONS, navData, type NavGroupData } from "@/lib/nav";
import { translator, type Lang } from "@/lib/i18n";

type Props = { user: string | null; role: string | null; lang: Lang };

export function Navbar({ user, role, lang }: Props) {
  const t = translator(lang);
  const groups: NavGroupData[] = navData(role);
  const pathname = usePathname();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpenKey(null); }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenKey(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const authButtons = user ? (
    <>
      <Link
        href="/profile"
        className="flex items-center gap-1 rounded-full px-2 py-1 font-semibold hover:bg-accent"
      >
        <UserCircle size={20} weight="fill" className="text-primary shrink-0" />
        <span className="max-w-20 truncate text-xs">{user}</span>
      </Link>
      <form action={logout}>
        <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">{t("nav.logout")}</Button>
      </form>
    </>
  ) : (
    <>
      <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs">
        <Link href="/register">{t("nav.register")}</Link>
      </Button>
      <Button asChild size="sm" className="h-8 px-2.5 text-xs">
        <Link href="/login">{t("nav.login")}</Link>
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div
        ref={navRef}
        className="mx-auto flex w-full max-w-7xl items-center justify-between gap-1 px-2.5 py-1.5 sm:px-4"
      >
        {/* Left: Brand logo */}
        <Logo label={t("appName")} />

        {/* Center: Desktop links (responsive breakdown: xl shows all comfortably, lg handles medium) */}
        <nav
          aria-label={t("nav.menu")}
          className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 px-1 lg:flex"
        >
          {groups.map((g) => {
            const Icon = ICONS[g.icon];
            const hasItems = !!g.items?.length;
            const isOpen = openKey === g.href;

            if (!hasItems) {
              return (
                <Link
                  key={g.href}
                  href={g.href}
                  className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs xl:text-sm font-semibold hover:bg-accent"
                >
                  <Icon size={16} className="text-primary shrink-0" />
                  <span>{t(g.labelKey)}</span>
                </Link>
              );
            }

            return (
              <DropdownMenu
                key={g.href}
                open={isOpen}
                onOpenChange={(o) => setOpenKey(o ? g.href : null)}
              >
                <DropdownMenuTrigger asChild>
                  <button className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs xl:text-sm font-semibold hover:bg-accent outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Icon size={16} className="text-primary shrink-0" />
                    <span>{t(g.labelKey)}</span>
                    <CaretDown
                      size={11}
                      className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {g.items!.map((it) => {
                    const Sub = ICONS[it.icon];
                    return (
                      <DropdownMenuItem key={it.href + it.labelKey} asChild>
                        <Link
                          href={it.href}
                          className="flex items-center gap-2"
                          onClick={() => setOpenKey(null)}
                        >
                          <Sub size={16} className="text-teal-600 shrink-0" />
                          {t(it.labelKey)}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </nav>

        {/* Right side: Lang Switch & Login / Register buttons */}
        <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
          <LangSwitch lang={lang} />
          <div className="flex shrink-0 items-center gap-1">
            {authButtons}
          </div>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex shrink-0 items-center gap-1 lg:hidden">
          <MobileMenu groups={groups} lang={lang} user={user} />
        </div>
      </div>
    </header>
  );
}
