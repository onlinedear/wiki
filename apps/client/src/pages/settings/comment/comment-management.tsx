import { useState } from "react";
import {
  Stack,
  Table,
  Checkbox,
  Group,
  Button,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Modal,
  TextInput,
  Select,
  Pagination,
  Box,
  Avatar,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconTrash,
  IconSearch,
  IconFilter,
  IconMessageCircle,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { getAppName } from "@/lib/config";
import SettingsTitle from "@/components/settings/settings-title";
import {
  useWorkspaceCommentsQuery,
  useDeleteCommentsMutation,
} from "@/features/comment/queries/comment-management-query";
import { notifications } from "@mantine/notifications";
import { formatDistanceToNow } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";

export default function CommentManagement() {
  const { t, i18n } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, refetch } = useWorkspaceCommentsQuery({
    page,
    limit: pageSize,
    searchText: searchText || undefined,
    type: filterType || undefined,
  });

  const deleteCommentsMutation = useDeleteCommentsMutation();

  const comments = data?.items || [];
  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  const allSelected = comments.length > 0 && selectedIds.length === comments.length;
  const indeterminate = selectedIds.length > 0 && selectedIds.length < comments.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(comments.map((c) => c.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      await deleteCommentsMutation.mutateAsync({ commentIds: selectedIds });
      notifications.show({
        message: t("Comments deleted successfully"),
        color: "green",
      });
      setSelectedIds([]);
      setDeleteModalOpened(false);
      refetch();
    } catch (error) {
      notifications.show({
        message: t("Failed to delete comments"),
        color: "red",
      });
    }
  };

  const getLocale = () => {
    return i18n.language === "zh-CN" ? zhCN : enUS;
  };

  const formatDate = (date: string | Date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: getLocale(),
      });
    } catch {
      return "";
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("Comment Management")} - {getAppName()}</title>
      </Helmet>

      <SettingsTitle title={t("Comment Management")} />

      <Stack gap="md">
        {/* Filters and Actions */}
        <Group justify="space-between">
          <Group>
            <TextInput
              placeholder={t("Search comments...")}
              leftSection={<IconSearch size={16} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              placeholder={t("Filter by type")}
              leftSection={<IconFilter size={16} />}
              data={[
                { value: "inline", label: t("Inline") },
                { value: "page", label: t("Page") },
              ]}
              value={filterType}
              onChange={setFilterType}
              clearable
              style={{ width: 200 }}
            />
          </Group>

          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            disabled={selectedIds.length === 0}
            onClick={() => setDeleteModalOpened(true)}
          >
            {t("Delete")} ({selectedIds.length})
          </Button>
        </Group>

        {/* Stats */}
        <Group>
          <Badge size="lg" variant="light">
            <Group gap={4}>
              <IconMessageCircle size={14} />
              <Text size="sm">{t("Total")}: {data?.total || 0}</Text>
            </Group>
          </Badge>
          {selectedIds.length > 0 && (
            <Badge size="lg" color="blue" variant="light">
              <Text size="sm">{t("Selected")}: {selectedIds.length}</Text>
            </Badge>
          )}
        </Group>

        {/* Table */}
        {isLoading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : comments.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed">{t("No comments found")}</Text>
          </Center>
        ) : (
          <Box style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 40 }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={indeterminate}
                      onChange={handleSelectAll}
                    />
                  </Table.Th>
                  <Table.Th>{t("Author")}</Table.Th>
                  <Table.Th>{t("Content")}</Table.Th>
                  <Table.Th>{t("Page")}</Table.Th>
                  <Table.Th>{t("Space")}</Table.Th>
                  <Table.Th>{t("Created")}</Table.Th>
                  <Table.Th style={{ width: 80 }}>{t("Actions")}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {comments.map((comment) => (
                  <Table.Tr key={comment.id}>
                    <Table.Td>
                      <Checkbox
                        checked={selectedIds.includes(comment.id)}
                        onChange={() => handleSelectOne(comment.id)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Avatar
                          src={comment.creator?.avatarUrl}
                          size="sm"
                          radius="xl"
                        >
                          {comment.creator?.name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Text size="sm">{comment.creator?.name || t("Unknown")}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={2} style={{ maxWidth: 300 }}>
                        {comment.content?.content?.[0]?.content?.[0]?.text || t("No content")}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={1} style={{ maxWidth: 200 }}>
                        {comment.page?.title || t("Untitled")}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{comment.space?.name || "-"}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {formatDate(comment.createdAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label={t("Delete")}>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => {
                            setSelectedIds([comment.id]);
                            setDeleteModalOpened(true);
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Group justify="center">
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
            />
          </Group>
        )}
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title={t("Delete Comments")}
      >
        <Stack>
          <Text>
            {t("Are you sure you want to delete")} {selectedIds.length}{" "}
            {selectedIds.length === 1 ? t("comment") : t("comments")}?
          </Text>
          <Text size="sm" c="dimmed">
            {t("This action cannot be undone.")}
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setDeleteModalOpened(false)}
            >
              {t("Cancel")}
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={deleteCommentsMutation.isPending}
            >
              {t("Delete")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
