import * as React from "react";
import { cn } from "@/lib/utils";

/** Tabs as links so they work without client-side state (important for deep links + a11y). */
function Tabs({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav data-slot="tabs" className={cn("flex gap-1 overflow-x-auto border-b pb-px", className)} {...props} />;
}
function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="tabs-list" className={cn("flex gap-1", className)} {...props} />;
}
function TabsTrigger({ className, active, ...props }: React.ComponentProps<"a"> & { active?: boolean }) {
  return (
    <a
      data-slot="tabs-trigger"
      data-state={active ? "active" : "inactive"}
      aria-current={active ? "page" : undefined}
      className={cn(
        "whitespace-nowrap rounded-t-xl px-4 py-2.5 font-semibold text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
        active && "border-b-2 border-primary bg-accent text-primary",
        className,
      )}
      {...props}
    />
  );
}
export { Tabs, TabsList, TabsTrigger };