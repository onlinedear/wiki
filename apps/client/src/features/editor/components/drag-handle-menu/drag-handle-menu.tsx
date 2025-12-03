import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Divider,
  Group,
  Paper,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconIndentDecrease,
  IconIndentIncrease,
  IconTypography,
  IconH1,
  IconH2,
  IconH3,
  IconListNumbers,
  IconList,
  IconBlockquote,
  IconCheckbox,
  IconCode,
  IconPalette,
  IconTrash,
  IconCopy,
  IconScissors,
  IconShare,
  IconLink,
  IconTable,
  IconColumnInsertLeft,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import classes from "./drag-handle-menu.module.css";
import clsx from "clsx";
import { v7 as uuid7 } from "uuid";
import { useAtom } from "jotai";
import {
  draftCommentIdAtom,
  showCommentPopupAtom,
} from "@/features/comment/atoms/comment-atom";

interface DragHandleMenuProps {
  editor: any;
  node: any;
  opened: boolean;
  onClose: () => void;
  position: { x: number; y: number; position?: 'left' | 'bottom' | 'top' | 'right' };
}

// 判断是否为文本类块
const isTextBlock = (nodeType: string) => {
  return [
    "paragraph",
    "heading",
    "orderedList",
    "bulletList",
    "taskList",
    "blockquote",
    "codeBlock",
  ].includes(nodeType);
};

// 判断是否为表格块
const isTableBlock = (nodeType: string) => {
  return nodeType === "table";
};

