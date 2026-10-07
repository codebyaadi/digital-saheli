"use client";
import { Printer } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

/** window.print() needs the browser, so it lives in its own client component. */
export function PrintButton({ label }: { label: string }) {
  return (
    <Button type="button" onClick={() => window.print()} size="lg" variant="outline">
      <Printer size={20} />
      {label}
    </Button>
  );
}