import { Badge } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IApiKey } from "@/ee/api-key/types/api-key.types";

interface ApiKeyStatusBadgeProps {
  apiKey: IApiKey;
}

export function ApiKeyStatusBadge({ apiKey }: ApiKeyStatusBadgeProps) {
  const { t } = useTranslation();

  const getStatus = () => {
    if (!apiKey.expiresAt) {
      return { label: t("Active"), color: "green" };
    }

    const expiryDate = new Date(apiKey.expiresAt);
    const now = new Date();

    if (expiryDate < now) {
      return { label: t("Expired"), color: "red" };
    }

    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 7) {
      return { label: t("Expiring Soon"), color: "orange" };
    }

    return { label: t("Active"), color: "green" };
  };

  const status = getStatus();

  return (
    <Badge color={status.color} variant="light" size="sm">
      {status.label}
    </Badge>
  );
}
