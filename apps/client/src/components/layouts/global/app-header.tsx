import { ActionIcon, Badge, Divider, Group, Menu, Text, Tooltip } from "@mantine/core";
import classes from "./app-header.module.css";
import TopMenu from "@/components/layouts/global/top-menu.tsx";
import { Link, useLocation, useParams } from "react-router-dom";
import APP_ROUTE from "@/lib/app-route.ts";
import { useAtom } from "jotai";
import {
  desktopSidebarAtom,
  mobileSidebarAtom,
} from "@/components/layouts/global/hooks/atoms/sidebar-atom.ts";
import { useToggleSidebar } from "@/components/layouts/global/hooks/hooks/use-toggle-sidebar.ts";
import SidebarToggle from "@/components/ui/sidebar-toggle-button.tsx";
import { Trans, useTranslation } from "react-i18next";
import useTrial from "@/ee/hooks/use-trial.tsx";
import { isCloud } from "@/lib/config.ts";
import { searchSpotlight } from "@/features/search/constants.ts";
import { currentUserAtom } from "@/features/user/atoms/current-user-atom.ts";
import {
  IconArrowRight,
  IconArrowsHorizontal,
  IconDots,
  IconFileExport,
  IconHistory,
  IconLink,
  IconList,
  IconMessage,
  IconPlus,
  IconPrinter,
  IconSearch,
  IconTrash,
  IconWifiOff,
} from "@tabler/icons-react";
import ShareModal from "@/features/share/components/share-modal.tsx";
import useToggleAside from "@/hooks/use-toggle-aside.tsx";
import { extractPageSlugId } from "@/lib";
import { usePageQuery } from "@/features/page/queries/page-query.ts";
import { useSpaceAbility } from "@/features/space/permissions/use-space-ability.ts";
import { useGetSpaceBySlugQuery } from "@/features/space/queries/space-query.ts";
import { SpaceCaslAction, SpaceCaslSubject } from "@/features/space/permissions/permissions.type.ts";
import { treeApiAtom } from "@/features/page/tree/atoms/tree-api-atom.ts";
import { historyAtoms } from "@/features/page-history/atoms/history-atoms.ts";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { buildPageUrl } from "@/features/page/page.utils.ts";
import { notifications } from "@mantine/notifications";
import { getAppUrl } from "@/lib/config.ts";
import { useDeletePageModal } from "@/features/page/hooks/use-delete-page-modal.tsx";
import { PageWidthToggle } from "@/features/user/components/page-width-pref.tsx";
import ExportModal from "@/components/common/export-modal";
import { pageEditorAtom, yjsConnectionStatusAtom } from "@/features/editor/atoms/editor-atoms.ts";
import { formattedDate } from "@/lib/time.ts";
import MovePageModal from "@/features/page/components/move-page-modal.tsx";
import { useTimeAgo } from "@/hooks/use-time-ago.tsx";
import { PageStateSegmentedControl } from "@/features/user/components/page-state-pref.tsx";

