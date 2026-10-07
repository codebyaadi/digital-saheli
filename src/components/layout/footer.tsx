import Link from "next/link";
import { Lifebuoy } from "@phosphor-icons/react/dist/ssr";
import { NAV } from "@/lib/nav";
import type { TKey } from "@/lib/i18n";

export function Footer({ t }: { t: (k: TKey) => string }) {
  return (
    <footer className="mt-8 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-xl font-bold">{t("appName")}</p>
          <p className="text-sm opacity-90">{t("footer.tagline")}</p>
          <p className="mt-3 text-sm opacity-80">{t("footer.project")}</p>
          <p className="mt-1 text-sm opacity-80">{t("home.subtitle")}</p>
        </div>
        <nav aria-label={t("nav.menu")}>
          <p className="mb-2 font-bold">{t("appName")}</p>
          <ul className="space-y-1 text-sm">
            {NAV.map((g) => (
              <li key={g.href}>
                <Link href={g.href} className="underline-offset-4 hover:underline">{t(g.labelKey)}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="mb-2 flex items-center gap-2 font-bold"><Lifebuoy size={22} weight="fill" />{t("privacy.emergencyNumbers")}</p>
          <ul className="space-y-1 text-sm">
            <li><a href="tel:112" className="font-bold underline-offset-4 hover:underline">112 — {t("common.all")} emergency</a></li>
            <li><a href="tel:1930" className="font-bold underline-offset-4 hover:underline">1930 — Cyber fraud</a></li>
            <li><a href="tel:181" className="font-bold underline-offset-4 hover:underline">181 — Women helpline</a></li>
          </ul>
          <p className="mt-3 text-xs opacity-80">{t("help.emergencyNote")}</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 px-8 py-3 text-center text-xs opacity-80">
        {t("footer.emergency")} · {t("common.demoLong")}
      </div>
    </footer>
  );
}