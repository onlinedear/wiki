import { Checkbox, Stack, Text, Group, Paper } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { ApiKeyScope } from "@/ee/api-key/types/api-key.types";
import {
  IconFileText,
  IconFolder,
  IconUsers,
  IconMessage,
} from "@tabler/icons-react";

interface ApiKeyScopesSelectorProps {
  value: ApiKeyScope[];
  onChange: (scopes: ApiKeyScope[]) => void;
}

export function ApiKeyScopesSelector({
  value,
  onChange,
}: ApiKeyScopesSelectorProps) {
  const { t } = useTranslation();

  const scopeGroups = [
    {
      resource: "pages",
      label: t("Pages"),
      icon: IconFileText,
      scopes: [
        { value: "pages:read" as ApiKeyScope, label: t("Read") },
        { value: "pages:write" as ApiKeyScope, label: t("Write") },
        { value: "pages:delete" as ApiKeyScope, label: t("Delete") },
      ],
    },
    {
      resource: "spaces",
      label: t("Spaces"),
      icon: IconFolder,
      scopes: [
        { value: "spaces:read" as ApiKeyScope, label: t("Read") },
        { value: "spaces:write" as ApiKeyScope, label: t("Write") },
        { value: "spaces:delete" as ApiKeyScope, label: t("Delete") },
      ],
    },
    {
      resource: "users",
      label: t("Users"),
      icon: IconUsers,
      scopes: [{ value: "users:read" as ApiKeyScope, label: t("Read") }],
    },
    {
      resource: "comments",
      label: t("Comments"),
      icon: IconMessage,
      scopes: [
        { value: "comments:read" as ApiKeyScope, label: t("Read") },
        { value: "comments:write" as ApiKeyScope, label: t("Write") },
        { value: "comments:delete" as ApiKeyScope, label: t("Delete") },
      ],
    },
  ];

  const handleScopeChange = (scope: ApiKeyScope, checked: boolean) => {
    if (checked) {
      onChange([...value, scope]);
    } else {
      onChange(value.filter((s) => s !== scope));
    }
  };

  const isResourceFullySelected = (resource: string) => {
    const resourceScopes = scopeGroups.find(
      (g) => g.resource === resource
    )?.scopes;
    return resourceScopes?.every((s) => value.includes(s.value));
  };

  const handleResourceToggle = (resource: string, checked: boolean) => {
    const resourceScopes =
      scopeGroups.find((g) => g.resource === resource)?.scopes || [];
    if (checked) {
      const newScopes = [
        ...value,
        ...resourceScopes.map((s) => s.value).filter((s) => !value.includes(s)),
      ];
      onChange(newScopes);
    } else {
      const scopesToRemove = resourceScopes.map((s) => s.value);
      onChange(value.filter((s) => !scopesToRemove.includes(s)));
    }
  };

  return (
    <Stack gap="md">
      <Text size="sm" fw={500}>
        {t("Permissions")}
      </Text>
      <Text size="xs" c="dimmed">
        {t("Select the permissions this API key should have")}
      </Text>

      {scopeGroups.map((group) => (
        <Paper key={group.resource} p="md" withBorder>
          <Stack gap="sm">
            <Group gap="xs">
              <group.icon size={18} />
              <Checkbox
                label={group.label}
                checked={isResourceFullySelected(group.resource)}
                onChange={(e) =>
                  handleResourceToggle(group.resource, e.currentTarget.checked)
                }
                fw={500}
              />
            </Group>
            <Group gap="md" ml="xl">
              {group.scopes.map((scope) => (
                <Checkbox
                  key={scope.value}
                  label={scope.label}
                  checked={value.includes(scope.value)}
                  onChange={(e) =>
                    handleScopeChange(scope.value, e.currentTarget.checked)
                  }
                  size="sm"
                />
              ))}
            </Group>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
