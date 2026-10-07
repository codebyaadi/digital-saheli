import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("flex gap-3 rounded-2xl border p-4 text-base", {
  variants: {
    variant: {
      info: "border-border bg-secondary text-secondary-foreground",
      success: "border-teal-300 bg-teal-50 text-teal-900",
      warning: "border-amber-300 bg-amber-50 text-amber-950",
      danger: "border-red-300 bg-red-50 text-red-900",
    },
  },
  defaultVariants: { variant: "info" },
});

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div role="note" data-slot="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}
function AlertTitle({ className, ...props }: React.ComponentProps<"p">) { return <p className={cn("font-bold", className)} {...props} />; }
function AlertDescription({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("mt-1 text-sm", className)} {...props} />; }
export { Alert, AlertTitle, AlertDescription };