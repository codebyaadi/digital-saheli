import * as React from "react";
import { cn } from "@/lib/utils";

function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  return (
    <span
      data-slot="avatar"
      aria-hidden
      className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-secondary-foreground", className)}
    >
      {initials || "?"}
    </span>
  );
}
export { Avatar };