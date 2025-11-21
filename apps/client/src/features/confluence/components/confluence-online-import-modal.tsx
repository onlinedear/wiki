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
      confluenceUrl: '',
      accessToken: '',
      pageUrl: '',
      includeChildren: true,
    },
    validate: {
      confluenceUrl: (value) => {
        if (!hasConfig && !value) return t('Confluence URL is required');
        if (value && !value.startsWith('http')) return t('Please enter a valid URL');
        return null;
      },
      accessToken: (value) => {
        if (!hasConfig && !value) return t('Access token is required');
        return null;
      },
      pageUrl: (value) => {
        if (!value) return t('Page URL is required');
        if (!value.includes('confluence') && !value.includes('/pages/')) {
          return t('Please enter a valid Confluence page URL');
        }
        return null;
      },
    },
  });

  // Load saved configuration when modal opens
  useEffect(() => {
    if (opened) {
      loadConfig();
    }
  }, [opened]);

  const loadConfig = async () => {
    setConfigLoading(true);
    try {
      const config = await getConfluenceConfig();
      if (config.confluenceUrl && config.hasAccessToken) {
        setHasConfig(true);
        form.setFieldValue('confluenceUrl', config.confluenceUrl);
        // Don't set accessToken as it's not returned for security
      } else {
        setHasConfig(false);
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
      // If using saved config, don't send credentials (backend will use saved ones)
      const importData: any = {
        pageId,
        spaceId,
        includeChildren: values.includeChildren,
      };

      if (!hasConfig) {
        importData.confluenceUrl = values.confluenceUrl;
        importData.accessToken = values.accessToken;
      }

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
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {hasConfig ? (
            <Alert color="green" icon={<IconCheck size={16} />}>
              <Text size="sm">
                {t('Using saved Confluence configuration.')}{' '}
                <Anchor href="/settings/account/profile" size="sm">
                  {t('Change settings')}
                </Anchor>
              </Text>
            </Alert>
          ) : (
            <Alert color="blue" icon={<IconAlertCircle size={16} />}>
              <Text size="sm">
                {t('Enter your Confluence URL and Personal Access Token to import pages directly.')}{' '}
                <Anchor href="/settings/account/profile" size="sm">
                  {t('Save for future use')}
                </Anchor>
              </Text>
            </Alert>
          )}

          {!hasConfig && (
            <>
              <TextInput
                label={t('Confluence URL')}
                placeholder="https://your-domain.atlassian.net/wiki"
                description={t('Your Confluence base URL (e.g., https://example.com/confluence)')}
                {...form.getInputProps('confluenceUrl')}
                required
              />

              <PasswordInput
                label={t('Personal Access Token')}
                placeholder={t('Enter your access token')}
                description={t('Your Confluence Personal Access Token')}
                {...form.getInputProps('accessToken')}
                required
              />
            </>
          )}

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

          <Button type="submit" loading={loading || configLoading} fullWidth>
            {t('Import from Confluence')}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
