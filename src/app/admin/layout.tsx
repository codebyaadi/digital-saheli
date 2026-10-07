import Link from "next/link";
import { ChartBar } from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/auth";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";
import { ADMIN_NAV } from "@/components/admin/nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const t = translator(await currentLang());

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <ChartBar size={36} weight="fill" />{t("admin.title")}
            </h1>
            <p className="mt-2 opacity-90">{t("admin.subtitle")}</p>
          </div>
          <nav aria-label={t("admin.overview")}>
            <ul className="flex flex-wrap gap-1.5">
              {ADMIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm font-semibold transition hover:bg-primary-foreground/25"
                  >
                    <item.icon size={18} />{t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}