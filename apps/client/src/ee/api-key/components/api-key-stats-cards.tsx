import { Card, Group, SimpleGrid, Text } from "@mantine/core";
import {
  IconKey,
  IconKeyOff,
  IconAlertTriangle,
  IconChartLine,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { IApiKey } from "@/ee/api-key/types/api-key.types";

interface ApiKeyStatsCardsProps {
  apiKeys: IApiKey[];
}

export function ApiKeyStatsCards({ apiKeys }: ApiKeyStatsCardsProps) {
  const { t } = useTranslation();

  const totalKeys = apiKeys?.length || 0;
  
  const activeKeys = apiKeys?.filter((key) => {
    if (!key.expiresAt) return true;
    return new Date(key.expiresAt) > new Date();
  }).length || 0;

  const expiredKeys = totalKeys - activeKeys;

  const expiringKeys = apiKeys?.filter((key) => {
    if (!key.expiresAt) return false;
    const expiryDate = new Date(key.expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  }).length || 0;

  const totalRequests = apiKeys?.reduce(
    (sum, key) => sum + (key.requestCount || 0),
    0
  ) || 0;

  const stats = [
    {
      title: t("Total API Keys"),
      value: totalKeys,
      icon: IconKey,
      color: "blue",
    },
    {
      title: t("Active Keys"),
      value: activeKeys,
      icon: IconKey,
      color: "green",
    },
    {
      title: t("Expiring Soon"),
      value: expiringKeys,
      icon: IconAlertTriangle,
      color: "orange",
    },
    {
      title: t("Total Requests"),
      value: totalRequests.toLocaleString(),
      icon: IconChartLine,
      color: "violet",
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
      {stats.map((stat) => (
        <Card key={stat.title} padding="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                {stat.title}
              </Text>
              <Text size="xl" fw={700} mt="xs">
                {stat.value}
              </Text>
            </div>
            <stat.icon size={32} stroke={1.5} color={`var(--mantine-color-${stat.color}-6)`} />
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}
