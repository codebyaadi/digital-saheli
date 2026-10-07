"use client";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { login, register } from "@/app/actions";
import type { FormState } from "@/lib/action-types";
import { translator, type Lang } from "@/lib/i18n";

type Props = { mode: "login" | "register"; lang: Lang };

export function AuthForm({ mode, lang }: Props) {
  const t = translator(lang);
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : register, null);
  const isReg = mode === "register";

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="p-6 sm:p-7">
        <h1 className="mb-1 text-2xl font-bold">{isReg ? t("auth.registerTitle") : t("auth.loginTitle")}</h1>
        <p className="mb-4 text-muted-foreground">{t("home.subtitle")}</p>

        {state?.error ? (
          <Alert variant="danger" className="mb-4">
            <AlertDescription className="font-bold">{t(state.error)}</AlertDescription>
          </Alert>
        ) : null}

        <form action={action} className="space-y-3">
          {isReg ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{t("profile.name")}</Label>
                <Input id="name" name="name" required minLength={2} maxLength={60} autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="village">{t("profile.village")} <span className="font-normal text-muted-foreground">({t("common.optional")})</span></Label>
                <Input id="village" name="village" maxLength={80} />
              </div>
            </>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">{t("common.email")}</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input id="password" name="password" type="password" required minLength={6} autoComplete={isReg ? "new-password" : "current-password"} />
            {isReg ? <p className="text-sm text-muted-foreground">{t("auth.passwordHint")}</p> : null}
          </div>

          {isReg ? (
            <div className="space-y-2">
              <Label htmlFor="language">{t("profile.language")}</Label>
              <NativeSelect id="language" name="language" defaultValue="en">
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </NativeSelect>
            </div>
          ) : null}

          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? t("common.loading") : isReg ? t("nav.register") : t("nav.login")}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          {isReg ? (
            <>
              <span className="text-muted-foreground">
                {lang === "hi" ? "पहले से खाता है? " : "Already registered? "}
              </span>
              <Link href="/login" className="font-semibold text-primary underline">
                {t("nav.login")}
              </Link>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">
                {lang === "hi" ? "नया खाता बनाना है? " : "New here? "}
              </span>
              <Link href="/register" className="font-semibold text-primary underline">
                {t("nav.register")}
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
