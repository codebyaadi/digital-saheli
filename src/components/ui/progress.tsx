"use client";
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
function Progress({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root data-slot="progress" value={value} className={cn("relative h-3 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
      <ProgressPrimitive.Indicator className="h-full bg-teal-600 transition-all" style={{ width: `${value ?? 0}%` }} />
    </ProgressPrimitive.Root>
  );
}
export { Progress };
