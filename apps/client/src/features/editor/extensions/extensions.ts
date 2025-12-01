import {
  IconTypography,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconCheckbox,
  IconQuote,
  IconCode,
  IconInfoCircle,
  IconTable,
  IconPhoto,
  IconVideo,
  IconPaperclip,
  IconCalendar,
  IconListDetails,
  IconMath,
  IconAppWindow,
  IconSitemap,
} from "@tabler/icons-react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Underline } from "@tiptap/extension-underline";
import { Superscript } from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { Highlight } from "@tiptap/extension-highlight";
import { Typography } from "@tiptap/extension-typography";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import SlashCommand from "@/features/editor/extensions/slash-command";
import { Collaboration } from "@tiptap/extension-collaboration";
import { CollaborationCursor } from "@tiptap/extension-collaboration-cursor";
import { HocuspocusProvider } from "@hocuspocus/provider";
import {
  Comment,
  Details,
  DetailsContent,
  DetailsSummary,
  MathBlock,
  MathInline,
  TableCell,
  TableRow,
  TableHeader,
  CustomTable,
  TrailingNode,
  TiptapImage,
  Callout,
  TiptapVideo,
  LinkExtension,
  Selection,
  Attachment,
  CustomCodeBlock,
  Drawio,
  Excalidraw,
  Embed,
  SearchAndReplace,
  Mention,
  Subpages,
  TableDndExtension,
  Gantt,
} from "@notedoc/editor-ext";
import { CustomListItem } from "@notedoc/editor-ext/src/lib/list-item";
import { CustomOrderedList } from "@notedoc/editor-ext/src/lib/ordered-list";
import {
  randomElement,
  userColors,
} from "@/features/editor/extensions/utils.ts";
import { IUser } from "@/features/user/types/user.types.ts";
import MathInlineView from "@/features/editor/components/math/math-inline.tsx";
import MathBlockView from "@/features/editor/components/math/math-block.tsx";
import { CustomGlobalDragHandle } from './custom-drag-handle';
import { Youtube } from "@tiptap/extension-youtube";
import ImageView from "@/features/editor/components/image/image-view.tsx";
import CalloutView from "@/features/editor/components/callout/callout-view.tsx";
import { common, createLowlight } from "lowlight";
import VideoView from "@/features/editor/components/video/video-view.tsx";
import AttachmentView from "@/features/editor/components/attachment/attachment-view.tsx";
import CodeBlockView from "@/features/editor/components/code-block/code-block-view.tsx";
import DrawioView from "../components/drawio/drawio-view";
import ExcalidrawView from "@/features/editor/components/excalidraw/excalidraw-view.tsx";
import EmbedView from "@/features/editor/components/embed/embed-view.tsx";
import SubpagesView from "@/features/editor/components/subpages/subpages-view.tsx";
import { GanttView } from "@/features/editor/components/gantt/gantt-view.tsx";
import plaintext from "highlight.js/lib/languages/plaintext";
import powershell from "highlight.js/lib/languages/powershell";
import abap from "highlightjs-sap-abap";
import elixir from "highlight.js/lib/languages/elixir";
import erlang from "highlight.js/lib/languages/erlang";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import clojure from "highlight.js/lib/languages/clojure";
import fortran from "highlight.js/lib/languages/fortran";
import haskell from "highlight.js/lib/languages/haskell";
import scala from "highlight.js/lib/languages/scala";
import mentionRenderItems from "@/features/editor/components/mention/mention-suggestion.ts";
import { ReactNodeViewRenderer } from "@tiptap/react";
import MentionView from "@/features/editor/components/mention/mention-view.tsx";
import i18n from "@/i18n.ts";
import { MarkdownClipboard } from "@/features/editor/extensions/markdown-clipboard.ts";
import EmojiCommand from "./emoji-command";
import { CharacterCount } from "@tiptap/extension-character-count";
import { countWords } from "alfaaz";
import React from "react";

