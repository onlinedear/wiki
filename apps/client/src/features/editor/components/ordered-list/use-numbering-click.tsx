import { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';

interface NumberingClickState {
  show: boolean;
  position: { x: number; y: number };
  currentNumber: string;
  listItemPos: number;
}

export function useNumberingClick(editor: Editor | null) {
  const [state, setState] = useState<NumberingClickState>({
    show: false,
    position: { x: 0, y: 0 },
    currentNumber: '1',
    listItemPos: 0,
  });

  useEffect(() => {
    if (!editor) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // 检查是否点击了编号（::before 伪元素）
      const listItem = target.closest('.tiptap ol li');
      if (!listItem) return;

      // 获取点击位置相对于列表项的位置
      const rect = listItem.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      
      // 如果点击位置在左侧 2em 范围内（编号区域）
      if (clickX < 0 || clickX > 32) return; // 32px ≈ 2em

      event.preventDefault();
      event.stopPropagation();

      // 获取当前编号
      const customNumber = listItem.getAttribute('data-custom-number');
      let currentNumber = '1';

      if (customNumber) {
        currentNumber = customNumber;
      } else {
        // 计算当前编号
        currentNumber = calculateCurrentNumber(listItem as HTMLElement);
      }

      // 获取 listItem 在文档中的位置
      let listItemPos = 0;
      const { state: editorState } = editor;
      editorState.doc.descendants((node, pos) => {
        if (node.type.name === 'listItem') {
          const domNode = editor.view.nodeDOM(pos);
          if (domNode === listItem) {
            listItemPos = pos;
            return false;
          }
        }
      });

      setState({
        show: true,
        position: { x: event.clientX, y: event.clientY },
        currentNumber,
        listItemPos,
      });
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleClick);

    return () => {
      editorElement.removeEventListener('click', handleClick);
    };
  }, [editor]);

  const closeMenu = () => {
    setState(prev => ({ ...prev, show: false }));
  };

  return { ...state, closeMenu };
}

// 计算当前编号（基于 CSS 计数器）
function calculateCurrentNumber(listItem: HTMLElement): string {
  // 获取标题级别
  const heading = listItem.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) {
    // 普通段落，计算段落编号
    const allParagraphItems = Array.from(
      listItem.closest('ol')?.querySelectorAll('li:has(> p):not(:has(> h1, > h2, > h3, > h4, > h5, > h6))') || []
    );
    const index = allParagraphItems.indexOf(listItem) + 1;
    return index.toString();
  }

  const level = parseInt(heading.tagName.substring(1));
  
  // 计算层级编号
  const numbers: number[] = [];
  let currentList = listItem.closest('ol');
  let currentItem: HTMLElement | null = listItem as HTMLElement;

  for (let i = level; i >= 1; i--) {
    if (!currentItem || !currentList) break;

    // 查找同级的所有标题
    const selector = `li:has(> h${i})`;
    const siblings = Array.from(currentList.querySelectorAll(selector));
    const index = siblings.indexOf(currentItem) + 1;
    numbers.unshift(index);

    // 向上查找父级
    currentItem = currentList.closest('li') as HTMLElement;
    currentList = currentItem?.closest('ol') || null;
  }

  return numbers.join('.');
}
