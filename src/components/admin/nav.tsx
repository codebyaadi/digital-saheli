import Link from "next/link";
import { ChartBar, ChartLineUp, Users, BookOpen, Siren, ClipboardText, UsersThree, SealCheck } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import type { IconType } from "@/lib/icon";
import type { TKey } from "@/lib/i18n";

export type AdminNavItem = { href: string; labelKey: TKey; icon: IconType };

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", labelKey: "admin.overview", icon: ChartBar },
  { href: "/admin/users", labelKey: "admin.users", icon: Users },
  { href: "/admin/courses", labelKey: "admin.courses", icon: BookOpen },
  { href: "/admin/shgs", labelKey: "admin.shgs", icon: UsersThree },
  { href: "/admin/certificates", labelKey: "admin.certificates", icon: SealCheck },
  { href: "/admin/reports", labelKey: "admin.reports", icon: ClipboardText },
  { href: "/admin/alerts", labelKey: "admin.alerts", icon: Siren },
  { href: "/admin/analytics", labelKey: "admin.analytics", icon: ChartLineUp },
];

export function StatCard({ label, value, icon: Icon, href }: { label: string; value: number | string; icon: IconType; href?: string }) {
  const inner = (
    <div className="flex items-center gap-4 p-5">
      <span className="rounded-2xl bg-secondary p-3 text-primary"><Icon size={28} /></span>
      <div className="min-w-0">
        <p className="text-3xl font-bold leading-none">{value}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner;
}

export { PageHeader };