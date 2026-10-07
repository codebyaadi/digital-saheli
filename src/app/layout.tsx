import type { Metadata } from "next";
import { Space_Grotesk, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import "./brand.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/layout/footer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentLang } from "@/lib/i18n/server";
import { translator } from "@/lib/i18n";

const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-noto-deva", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Digital Saheli", template: "%s | Digital Saheli" },
  description: "Learn. Connect. Stay Safe. Smartphone skills and online safety for women self-help groups.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await currentLang();
  const t = translator(lang); // used by Footer (server component — safe to pass)
  const s = await getSession();
  const u = s ? await prisma.user.findUnique({ where: { id: s.id }, select: { name: true, role: true } }) : null;

  return (
    <html lang={lang} className={`${grotesk.variable} ${devanagari.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
          Skip to content
        </a>
        {/* Navbar is a client component — only pass serialisable props (no functions) */}
        <Navbar user={u?.name.split(" ")[0] ?? null} role={u?.role ?? null} lang={lang} />
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 pb-16 sm:px-6 sm:py-6">{children}</main>
        {/* Footer is a server component — t function is fine here */}
        <Footer t={t} />
      </body>
    </html>
  );
}