// 页面操作菜单组件（导入自 page-header-menu.tsx）
function PageActionMenu({ readOnly }: { readOnly?: boolean }) {
  const { t } = useTranslation();
  const [, setHistoryModalOpen] = useAtom(historyAtoms);
  const clipboard = useClipboard({ timeout: 500 });
  const { pageSlug, spaceSlug } = useParams();
  const { data: page } = usePageQuery({
    pageId: extractPageSlugId(pageSlug),
  });
  const { openDeleteModal } = useDeletePageModal();
  const [tree] = useAtom(treeApiAtom);
  const [exportOpened, { open: openExportModal, close: closeExportModal }] =
    useDisclosure(false);
  const [
    movePageModalOpened,
    { open: openMovePageModal, close: closeMoveSpaceModal },
  ] = useDisclosure(false);
  const [pageEditor] = useAtom(pageEditorAtom);
  const pageUpdatedAt = useTimeAgo(page?.updatedAt);

  if (!page) return null;

  const handleCopyLink = () => {
    const pageUrl =
      getAppUrl() + buildPageUrl(spaceSlug, page.slugId, page.title);

    clipboard.copy(pageUrl);
    notifications.show({ message: t("Link copied") });
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const openHistoryModal = () => {
    setHistoryModalOpen(true);
  };

  const handleDeletePage = () => {
    openDeleteModal({ onConfirm: () => tree?.delete(page.id) });
  };

  return (
    <>
      <Menu
        shadow="xl"
        position="bottom-end"
        offset={20}
        width={230}
        withArrow
        arrowPosition="center"
      >
        <Menu.Target>
          <Tooltip label={t("More")} openDelay={250} withArrow>
            <ActionIcon variant="subtle" color="gray">
              <IconDots size={20} />
            </ActionIcon>
          </Tooltip>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconLink size={16} />}
            onClick={handleCopyLink}
          >
            {t("Copy link")}
          </Menu.Item>
          <Menu.Divider />

          <Menu.Item leftSection={<IconArrowsHorizontal size={16} />}>
            <Group wrap="nowrap">
              <PageWidthToggle label={t("Full width")} />
            </Group>
          </Menu.Item>

          <Menu.Item
            leftSection={<IconHistory size={16} />}
            onClick={openHistoryModal}
          >
            {t("Page history")}
          </Menu.Item>

          <Menu.Divider />

          {!readOnly && (
            <Menu.Item
              leftSection={<IconArrowRight size={16} />}
              onClick={openMovePageModal}
            >
              {t("Move")}
            </Menu.Item>
          )}

          <Menu.Item
            leftSection={<IconFileExport size={16} />}
            onClick={openExportModal}
          >
            {t("Export")}
          </Menu.Item>

          <Menu.Item
            leftSection={<IconPrinter size={16} />}
            onClick={handlePrint}
          >
            {t("Print PDF")}
          </Menu.Item>

          {!readOnly && (
            <>
              <Menu.Divider />
              <Menu.Item
                color={"red"}
                leftSection={<IconTrash size={16} />}
                onClick={handleDeletePage}
              >
                {t("Move to trash")}
              </Menu.Item>
            </>
          )}

          <Menu.Divider />

          <Group px="sm" wrap="nowrap" style={{ cursor: "pointer" }}>
            <Tooltip
              label={t("Edited by {{name}} {{time}}", {
                name: page.lastUpdatedBy?.name || "",
                time: pageUpdatedAt,
              })}
              position="left-start"
            >
              <div style={{ width: 210 }}>
                <Text size="xs" c="dimmed" truncate="end">
                  {t("Word count: {{wordCount}}", {
                    wordCount: pageEditor?.storage?.characterCount?.words() || 0,
                  })}
                </Text>

                <Text size="xs" c="dimmed" lineClamp={1}>
                  <Trans
                    defaults="Created by: <b>{{creatorName}}</b>"
                    values={{ creatorName: page.creator?.name || "" }}
                    components={{ b: <Text span fw={500} /> }}
                  />
                </Text>
                <Text size="xs" c="dimmed" truncate="end">
                  {t("Created at: {{time}}", {
                    time: formattedDate(page.createdAt),
                  })}
                </Text>
              </div>
            </Tooltip>
          </Group>
        </Menu.Dropdown>
      </Menu>

      {page && (
        <>
          <ExportModal
            type="page"
            id={page.id}
            open={exportOpened}
            onClose={closeExportModal}
          />

          <MovePageModal
            pageId={page.id}
            slugId={page.slugId}
            currentSpaceSlug={spaceSlug}
            onClose={closeMoveSpaceModal}
            open={movePageModalOpened}
          />
        </>
      )}
    </>
  );
}

