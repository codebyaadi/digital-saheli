import * as React from "react";
import { cn } from "@/lib/utils";
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn("min-h-24 w-full rounded-xl border border-input bg-card px-4 py-3 text-base outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50", className)} {...props} />;
}
export { Textarea };
