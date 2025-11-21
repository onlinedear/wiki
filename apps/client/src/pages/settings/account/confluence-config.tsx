import {
  Button,
  TextInput,
  Stack,
  Group,
  Text,
  Paper,
  PasswordInput,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertCircle, IconTrash } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getConfluenceConfig,
  saveConfluenceConfig,
  deleteConfluenceConfig,
  testConfluenceConnection,
} from '@/features/confluence/services/confluence-service';

export default function ConfluenceConfig() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);

  const form = useForm({
    initialValues: {
      confluenceUrl: '',
      accessToken: '',
    },
    validate: {
      confluenceUrl: (value) =>
        !value || !value.startsWith('http')
          ? 'Please enter a valid Confluence URL'
          : null,
      accessToken: (value) => {
        // Token is only required when creating new config or updating
        if (!hasConfig && !value) {
          return 'Access token is required';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    console.log('Loading Confluence config...');
    try {
      const response = await getConfluenceConfig();
      console.log('Loaded config response:', response);
      
      // Handle both wrapped and unwrapped responses
      const config = response?.data || response;
      console.log('Parsed config:', config);
      
      if (config?.confluenceUrl) {
        form.setFieldValue('confluenceUrl', config.confluenceUrl);
        setHasConfig(config.hasAccessToken);
        console.log('Config loaded successfully:', { 
          confluenceUrl: config.confluenceUrl, 
          hasAccessToken: config.hasAccessToken 
        });
      } else {
        console.log('No config found');
        setHasConfig(false);
      }
    } catch (error) {
      console.error('Failed to load Confluence config:', error);
      setHasConfig(false);
    }
  };

  const handleSave = async (values: typeof form.values) => {
    // If updating existing config and no new token provided, skip validation
    if (hasConfig && !values.accessToken) {
      notifications.show({
        title: t('Info'),
        message: t('Please enter a new access token to update, or leave unchanged'),
        color: 'blue',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await saveConfluenceConfig(values);
      console.log('Save config result:', result);
      notifications.show({
        title: t('Success'),
        message: t('Confluence configuration saved successfully'),
        color: 'teal',
        icon: <IconCheck size={18} />,
      });
      setHasConfig(true);
      // Clear the token field after successful save (for security)
      form.setFieldValue('accessToken', '');
      // Reload config to verify it was saved
      await loadConfig();
    } catch (error) {
      console.error('Save config error:', error);
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

  const handleTest = async () => {
    if (!form.values.confluenceUrl || !form.values.accessToken) {
      notifications.show({
        title: t('Error'),
        message: t('Please fill in both URL and access token'),
        color: 'red',
      });
      return;
    }

    setTesting(true);
    try {
      const result = await testConfluenceConnection(form.values);
      if (result.success) {
        notifications.show({
          title: t('Success'),
          message: t('Connection successful'),
          color: 'teal',
          icon: <IconCheck size={18} />,
        });
      } else {
        notifications.show({
          title: t('Error'),
          message: t('Connection failed'),
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: t('Error'),
        message: t('Failed to test connection'),
        color: 'red',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('Are you sure you want to delete your Confluence configuration?'))) {
      return;
    }

    setLoading(true);
    try {
      await deleteConfluenceConfig();
      notifications.show({
        title: t('Success'),
        message: t('Confluence configuration deleted'),
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

  return (
    <Paper p="md">
      <Stack gap="md">
        <div>
          <Text size="lg" fw={500} mb="xs">
            {t('Confluence Integration')}
          </Text>
          <Text size="sm" c="dimmed">
            {t('Configure your Confluence connection to import pages directly from your Confluence instance')}
          </Text>
        </div>

        <Alert color="blue" title={t('How to get your Personal Access Token')}>
          <Text size="sm">
            {t('1. Go to your Confluence instance')}
            <br />
            {t('2. Click on your profile picture → Settings → Personal Access Tokens')}
            <br />
            {t('3. Create a new token with read permissions')}
            <br />
            {t('4. Copy the token and paste it below')}
          </Text>
          <Text size="sm" mt="xs">
            <a
              href="https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Learn more about Personal Access Tokens')}
            </a>
          </Text>
        </Alert>

        <form onSubmit={form.onSubmit(handleSave)}>
          <Stack gap="md">
            <TextInput
              label={t('Confluence URL')}
              placeholder="https://your-domain.atlassian.net/wiki"
              description={t('Your Confluence instance URL')}
              {...form.getInputProps('confluenceUrl')}
            />

            <PasswordInput
              label={t('Personal Access Token')}
              placeholder={hasConfig ? '••••••••••••••••' : t('Enter your access token')}
              description={
                hasConfig
                  ? t('Token is configured. Enter a new token to update.')
                  : t('Your Confluence Personal Access Token')
              }
              required={!hasConfig}
              {...form.getInputProps('accessToken')}
            />

            <Group justify="space-between">
              <Group>
                <Button type="submit" loading={loading}>
                  {t('Save Configuration')}
                </Button>
                <Button
                  variant="light"
                  onClick={handleTest}
                  loading={testing}
                  disabled={!form.values.confluenceUrl || !form.values.accessToken}
                >
                  {t('Test Connection')}
                </Button>
              </Group>

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
