import { RegisterForm } from "@/features/auth/components/register-form";
import { Helmet } from "react-helmet-async";
import { getAppName } from "@/lib/config.ts";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>
          {t("Register")} - {getAppName()}
        </title>
      </Helmet>
      <RegisterForm />
    </>
  );
}
