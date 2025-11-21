import {
  Modal,
  Button,
  TextInput,
  Stack,
  Switch,
  Alert,
  Text,
  PasswordInput,
  Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconAlertCircle, IconSettings } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { importConfluenceOnline, getConfluenceConfig } from '../services/confluence-service';
import { queryClient } from '@/main';

interface ConfluenceOnlineImportModalProps {
  spaceId: string;
  opened: boolean;
  onClose: () => void;
}

export function ConfluenceOnlineImportModal({
  spaceId,
  opened,
  onClose,
}: ConfluenceOnlineImportModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  const form = useForm({
    initialValues: {
      pageUrl: '',
      includeChildren: true,
    },
    validate: {
      pageUrl: (value) => {
        if (!value) return t('Page URL is required');
        if (!value.includes('confluence') && !value.includes('/pages/')) {
          return t('Please enter a valid Confluence page URL');
        }
        return null;
      },
    },
  });

  // Check if user has saved configuration when modal opens
  useEffect(() => {
    if (opened) {
      checkConfig();
    }
  }, [opened]);

  const checkConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await getConfluenceConfig();
      console.log('Checking Confluence config response:', response);
      
      // Handle both wrapped and unwrapped responses
      const config = response?.data || response;
      console.log('Parsed config:', config);
      
      if (config && config.confluenceUrl && config.hasAccessToken) {
        setHasConfig(true);
        console.log('Config found, user can import');
      } else {
        setHasConfig(false);
        console.log('No config found, user needs to configure first');
      }
    } catch (error) {
      console.error('Failed to load Confluence config:', error);
      setHasConfig(false);
    } finally {
      setConfigLoading(false);
    }
  };

  const extractPageId = (url: string): string | null => {
    // Extract page ID from various Confluence URL formats
    // Format 1: /pages/123456/Page+Title
    const match1 = url.match(/\/pages\/(\d+)\//);
    if (match1) return match1[1];

    // Format 2: /pages/viewpage.action?pageId=123456
    const match2 = url.match(/pageId=(\d+)/);
    if (match2) return match2[1];

    // Format 3: /display/SPACE/Page+Title (need to handle differently)
    // This would require an API call to resolve

    return null;
  };

  const handleSubmit = async (values: typeof form.values) => {
    const pageId = extractPageId(values.pageUrl);

    if (!pageId) {
      notifications.show({
        title: t('Error'),
        message: t('Could not extract page ID from URL. Please use a direct page URL.'),
        color: 'red',
        icon: <IconX size={18} />,
      });
      return;
    }

    setLoading(true);

    try {
      // Use saved configuration from user profile
      const importData = {
        pageId,
        spaceId,
        includeChildren: values.includeChildren,
      };

      const result = await importConfluenceOnline(importData);

      notifications.show({
        title: t('Import started'),
        message: result.message || t('Your Confluence pages are being imported'),
        color: 'teal',
        icon: <IconCheck size={18} />,
        autoClose: 5000,
      });

      // Refresh the page tree
      await queryClient.refetchQueries({
        queryKey: ['root-sidebar-pages', spaceId],
      });

      onClose();
      form.reset();
    } catch (error) {
      notifications.show({
        title: t('Import failed'),
        message:
          error?.response?.data?.message ||
          t('Failed to import from Confluence'),
        color: 'red',
        icon: <IconX size={18} />,
        autoClose: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('Import from Confluence Online')}
      size="md"
    >
      {configLoading ? (
        <Text size="sm" c="dimmed" ta="center">
          {t('Loading configuration...')}
        </Text>
      ) : !hasConfig ? (
        <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
          <Stack gap="sm">
            <Text size="sm">
              {t('Please configure your Confluence connection in your profile settings first.')}
            </Text>
            <Button
              component="a"
              href="/settings/account/profile"
              variant="light"
              leftSection={<IconSettings size={16} />}
            >
              {t('Go to Settings')}
            </Button>
          </Stack>
        </Alert>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Alert color="green" icon={<IconCheck size={16} />}>
              <Text size="sm">
                {t('Using saved Confluence configuration.')}{' '}
                <Anchor href="/settings/account/profile" size="sm">
                  {t('Change settings')}
                </Anchor>
              </Text>
            </Alert>

            <TextInput
              label={t('Confluence Page URL')}
              placeholder="https://your-domain.atlassian.net/wiki/pages/123456/Page+Title"
              description={t('The full URL of the specific page you want to import')}
              {...form.getInputProps('pageUrl')}
              required
            />

            <Switch
              label={t('Include child pages')}
              description={t('Import all child pages recursively')}
              {...form.getInputProps('includeChildren', { type: 'checkbox' })}
            />

            <Button type="submit" loading={loading} fullWidth>
              {t('Import from Confluence')}
            </Button>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