export const DragHandleMenu = ({
  editor,
  node,
  opened,
  onClose,
  position,
}: DragHandleMenuProps) => {
  const { t } = useTranslation();
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [editorUpdateKey, setEditorUpdateKey] = useState(0);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const [showCommentPopup, setShowCommentPopup] = useAtom(showCommentPopupAtom);
  const [, setDraftCommentId] = useAtom(draftCommentIdAtom);

  // 监听编辑器更新事件，实时刷新状态
  useEffect(() => {
    if (!editor || !opened) return;

    const handleUpdate = () => {
      setEditorUpdateKey(prev => prev + 1);
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor, opened]);

  const nodeType = node?.type?.name || "paragraph";
  const isText = isTextBlock(nodeType);
  const isTable = isTableBlock(nodeType);

  // 获取当前块的状态 - 使用 useMemo 确保实时更新
  const blockState = useMemo(() => {
    if (!editor || !opened) return null;

    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;

    // 获取当前节点的缩进级别
    let currentIndent = 0;
    const isListItem = editor.isActive('listItem');
    const isTaskItem = editor.isActive('taskItem');
    
    // 对于列表项，检查嵌套深度
    if (isListItem || isTaskItem) {
      // 计算列表项的嵌套层级
      let listDepth = 0;
      for (let depth = $from.depth; depth > 0; depth--) {
        const currentNode = $from.node(depth);
        if (currentNode.type.name === 'listItem' || currentNode.type.name === 'taskItem') {
          // 检查父节点是否也是列表
          if (depth > 1) {
            const parentNode = $from.node(depth - 1);
            if (parentNode.type.name === 'orderedList' || 
                parentNode.type.name === 'bulletList' || 
                parentNode.type.name === 'taskList') {
              // 检查祖父节点是否是列表项（表示嵌套）
              if (depth > 2) {
                const grandParentNode = $from.node(depth - 2);
                if (grandParentNode.type.name === 'listItem' || grandParentNode.type.name === 'taskItem') {
                  listDepth = 1; // 已经是嵌套的列表项
                }
              }
            }
          }
          break;
        }
      }
      currentIndent = listDepth;
    } else {
      // 对于非列表项，从节点属性获取缩进
      for (let depth = $from.depth; depth > 0; depth--) {
        const currentNode = $from.node(depth);
        if (currentNode && currentNode.attrs && typeof currentNode.attrs.indent === 'number') {
          currentIndent = currentNode.attrs.indent;
          break;
        }
      }
      
      // 如果上面没找到，尝试从传入的 node 获取
      if (currentIndent === 0 && node && node.attrs && typeof node.attrs.indent === 'number') {
        currentIndent = node.attrs.indent;
      }
    }

    return {
      isHeading1: editor.isActive("heading", { level: 1 }),
      isHeading2: editor.isActive("heading", { level: 2 }),
      isHeading3: editor.isActive("heading", { level: 3 }),
      isOrderedList: editor.isActive("orderedList"),
      isBulletList: editor.isActive("bulletList"),
      isTaskList: editor.isActive("taskList"),
      isBlockquote: editor.isActive("blockquote"),
      isCodeBlock: editor.isActive("codeBlock"),
      isParagraph: editor.isActive("paragraph"),
      textAlign: editor.getAttributes("paragraph").textAlign || "left",
      indent: currentIndent,
      isListItem,
      isTaskItem,
    };
  }, [editor, opened, node, editorUpdateKey]);

  // 文本类型转换选项
  const textTypeOptions = [
    {
      icon: IconTypography,
      label: "Text",
      active: blockState?.isParagraph,
      command: () => editor.chain().focus().setParagraph().run(),
    },
    {
      icon: IconH1,
      label: "Heading 1",
      active: blockState?.isHeading1,
      command: () => editor.chain().focus().setHeading({ level: 1 }).run(),
    },
    {
      icon: IconH2,
      label: "Heading 2",
      active: blockState?.isHeading2,
      command: () => editor.chain().focus().setHeading({ level: 2 }).run(),
    },
    {
      icon: IconH3,
      label: "Heading 3",
      active: blockState?.isHeading3,
      command: () => editor.chain().focus().setHeading({ level: 3 }).run(),
    },
    {
      icon: IconListNumbers,
      label: "Numbered list",
      active: blockState?.isOrderedList,
      command: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: IconList,
      label: "Bullet list",
      active: blockState?.isBulletList,
      command: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: IconCheckbox,
      label: "To-do list",
      active: blockState?.isTaskList,
      command: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      icon: IconBlockquote,
      label: "Quote",
      active: blockState?.isBlockquote,
      command: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: IconCode,
      label: "Code",
      active: blockState?.isCodeBlock,
      command: () => editor.chain().focus().toggleCodeBlock().run(),
    },
  ];

  // 对齐选项（移除两端对齐）
  const alignmentOptions = [
    {
      icon: IconAlignLeft,
      label: "Align left",
      value: "left",
      active: blockState?.textAlign === "left",
    },
    {
      icon: IconAlignCenter,
      label: "Align center",
      value: "center",
      active: blockState?.textAlign === "center",
    },
    {
      icon: IconAlignRight,
      label: "Align right",
      value: "right",
      active: blockState?.textAlign === "right",
    },
  ];

  // 字体颜色选项（与横向工具条保持一致）
  const textColors = [
    { label: "Default", value: "", display: "#000000" },
    { label: "Blue", value: "#2563EB", display: "#2563EB" },
    { label: "Green", value: "#008A00", display: "#008A00" },
    { label: "Purple", value: "#9333EA", display: "#9333EA" },
    { label: "Red", value: "#E00000", display: "#E00000" },
    { label: "Yellow", value: "#EAB308", display: "#EAB308" },
    { label: "Orange", value: "#FFA500", display: "#FFA500" },
    { label: "Pink", value: "#BA4081", display: "#BA4081" },
    { label: "Gray", value: "#A8A29E", display: "#A8A29E" },
  ];

  // 背景颜色选项（与横向工具条保持一致）
  const backgroundColors = [
    { label: "Default", value: "", display: "#FFFFFF", border: true },
    { label: "Blue", value: "#c1ecf9", display: "#c1ecf9" },
    { label: "Green", value: "#acf79f", display: "#acf79f" },
    { label: "Purple", value: "#f6f3f8", display: "#f6f3f8" },
    { label: "Red", value: "#fdebeb", display: "#fdebeb" },
    { label: "Yellow", value: "#fbf4a2", display: "#fbf4a2" },
    { label: "Orange", value: "#faebdd", display: "#faebdd" },
    { label: "Pink", value: "#faf1f5", display: "#faf1f5" },
    { label: "Gray", value: "#f1f1ef", display: "#f1f1ef" },
  ];



  // 鼠标移出菜单区域时关闭
  useEffect(() => {
    if (!opened) return;

    let closeTimeout: number | null = null;

    const handleMouseLeave = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      
      // 如果鼠标移动到拖拽手柄，不关闭
      if (
        relatedTarget?.closest('.drag-handle') ||
        relatedTarget?.closest('.drag-handle-container')
      ) {
        return;
      }
      
      // 延迟关闭，给用户时间移动鼠标
      closeTimeout = window.setTimeout(() => {
        // 再次检查鼠标是否在拖拽手柄上
        const dragHandleElement = document.querySelector('.drag-handle');
        const isHandleHovered = dragHandleElement?.matches(':hover');
        
        if (!isHandleHovered) {
          onClose();
        }
      }, 300);
    };

    const handleMouseEnter = () => {
      // 鼠标重新进入菜单，取消关闭
      if (closeTimeout) {
        window.clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      
      // 确保拖拽手柄保持显示
      const dragHandleElement = document.querySelector('.drag-handle');
      if (dragHandleElement) {
        dragHandleElement.classList.remove('hide');
      }
    };

    // 监听拖拽手柄的关闭请求
    const handleCloseRequest = () => {
      onClose();
    };

    // 监听滚动事件，滚动时关闭菜单
    const handleScroll = () => {
      onClose();
    };

    const menuElement = document.querySelector('[data-drag-handle-menu]');
    
    window.addEventListener('drag-handle-menu-close-request', handleCloseRequest);
    window.addEventListener('scroll', handleScroll, true); // 使用捕获阶段监听所有滚动
    
    if (menuElement) {
      menuElement.addEventListener('mouseleave', handleMouseLeave as any);
      menuElement.addEventListener('mouseenter', handleMouseEnter);
    }

    return () => {
      if (closeTimeout) {
        window.clearTimeout(closeTimeout);
      }
      window.removeEventListener('drag-handle-menu-close-request', handleCloseRequest);
      window.removeEventListener('scroll', handleScroll, true);
      if (menuElement) {
        menuElement.removeEventListener('mouseleave', handleMouseLeave as any);
        menuElement.removeEventListener('mouseenter', handleMouseEnter);
      }
    };
  }, [opened, onClose]);

  if (!opened) return null;

  return (
    <Paper
      data-drag-handle-menu
      className={classes.menu}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 1000,
      }}
      shadow="md"
      p="xs"
      withBorder
    >
      {/* 文本类型选项 - 仅文本块显示 */}
      {isText && (
        <>
          <div className={classes.typeGrid}>
            {textTypeOptions.map((option, index) => (
              <UnstyledButton
                key={index}
                className={clsx(classes.typeButton, {
                  [classes.activeType]: option.active,
                })}
                onClick={() => {
                  option.command();
                  onClose();
                }}
                title={t(option.label)}
              >
                <option.icon size={18} />
              </UnstyledButton>
            ))}
          </div>

          <Divider my="xs" />
        </>
      )}

      {/* 缩进和对齐 - 仅文本块显示 */}
      {isText && (
        <>
          <Text size="xs" c="dimmed" mb="xs" fw={500}>
            {t("Indent and alignment")}
          </Text>
          <Group gap="xs" mb="xs">
            {/* 缩进按钮 - 对列表显示 */}
            {(() => {
              // 检查节点类型是否为列表
              const nodeTypeName = node?.type?.name;
              const isListNode = nodeTypeName === 'orderedList' || 
                                 nodeTypeName === 'bulletList' || 
                                 nodeTypeName === 'taskList';
              
              const isListActive = isListNode ||
                                   blockState?.isOrderedList || 
                                   blockState?.isBulletList || 
                                   blockState?.isTaskList ||
                                   blockState?.isListItem ||
                                   blockState?.isTaskItem;
              
              const isTaskType = nodeTypeName === 'taskList' || 
                                 blockState?.isTaskList || 
                                 blockState?.isTaskItem;
              
              const canLift = isTaskType 
                ? editor.can().liftListItem('taskItem')
                : editor.can().liftListItem('listItem');
              const canSink = isTaskType 
                ? editor.can().sinkListItem('taskItem')
                : editor.can().sinkListItem('listItem');
              
              return (
                <>
                  <ActionIcon
                    variant="default"
                    disabled={!isListActive || !canLift}
                    onClick={() => {
                      if (isTaskType) {
                        editor.chain().focus().liftListItem('taskItem').run();
                      } else {
                        editor.chain().focus().liftListItem('listItem').run();
                      }
                    }}
                    title={t("Decrease indent")}
                    style={{
                      opacity: (!isListActive || !canLift) ? 0.4 : 1,
                      cursor: (!isListActive || !canLift) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <IconIndentDecrease size={18} />
                  </ActionIcon>
                  <ActionIcon
                    variant="default"
                    disabled={!isListActive || !canSink}
                    onClick={() => {
                      if (isTaskType) {
                        editor.chain().focus().sinkListItem('taskItem').run();
                      } else {
                        editor.chain().focus().sinkListItem('listItem').run();
                      }
                    }}
                    title={t("Increase indent")}
                    style={{
                      opacity: (!isListActive || !canSink) ? 0.4 : 1,
                      cursor: (!isListActive || !canSink) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <IconIndentIncrease size={18} />
                  </ActionIcon>
                </>
              );
            })()}
            
            {/* 分割线 */}
            <div
              style={{
                width: '1px',
                height: '20px',
                backgroundColor: 'var(--mantine-color-gray-3)',
                margin: '0 4px',
              }}
            />
            
            {alignmentOptions.map((option, index) => (
              <ActionIcon
                key={index}
                variant={option.active ? "filled" : "default"}
                onClick={() => {
                  editor.chain().focus().setTextAlign(option.value).run();
                  onClose();
                }}
                title={t(option.label)}
              >
                <option.icon size={18} />
              </ActionIcon>
            ))}
          </Group>

          <Divider my="xs" />
        </>
      )}

      {/* 文本颜色 - 仅文本块显示 */}
      {isText && (
        <>
          <div style={{ position: "relative" }}>
            <UnstyledButton
              className={classes.menuItem}
              onMouseEnter={() => setShowColorMenu(true)}
              onClick={() => setShowColorMenu(!showColorMenu)}
            >
              <Group gap="xs" style={{ width: "100%" }}>
                <IconPalette size={18} />
                <Text size="sm" style={{ flex: 1 }}>
                  {t("Color")}
                </Text>
                <Text size="xs" c="dimmed">
                  ▶
                </Text>
              </Group>
            </UnstyledButton>

            {/* 颜色选择面板 */}
            {showColorMenu && (
              <Paper
                ref={colorMenuRef}
                className={classes.insertMenu}
                shadow="md"
                p="md"
                withBorder
                style={{ minWidth: 280 }}
              >
                {/* 字体颜色 */}
                <Text size="sm" fw={500} mb="xs">
                  {t("Text color")}
                </Text>
                <Group gap="xs" mb="md">
                  {textColors.map((color, index) => (
                    <UnstyledButton
                      key={index}
                      onClick={() => {
                        console.log('[Color] Text color clicked:', color.label, color.value);
                        console.log('[Color] Node:', node);
                        console.log('[Color] Node type:', node?.type?.name);
                        
                        const { state } = editor;
                        const { selection } = state;
                        const { $from } = selection;
                        
                        // 如果是列表类型，找到当前的 listItem
                        let targetNode = node;
                        let targetPos = -1;
                        
                        if (node?.type?.name === 'orderedList' || 
                            node?.type?.name === 'bulletList' || 
                            node?.type?.name === 'taskList') {
                          console.log('[Color] Node is a list, finding current listItem');
                          
                          // 找到当前光标所在的 listItem
                          for (let depth = $from.depth; depth > 0; depth--) {
                            const currentNode = $from.node(depth);
                            if (currentNode.type.name === 'listItem' || currentNode.type.name === 'taskItem') {
                              targetNode = currentNode;
                              // 计算这个 listItem 的位置
                              targetPos = $from.before(depth);
                              console.log('[Color] Found listItem at depth:', depth, 'pos:', targetPos);
                              break;
                            }
                          }
                        } else {
                          // 非列表节点，在文档中查找位置
                          state.doc.descendants((n, pos) => {
                            if (n === node) {
                              targetPos = pos;
                              return false;
                            }
                          });
                        }
                        
                        console.log('[Color] Target node type:', targetNode?.type?.name);
                        console.log('[Color] Target pos:', targetPos);
                        
                        if (targetNode && targetPos >= 0) {
                          const from = targetPos + 1;
                          const to = targetPos + targetNode.nodeSize - 1;
                          
                          console.log('[Color] Selection range:', { from, to });
                          
                          // 应用颜色
                          if (color.value === "") {
                            editor.chain()
                              .setTextSelection({ from, to })
                              .unsetColor()
                              .setTextSelection(editor.state.selection.from)
                              .run();
                          } else {
                            editor.chain()
                              .setTextSelection({ from, to })
                              .setColor(color.value)
                              .setTextSelection(editor.state.selection.from)
                              .run();
                          }
                          
                          console.log('[Color] Color applied successfully');
                        } else {
                          console.error('[Color] Could not find target node!');
                        }
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--mantine-color-gray-3)",
                        borderRadius: 4,
                        cursor: "pointer",
                        backgroundColor: "#fff",
                      }}
                      title={t(color.label)}
                    >
                      <Text
                        size="lg"
                        fw={600}
                        style={{ color: color.display }}
                      >
                        A
                      </Text>
                    </UnstyledButton>
                  ))}
                </Group>

                {/* 背景颜色 */}
                <Text size="sm" fw={500} mb="xs">
                  {t("Background color")}
                </Text>
                <Group gap="xs" mb="md">
                  {backgroundColors.map((color, index) => (
                    <UnstyledButton
                      key={index}
                      onClick={() => {
                        console.log('[Background] Background color clicked:', color.label, color.value);
                        console.log('[Background] Node:', node);
                        console.log('[Background] Node type:', node?.type?.name);
                        
                        const { state } = editor;
                        const { selection } = state;
                        const { $from } = selection;
                        
                        // 如果是列表类型，找到当前的 listItem
                        let targetNode = node;
                        let targetPos = -1;
                        
                        if (node?.type?.name === 'orderedList' || 
                            node?.type?.name === 'bulletList' || 
                            node?.type?.name === 'taskList') {
                          console.log('[Background] Node is a list, finding current listItem');
                          
                          // 找到当前光标所在的 listItem
                          for (let depth = $from.depth; depth > 0; depth--) {
                            const currentNode = $from.node(depth);
                            if (currentNode.type.name === 'listItem' || currentNode.type.name === 'taskItem') {
                              targetNode = currentNode;
                              // 计算这个 listItem 的位置
                              targetPos = $from.before(depth);
                              console.log('[Background] Found listItem at depth:', depth, 'pos:', targetPos);
                              break;
                            }
                          }
                        } else {
                          // 非列表节点，在文档中查找位置
                          state.doc.descendants((n, pos) => {
                            if (n === node) {
                              targetPos = pos;
                              return false;
                            }
                          });
                        }
                        
                        console.log('[Background] Target node type:', targetNode?.type?.name);
                        console.log('[Background] Target pos:', targetPos);
                        
                        if (targetNode && targetPos >= 0) {
                          const from = targetPos + 1;
                          const to = targetPos + targetNode.nodeSize - 1;
                          
                          console.log('[Background] Selection range:', { from, to });
                          
                          // 应用背景色
                          if (color.value === "") {
                            editor.chain()
                              .setTextSelection({ from, to })
                              .unsetHighlight()
                              .setTextSelection(editor.state.selection.from)
                              .run();
                          } else {
                            editor.chain()
                              .setTextSelection({ from, to })
                              .setHighlight({ color: color.value })
                              .setTextSelection(editor.state.selection.from)
                              .run();
                          }
                          
                          console.log('[Background] Background applied successfully');
                        } else {
                          console.error('[Background] Could not find target node!');
                        }
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        backgroundColor: color.display,
                        border: color.border
                          ? "1px solid var(--mantine-color-gray-4)"
                          : "1px solid var(--mantine-color-gray-3)",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                      title={t(color.label)}
                    />
                  ))}
                </Group>

                {/* 恢复默认按钮 */}
                <UnstyledButton
                  onClick={() => {
                    // 使用传入的 node 参数来获取块的范围
                    if (node && node.nodeSize) {
                      const { state } = editor;
                      
                      // 在文档中查找当前节点的位置
                      let nodePos = -1;
                      state.doc.descendants((n, pos) => {
                        if (n === node) {
                          nodePos = pos;
                          return false;
                        }
                      });
                      
                      if (nodePos >= 0) {
                        // 选中整个块的内容（不包括块标记）
                        const from = nodePos + 1;
                        const to = nodePos + node.nodeSize - 1;
                        
                        editor.chain()
                          .setTextSelection({ from, to })
                          .focus();
                        
                        // 清除所有颜色设置
                        editor.commands.unsetColor();
                        editor.commands.unsetHighlight();
                      }
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid var(--mantine-color-gray-3)",
                    borderRadius: 4,
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "#fff",
                  }}
                >
                  <Text size="sm">{t("Reset to default")}</Text>
                </UnstyledButton>
              </Paper>
            )}
          </div>

          <Divider my="xs" />
        </>
      )}

      {/* 表格选项 - 仅表格块显示 */}
      {isTable && (
        <>
          <UnstyledButton
            className={classes.menuItem}
            onClick={() => {
              editor.chain().focus().toggleHeaderRow().run();
              onClose();
            }}
          >
            <Group gap="xs" style={{ width: "100%", justifyContent: "space-between" }}>
              <Group gap="xs">
                <IconTable size={18} />
                <Text size="sm">{t("Toggle header row")}</Text>
              </Group>
              <ActionIcon
                variant={editor.isActive("table") && editor.can().toggleHeaderRow() ? "filled" : "default"}
                size="sm"
                component="div"
              >
                {/* Toggle indicator */}
              </ActionIcon>
            </Group>
          </UnstyledButton>

          <UnstyledButton
            className={classes.menuItem}
            onClick={() => {
              editor.chain().focus().toggleHeaderColumn().run();
              onClose();
            }}
          >
            <Group gap="xs" style={{ width: "100%", justifyContent: "space-between" }}>
              <Group gap="xs">
                <IconColumnInsertLeft size={18} />
                <Text size="sm">{t("Toggle header column")}</Text>
              </Group>
              <ActionIcon
                variant={editor.isActive("table") && editor.can().toggleHeaderColumn() ? "filled" : "default"}
                size="sm"
                component="div"
              >
                {/* Toggle indicator */}
              </ActionIcon>
            </Group>
          </UnstyledButton>

          <Divider my="xs" />
        </>
      )}

      {/* 通用操作 */}
      <UnstyledButton
        className={classes.menuItem}
        onClick={() => {
          // 选中当前块的内容并添加评论
          const { state } = editor;
          const { selection } = state;
          const { $from } = selection;
          
          // 找到当前块并选中其内容
          let targetNode = node;
          let targetPos = -1;
          
          if (node?.type?.name === 'orderedList' || 
              node?.type?.name === 'bulletList' || 
              node?.type?.name === 'taskList') {
            // 如果是列表，找到当前的 listItem
            for (let depth = $from.depth; depth > 0; depth--) {
              const currentNode = $from.node(depth);
              if (currentNode.type.name === 'listItem' || currentNode.type.name === 'taskItem') {
                targetNode = currentNode;
                targetPos = $from.before(depth);
                break;
              }
            }
          } else {
            // 非列表节点，在文档中查找位置
            state.doc.descendants((n, pos) => {
              if (n === node) {
                targetPos = pos;
                return false;
              }
            });
          }
          
          if (targetNode && targetPos >= 0) {
            const from = targetPos + 1;
            const to = targetPos + targetNode.nodeSize - 1;
            
            // 选中内容并添加评论装饰
            editor.chain()
              .setTextSelection({ from, to })
              .focus()
              .setCommentDecoration()
              .run();
            
            // 触发评论弹窗
            const commentId = uuid7();
            setDraftCommentId(commentId);
            setShowCommentPopup(true);
          }
          
          onClose();
        }}
      >
        <Group gap="xs">
          <IconShare size={18} />
          <Text size="sm">{t("Comment")}</Text>
        </Group>
      </UnstyledButton>

      <UnstyledButton
        className={classes.menuItem}
        onClick={() => {
          console.log('[Cut] Cut clicked');
          console.log('[Cut] Node:', node);
          console.log('[Cut] Node type:', node?.type?.name);
          
          // 选中当前块并剪切
          const { state } = editor;
          const { selection } = state;
          const { $from } = selection;
          
          let targetNode = node;
          let targetPos = -1;
          
          if (node?.type?.name === 'orderedList' || 
              node?.type?.name === 'bulletList' || 
              node?.type?.name === 'taskList') {
            console.log('[Cut] Node is a list, finding listItem');
            for (let depth = $from.depth; depth > 0; depth--) {
              const currentNode = $from.node(depth);
              if (currentNode.type.name === 'listItem' || currentNode.type.name === 'taskItem') {
                targetNode = currentNode;
                targetPos = $from.before(depth);
                console.log('[Cut] Found listItem at depth:', depth, 'pos:', targetPos);
                break;
              }
            }
          } else {
            state.doc.descendants((n, pos) => {
              if (n === node) {
                targetPos = pos;
                console.log('[Cut] Found node at pos:', pos);
                return false;
              }
            });
          }
          
          console.log('[Cut] Target node:', targetNode?.type?.name);
          console.log('[Cut] Target pos:', targetPos);
          console.log('[Cut] Node size:', targetNode?.nodeSize);
          
          if (targetNode && targetPos >= 0) {
            const from = targetPos;
            const to = targetPos + targetNode.nodeSize;
            
            console.log('[Cut] Selection range:', { from, to });
            
            // 先选中内容
            editor.chain()
              .setTextSelection({ from, to })
              .focus()
              .run();
            
            // 然后执行剪切
            const result = document.execCommand('cut');
            console.log('[Cut] Cut result:', result);
          } else {
            console.error('[Cut] Could not find target node!');
          }
          
          onClose();
        }}
      >
        <Group gap="xs">
          <IconScissors size={18} />
          <Text size="sm">{t("Cut")}</Text>
        </Group>
      </UnstyledButton>

      <UnstyledButton
        className={classes.menuItem}
        onClick={() => {
          console.log('[Copy] Copy clicked');
          console.log('[Copy] Node:', node);
          console.log('[Copy] Node type:', node?.type?.name);
          
          // 选中当前块并复制
          const { state } = editor;
          const { selection } = state;
          const { $from } = selection;
          
          let targetNode = node;
          let targetPos = -1;
          
          if (node?.type?.name === 'orderedList' || 
              node?.type?.name === 'bulletList' || 
              node?.type?.name === 'taskList') {
            console.log('[Copy] Node is a list, finding listItem');
            for (let depth = $from.depth; depth > 0; depth--) {
              const currentNode = $from.node(depth);
              if (currentNode.type.name === 'listItem' || currentNode.type.name === 'taskItem') {
                targetNode = currentNode;
                targetPos = $from.before(depth);
                console.log('[Copy] Found listItem at depth:', depth, 'pos:', targetPos);
                break;
              }
            }
          } else {
            state.doc.descendants((n, pos) => {
              if (n === node) {
                targetPos = pos;
                console.log('[Copy] Found node at pos:', pos);
                return false;
              }
            });
          }
          
          console.log('[Copy] Target node:', targetNode?.type?.name);
          console.log('[Copy] Target pos:', targetPos);
          console.log('[Copy] Node size:', targetNode?.nodeSize);
          
          if (targetNode && targetPos >= 0) {
            const from = targetPos;
            const to = targetPos + targetNode.nodeSize;
            
            console.log('[Copy] Selection range:', { from, to });
            
            // 先选中内容
            editor.chain()
              .setTextSelection({ from, to })
              .focus()
              .run();
            
            // 然后执行复制
            const result = document.execCommand('copy');
            console.log('[Copy] Copy result:', result);
          } else {
            console.error('[Copy] Could not find target node!');
          }
          
          onClose();
        }}
      >
        <Group gap="xs">
          <IconCopy size={18} />
          <Text size="sm">{t("Copy")}</Text>
        </Group>
      </UnstyledButton>

      <UnstyledButton
        className={classes.menuItem}
        onClick={() => {
          // 复制当前页面链接到剪贴板
          const currentUrl = window.location.href;
          navigator.clipboard.writeText(currentUrl).then(() => {
            // 可以添加一个提示通知
            console.log('Link copied to clipboard:', currentUrl);
          }).catch(err => {
            console.error('Failed to copy link:', err);
          });
          onClose();
        }}
      >
        <Group gap="xs">
          <IconLink size={18} />
          <Text size="sm">{t("Copy link")}</Text>
        </Group>
      </UnstyledButton>

      <Divider my="xs" />

      <UnstyledButton
        className={classes.menuItem}
        onClick={() => {
          console.log('[Delete] Delete clicked');
          console.log('[Delete] Node:', node);
          console.log('[Delete] Node type:', node?.type?.name);
          
          // 删除当前块
          const { state } = editor;
          const { selection } = state;
          const { $from } = selection;
          
          let targetPos = -1;
          let targetNode = node;
          
          // 首先检查当前节点是否在列表项中
          let isInList = false;
          for (let depth = $from.depth; depth > 0; depth--) {
            const currentNode = $from.node(depth);
            if (currentNode.type.name === 'listItem' || currentNode.type.name === 'taskItem') {
              // 找到了 listItem，删除整个 listItem
              targetNode = currentNode;
              targetPos = $from.before(depth);
              isInList = true;
              console.log('[Delete] Found listItem at depth:', depth, 'pos:', targetPos);
              break;
            }
          }
          
          // 如果不在列表项中，检查节点本身是否是列表
          if (!isInList) {
            if (node?.type?.name === 'orderedList' || 
                node?.type?.name === 'bulletList' || 
                node?.type?.name === 'taskList') {
              console.log('[Delete] Node is a list, deleting entire list');
              // 删除整个列表
              state.doc.descendants((n, pos) => {
                if (n === node) {
                  targetPos = pos;
                  targetNode = node;
                  console.log('[Delete] Found list at pos:', pos);
                  return false;
                }
              });
            } else {
              // 非列表节点，在文档中查找位置
              state.doc.descendants((n, pos) => {
                if (n === node) {
                  targetPos = pos;
                  console.log('[Delete] Found node at pos:', pos);
                  return false;
                }
              });
            }
          }
          
          console.log('[Delete] Target node:', targetNode?.type?.name);
          console.log('[Delete] Target pos:', targetPos);
          console.log('[Delete] Node size:', targetNode?.nodeSize);
          
          if (targetPos >= 0 && targetNode) {
            const from = targetPos;
            const to = targetPos + targetNode.nodeSize;
            
            console.log('[Delete] Delete range:', { from, to });
            
            const result = editor.chain()
              .focus()
              .deleteRange({ from, to })
              .run();
            
            console.log('[Delete] Delete result:', result);
          } else {
            console.error('[Delete] Could not find target node!');
          }
          
          onClose();
        }}
      >
        <Group gap="xs">
          <IconTrash size={18} />
          <Text size="sm">{t("Delete")}</Text>
        </Group>
      </UnstyledButton>


    </Paper>
  );
};
