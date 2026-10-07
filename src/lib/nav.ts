import {
  House, DeviceMobile, WhatsappLogo, GlobeHemisphereWest, ShieldCheck, Warning,
  MagnifyingGlass, LockKey, CreditCard, UsersThree, Storefront, Bank, GraduationCap,
  Certificate, Lifebuoy, ListChecks, Gear,
} from "@phosphor-icons/react/dist/ssr";
import type { IconType } from "@/lib/icon";
import type { TKey } from "@/lib/i18n";

/* Note: every icon here comes from `@phosphor-icons/react/dist/ssr`. The default
   entry calls `createContext` at module scope, which throws in a server component.
   The /dist/ssr build is safe in both server and client components, so the same
   map can be used by the server navbar and the client mobile sheet. */

export const ICONS = {
  home: House, smartphone: DeviceMobile, whatsapp: WhatsappLogo, globe: GlobeHemisphereWest,
  safety: ShieldCheck, warning: Warning, search: MagnifyingGlass, lock: LockKey, card: CreditCard,
  users: UsersThree, store: Storefront, bank: Bank, graduation: GraduationCap,
  certificate: Certificate, lifebuoy: Lifebuoy, list: ListChecks, gear: Gear,
};

export type IconKey = keyof typeof ICONS;

/** Icon components cannot cross the server -> client boundary, so nav data sent to a
 *  client component uses an `icon` key string that the client maps back locally. */
export type NavLink = { labelKey: TKey; href: string; icon: IconKey };
export type NavGroupData = { labelKey: TKey; href: string; icon: IconKey; items?: NavLink[] };

/** HOME + the six section menus from spec §3. Admin is appended for ADMIN only. */
export const NAV: NavGroupData[] = [
  { labelKey: "nav.home", href: "/", icon: "home" },
  {
    labelKey: "nav.learn", href: "/learn", icon: "smartphone",
    items: [
      { labelKey: "learn.title", href: "/learn", icon: "list" },
      { labelKey: "learn.startCourse", href: "/learn/smartphone-basics", icon: "smartphone" },
      { labelKey: "learn.continueCourse", href: "/learn/whatsapp", icon: "whatsapp" },
      { labelKey: "nav.learn", href: "/learn/internet-literacy", icon: "globe" },
    ],
  },
  {
    labelKey: "nav.safety", href: "/safety", icon: "safety",
    items: [
      { labelKey: "safety.title", href: "/safety", icon: "lock" },
      { labelKey: "safety.academy", href: "/safety/academy", icon: "safety" },
      { labelKey: "safety.simulator", href: "/safety/simulator", icon: "warning" },
      { labelKey: "safety.checkMessage", href: "/safety/check-message", icon: "search" },
    ],
  },
  { labelKey: "nav.payments", href: "/payments", icon: "card", items: [{ labelKey: "payments.title", href: "/payments", icon: "card" }] },
  {
    labelKey: "nav.shg", href: "/shg", icon: "users",
    items: [
      { labelKey: "shg.title", href: "/shg", icon: "users" },
      { labelKey: "business.title", href: "/shg/business", icon: "store" },
      { labelKey: "gov.title", href: "/government", icon: "bank" },
    ],
  },
  {
    labelKey: "nav.training", href: "/training", icon: "graduation",
    items: [
      { labelKey: "training.courses", href: "/training", icon: "graduation" },
      { labelKey: "profile.certificates", href: "/training/certificates", icon: "certificate" },
      { labelKey: "profile.activity", href: "/profile", icon: "list" },
    ],
  },
  {
    labelKey: "nav.help", href: "/help", icon: "lifebuoy",
    items: [
      { labelKey: "help.title", href: "/help", icon: "lifebuoy" },
      { labelKey: "privacy.title", href: "/privacy", icon: "lock" },
      { labelKey: "gov.title", href: "/government", icon: "bank" },
    ],
  },
];

export const ADMIN_LINK: NavGroupData = { labelKey: "nav.admin", href: "/admin", icon: "gear" };

/** Nav for the current role. Plain data, so it can be sent to a client component. */
export function navData(role: string | null): NavGroupData[] {
  return role === "ADMIN" ? [...NAV, ADMIN_LINK] : NAV;
}

/** Flat list of every href reachable from the nav, for section landing pages. */
export function flattenNav(groups: NavGroupData[]): NavLink[] {
  return groups.flatMap((g) => [{ labelKey: g.labelKey, href: g.href, icon: g.icon }, ...(g.items ?? [])]);
}