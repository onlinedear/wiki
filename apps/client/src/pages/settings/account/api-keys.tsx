import React, { useState } from "react";
import { Button, Group, Space, Text, TextInput, Select, Alert, Stack } from "@mantine/core";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { IconSearch, IconShieldCheck, IconPlus, IconKey } from "@tabler/icons-react";
import SettingsTitle from "@/components/settings/settings-title";
import { getAppName } from "@/lib/config";
import { ApiKeyTable } from "@/ee/api-key/components/api-key-table";
import { CreateApiKeyModal } from "@/ee/api-key/components/create-api-key-modal";
import { ApiKeyCreatedModal } from "@/ee/api-key/components/api-key-created-modal";
import { UpdateApiKeyModal } from "@/ee/api-key/components/update-api-key-modal";
import { RevokeApiKeyModal } from "@/ee/api-key/components/revoke-api-key-modal";
import { ApiKeyDetailsDrawer } from "@/ee/api-key/components/api-key-details-drawer";
import Paginate from "@/components/common/paginate";
import { usePaginateAndSearch } from "@/hooks/use-paginate-and-search";
import { useGetUserApiKeysQuery } from "@/ee/api-key/queries/api-key-query.ts";
import { IApiKey } from "@/ee/api-key";

export default function AccountApiKeys() {
  const { t } = useTranslation();
  const { page, setPage } = usePaginateAndSearch();
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState<IApiKey | null>(null);
  const [updateModalOpened, setUpdateModalOpened] = useState(false);
  const [revokeModalOpened, setRevokeModalOpened] = useState(false);
  const [detailsDrawerOpened, setDetailsDrawerOpened] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<IApiKey | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data, isLoading } = useGetUserApiKeysQuery({ page });

  const handleCreateSuccess = (response: IApiKey) => {
    setCreatedApiKey(response);
  };

  const handleUpdate = (apiKey: IApiKey) => {
    setSelectedApiKey(apiKey);
    setUpdateModalOpened(true);
  };

  const handleRevoke = (apiKey: IApiKey) => {
    setSelectedApiKey(apiKey);
    setRevokeModalOpened(true);
  };

  const handleViewDetails = (apiKey: IApiKey) => {
    setSelectedApiKey(apiKey);
    setDetailsDrawerOpened(true);
  };

  const filteredApiKeys = data?.filter((apiKey) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      apiKey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apiKey.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    let matchesStatus = true;
    if (statusFilter !== "all") {
      const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date();
      const isExpiringSoon = apiKey.expiresAt && (() => {
        const expiryDate = new Date(apiKey.expiresAt);
        const now = new Date();
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
      })();

      if (statusFilter === "active") {
        matchesStatus = !isExpired && !isExpiringSoon;
      } else if (statusFilter === "expired") {
        matchesStatus = !!isExpired;
      } else if (statusFilter === "expiring") {
        matchesStatus = !!isExpiringSoon;
      }
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Helmet>
        <title>
          {t("Personal API Keys")} - {getAppName()}
        </title>
      </Helmet>

      <SettingsTitle title={t("Personal API Keys")} />

      <Text size="md" c="dimmed" mb="lg">
        {t("Manage your personal API keys for programmatic access")}
      </Text>

      {/* Security Alert */}
      <Alert icon={<IconShieldCheck size={16} />} color="blue" variant="light" mb="lg">
        <Text size="sm" fw={500} mb={4}>
          {t("Security Best Practices")}
        </Text>
        <Text size="xs">
          • {t("Store API keys securely and never commit them to version control")}
          <br />
          • {t("Rotate keys regularly")}
          <br />
          • {t("Use the minimum required permissions")}
          <br />
          • {t("Monitor API key usage regularly")}
        </Text>
      </Alert>

      {/* Info Card */}
      <Alert icon={<IconKey size={16} />} color="gray" variant="light" mb="lg">
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            {t("About Personal API Keys")}
          </Text>
          <Text size="xs">
            {t("Personal API keys allow you to access the API with your own permissions. These keys inherit your workspace role and access rights.")}
          </Text>
        </Stack>
      </Alert>

      {/* Search and Filter Bar */}
      <Group justify="space-between" mb="md">
        <Group gap="md" style={{ flex: 1 }}>
          <TextInput
            placeholder={t("Search API keys...")}
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flex: 1, maxWidth: 400 }}
          />
          <Select
            placeholder={t("Filter by status")}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || "all")}
            data={[
              { value: "all", label: t("All") },
              { value: "active", label: t("Active") },
              { value: "expiring", label: t("Expiring Soon") },
              { value: "expired", label: t("Expired") },
            ]}
            style={{ width: 180 }}
          />
        </Group>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateModalOpened(true)}
        >
          {t("Create API Key")}
        </Button>
      </Group>

      {/* API Keys Table */}
      <ApiKeyTable
        apiKeys={filteredApiKeys}
        isLoading={isLoading}
        showUserColumn={true}
        onUpdate={handleUpdate}
        onRevoke={handleRevoke}
        onViewDetails={handleViewDetails}
      />

      <Space h="md" />

      {data && data.length > 0 && (
        <Paginate
          currentPage={page}
          hasPrevPage={page > 1}
          hasNextPage={data.length >= 100}
          onPageChange={setPage}
        />
      )}

      <CreateApiKeyModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={handleCreateSuccess}
        userMode
      />

      <ApiKeyCreatedModal
        opened={!!createdApiKey}
        onClose={() => setCreatedApiKey(null)}
        apiKey={createdApiKey}
      />

      <UpdateApiKeyModal
        opened={updateModalOpened}
        onClose={() => {
          setUpdateModalOpened(false);
          setSelectedApiKey(null);
        }}
        apiKey={selectedApiKey}
      />

      <RevokeApiKeyModal
        opened={revokeModalOpened}
        onClose={() => {
          setRevokeModalOpened(false);
          setSelectedApiKey(null);
        }}
        apiKey={selectedApiKey}
      />

      <ApiKeyDetailsDrawer
        opened={detailsDrawerOpened}
        onClose={() => {
          setDetailsDrawerOpened(false);
          setSelectedApiKey(null);
        }}
        apiKey={selectedApiKey}
      />
    </>
  );
}
