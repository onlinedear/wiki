import React, { useState } from "react";
import { Button, Group, Space, Text, TextInput, Select, Alert } from "@mantine/core";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { IconSearch, IconShieldCheck, IconPlus } from "@tabler/icons-react";
import SettingsTitle from "@/components/settings/settings-title";
import { getAppName } from "@/lib/config";
import { ApiKeyTable } from "@/ee/api-key/components/api-key-table";
import { CreateApiKeyModal } from "@/ee/api-key/components/create-api-key-modal";
import { ApiKeyCreatedModal } from "@/ee/api-key/components/api-key-created-modal";
import { UpdateApiKeyModal } from "@/ee/api-key/components/update-api-key-modal";
import { RevokeApiKeyModal } from "@/ee/api-key/components/revoke-api-key-modal";
import { ApiKeyStatsCards } from "@/ee/api-key/components/api-key-stats-cards";
import { ApiKeyDetailsDrawer } from "@/ee/api-key/components/api-key-details-drawer";
import Paginate from "@/components/common/paginate";
import { usePaginateAndSearch } from "@/hooks/use-paginate-and-search";
import { useGetApiKeysQuery, useGetApiKeyStatsQuery } from "@/ee/api-key/queries/api-key-query.ts";
import { IApiKey } from "@/ee/api-key";
import useUserRole from '@/hooks/use-user-role.tsx';

export default function WorkspaceApiKeys() {
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
  const { data, isLoading } = useGetApiKeysQuery({ page, adminView: true });
  const { data: stats } = useGetApiKeyStatsQuery();
  const { isAdmin } = useUserRole();

  if (!isAdmin) {
    return null;
  }

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

  const filteredApiKeys = data?.items?.filter((apiKey) => {
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
          {t("API management")} - {getAppName()}
        </title>
      </Helmet>

      <SettingsTitle title={t("API management")} />

      <Text size="md" c="dimmed" mb="lg">
        {t("Manage API keys for all users in the workspace")}
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

      {/* Stats Cards */}
      <ApiKeyStatsCards apiKeys={data?.items || []} />

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
        showUserColumn
        onUpdate={handleUpdate}
        onRevoke={handleRevoke}
        onViewDetails={handleViewDetails}
      />

      <Space h="md" />

      {data?.items && data.items.length > 0 && (
        <Paginate
          currentPage={page}
          hasPrevPage={data.meta.hasPrevPage}
          hasNextPage={data.meta.hasNextPage}
          onPageChange={setPage}
        />
      )}

      <CreateApiKeyModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={handleCreateSuccess}
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
