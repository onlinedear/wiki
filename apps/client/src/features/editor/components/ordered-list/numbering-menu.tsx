import { Menu, NumberInput, Button, Stack, Group, Text } from '@mantine/core';
import { useState } from 'react';
import { Editor } from '@tiptap/react';

interface NumberingMenuProps {
  editor: Editor;
  currentNumber: string; // 当前编号，如 "1", "2.1", "1.1.1"
  position: { x: number; y: number };
  listItemPos: number; // listItem 节点的位置
  onClose: () => void;
}

export function NumberingMenu({ editor, currentNumber, position, listItemPos, onClose }: NumberingMenuProps) {
  // 解析当前编号，获取层级和最后一级的数字
  const parseNumber = (num: string) => {
    const parts = num.split('.');
    const lastPart = parseInt(parts[parts.length - 1]);
    return { parts, lastPart, level: parts.length };
  };

  const { parts, lastPart, level } = parseNumber(currentNumber);
  const [customValue, setCustomValue] = useState<number>(lastPart);

  // 更新指定位置的 listItem 属性，并级联更新子级编号
  const updateListItemAttrs = (attrs: Record<string, any>) => {
    console.log('[NumberingMenu] updateListItemAttrs called with:', attrs);
    console.log('[NumberingMenu] listItemPos:', listItemPos);
    
    const { state, view } = editor;
    
    // 创建一个新的 transaction
    const tr = state.tr;
    const node = state.doc.nodeAt(listItemPos);
    
    console.log('[NumberingMenu] Node at position:', node?.type.name);
    
    if (node && node.type.name === 'listItem') {
      // 更新当前节点
      tr.setNodeMarkup(listItemPos, undefined, {
        ...node.attrs,
        ...attrs,
      });
      
      // 级联更新后续的标题（包括设置和清除自定义编号）
      if (attrs.customNumber !== undefined) {
        const oldNumber = currentNumber;
        const newNumber = attrs.customNumber;
        const currentLevel = level;
        
        // 只有在 newNumber 不为 null 时才计算增量
        let increment = 0;
        if (newNumber !== null) {
          const newNumberValue = parseInt(newNumber.split('.').pop() || '1');
          const oldNumberValue = parseInt(oldNumber.split('.').pop() || '1');
          increment = newNumberValue - oldNumberValue;
        }
        
        console.log('[NumberingMenu] Cascading update:', {
          oldNumber,
          newNumber,
          currentLevel,
          increment,
        });
        
        // 遍历整个文档，找到所有需要更新的标题（包括跨列表）
        let foundCurrent = false;
        
        state.doc.descendants((descendantNode, pos) => {
          // 找到当前项
          if (pos === listItemPos) {
            foundCurrent = true;
            return;
          }
          
          // 只处理当前项之后的节点
          if (!foundCurrent) return;
          
          if (descendantNode.type.name === 'listItem') {
            const firstChild = descendantNode.firstChild;
            const isHeading = firstChild && firstChild.type.name === 'heading';
            
            // 只处理包含标题的列表项
            if (!isHeading) return;
            
            const descendantCustomNumber = descendantNode.attrs.customNumber;
            const descendantComputedNumber = descendantNode.attrs.computedNumber;
            const descendantNumber = descendantCustomNumber || descendantComputedNumber;
            const descendantLevel = descendantNode.attrs.headingLevel;
            
            if (descendantNumber && descendantLevel) {
              const descendantParts = descendantNumber.split('.');
              
              console.log('[NumberingMenu] Checking item:', {
                descendantNumber,
                descendantLevel,
                currentLevel,
                hasCustomNumber: !!descendantCustomNumber,
              });
              
              // 如果清除自定义编号（newNumber 为 null）
              if (attrs.customNumber === null) {
                // 清除所有子级和同级的自定义编号
                if (descendantParts.length >= currentLevel && descendantCustomNumber) {
                  // 如果是子级（前缀匹配）或同级
                  if (descendantParts.length > currentLevel && descendantNumber.startsWith(oldNumber + '.')) {
                    console.log('[NumberingMenu] Clearing child custom number:', descendantNumber);
                    tr.setNodeMarkup(pos, undefined, {
                      ...descendantNode.attrs,
                      customNumber: null,
                    });
                  } else if (descendantParts.length === currentLevel) {
                    console.log('[NumberingMenu] Clearing sibling custom number:', descendantNumber);
                    tr.setNodeMarkup(pos, undefined, {
                      ...descendantNode.attrs,
                      customNumber: null,
                    });
                  } else if (descendantParts.length < currentLevel) {
                    // 遇到更高级的标题，停止
                    return false;
                  }
                }
              }
              // 如果设置了新的自定义编号
              else {
                // 如果是子级（层级更深）且前缀匹配
                if (descendantParts.length > currentLevel && 
                    descendantNumber.startsWith(oldNumber + '.')) {
                  // 替换前缀
                  const newDescendantNumber = descendantNumber.replace(
                    new RegExp(`^${oldNumber.replace(/\./g, '\\.')}`),
                    newNumber
                  );
                  
                  console.log('[NumberingMenu] Updating child:', descendantNumber, '→', newDescendantNumber);
                  
                  tr.setNodeMarkup(pos, undefined, {
                    ...descendantNode.attrs,
                    customNumber: newDescendantNumber,
                  });
                }
                // 如果是同级标题，递增编号
                else if (descendantParts.length === currentLevel) {
                  const descendantValue = parseInt(descendantParts[descendantParts.length - 1]);
                  const newDescendantValue = descendantValue + increment;
                  const newDescendantParts = [...descendantParts];
                  newDescendantParts[newDescendantParts.length - 1] = newDescendantValue.toString();
                  const newDescendantNumber = newDescendantParts.join('.');
                  
                  console.log('[NumberingMenu] Updating sibling:', descendantNumber, '→', newDescendantNumber);
                  
                  tr.setNodeMarkup(pos, undefined, {
                    ...descendantNode.attrs,
                    customNumber: newDescendantNumber,
                  });
                }
                // 如果遇到更高级的标题，停止遍历
                else if (descendantParts.length < currentLevel) {
                  console.log('[NumberingMenu] Stopping at higher level:', descendantNumber);
                  return false;
                }
              }
            }
          }
        });
      }
      
      // 标记文档已更改，触发装饰器更新
      tr.setMeta('addToHistory', true);
      
      // 分发 transaction
      view.dispatch(tr);
    }
  };

  // 继续标题编号 - 与上一个有序列表合并，延续上一个列表的编号
  const handleContinueNumbering = () => {
    const { state } = editor;
    
    // 找到当前列表项所在的有序列表
    let currentListPos = -1;
    let currentListNode = null;
    
    state.doc.descendants((node, pos) => {
      if (node.type.name === 'orderedList') {
        // 检查当前列表项是否在这个列表中
        let found = false;
        node.forEach((listItem, offset) => {
          const itemPos = pos + offset + 1;
          if (itemPos === listItemPos) {
            found = true;
          }
        });
        
        if (found) {
          currentListPos = pos;
          currentListNode = node;
          return false; // 停止遍历
        }
      }
    });
    
    if (currentListPos === -1 || !currentListNode) {
      console.log('[NumberingMenu] Could not find current list');
      onClose();
      return;
    }
    
    // 获取当前标题的级别（H1/H2/H3等）
    const currentNode = state.doc.nodeAt(listItemPos);
    const currentHeadingLevel = currentNode?.attrs.headingLevel;
    
    if (!currentHeadingLevel) {
      console.log('[NumberingMenu] Current item is not a heading');
      onClose();
      return;
    }
    
    // 找到上一个有序列表的最后一个同级标题编号
    let previousNumber: string | null = null;
    let foundCurrent = false;
    
    state.doc.descendants((node, pos) => {
      // 跳过当前列表之后的内容
      if (pos >= currentListPos) {
        if (pos === currentListPos) {
          foundCurrent = true;
        }
        return false;
      }
      
      if (node.type.name === 'orderedList') {
        // 遍历这个列表，找到最后一个与当前标题同级的编号
        node.forEach((listItem) => {
          if (listItem.type.name === 'listItem') {
            const itemHeadingLevel = listItem.attrs.headingLevel;
            const itemNumber = listItem.attrs.customNumber || listItem.attrs.computedNumber;
            
            // 必须同时满足：标题级别相同（H1/H2/H3）且编号层级相同
            if (itemHeadingLevel === currentHeadingLevel && itemNumber) {
              const itemParts = itemNumber.split('.');
              
              // 检查编号层级是否相同
              if (itemParts.length === level) {
                previousNumber = itemNumber;
              }
            }
          }
        });
      }
    });
    
    if (previousNumber) {
      // 计算新的起始编号（上一个编号 + 1）
      const previousParts = previousNumber.split('.');
      const lastValue = parseInt(previousParts[previousParts.length - 1]);
      const newValue = lastValue + 1;
      
      let newNumber: string;
      if (level === 1) {
        newNumber = newValue.toString();
      } else {
        const newParts = [...previousParts];
        newParts[newParts.length - 1] = newValue.toString();
        newNumber = newParts.join('.');
      }
      
      console.log('[NumberingMenu] Continue from previous list:', previousNumber, '→', newNumber);
      
      // 设置新的起始编号
      updateListItemAttrs({
        customNumber: newNumber,
        restartNumbering: false,
      });
    } else {
      // 如果没有找到上一个列表，清除自定义编号（恢复自动计算）
      console.log('[NumberingMenu] No previous list found, clearing custom number');
      updateListItemAttrs({
        customNumber: null,
        restartNumbering: false,
      });
    }
    
    onClose();
  };

  // 重新开始编号 - 从 1 开始
  const handleRestartFromOne = () => {
    console.log('[NumberingMenu] handleRestartFromOne called');
    console.log('[NumberingMenu] Current number:', currentNumber);
    console.log('[NumberingMenu] Level:', level);
    console.log('[NumberingMenu] Parts:', parts);
    
    if (level === 1) {
      console.log('[NumberingMenu] Setting to "1"');
      updateListItemAttrs({
        customNumber: '1',
        restartNumbering: true,
      });
    } else {
      const newParts = [...parts];
      newParts[newParts.length - 1] = '1';
      const newNumber = newParts.join('.');
      console.log('[NumberingMenu] Setting to:', newNumber);
      updateListItemAttrs({
        customNumber: newNumber,
        restartNumbering: true,
      });
    }
    onClose();
  };

  // 重新开始编号 - 从当前编号开始
  const handleRestartFromCurrent = () => {
    updateListItemAttrs({
      customNumber: currentNumber,
      restartNumbering: true,
    });
    onClose();
  };

  // 设置编号的值
  const handleSetCustomValue = () => {
    if (level === 1) {
      updateListItemAttrs({
        customNumber: customValue.toString(),
        restartNumbering: false,
      });
    } else {
      const newParts = [...parts];
      newParts[newParts.length - 1] = customValue.toString();
      updateListItemAttrs({
        customNumber: newParts.join('.'),
        restartNumbering: false,
      });
    }
    onClose();
  };

  return (
    <Menu
      opened={true}
      onClose={onClose}
      position="right-start"
      offset={5}
      withinPortal
    >
      <Menu.Target>
        <div
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            width: 1,
            height: 1,
          }}
        />
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item onClick={handleContinueNumbering}>
          继续标题编号
        </Menu.Item>

        <Menu.Divider />
        
        <Menu.Label>重新开始编号</Menu.Label>
        <Menu.Item onClick={handleRestartFromOne}>
          从 1. 开始
        </Menu.Item>
        <Menu.Item onClick={handleRestartFromCurrent}>
          从 {currentNumber} 开始
        </Menu.Item>

        <Menu.Divider />

        <div style={{ padding: '8px 12px' }}>
          <Stack gap="xs">
            <Text size="sm" fw={500}>设置编号的值</Text>
            <Group gap="xs">
              <NumberInput
                value={customValue}
                onChange={(val) => setCustomValue(Number(val) || 1)}
                min={1}
                max={999}
                size="xs"
                style={{ flex: 1 }}
                placeholder={level > 1 ? `修改最后一级 (当前: ${lastPart})` : '输入编号'}
              />
              <Button size="xs" onClick={handleSetCustomValue}>
                确定
              </Button>
            </Group>
            {level > 1 && (
              <Text size="xs" c="dimmed">
                只能修改最后一级编号 ({parts.slice(0, -1).join('.')}.X)
              </Text>
            )}
          </Stack>
        </div>
      </Menu.Dropdown>
    </Menu>
  );
}
