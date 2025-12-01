import { Editor } from '@tiptap/react';
import { useNumberingClick } from './use-numbering-click';
import { NumberingMenu } from './numbering-menu';

interface NumberingMenuWrapperProps {
  editor: Editor | null;
}

export function NumberingMenuWrapper({ editor }: NumberingMenuWrapperProps) {
  const { show, position, currentNumber, closeMenu } = useNumberingClick(editor);

  if (!show || !editor) return null;

  return (
    <NumberingMenu
      editor={editor}
      currentNumber={currentNumber}
      position={position}
      onClose={closeMenu}
    />
  );
}
