import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export interface GanttOptions {
  HTMLAttributes: Record<string, any>;
  view: any;
}

export interface GanttTask {
  id: string;
  name: string;
  status?: string;
  note?: string;
  startDate: string;
  endDate: string;
}

export interface CustomField {
  id: string;
  name: string;
  type: string;
  options?: string[];
  defaultValue?: any;
  order?: number;
}

export interface GanttSettings {
  startDate?: string;
  endDate?: string;
  titleField?: string;
  barColor?: string;
  workdaysOnly?: boolean;  // 是否仅计算工作日
  customWorkdays?: number[];  // 自定义工作日 (0=周日, 1=周一, ..., 6=周六)
}

export interface FilterCondition {
  id: string;
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'isEmpty' | 'isNotEmpty';
  value: any;
}

export interface SortCondition {
  id: string;
  fieldId: string;
  direction: 'asc' | 'desc';
}

export interface GroupCondition {
  fieldId: string;
}

export interface GanttViewConfig {
  filterConditions?: FilterCondition[];
  filterLogic?: 'and' | 'or';
  sortConditions?: SortCondition[];
  autoSort?: boolean;
  groupCondition?: GroupCondition | null;
}

export interface Milestone {
  id: string;
  date: string;
  name: string;
}

export interface GanttAttributes {
  tasks?: GanttTask[];
  viewMode?: 'week' | 'month' | 'quarter' | 'year';
  hiddenColumns?: string[];
  customFields?: CustomField[];
  ganttSettings?: GanttSettings;
  viewConfig?: GanttViewConfig;
  milestones?: Milestone[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    gantt: {
      setGantt: (attributes?: GanttAttributes) => ReturnType;
    };
  }
}

export const Gantt = Node.create<GanttOptions>({
  name: 'gantt',
  inline: false,
  group: 'block',
  isolating: true,
  atom: true,
  defining: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      view: null,
    };
  },

  addAttributes() {
    return {
      tasks: {
        default: [],
        parseHTML: (element) => {
          const data = element.getAttribute('data-tasks');
          return data ? JSON.parse(data) : [];
        },
        renderHTML: (attributes: GanttAttributes) => ({
          'data-tasks': JSON.stringify(attributes.tasks || []),
        }),
      },
      viewMode: {
        default: 'week',
        parseHTML: (element) => element.getAttribute('data-view-mode') || 'week',
        renderHTML: (attributes: GanttAttributes) => ({
          'data-view-mode': attributes.viewMode,
        }),
      },
      hiddenColumns: {
        default: [],
        parseHTML: (element) => {
          const data = element.getAttribute('data-hidden-columns');
          return data ? JSON.parse(data) : [];
        },
        renderHTML: (attributes: GanttAttributes) => ({
          'data-hidden-columns': JSON.stringify(attributes.hiddenColumns || []),
        }),
      },
      customFields: {
        default: [],
        parseHTML: (element) => {
          const data = element.getAttribute('data-custom-fields');
          return data ? JSON.parse(data) : [];
        },
        renderHTML: (attributes: GanttAttributes) => ({
          'data-custom-fields': JSON.stringify(attributes.customFields || []),
        }),
      },
      ganttSettings: {
        default: {},
        parseHTML: (element) => {
          const data = element.getAttribute('data-gantt-settings');
          return data ? JSON.parse(data) : {};
        },
        renderHTML: (attributes: GanttAttributes) => ({
          'data-gantt-settings': JSON.stringify(attributes.ganttSettings || {}),
        }),
      },
      viewConfig: {
        default: {},
        parseHTML: (element) => {
          const data = element.getAttribute('data-view-config');
          return data ? JSON.parse(data) : {};
        },
        renderHTML: (attributes: GanttAttributes) => ({
          'data-view-config': JSON.stringify(attributes.viewConfig || {}),
        }),
      },
      milestones: {
        default: [],
        parseHTML: (element) => {
          const data = element.getAttribute('data-milestones');
          return data ? JSON.parse(data) : [];
        },
        renderHTML: (attributes: GanttAttributes) => ({
          'data-milestones': JSON.stringify(attributes.milestones || []),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        { 'data-type': this.name },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
    ];
  },

  addCommands() {
    return {
      setGantt:
        (attrs: GanttAttributes = {}) =>
        ({ commands }) => {
          // Create default tasks if none provided
          const today = new Date();
          const defaultTasks: GanttTask[] = attrs.tasks || [
            {
              id: '1',
              name: '任务 1',
              status: '',
              note: '',
              startDate: today.toISOString().split('T')[0],
              endDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
            {
              id: '2',
              name: '任务 2',
              status: '',
              note: '',
              startDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              endDate: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
            {
              id: '3',
              name: '任务 3',
              status: '',
              note: '',
              startDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              endDate: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
          ];

          return commands.insertContent({
            type: 'gantt',
            attrs: {
              tasks: defaultTasks,
              viewMode: attrs.viewMode || 'week',
              hiddenColumns: attrs.hiddenColumns || [],
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(this.options.view);
  },
});
