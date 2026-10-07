"use client";
import { useActionState } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addProduct } from "@/app/actions";
import type { FormState } from "@/lib/action-types";
import { translator, type Lang } from "@/lib/i18n";

export function ProductForm({ lang }: { lang: Lang }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addProduct, null);
  const t = translator(lang);

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Plus size={22} className="text-primary" />{t("business.addProduct")}</CardTitle></CardHeader>
      <CardContent>
        {state?.ok ? <p role="status" className="mb-3 rounded-xl border border-teal-300 bg-teal-50 p-3 font-bold text-teal-800">{t(state.notice ?? "common.saved")}</p> : null}
        {state?.error ? <p role="alert" className="mb-3 rounded-xl border border-red-300 bg-red-50 p-3 font-bold text-red-800">{t(state.error)}</p> : null}
        <form action={action} className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">{t("business.name")}</Label>
            <Input id="name" name="name" required minLength={2} maxLength={80} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceInr">{t("business.price")}</Label>
            <Input id="priceInr" name="priceInr" type="number" inputMode="numeric" min={1} max={1000000} required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">{t("business.description")} <span className="font-normal text-muted-foreground">({t("common.optional")})</span></Label>
            <Textarea id="description" name="description" rows={3} maxLength={500} />
          </div>
          <Button type="submit" size="lg" disabled={pending} className="sm:col-span-2 sm:w-fit">
            {pending ? t("common.saving") : t("business.addProduct")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}