import { Checkbox, Group, Text, Box, ActionIcon, Collapse } from '@mantine/core';
import { IconChevronRight, IconFolder, IconFile } from '@tabler/icons-react';
import { DocumentTreeNode } from '../types/document-tree';
import styles from './feishu-document-tree.module.css';

interface FeishuDocumentTreeProps {
  nodes: DocumentTreeNode[];
  onNodeToggle: (token: string) => void;
  onNodeExpand: (token: string) => void;
}

function TreeNode({
  node,
  onToggle,
  onExpand,
  level = 0,
}: {
  node: DocumentTreeNode;
  onToggle: (token: string) => void;
  onExpand: (token: string) => void;
  level?: number;
}) {
  const hasChildren = node.children.length > 0;
  const isFolder = node.type === 'folder';

  return (
    <Box>
      <Group
        gap="xs"
        wrap="nowrap"
        className={styles.treeNode}
        style={{ paddingLeft: `${level * 24}px` }}
      >
        {hasChildren ? (
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={() => onExpand(node.token)}
            className={node.expanded ? styles.chevronExpanded : styles.chevronCollapsed}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        ) : (
          <Box style={{ width: 28 }} />
        )}

        <Checkbox
          checked={node.checked}
          indeterminate={node.indeterminate}
          onChange={() => onToggle(node.token)}
          disabled={isFolder && !hasChildren}
        />

        {isFolder ? (
          <IconFolder size={18} color="var(--mantine-color-blue-6)" />
        ) : (
          <IconFile size={18} color="var(--mantine-color-gray-6)" />
        )}

        <Text size="sm" style={{ flex: 1 }}>
          {node.name}
        </Text>

        {hasChildren && (
          <Text size="xs" c="dimmed">
            ({node.children.length})
          </Text>
        )}
      </Group>

      {hasChildren && (
        <Collapse in={node.expanded}>
          {node.children.map((child) => (
            <TreeNode
              key={child.token}
              node={child}
              onToggle={onToggle}
              onExpand={onExpand}
              level={level + 1}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

export function FeishuDocumentTree({
  nodes,
  onNodeToggle,
  onNodeExpand,
}: FeishuDocumentTreeProps) {
  if (nodes.length === 0) {
    return (
      <Box p="md" ta="center">
        <Text size="sm" c="dimmed">
          No documents found
        </Text>
      </Box>
    );
  }

  return (
    <Box className={styles.treeContainer}>
      {nodes.map((node) => (
        <TreeNode
          key={node.token}
          node={node}
          onToggle={onNodeToggle}
          onExpand={onNodeExpand}
        />
      ))}
    </Box>
  );
}
