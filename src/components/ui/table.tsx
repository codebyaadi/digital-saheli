import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border bg-card">
      <table data-slot="table" className={cn("w-full caption-bottom text-left text-base", className)} {...props} />
    </div>
  );
}
function TableHead({ className, ...props }: React.ComponentProps<"thead">) { return <thead className={cn("[&_tr]:border-b", className)} {...props} />; }
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) { return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />; }
function TableRow({ className, ...props }: React.ComponentProps<"tr">) { return <tr className={cn("border-b transition-colors hover:bg-accent/60", className)} {...props} />; }
function TableHeadCell({ className, ...props }: React.ComponentProps<"th">) { return <th className={cn("h-11 whitespace-nowrap px-4 font-bold", className)} {...props} />; }
function TableCell({ className, ...props }: React.ComponentProps<"td">) { return <td className={cn("px-4 py-3 align-middle", className)} {...props} />; }
export { Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell };