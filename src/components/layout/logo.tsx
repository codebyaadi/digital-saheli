import Link from "next/link";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export function Logo({ label = "Digital Saheli" }: { label?: string }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 text-xl font-bold text-primary" aria-label={label}>
      <ShieldCheck size={34} weight="fill" className="text-teal-600" />
      <span>{label}</span>
    </Link>
  );
}