import { Stack, Title, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import ConfluenceConfig from './confluence-integration';

export default function ThirdPartyIntegrations() {
  const { t } = useTranslation();

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>{t('Third-party integrations')}</Title>
        <Text size="sm" c="dimmed" mt="xs">
          {t('Manage connections to external systems and services')}
        </Text>
      </div>

      <ConfluenceConfig />
    </Stack>
  );
}
