import {
  Drawer,
  Stack,
  Text,
  Group,
  Badge,
  Divider,
  Paper,
  CopyButton,
  Button,
  ActionIcon,
  Tooltip,
  List,
} from "@mantine/core";
import { IconCopy, IconCheck, IconCalendar, IconUser, IconShield, IconActivity } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { IApiKey } from "@/ee/api-key/types/api-key.types";
import { format } from "date-fns";
import { ApiKeyStatusBadge } from "./api-key-status-badge";

interface ApiKeyDetailsDrawerProps {
  opened: boolean;
  onClose: () => void;
  apiKey: IApiKey | null;
}

export function ApiKeyDetailsDrawer({
  opened,
  onClose,
  apiKey,
}: ApiKeyDetailsDrawerProps) {
  const { t } = useTranslation();

  if (!apiKey) return null;

  const formatDate = (date: Date | string | null) => {
    if (!date) return t("Never");
    return format(new Date(date), "MMM dd, yyyy HH:mm");
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={t("API Key Details")}
      position="right"
      size="md"
    >
      <Stack gap="lg">
        {/* Status */}
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
            {t("Status")}
          </Text>
          <ApiKeyStatusBadge apiKey={apiKey} />
        </div>

        <Divider />

        {/* Basic Info */}
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
            {t("Basic Information")}
          </Text>
          <Stack gap="sm">
            <div>
              <Text size="sm" fw={500}>
                {t("Name")}
              </Text>
              <Text size="sm" c="dimmed">
                {apiKey.name}
              </Text>
            </div>

            {apiKey.description && (
              <div>
                <Text size="sm" fw={500}>
                  {t("Description")}
                </Text>
                <Text size="sm" c="dimmed">
                  {apiKey.description}
                </Text>
              </div>
            )}

            <div>
              <Text size="sm" fw={500}>
                {t("API Key ID")}
              </Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed" style={{ fontFamily: "monospace" }}>
                  {apiKey.id}
                </Text>
                <CopyButton value={apiKey.id}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? t("Copied") : t("Copy")} withinPortal>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color={copied ? "teal" : "gray"}
                        onClick={copy}
                      >
                        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </div>
          </Stack>
        </div>

        <Divider />

        {/* Permissions */}
        <div>
          <Group gap="xs" mb="xs">
            <IconShield size={16} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {t("Permissions")}
            </Text>
          </Group>
          {apiKey.scopes && apiKey.scopes.length > 0 ? (
            <Group gap="xs">
              {apiKey.scopes.map((scope) => (
                <Badge key={scope} size="sm" variant="light">
                  {scope}
                </Badge>
              ))}
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              {t("Full access to all resources")}
            </Text>
          )}
        </div>

        <Divider />

        {/* Usage Statistics */}
        <div>
          <Group gap="xs" mb="xs">
            <IconActivity size={16} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {t("Usage Statistics")}
            </Text>
          </Group>
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm">{t("Total Requests")}</Text>
                <Text size="sm" fw={500}>
                  {apiKey.requestCount?.toLocaleString() || 0}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">{t("Last Used")}</Text>
                <Text size="sm" fw={500}>
                  {formatDate(apiKey.lastUsedAt)}
                </Text>
              </Group>
            </Stack>
          </Paper>
        </div>

        <Divider />

        {/* Security Settings */}
        {(apiKey.ipWhitelist || apiKey.rateLimit) && (
          <>
            <div>
              <Group gap="xs" mb="xs">
                <IconShield size={16} />
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {t("Security Settings")}
                </Text>
              </Group>
              <Stack gap="sm">
                {apiKey.ipWhitelist && apiKey.ipWhitelist.length > 0 && (
                  <div>
                    <Text size="sm" fw={500} mb={4}>
                      {t("IP Whitelist")}
                    </Text>
                    <List size="sm">
                      {apiKey.ipWhitelist.map((ip, index) => (
                        <List.Item key={index}>
                          <Text size="sm" c="dimmed" style={{ fontFamily: "monospace" }}>
                            {ip}
                          </Text>
                        </List.Item>
                      ))}
                    </List>
                  </div>
                )}

                {apiKey.rateLimit && (
                  <div>
                    <Text size="sm" fw={500}>
                      {t("Rate Limit")}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {apiKey.rateLimit.toLocaleString()} {t("requests per hour")}
                    </Text>
                  </div>
                )}
              </Stack>
            </div>
            <Divider />
          </>
        )}

        {/* Dates */}
        <div>
          <Group gap="xs" mb="xs">
            <IconCalendar size={16} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {t("Dates")}
            </Text>
          </Group>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm">{t("Created")}</Text>
              <Text size="sm" fw={500}>
                {formatDate(apiKey.createdAt)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">{t("Expires")}</Text>
              <Text size="sm" fw={500}>
                {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : t("Never")}
              </Text>
            </Group>
          </Stack>
        </div>

        {/* Creator */}
        {apiKey.creator && (
          <>
            <Divider />
            <div>
              <Group gap="xs" mb="xs">
                <IconUser size={16} />
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {t("Created By")}
                </Text>
              </Group>
              <Text size="sm">{apiKey.creator.name}</Text>
            </div>
          </>
        )}
      </Stack>
    </Drawer>
  );
}
