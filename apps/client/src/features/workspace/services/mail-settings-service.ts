import api from "@/lib/api-client";

export interface MailSettings {
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
  mailFromAddress?: string;
  mailFromName?: string;
  smtpIgnoreTLS?: boolean;
}

export const getMailSettings = async (): Promise<MailSettings> => {
  const response: any = await api.post("/workspace/mail-settings");
  return response.data || response;
};

export const updateMailSettings = async (
  settings: MailSettings
): Promise<MailSettings> => {
  const response: any = await api.post("/workspace/mail-settings/update", settings);
  return response.data || response;
};

export const testMailSettings = async (email: string): Promise<{ success: boolean; message: string }> => {
  const response: any = await api.post("/workspace/mail-settings/test", { email });
  return response.data || response;
};
