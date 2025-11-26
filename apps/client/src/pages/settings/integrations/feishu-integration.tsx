import {
  Button,
  TextInput,
  Stack,
  Group,
  Text,
  Paper,
  PasswordInput,
  Alert,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertCircle, IconTrash } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getFeishuConfig,
  saveFeishuConfig,
  deleteFeishuConfig,
} from '@/features/feishu/services/feishu-service';

export default function FeishuIntegration() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  const form = useForm({
    initialValues: {
      appId: '',
      appSecret: '',
    },
    validate: {
      appId: (value) =>
        !value ? 'App ID is required' : null,
      appSecret: (value) => {
        if (!hasConfig && !value) {
          return 'App Secret is required';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await getFeishuConfig();
      const config = response?.data || response;
      
      if (config?.appId) {
        form.setFieldValue('appId', config.appId);
        setHasConfig(config.hasAppSecret);
      } else {
        setHasConfig(false);
      }
      
      setIsAdmin(config?.isAdmin || false);
    } catch (error) {
      console.error('Failed to load Feishu config:', error);
      setHasConfig(false);
      setIsAdmin(false);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleSave = async (values: typeof form.values) => {
    if (hasConfig && !values.appSecret) {
      notifications.show({
        title: t('Info'),
        message: t('Please enter a new app secret to update, or leave unchanged'),
        color: 'blue',
      });
      return;
    }

    setLoading(true);
    try {
      await saveFeishuConfig(values);
      notifications.show({
        title: t('Success'),
        message: t('Feishu configuration saved successfully'),
        color: 'teal',
        icon: <IconCheck size={18} />,
      });
      setHasConfig(true);
      form.setFieldValue('appSecret', '');
      await loadConfig();
    } catch (error) {
      notifications.show({
        title: t('Error'),
        message: error?.response?.data?.message || t('Failed to save configuration'),
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('Are you sure you want to delete your Feishu configuration?'))) {
      return;
    }

    setLoading(true);
    try {
      await deleteFeishuConfig();
      notifications.show({
        title: t('Success'),
        message: t('Feishu configuration deleted'),
        color: 'teal',
        icon: <IconCheck size={18} />,
      });
      form.reset();
      setHasConfig(false);
    } catch (error) {
      notifications.show({
        title: t('Error'),
        message: t('Failed to delete configuration'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <Paper p="md" withBorder>
        <Text size="sm" c="dimmed" ta="center">
          {t('Loading configuration...')}
        </Text>
      </Paper>
    );
  }

  if (!isAdmin) {
    return (
      <Paper p="md" withBorder>
        <Stack gap="md">
          <div>
            <Title order={3}>{t('Feishu Integration')}</Title>
            <Text size="sm" c="dimmed" mt="xs">
              {t('Import documents from Feishu workspace')}
            </Text>
          </div>

          <Alert color="blue" icon={<IconAlertCircle size={16} />}>
            <Text size="sm">
              {hasConfig
                ? t('Feishu integration is configured by your workspace administrator. You can use the import feature in any document library.')
                : t('Feishu integration is not configured yet. Please contact your workspace administrator to set it up.')}
            </Text>
          </Alert>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <div>
          <Title order={3}>{t('Feishu Integration')}</Title>
          <Text size="sm" c="dimmed" mt="xs">
            {t('Configure Feishu integration for your workspace. All workspace members will be able to import documents using this configuration.')}
          </Text>
        </div>

        <Alert color="blue" title={t('How to get your Feishu App credentials')}>
          <Text size="sm">
            {t('1. Go to Feishu Open Platform')} (https://open.feishu.cn)
            <br />
            {t('2. Create a new app or select an existing one')}
            <br />
            {t('3. Go to Credentials & Basic Info → App Credentials')}
            <br />
            {t('4. Copy the App ID and App Secret')}
            <br />
            {t('5. Enable the following permissions: docs:read, drive:read')}
          </Text>
        </Alert>

        <form onSubmit={form.onSubmit(handleSave)}>
          <Stack gap="md">
            <TextInput
              label={t('App ID')}
              placeholder="cli_xxxxxxxxxx"
              description={t('Your Feishu App ID')}
              {...form.getInputProps('appId')}
            />

            <PasswordInput
              label={t('App Secret')}
              placeholder={hasConfig ? '••••••••••••••••' : t('Enter your app secret')}
              description={
                hasConfig
                  ? t('App Secret is configured. Enter a new secret to update.')
                  : t('Your Feishu App Secret')
              }
              required={!hasConfig}
              {...form.getInputProps('appSecret')}
            />

            <Group justify="space-between">
              <Button type="submit" loading={loading}>
                {t('Save Configuration')}
              </Button>

              {hasConfig && (
                <Button
                  variant="subtle"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={handleDelete}
                  loading={loading}
                >
                  {t('Delete Configuration')}
                </Button>
              )}
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
