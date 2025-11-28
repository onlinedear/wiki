import { StarterKit } from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Underline } from '@tiptap/extension-underline';
import { Superscript } from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { Highlight } from '@tiptap/extension-highlight';
import { Typography } from '@tiptap/extension-typography';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Youtube } from '@tiptap/extension-youtube';
import {
  Callout,
  Comment,
  CustomCodeBlock,
  Details,
  DetailsContent,
  DetailsSummary,
  LinkExtension,
  MathBlock,
  MathInline,
  TableHeader,
  TableCell,
  TableRow,
  CustomTable,
  TiptapImage,
  TiptapVideo,
  TrailingNode,
  Attachment,
  Drawio,
  Excalidraw,
  Embed,
  Mention,
  Subpages,
} from '@notedoc/editor-ext';
import { Node as TiptapNode, mergeAttributes } from '@tiptap/core';
import { generateText, getSchema, JSONContent } from '@tiptap/core';
import { generateHTML, generateJSON } from '../common/helpers/prosemirror/html';
// @tiptap/html library works best for generating prosemirror json state but not HTML
// see: https://github.com/ueberdosis/tiptap/issues/5352
// see:https://github.com/ueberdosis/tiptap/issues/4089
import { Node as ProseMirrorNode } from '@tiptap/pm/model';

// Server-side Gantt extension without React dependency
const GanttServerSide = TiptapNode.create({
  name: 'gantt',
  inline: false,
  group: 'block',
  isolating: true,
  atom: true,
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      tasks: {
        default: [],
        parseHTML: (element) => {
          const data = element.getAttribute('data-tasks');
          return data ? JSON.parse(data) : [];
        },
        renderHTML: (attributes) => ({
          'data-tasks': JSON.stringify(attributes.tasks || []),
        }),
      },
      viewMode: {
        default: 'week',
        parseHTML: (element) => element.getAttribute('data-view-mode') || 'week',
        renderHTML: (attributes) => ({
          'data-view-mode': attributes.viewMode,
        }),
      },
      hiddenColumns: {
        default: [],
        parseHTML: (element) => {
          const data = element.getAttribute('data-hidden-columns');
          return data ? JSON.parse(data) : [];
        },
        renderHTML: (attributes) => ({
          'data-hidden-columns': JSON.stringify(attributes.hiddenColumns || []),
        }),
      },
      customFields: {
        default: [],
        parseHTML: (element) => {
          const data = element.getAttribute('data-custom-fields');
          return data ? JSON.parse(data) : [];
        },
        renderHTML: (attributes) => ({
          'data-custom-fields': JSON.stringify(attributes.customFields || []),
        }),
      },
      ganttSettings: {
        default: {},
        parseHTML: (element) => {
          const data = element.getAttribute('data-gantt-settings');
          return data ? JSON.parse(data) : {};
        },
        renderHTML: (attributes) => ({
          'data-gantt-settings': JSON.stringify(attributes.ganttSettings || {}),
        }),
      },
      viewConfig: {
        default: {},
        parseHTML: (element) => {
          const data = element.getAttribute('data-view-config');
          return data ? JSON.parse(data) : {};
        },
        renderHTML: (attributes) => ({
          'data-view-config': JSON.stringify(attributes.viewConfig || {}),
        }),
      },
      milestones: {
        default: [],
        parseHTML: (element) => {
          const data = element.getAttribute('data-milestones');
          return data ? JSON.parse(data) : [];
        },
        renderHTML: (attributes) => ({
          'data-milestones': JSON.stringify(attributes.milestones || []),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="gantt"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        { 'data-type': 'gantt', class: 'gantt-chart' },
        HTMLAttributes
      ),
      ['p', 'Gantt Chart'],
    ];
  },
});

export const tiptapExtensions = [
  StarterKit.configure({
    codeBlock: false,
  }),
  Comment,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Underline,
  LinkExtension,
  Superscript,
  SubScript,
  Highlight,
  Typography,
  TrailingNode,
  TextStyle,
  Color,
  MathInline,
  MathBlock,
  Details,
  DetailsContent,
  DetailsSummary,
  CustomTable,
  TableCell,
  TableRow,
  TableHeader,
  Youtube,
  TiptapImage,
  TiptapVideo,
  Callout,
  Attachment,
  CustomCodeBlock,
  Drawio,
  Excalidraw,
  Embed,
  Mention,
  Subpages,
  GanttServerSide,
] as any;

export function jsonToHtml(tiptapJson: any) {
  return generateHTML(tiptapJson, tiptapExtensions);
}

export function htmlToJson(html: string) {
  return generateJSON(html, tiptapExtensions);
}

export function jsonToText(tiptapJson: JSONContent) {
  return generateText(tiptapJson, tiptapExtensions);
}

export function jsonToNode(tiptapJson: JSONContent) {
  return ProseMirrorNode.fromJSON(getSchema(tiptapExtensions), tiptapJson);
}

export function getPageId(documentName: string) {
  return documentName.split('.')[1];
}
