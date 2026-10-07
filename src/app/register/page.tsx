import { currentLang } from "@/lib/i18n/server";
import { AuthForm } from "../login/auth-form";

export default async function RegisterPage() {
  const lang = await currentLang();
  return <div className="py-6"><AuthForm mode="register" lang={lang} /></div>;
}