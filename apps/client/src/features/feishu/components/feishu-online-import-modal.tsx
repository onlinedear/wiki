import {
  Modal,
  Button,
  TextInput,
  Stack,
  Alert,
  Text,
  Anchor,
  Tabs,
  Loader,
  Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconAlertCircle, IconSettings, IconLink, IconFolderOpen } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  importFeishuOnline, 
  getFeishuConfig, 
  listFeishuDocuments,
  importFeishuBatch 
} from '../services/feishu-service';
import { queryClient } from '@/main';
import { FeishuDocumentTree } from './feishu-document-tree';
import { DocumentTreeNode, buildDocumentTree, getSelectedDocuments } from '../types/document-tree';

interface FeishuOnlineImportModalProps {
  spaceId: string;
  opened: boolean;
  onClose: () => void;
}

export function FeishuOnlineImportModal({
  spaceId,
  opened,
  onClose,
}: FeishuOnlineImportModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('url');
  
  // Document tree state
  const [treeNodes, setTreeNodes] = useState<DocumentTreeNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [folderToken, setFolderToken] = useState('');

  const form = useForm({
    initialValues: {
      documentUrl: '',
    },
    validate: {
      documentUrl: (value) => {
        if (!value) return t('Document URL is required');
        if (!value.includes('feishu.cn') && !value.includes('larksuite.com')) {
          return t('Please enter a valid Feishu document URL');
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (opened) {
      checkConfig();
    }
  }, [opened]);

  const checkConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await getFeishuConfig();
      const config = response?.data || response;
      
      if (config && config.appId && config.hasAppSecret) {
        setHasConfig(true);
      } else {
        setHasConfig(false);
      }
    } catch (error) {
      console.error('Failed to load Feishu config:', error);
      setHasConfig(false);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      const importData = {
        documentUrl: values.documentUrl,
        spaceId,
        includeChildren: false, // 单文档导入不包含子文档，如需批量导入请使用批量导入功能
      };

      const result = await importFeishuOnline(importData);

      notifications.show({
        title: t('Import started'),
        message: result.message || t('Your Feishu documents are being imported'),
        color: 'teal',
        icon: <IconCheck size={18} />,
        autoClose: 5000,
      });

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
          t('Failed to import from Feishu'),
        color: 'red',
        icon: <IconX size={18} />,
        autoClose: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDocuments = async () => {
    if (!folderToken.trim()) {
      notifications.show({
        title: t('Error'),
        message: t('Please enter a folder token'),
        color: 'red',
        icon: <IconX size={18} />,
      });
      return;
    }

    setTreeLoading(true);
    try {
      const result = await listFeishuDocuments(folderToken.trim());
      const tree = buildDocumentTree(result.documents || []);
      setTreeNodes(tree);
      
      if (tree.length === 0) {
        notifications.show({
          title: t('No documents found'),
          message: t('The folder is empty or you do not have access'),
          color: 'yellow',
          icon: <IconAlertCircle size={18} />,
        });
      }
    } catch (error) {
      notifications.show({
        title: t('Failed to load documents'),
        message: error?.response?.data?.message || t('Could not load folder contents'),
        color: 'red',
        icon: <IconX size={18} />,
      });
      setTreeNodes([]);
    } finally {
      setTreeLoading(false);
    }
  };

  const handleNodeToggle = (token: string) => {
    const toggleNode = (nodes: DocumentTreeNode[]): DocumentTreeNode[] => {
      return nodes.map((node) => {
        if (node.token === token) {
          const newChecked = !node.checked;
          return {
            ...node,
            checked: newChecked,
            indeterminate: false,
            children: toggleChildren(node.children, newChecked),
          };
        }
        return {
          ...node,
          children: toggleNode(node.children),
        };
      });
    };

    const toggleChildren = (nodes: DocumentTreeNode[], checked: boolean): DocumentTreeNode[] => {
      return nodes.map((node) => ({
        ...node,
        checked,
        indeterminate: false,
        children: toggleChildren(node.children, checked),
      }));
    };

    setTreeNodes(toggleNode(treeNodes));
  };

  const handleNodeExpand = (token: string) => {
    const expandNode = (nodes: DocumentTreeNode[]): DocumentTreeNode[] => {
      return nodes.map((node) => {
        if (node.token === token) {
          return { ...node, expanded: !node.expanded };
        }
        return {
          ...node,
          children: expandNode(node.children),
        };
      });
    };

    setTreeNodes(expandNode(treeNodes));
  };

  const handleBatchImport = async () => {
    const selected = getSelectedDocuments(treeNodes);
    
    if (selected.length === 0) {
      notifications.show({
        title: t('No documents selected'),
        message: t('Please select at least one document to import'),
        color: 'yellow',
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    setLoading(true);
    try {
      const result = await importFeishuBatch({
        spaceId,
        documents: selected,
      });

      notifications.show({
        title: t('Import completed'),
        message: result.message || t('Documents imported successfully'),
        color: 'teal',
        icon: <IconCheck size={18} />,
        autoClose: 5000,
      });

      await queryClient.refetchQueries({
        queryKey: ['root-sidebar-pages', spaceId],
      });

      onClose();
      setTreeNodes([]);
      setFolderToken('');
    } catch (error) {
      notifications.show({
        title: t('Import failed'),
        message: error?.response?.data?.message || t('Failed to import documents'),
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
      title={t('Import from Feishu')}
      size="lg"
    >
      {configLoading ? (
        <Center p="xl">
          <Loader size="sm" />
        </Center>
      ) : !hasConfig ? (
        <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
          <Stack gap="sm">
            <Text size="sm">
              {t('Please configure your Feishu connection in system settings first.')}
            </Text>
            <Button
              component="a"
              href="/settings/integrations"
              variant="light"
              leftSection={<IconSettings size={16} />}
            >
              {t('Go to Settings')}
            </Button>
          </Stack>
        </Alert>
      ) : (
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="url" leftSection={<IconLink size={16} />}>
              {t('Single Document')}
            </Tabs.Tab>
            <Tabs.Tab value="folder" leftSection={<IconFolderOpen size={16} />}>
              {t('Batch Import')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="url" pt="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <Alert color="blue" icon={<IconCheck size={16} />}>
                  <Text size="sm">
                    {t('Using saved Feishu configuration.')}{' '}
                    <Anchor href="/settings/integrations" size="sm">
                      {t('Change settings')}
                    </Anchor>
                  </Text>
                </Alert>

                <TextInput
                  label={t('Feishu Document URL')}
                  placeholder="https://xxx.feishu.cn/docx/xxxxx"
                  description={t('The full URL of the document you want to import')}
                  {...form.getInputProps('documentUrl')}
                  required
                />

                <Button type="submit" loading={loading} fullWidth>
                  {t('Import Document')}
                </Button>
              </Stack>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="folder" pt="md">
            <Stack gap="md">
              <Alert color="blue" icon={<IconAlertCircle size={16} />}>
                <Text size="sm">
                  {t('Enter a Feishu folder token to browse and select multiple documents for import.')}
                </Text>
              </Alert>

              <TextInput
                label={t('Folder Token')}
                placeholder="fldcnxxxxxx"
                description={t('The folder token from Feishu (found in the folder URL)')}
                value={folderToken}
                onChange={(e) => setFolderToken(e.currentTarget.value)}
              />

              <Button 
                onClick={handleLoadDocuments} 
                loading={treeLoading}
                variant="light"
              >
                {t('Load Documents')}
              </Button>

              {treeLoading ? (
                <Center p="xl">
                  <Loader size="sm" />
                </Center>
              ) : treeNodes.length > 0 ? (
                <>
                  <FeishuDocumentTree
                    nodes={treeNodes}
                    onNodeToggle={handleNodeToggle}
                    onNodeExpand={handleNodeExpand}
                  />
                  
                  <Button 
                    onClick={handleBatchImport} 
                    loading={loading}
                    fullWidth
                  >
                    {t('Import Selected Documents')} ({getSelectedDocuments(treeNodes).length})
                  </Button>
                </>
              ) : null}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      )}
    </Modal>
  );
}
