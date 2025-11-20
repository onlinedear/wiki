import { ActionIcon, Group, Menu, Table, Text, Badge, Tooltip, CopyButton, Button } from "@mantine/core";
import { IconDots, IconEdit, IconTrash, IconCopy, IconCheck, IconEye } from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { IApiKey } from "@/ee/api-key";
import { CustomAvatar } from "@/components/ui/custom-avatar.tsx";
import React from "react";
import NoTableResults from "@/components/common/no-table-results";
import { ApiKeyStatusBadge } from "./api-key-status-badge";

interface ApiKeyTableProps {
  apiKeys: IApiKey[];
  isLoading?: boolean;
  showUserColumn?: boolean;
  onUpdate?: (apiKey: IApiKey) => void;
  onRevoke?: (apiKey: IApiKey) => void;
  onViewDetails?: (apiKey: IApiKey) => void;
}

export function ApiKeyTable({
  apiKeys,
  isLoading,
  showUserColumn = false,
  onUpdate,
  onRevoke,
  onViewDetails,
}: ApiKeyTableProps) {
  const { t } = useTranslation();

  const formatDate = (date: Date | string | null) => {
    if (!date) return t("Never");
    return format(new Date(date), "MMM dd, yyyy");
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const maskApiKey = (token?: string) => {
    if (!token) return "";
    return `${token.substring(0, 12)}...${token.substring(token.length - 4)}`;
  };

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("Status")}</Table.Th>
            <Table.Th>{t("Name")}</Table.Th>
            <Table.Th>{t("Permissions")}</Table.Th>
            {showUserColumn && <Table.Th>{t("User")}</Table.Th>}
            <Table.Th>{t("Requests")}</Table.Th>
            <Table.Th>{t("Last used")}</Table.Th>
            <Table.Th>{t("Expires")}</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {apiKeys && apiKeys.length > 0 ? (
            apiKeys.map((apiKey: IApiKey, index: number) => (
              <Table.Tr key={index}>
                <Table.Td>
                  <ApiKeyStatusBadge apiKey={apiKey} />
                </Table.Td>

                <Table.Td>
                  <div>
                    <Text fz="sm" fw={500}>
                      {apiKey.name}
                    </Text>
                    {apiKey.description && (
                      <Text fz="xs" c="dimmed" lineClamp={1}>
                        {apiKey.description}
                      </Text>
                    )}
                  </div>
                </Table.Td>

                <Table.Td>
                  {apiKey.scopes && apiKey.scopes.length > 0 ? (
                    <Tooltip
                      label={
                        <div style={{ maxWidth: 300 }}>
                          {apiKey.scopes.map((scope, idx) => (
                            <div key={idx}>• {scope}</div>
                          ))}
                        </div>
                      }
                      withinPortal
                      multiline
                    >
                      <Group gap={4} style={{ cursor: 'pointer' }}>
                        <Badge size="xs" variant="light">
                          {apiKey.scopes[0].split(":")[0]}:{apiKey.scopes[0].split(":")[1]}
                        </Badge>
                        {apiKey.scopes.length > 1 && (
                          <Badge size="xs" variant="light" color="gray">
                            +{apiKey.scopes.length - 1}
                          </Badge>
                        )}
                      </Group>
                    </Tooltip>
                  ) : (
                    <Text fz="xs" c="dimmed">
                      {t("All")}
                    </Text>
                  )}
                </Table.Td>

                {showUserColumn && apiKey.creator && (
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <CustomAvatar
                        avatarUrl={apiKey.creator?.avatarUrl}
                        name={apiKey.creator.name}
                        size="sm"
                      />
                      <Text fz="sm" lineClamp={1}>
                        {apiKey.creator.name}
                      </Text>
                    </Group>
                  </Table.Td>
                )}

                <Table.Td>
                  <Text fz="sm">
                    {apiKey.requestCount?.toLocaleString() || 0}
                  </Text>
                </Table.Td>

                <Table.Td>
                  <Text fz="sm" style={{ whiteSpace: "nowrap" }}>
                    {formatDate(apiKey.lastUsedAt)}
                  </Text>
                </Table.Td>

                <Table.Td>
                  {apiKey.expiresAt ? (
                    isExpired(apiKey.expiresAt) ? (
                      <Text fz="sm" c="red" style={{ whiteSpace: "nowrap" }}>
                        {t("Expired")}
                      </Text>
                    ) : (
                      <Text fz="sm" style={{ whiteSpace: "nowrap" }}>
                        {formatDate(apiKey.expiresAt)}
                      </Text>
                    )
                  ) : (
                    <Text fz="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                      {t("Never")}
                    </Text>
                  )}
                </Table.Td>

                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    {onViewDetails && (
                      <Tooltip label={t("View details")} withinPortal>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() => onViewDetails(apiKey)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {onUpdate && (
                          <Menu.Item
                            leftSection={<IconEdit size={16} />}
                            onClick={() => onUpdate(apiKey)}
                          >
                            {t("Edit")}
                          </Menu.Item>
                        )}
                        {onRevoke && (
                          <Menu.Item
                            leftSection={<IconTrash size={16} />}
                            color="red"
                            onClick={() => onRevoke(apiKey)}
                          >
                            {t("Revoke")}
                          </Menu.Item>
                        )}
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))
          ) : (
            <NoTableResults colSpan={showUserColumn ? 8 : 7} />
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
