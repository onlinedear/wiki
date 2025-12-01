import ListItem from '@tiptap/extension-list-item';

/**
 * 自定义 ListItem 扩展，允许标题作为列表项的内容
 * 这样可以创建带编号的标题（如：1. 一级标题）
 */
export const CustomListItem = ListItem.extend({
  content: 'paragraph block* | heading block*',
  
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
      Tab: () => this.editor.commands.sinkListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
    };
  },
});