const lowlight = createLowlight(common);
lowlight.register("mermaid", plaintext);
lowlight.register("powershell", powershell);
lowlight.register("abap", abap);
lowlight.register("erlang", erlang);
lowlight.register("elixir", elixir);
lowlight.register("dockerfile", dockerfile);
lowlight.register("clojure", clojure);
lowlight.register("fortran", fortran);
lowlight.register("haskell", haskell);
lowlight.register("scala", scala);

export const mainExtensions = [
  StarterKit.configure({
    history: false,
    dropcursor: {
      width: 3,
      color: "#70CFF8",
    },
    codeBlock: false,
    listItem: false, // 禁用默认的 ListItem，使用自定义的
    orderedList: false, // 禁用默认的 OrderedList，使用自定义的
    code: {
      HTMLAttributes: {
        spellcheck: false,
      },
    },
  }),
  CustomListItem, // 使用自定义的 ListItem，支持标题作为列表项
  CustomOrderedList, // 使用自定义的 OrderedList，支持层级编号
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === "heading") {
        return i18n.t("Heading {{level}}", { level: node.attrs.level });
      }
      if (node.type.name === "detailsSummary") {
        return i18n.t("Toggle title");
      }
      if (node.type.name === "paragraph") {
        return i18n.t('Write anything. Enter "/" for commands');
      }
    },
    includeChildren: true,
    showOnlyWhenEditable: true,
  }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Underline,
  LinkExtension.configure({
    openOnClick: false,
  }),
  Superscript,
  SubScript,
  Highlight.configure({
    multicolor: true,
  }),
  Typography,
  TrailingNode,
  CustomGlobalDragHandle.configure({
    dragHandleWidth: 40, // 增加宽度以容纳图标和手柄
    scrollTreshold: 100,
    // 添加自定义节点类型，以便拖拽手柄能正确识别它们
    customNodes: [
      'table', 
      'callout', 
      'details', 
      'codeBlock', 
      'image', 
      'video', 
      'attachment', 
      'gantt', 
      'embed', 
      'subpages', 
      'mathBlock'
    ],
    renderContent: (node) => {
      // 获取块类型的显示名称和图标
      const getBlockInfo = (node: any) => {
        const type = node.type.name;
        const attrs = node.attrs;
        
        // 标题类型
        if (type === 'heading') {
          const icons = [null, IconH1, IconH2, IconH3, IconH3, IconH3, IconH3];
          return {
            label: `H${attrs.level}`,
            icon: icons[attrs.level] || IconH1,
          };
        }
        
        // 其他块类型
        const blockInfo: Record<string, { label: string; icon: any }> = {
          'paragraph': { label: i18n.t('Text') || 'Text', icon: IconTypography },
          'bulletList': { label: i18n.t('Bullet List') || 'List', icon: IconList },
          'orderedList': { label: i18n.t('Numbered list') || 'Numbered', icon: IconListNumbers },
          'taskList': { label: i18n.t('To-do list') || 'To-do', icon: IconCheckbox },
          'blockquote': { label: i18n.t('Quote') || 'Quote', icon: IconQuote },
          'codeBlock': { label: i18n.t('Code') || 'Code', icon: IconCode },
          'callout': { label: i18n.t('Callout') || 'Callout', icon: IconInfoCircle },
          'table': { label: i18n.t('Table') || 'Table', icon: IconTable },
          'tableRow': { label: i18n.t('Table') || 'Table', icon: IconTable },
          'image': { label: i18n.t('Image') || 'Image', icon: IconPhoto },
          'video': { label: i18n.t('Video') || 'Video', icon: IconVideo },
          'attachment': { label: i18n.t('File attachment') || 'File', icon: IconPaperclip },
          'gantt': { label: i18n.t('Gantt chart') || 'Gantt', icon: IconCalendar },
          'details': { label: i18n.t('Toggle block') || 'Toggle', icon: IconListDetails },
          'detailsSummary': { label: i18n.t('Toggle block') || 'Toggle', icon: IconListDetails },
          'mathBlock': { label: i18n.t('Math block') || 'Math', icon: IconMath },
          'embed': { label: i18n.t('Iframe embed') || 'Embed', icon: IconAppWindow },
          'subpages': { label: i18n.t('Subpages (Child pages)') || 'Subpages', icon: IconSitemap },
          'excalidraw': { label: i18n.t('Excalidraw') || 'Excalidraw', icon: IconPhoto },
          'drawio': { label: i18n.t('Draw.io') || 'Draw.io', icon: IconPhoto },
        };
        
        return blockInfo[type] || { label: type, icon: IconTypography };
      };
      
      const { label, icon: IconComponent } = getBlockInfo(node);
      
      // 使用 React.createElement 创建 React 元素，而不是 DOM 元素
      return React.createElement('div', { className: 'drag-handle-container' },
        React.createElement('div', { className: 'block-type-label' },
           IconComponent ? 
             React.createElement('span', { className: 'block-type-icon' },
               React.createElement(IconComponent as any, { size: 16, stroke: 1.5 })
             ) : (label.substring(0, 2) || "?")
        ),
        React.createElement('div', { className: 'drag-handle-icon' })
      );
    },
  }),
  TextStyle,
  Color,
  SlashCommand,
  EmojiCommand,
  Comment.configure({
    HTMLAttributes: {
      class: "comment-mark",
    },
  }),
  Mention.configure({
    suggestion: {
      allowSpaces: true,
      items: () => {
        return [];
      },
      // @ts-ignore
      render: mentionRenderItems,
    },
    HTMLAttributes: {
      class: "mention",
    },
  }).extend({
    addNodeView() {
      return ReactNodeViewRenderer(MentionView);
    },
  }),
  CustomTable.configure({
    resizable: true,
    lastColumnResizable: true,
    allowTableNodeSelection: true,
  }),
  TableRow,
  TableCell,
  TableHeader,
  TableDndExtension,
  MathInline.configure({
    view: MathInlineView,
  }),
  MathBlock.configure({
    view: MathBlockView,
  }),
  Details,
  DetailsSummary,
  DetailsContent,
  Youtube.configure({
    addPasteHandler: false,
    controls: true,
    nocookie: true,
  }),
  TiptapImage.configure({
    view: ImageView,
    allowBase64: false,
  }),
  TiptapVideo.configure({
    view: VideoView,
  }),
  Callout.configure({
    view: CalloutView,
  }),
  CustomCodeBlock.configure({
    view: CodeBlockView,
    lowlight,
    HTMLAttributes: {
      spellcheck: false,
    },
  }),
  Selection,
  Attachment.configure({
    view: AttachmentView,
  }),
  Drawio.configure({
    view: DrawioView,
  }),
  Excalidraw.configure({
    view: ExcalidrawView,
  }),
  Embed.configure({
    view: EmbedView,
  }),
  Subpages.configure({
    view: SubpagesView,
  }),
  Gantt.configure({
    view: GanttView,
  }),
  MarkdownClipboard.configure({
    transformPastedText: true,
  }),
  CharacterCount.configure({
    wordCounter: (text) => countWords(text),
  }),
  SearchAndReplace.extend({
    addKeyboardShortcuts() {
      return {
        'Mod-f': () => {
          const event = new CustomEvent("openFindDialogFromEditor", {});
          document.dispatchEvent(event);
          return true;
        },
        'Escape': () => {
          const event = new CustomEvent("closeFindDialogFromEditor", {});
          document.dispatchEvent(event);
          return true;
        },
      }
    },
  }).configure(),
] as any;

type CollabExtensions = (provider: HocuspocusProvider, user: IUser) => any[];

export const collabExtensions: CollabExtensions = (provider, user) => [
  Collaboration.configure({
    document: provider.document,
  }),
  CollaborationCursor.configure({
    provider,
    user: {
      name: user.name,
      color: randomElement(userColors),
    },
  }),
];
