import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMailSettings,
  updateMailSettings,
  testMailSettings,
  MailSettings,
} from "../services/mail-settings-service";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";

export const useMailSettings = () => {
  return useQuery({
    queryKey: ["mail-settings"],
    queryFn: getMailSettings,
  });
};

export const useUpdateMailSettings = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (settings: MailSettings) => updateMailSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail-settings"] });
      notifications.show({
        title: t("Success"),
        message: t("Mail settings updated successfully"),
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: t("Error"),
        message: t("Failed to update mail settings"),
        color: "red",
      });
    },
  });
};

export const useTestMailSettings = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (email: string) => testMailSettings(email),
    onSuccess: () => {
      notifications.show({
        title: t("Success"),
        message: t("Test email sent successfully"),
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t("Error"),
        message: error?.response?.data?.message || t("Failed to send test email"),
        color: "red",
      });
    },
  });
};
