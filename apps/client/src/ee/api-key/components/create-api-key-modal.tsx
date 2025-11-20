import { lazy, Suspense, useState } from "react";
import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  Select,
  Textarea,
  Stepper,
  NumberInput,
  Text,
  Alert,
  Collapse,
  Switch,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useCreateApiKeyMutation } from "@/ee/api-key/queries/api-key-query";
import { IconCalendar, IconInfoCircle } from "@tabler/icons-react";
import { IApiKey, ApiKeyScope } from "@/ee/api-key";
import { ApiKeyScopesSelector } from "./api-key-scopes-selector";

const DateInput = lazy(() =>
  import("@mantine/dates").then((module) => ({
    default: module.DateInput,
  })),
);

interface CreateApiKeyModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: (response: IApiKey) => void;
  userMode?: boolean;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  expiresAt: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  ipWhitelist: z.array(z.string()).optional(),
  rateLimit: z.number().optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function CreateApiKeyModal({
  opened,
  onClose,
  onSuccess,
  userMode = false,
}: CreateApiKeyModalProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [expirationOption, setExpirationOption] = useState<string>("30");
  const [enableAdvanced, setEnableAdvanced] = useState(false);
  const [ipWhitelistText, setIpWhitelistText] = useState("");
  const createApiKeyMutation = useCreateApiKeyMutation();

  const form = useForm<FormValues>({
    validate: zodResolver(formSchema),
    initialValues: {
      name: "",
      description: "",
      expiresAt: "",
      scopes: [],
      ipWhitelist: [],
      rateLimit: 1000,
    },
  });

  const getExpirationDate = (): string | undefined => {
    if (expirationOption === "never") {
      return undefined;
    }
    if (expirationOption === "custom") {
      return form.values.expiresAt;
    }
    const days = parseInt(expirationOption);
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };

  const getExpirationLabel = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const formatted = date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    return `${days} days (${formatted})`;
  };

  const expirationOptions = [
    { value: "30", label: getExpirationLabel(30) },
    { value: "60", label: getExpirationLabel(60) },
    { value: "90", label: getExpirationLabel(90) },
    { value: "365", label: getExpirationLabel(365) },
    { value: "custom", label: t("Custom") },
    { value: "never", label: t("No expiration") },
  ];

  const handleSubmit = async (data: FormValues) => {
    const ipList = ipWhitelistText
      .split(/[\n,]/)
      .map((ip) => ip.trim())
      .filter((ip) => ip.length > 0);

    const apiKeyData = {
      name: data.name,
      description: data.description,
      expiresAt: getExpirationDate(),
      scopes: data.scopes as ApiKeyScope[],
      ipWhitelist: enableAdvanced && ipList.length > 0 ? ipList : undefined,
      rateLimit: enableAdvanced ? data.rateLimit : undefined,
    };

    try {
      const createdKey = await createApiKeyMutation.mutateAsync(apiKeyData);
      onSuccess(createdKey);
      handleClose();
    } catch (err) {
      //
    }
  };

  const handleClose = () => {
    form.reset();
    setActive(0);
    setExpirationOption("30");
    setEnableAdvanced(false);
    setIpWhitelistText("");
    onClose();
  };

  const nextStep = () => {
    if (active === 0 && !form.values.name) {
      form.validate();
      return;
    }
    setActive((current) => (current < 2 ? current + 1 : current));
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t("Create API Key")}
      size="lg"
    >
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Stepper active={active} onStepClick={setActive} mb="xl">
          <Stepper.Step label={t("Basic Info")} description={t("Name and description")}>
            <Stack gap="md" mt="md">
              <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                {t("Create a new API key to access the Docmost API programmatically")}
              </Alert>

              <TextInput
                label={t("Name")}
                placeholder={t("e.g., Production API Key")}
                description={t("A descriptive name for this API key")}
                required
                {...form.getInputProps("name")}
              />

              <Textarea
                label={t("Description")}
                placeholder={t("What will this API key be used for?")}
                description={t("Optional description to help you remember the purpose")}
                minRows={3}
                {...form.getInputProps("description")}
              />
            </Stack>
          </Stepper.Step>

          <Stepper.Step label={t("Permissions")} description={t("Access control")}>
            <Stack gap="md" mt="md">
              <ApiKeyScopesSelector
                value={(form.values.scopes as ApiKeyScope[]) || []}
                onChange={(scopes) => form.setFieldValue("scopes", scopes)}
              />
            </Stack>
          </Stepper.Step>

          <Stepper.Step label={t("Security")} description={t("Expiration and limits")}>
            <Stack gap="md" mt="md">
              <Select
                label={t("Expiration")}
                data={expirationOptions}
                value={expirationOption}
                onChange={(value) => setExpirationOption(value || "30")}
                leftSection={<IconCalendar size={16} />}
                allowDeselect={false}
              />

              {expirationOption === "custom" && (
                <Suspense fallback={null}>
                  <DateInput
                    label={t("Custom expiration date")}
                    placeholder={t("Select expiration date")}
                    minDate={new Date()}
                    {...form.getInputProps("expiresAt")}
                  />
                </Suspense>
              )}

              <Switch
                label={t("Enable advanced security settings")}
                description={t("Configure IP whitelist and rate limiting")}
                checked={enableAdvanced}
                onChange={(e) => setEnableAdvanced(e.currentTarget.checked)}
                mt="md"
              />

              <Collapse in={enableAdvanced}>
                <Stack gap="md" mt="md">
                  <Textarea
                    label={t("IP Whitelist")}
                    placeholder="192.168.1.1&#10;10.0.0.0/8"
                    description={t("Enter IP addresses or CIDR ranges, one per line or comma-separated")}
                    minRows={3}
                    value={ipWhitelistText}
                    onChange={(e) => setIpWhitelistText(e.currentTarget.value)}
                  />

                  <NumberInput
                    label={t("Rate Limit")}
                    description={t("Maximum requests per hour")}
                    placeholder="1000"
                    min={1}
                    max={100000}
                    {...form.getInputProps("rateLimit")}
                  />
                </Stack>
              </Collapse>

              <Alert icon={<IconInfoCircle size={16} />} color="yellow" variant="light" mt="md">
                <Text size="sm" fw={500} mb={4}>
                  {t("Security Best Practices")}
                </Text>
                <Text size="xs">
                  • {t("Store API keys securely and never commit them to version control")}
                </Text>
                <Text size="xs">
                  • {t("Rotate keys regularly")}
                </Text>
                <Text size="xs">
                  • {t("Use the minimum required permissions")}
                </Text>
              </Alert>
            </Stack>
          </Stepper.Step>
        </Stepper>

        <Group justify="space-between" mt="xl">
          <Button variant="default" onClick={active === 0 ? handleClose : prevStep}>
            {active === 0 ? t("Cancel") : t("Back")}
          </Button>
          {active < 2 ? (
            <Button onClick={nextStep}>{t("Next")}</Button>
          ) : (
            <Button type="submit" loading={createApiKeyMutation.isPending}>
              {t("Create API Key")}
            </Button>
          )}
        </Group>
      </form>
    </Modal>
  );
}
