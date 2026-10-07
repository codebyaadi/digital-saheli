import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, icon, back, actions }: Props) {
  return (
    <div className="mb-6 space-y-3">
      {back ? (
        <Link href={back.href} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
          <ArrowLeft size={20} weight="bold" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon ? <span className="mt-1 shrink-0 text-primary">{icon}</span> : null}
          <div>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}