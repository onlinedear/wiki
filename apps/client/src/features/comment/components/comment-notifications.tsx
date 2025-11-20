import { useState } from "react";
import {
  Popover,
  ActionIcon,
  Badge,
  Stack,
  Text,
  Group,
  Avatar,
  Button,
  ScrollArea,
  Box,
  Divider,
} from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import {
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "../queries/comment-query";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export function CommentNotifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);

  const { data: unreadCount = 0 } = useUnreadNotificationCountQuery();
  const { data: notifications = [] } = useNotificationsQuery(showUnreadOnly);
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    // Navigate to the page with the comment
    if (notification.pageSlugId) {
      navigate(`/p/${notification.pageSlugId}#comment-${notification.commentId}`);
      setOpened(false);
    }
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case "reply":
        return t("{{name}} replied to your comment", {
          name: notification.creatorName,
        });
      case "mention":
        return t("{{name}} mentioned you in a comment", {
          name: notification.creatorName,
        });
      case "reaction":
        return t("{{name}} reacted to your comment", {
          name: notification.creatorName,
        });
      default:
        return t("New comment notification");
    }
  };

  return (
    <Popover
      width={400}
      position="bottom-end"
      opened={opened}
      onChange={setOpened}
    >
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => setOpened((o) => !o)}
        >
          <IconBell size={20} />
          {unreadCount > 0 && (
            <Badge
              size="xs"
              variant="filled"
              color="red"
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                padding: "0 4px",
                minWidth: 16,
                height: 16,
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Stack gap={0}>
          <Group justify="space-between" p="md" pb="sm">
            <Text fw={600}>{t("Notifications")}</Text>
            {unreadCount > 0 && (
              <Button
                size="xs"
                variant="subtle"
                onClick={handleMarkAllRead}
              >
                {t("Mark all as read")}
              </Button>
            )}
          </Group>

          <Group px="md" pb="sm">
            <Button
              size="xs"
              variant={showUnreadOnly ? "filled" : "subtle"}
              onClick={() => setShowUnreadOnly(true)}
            >
              {t("Unread")}
            </Button>
            <Button
              size="xs"
              variant={!showUnreadOnly ? "filled" : "subtle"}
              onClick={() => setShowUnreadOnly(false)}
            >
              {t("All")}
            </Button>
          </Group>

          <Divider />

          <ScrollArea h={400}>
            {notifications.length === 0 ? (
              <Box p="md">
                <Text c="dimmed" size="sm" ta="center">
                  {showUnreadOnly
                    ? t("No unread notifications")
                    : t("No notifications")}
                </Text>
              </Box>
            ) : (
              <Stack gap={0}>
                {notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    p="md"
                    style={{
                      cursor: "pointer",
                      backgroundColor: notification.isRead
                        ? "transparent"
                        : "var(--mantine-color-blue-0)",
                      borderBottom: "1px solid var(--mantine-color-gray-2)",
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Group wrap="nowrap" align="flex-start">
                      <Avatar
                        src={notification.creatorAvatar}
                        size="sm"
                        radius="xl"
                      >
                        {notification.creatorName?.[0]}
                      </Avatar>
                      <Stack gap={4} style={{ flex: 1 }}>
                        <Text size="sm">
                          {getNotificationText(notification)}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {notification.pageTitle}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </Text>
                      </Stack>
                    </Group>
                  </Box>
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
