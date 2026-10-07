"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

/** Native <select> styled to match the shadcn look.
 *  Use this when you need native form submission (name/value in FormData).
 *  For controlled/uncontrolled UX use the Radix-based <Select> from ./select.tsx. */
function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "h-11 w-full min-w-0 appearance-none rounded-xl border border-input bg-card px-4 py-2 text-base outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50",
        "bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%235b2a86'%3E%3Cpath d='M4.5 6.5 8 10l3.5-3.5z'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}
export { NativeSelect };