export function AppHeader() {
  const { t } = useTranslation();
  const location = useLocation();
  const { pageSlug, spaceSlug } = useParams();
  const [mobileOpened] = useAtom(mobileSidebarAtom);
  const toggleMobile = useToggleSidebar(mobileSidebarAtom);
  const toggleAside = useToggleAside();

  const [desktopOpened] = useAtom(desktopSidebarAtom);
  const toggleDesktop = useToggleSidebar(desktopSidebarAtom);
  const { isTrial, trialDaysLeft } = useTrial();
  const [currentUser] = useAtom(currentUserAtom);
  const [tree] = useAtom(treeApiAtom);
  const [yjsConnectionStatus] = useAtom(yjsConnectionStatusAtom);

  const workspace = currentUser?.workspace;

  const isHomeRoute = location.pathname.startsWith("/home");
  const isSpacesRoute = location.pathname === "/spaces";
  const isPageRoute = location.pathname.includes("/p/");
  const hideSidebar = isHomeRoute || isSpacesRoute;

  // 获取页面数据和权限
  const pageId = isPageRoute && pageSlug ? extractPageSlugId(pageSlug) : null;
  const { data: page } = usePageQuery({
    pageId,
  });
  const { data: space } = useGetSpaceBySlugQuery(page?.space?.slug);
  const spaceRules = space?.membership?.permissions;
  const spaceAbility = useSpaceAbility(spaceRules);
  const readOnly = isPageRoute && page && spaceAbility.cannot(
    SpaceCaslAction.Manage,
    SpaceCaslSubject.Page,
  );

  // 创建新文档
  const handleCreatePage = () => {
    if (tree) {
      tree.create({ parentId: null, type: "internal", index: 0 });
    }
  };

  return (
    <>
      <Group h="100%" px="md" justify="space-between" wrap={"nowrap"}>
        <Group wrap="nowrap">
          {!hideSidebar && (
            <>
              <Tooltip label={t("Sidebar toggle")}>
                <SidebarToggle
                  aria-label={t("Sidebar toggle")}
                  opened={mobileOpened}
                  onClick={toggleMobile}
                  hiddenFrom="sm"
                  size="sm"
                />
              </Tooltip>

              <Tooltip label={t("Sidebar toggle")}>
                <SidebarToggle
                  aria-label={t("Sidebar toggle")}
                  opened={desktopOpened}
                  onClick={toggleDesktop}
                  visibleFrom="sm"
                  size="sm"
                />
              </Tooltip>
            </>
          )}

          <Text
            size="lg"
            fw={600}
            style={{ cursor: "pointer", userSelect: "none" }}
            component={Link}
            to="/home"
          >
            {workspace?.name || "NoteDoc"}
          </Text>
        </Group>

        <Group gap="xs" wrap="nowrap">
          {/* 文档编辑页面专属按钮 */}
          {isPageRoute && page && (
            <>
              {yjsConnectionStatus === "disconnected" && (
                <Tooltip
                  label={t("Real-time editor connection lost. Retrying...")}
                  openDelay={250}
                  withArrow
                >
                  <ActionIcon variant="subtle" c="red">
                    <IconWifiOff size={20} stroke={2} />
                  </ActionIcon>
                </Tooltip>
              )}

              {!readOnly && <PageStateSegmentedControl size="xs" />}

              <ShareModal readOnly={readOnly} />

              <Tooltip label={t("Comments")} openDelay={250} withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => toggleAside("comments")}
                >
                  <IconMessage size={20} stroke={2} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={t("Table of contents")} openDelay={250} withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => toggleAside("toc")}
                >
                  <IconList size={20} stroke={2} />
                </ActionIcon>
              </Tooltip>

              <PageActionMenu readOnly={readOnly} />

              <Divider orientation="vertical" />
            </>
          )}

          {/* 全局按钮 */}
          <Tooltip label={t("Search")} openDelay={250} withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={searchSpotlight.open}
            >
              <IconSearch size={20} stroke={2} />
            </ActionIcon>
          </Tooltip>

          {isPageRoute && spaceSlug && (
            <Tooltip label={t("Create page")} openDelay={250} withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={handleCreatePage}
              >
                <IconPlus size={20} stroke={2} />
              </ActionIcon>
            </Tooltip>
          )}

          <Divider orientation="vertical" />

          {isCloud() && isTrial && trialDaysLeft !== 0 && (
            <Badge
              variant="light"
              style={{ cursor: "pointer" }}
              component={Link}
              to={APP_ROUTE.SETTINGS.WORKSPACE.BILLING}
              visibleFrom="xs"
            >
              {trialDaysLeft === 1
                ? "1 day left"
                : `${trialDaysLeft} days left`}
            </Badge>
          )}
          
          <TopMenu />
        </Group>
      </Group>
    </>
  );
}
