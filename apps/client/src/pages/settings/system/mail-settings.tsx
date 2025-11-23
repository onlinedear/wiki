import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  NumberInput,
  Switch,
  Button,
  Stack,
  Group,
  Divider,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconMail, IconInfoCircle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import {
  useMailSettings,
  useUpdateMailSettings,
  useTestMailSettings,
} from "@/features/workspace/queries/mail-settings-query";
import { MailSettings } from "@/features/workspace/services/mail-settings-service";

export default function MailSettingsPage() {
  const { t } = useTranslation();
  const [testEmail, setTestEmail] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { data: mailSettings, isLoading } = useMailSettings();
  const updateMutation = useUpdateMailSettings();
  const testMutation = useTestMailSettings();

  const form = useForm<MailSettings>({
    initialValues: {
      smtpHost: "",
      smtpPort: 587,
      smtpSecure: false,
      smtpUsername: "",
      smtpPassword: "",
      mailFromAddress: "",
      mailFromName: "NoteDoc",
      smtpIgnoreTLS: false,
    },
  });

  // Update form when data loads (only once)
  useEffect(() => {
    if (mailSettings && !isInitialized) {
      form.setValues({
        smtpHost: mailSettings.smtpHost || "",
        smtpPort: mailSettings.smtpPort || 587,
        smtpSecure: mailSettings.smtpSecure || false,
        smtpUsername: mailSettings.smtpUsername || "",
        smtpPassword: mailSettings.smtpPassword || "",
        mailFromAddress: mailSettings.mailFromAddress || "",
        mailFromName: mailSettings.mailFromName || "NoteDoc",
        smtpIgnoreTLS: mailSettings.smtpIgnoreTLS || false,
      });
      setIsInitialized(true);
    }
  }, [mailSettings, isInitialized]);

  const handleSubmit = (values: MailSettings) => {
    updateMutation.mutate(values);
  };

  const handleTest = () => {
    if (!testEmail) {
      return;
    }
    testMutation.mutate(testEmail);
  };

  return (
    <Container size="md" py="xl">
      <LoadingOverlay visible={isLoading} />
      
      <Stack gap="lg">
        <div>
          <Title order={2}>{t("Mail service")}</Title>
          <Text c="dimmed" size="sm" mt="xs">
            {t("Configure SMTP settings for sending emails")}
          </Text>
        </div>

        <Alert icon={<IconInfoCircle size={16} />} color="blue">
          {t("Mail service is used for user invitations, password resets, and notification emails")}
        </Alert>

        <Paper shadow="xs" p="xl">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Title order={4}>{t("SMTP configuration")}</Title>

              <TextInput
                label={t("SMTP host")}
                placeholder="smtp.example.com"
                required
                {...form.getInputProps("smtpHost")}
              />

              <NumberInput
                label={t("SMTP port")}
                placeholder="587"
                required
                min={1}
                max={65535}
                {...form.getInputProps("smtpPort")}
              />

              <Switch
                label={t("Use SSL/TLS")}
                description={t("Enable secure connection (recommended for port 465)")}
                {...form.getInputProps("smtpSecure", { type: "checkbox" })}
              />

              <Switch
                label={t("Ignore TLS")}
                description={t("Disable TLS certificate validation (not recommended)")}
                {...form.getInputProps("smtpIgnoreTLS", { type: "checkbox" })}
              />

              <Divider my="sm" />

              <Title order={4}>{t("Authentication")}</Title>

              <TextInput
                label={t("SMTP username")}
                placeholder={t("Username or email")}
                {...form.getInputProps("smtpUsername")}
              />

              <TextInput
                label={t("SMTP password")}
                placeholder={t("Password")}
                type="password"
                {...form.getInputProps("smtpPassword")}
              />

              <Divider my="sm" />

              <Title order={4}>{t("Sender information")}</Title>

              <TextInput
                label={t("From email address")}
                placeholder="noreply@example.com"
                required
                {...form.getInputProps("mailFromAddress")}
              />

              <TextInput
                label={t("From name")}
                placeholder="NoteDoc"
                required
                {...form.getInputProps("mailFromName")}
              />

              <Group justify="flex-end" mt="xl">
                <Button
                  type="submit"
                  loading={updateMutation.isPending}
                >
                  {t("Save settings")}
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>

        <Paper shadow="xs" p="xl">
          <Stack gap="md">
            <div>
              <Title order={4}>{t("Test email")}</Title>
              <Text c="dimmed" size="sm" mt="xs">
                {t("Send a test email to verify your SMTP configuration")}
              </Text>
            </div>

            <Group align="flex-end">
              <TextInput
                label={t("Test email address")}
                placeholder="test@example.com"
                style={{ flex: 1 }}
                value={testEmail}
                onChange={(e) => setTestEmail(e.currentTarget.value)}
                leftSection={<IconMail size={16} />}
              />
              <Button
                onClick={handleTest}
                loading={testMutation.isPending}
                disabled={!testEmail}
              >
                {t("Send test email")}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
