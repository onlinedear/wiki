import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import renderItems from '@/features/editor/components/slash-menu/render-items';
import getSuggestionItems from '@/features/editor/components/slash-menu/menu-items';
import i18n from '@/i18n';

export const slashMenuPluginKey = new PluginKey('slash-command');

// @ts-ignore
const Command = Extension.create({
  name: 'slash-command',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range, props });
        },
      } as Partial<SuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey: slashMenuPluginKey,
        ...this.options.suggestion,
        editor: this.editor,
      }),
    ];
  },
});

const SlashCommand = Command.configure({
  suggestion: {
    items: ({ query }) => getSuggestionItems({ query, t: i18n.t }),
    render: renderItems,
  },
});

export default SlashCommand;
