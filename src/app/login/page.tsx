import { currentLang } from "@/lib/i18n/server";
import { AuthForm } from "./auth-form";

export default async function LoginPage() {
  const lang = await currentLang();
  return (
    <div className="py-6">
      <AuthForm mode="login" lang={lang} />
    </div>
  );
}
