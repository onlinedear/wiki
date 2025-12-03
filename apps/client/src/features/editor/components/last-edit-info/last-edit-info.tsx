import { Group, Text, Tooltip } from '@mantine/core';
import { usePageHistoryListQuery } from '@/features/page-history/queries/page-history-query';
import { useAtom } from 'jotai';
import { historyAtoms } from '@/features/page-history/atoms/history-atoms';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS, ja, ko, fr, de, es, ru, pt, it } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { CustomAvatar } from '@/components/ui/custom-avatar';
import classes from './last-edit-info.module.css';

const localeMap = {
  'zh-CN': zhCN,
  'en': enUS,
  'ja': ja,
  'ko': ko,
  'fr': fr,
  'de': de,
  'es': es,
  'ru': ru,
  'pt': pt,
  'it': it,
};

interface LastEditInfoProps {
  pageId: string;
}

export function LastEditInfo({ pageId }: LastEditInfoProps) {
  const { t, i18n } = useTranslation();
  const { data: historyData } = usePageHistoryListQuery(pageId);
  const [, setHistoryModalOpen] = useAtom(historyAtoms);

  if (!historyData || !historyData.items || historyData.items.length === 0) {
    return null;
  }

  const lastEdit = historyData.items[0];
  const locale = localeMap[i18n.language] || enUS;
  
  const timeAgo = formatDistanceToNow(new Date(lastEdit.updatedAt), {
    addSuffix: true,
    locale,
  });

  const handleClick = () => {
    setHistoryModalOpen(true);
  };

  return (
    <Tooltip label={t('Page history')} position="bottom">
      <Group
        gap="xs"
        className={classes.container}
        onClick={handleClick}
        align="center"
      >
        <CustomAvatar
          avatarUrl={lastEdit.lastUpdatedBy?.avatarUrl}
          name={lastEdit.lastUpdatedBy?.name}
          size={24}
          radius="xl"
        />
        <Text size="sm" c="dimmed">
          {lastEdit.lastUpdatedBy?.name}
        </Text>
        <Text size="sm" c="dimmed">
          |
        </Text>
        <Text size="sm" c="dimmed">
          {timeAgo}
        </Text>
      </Group>
    </Tooltip>
  );
}
