import { NodeViewWrapper } from '@tiptap/react';
import React, { useState, useMemo } from 'react';
import { useAtom, useSetAtom, type SetStateAction } from 'jotai';
import { asideStateAtom } from '@/components/layouts/global/hooks/atoms/sidebar-atom';
import { taskReferenceAtom, type TaskReference } from '@/features/comment/atoms/comment-atom';
import { Box, Button, Group, Modal, TextInput, Textarea, Checkbox, Menu, Stack, Text, Select, MultiSelect, Avatar } from '@mantine/core';
import { DatePickerInput, DatesProvider } from '@mantine/dates';
import 'dayjs/locale/zh-cn';
import { useWorkspaceMembersQuery } from '@/features/workspace/queries/workspace-query';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  IconPlus, 
  IconTypography, 
  IconCircleDot, 
  IconCircleCheck, 
  IconUser, 
  IconUsers, 
  IconCalendar, 
  IconPaperclip, 
  IconHash, 
  IconSquareCheck, 
  IconLink, 
  IconMathFunction, 
  IconFileText, 
  IconGitBranch, 
  IconListNumbers,
  IconCalendarEvent,
  IconX,
  IconSettings,
  IconColumns,
  IconFilter,
  IconArrowsSort,
  IconLayoutList,
  IconMessage,
  IconMaximize,
  IconGripVertical,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconLock,
  IconChevronDown,
  IconChevronUp,
  IconChevronRight,
  IconDeviceFloppy,
  IconCalendarX,
  IconInfoCircle,
  IconMessagePlus,
  IconFlag,
  IconArrowUp,
  IconArrowDown
} from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { nanoid } from 'nanoid';
import classes from './gantt-view.module.css';

type FieldType = 'text' | 'select' | 'multiSelect' | 'person' | 'group' | 'date' | 'attachment' | 'number' | 'checkbox' | 'link' | 'formula' | 'reference' | 'workflow' | 'autoNumber';

interface CustomField {
  id: string;
  name: string;
  type: FieldType;
  options?: string[]; // For select/multiSelect
  defaultValue?: any;
  order?: number; // 字段排序
}

interface GanttSettings {
  startDate?: string;
  endDate?: string;
  startDateField?: string; // 开始时间字段ID
  endDateField?: string; // 结束时间字段ID
  titleField?: string; // 标题显示字段，默认为 'name'
  barColor?: string; // 进度条颜色
  workdaysOnly?: boolean; // 是否仅计算工作日
  customWorkdays?: number[]; // 自定义工作日 (0=周日, 1=周一, ..., 6=周六)
}

type FilterOperator = 'equals' | 'notEquals' | 'contains' | 'notContains' | 'isEmpty' | 'isNotEmpty';

type FilterLogic = 'and' | 'or';

interface FilterCondition {
  id: string;
  fieldId: string;
  operator: FilterOperator;
  value: any;
}

type SortDirection = 'asc' | 'desc';

interface SortCondition {
  id: string;
  fieldId: string;
  direction: SortDirection;
}

interface GroupCondition {
  fieldId: string;
}

interface GanttTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  [key: string]: any; // Custom fields
}

interface Milestone {
  id: string;
  date: string;
  name: string;
}

interface GanttViewProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  selected: boolean;
  editor: any;
}

type ViewMode = 'week' | 'month' | 'quarter' | 'year';

export function GanttView({ node, updateAttributes, editor }: GanttViewProps) {
  const tasks: GanttTask[] = node.attrs.tasks || [];
  const viewMode: ViewMode = node.attrs.viewMode || 'week';
  const hiddenColumns: string[] = node.attrs.hiddenColumns || [];
  const customFields: CustomField[] = node.attrs.customFields || [];
  const ganttSettings: GanttSettings = node.attrs.ganttSettings || {};
  const savedViewConfig = node.attrs.viewConfig || {};
  const milestones: Milestone[] = node.attrs.milestones || [];
  
  const [, setAsideState]: [any, (update: SetStateAction<{ tab: string; isAsideOpen: boolean }>) => void] = useAtom(asideStateAtom);
  const [, setTaskReference]: [any, (update: SetStateAction<TaskReference | null>) => void] = useAtom(taskReferenceAtom);

  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [isFieldConfigModalOpen, setIsFieldConfigModalOpen] = useState(false);
  const [isGanttSettingsModalOpen, setIsGanttSettingsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [newFieldOptions, setNewFieldOptions] = useState<string[]>(['']);
  const [newFieldAllowedUsers, setNewFieldAllowedUsers] = useState<string[]>([]);
  const [newFieldDateFormat, setNewFieldDateFormat] = useState<string>('YYYY/MM/DD');
  const [newFieldNumberFormat, setNewFieldNumberFormat] = useState<string>('integer');
  const [newFieldDefaultValue, setNewFieldDefaultValue] = useState<any>(null);
  const [showFieldTypeMenu, setShowFieldTypeMenu] = useState(false);
  const [resizingTask, setResizingTask] = useState<{ taskId: string; edge: 'start' | 'end' } | null>(null);
  const [draggingTask, setDraggingTask] = useState<{ taskId: string; startX: number; originalStartDate: Date; originalEndDate: Date } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ taskId: string; x: number; y: number; type: 'task' | 'bar' } | null>(null);
  const [insertRowCount, setInsertRowCount] = useState<number>(1);
  const [scrollableRef, setScrollableRef] = useState<HTMLDivElement | null>(null);
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>(savedViewConfig.filterConditions || []);
  const [filterLogic, setFilterLogic] = useState<FilterLogic>(savedViewConfig.filterLogic || 'and');
  const [sortConditions, setSortConditions] = useState<SortCondition[]>(savedViewConfig.sortConditions || []);
  const [autoSort, setAutoSort] = useState(savedViewConfig.autoSort !== undefined ? savedViewConfig.autoSort : true);
  const [groupCondition, setGroupCondition] = useState<GroupCondition | null>(savedViewConfig.groupCondition || null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [taskColumnWidth, setTaskColumnWidth] = useState(150); // 任务列的宽度
  const [isResizingColumn, setIsResizingColumn] = useState(false);
  const [hoveredDateIndex, setHoveredDateIndex] = useState<number | null>(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedDateForMilestone, setSelectedDateForMilestone] = useState<string | null>(null);
  const [milestoneName, setMilestoneName] = useState('');

  const isReadOnly = !editor.isEditable;

  // 获取工作空间成员列表
  const { data: membersData } = useWorkspaceMembersQuery({ limit: 100 });
  
  // 转换成员数据为选择器选项
  const userOptions = useMemo(() => {
    if (!membersData?.items) return [];
    return membersData.items.map(user => ({
      value: user.id,
      label: user.name || user.email,
    }));
  }, [membersData]);

  // 预设颜色方案
  const colorPresets = [
    { value: '#228be6', label: '蓝色' },
    { value: '#40c057', label: '绿色' },
    { value: '#fa5252', label: '红色' },
    { value: '#fd7e14', label: '橙色' },
    { value: '#be4bdb', label: '紫色' },
    { value: '#15aabf', label: '青色' },
    { value: '#fab005', label: '黄色' },
    { value: '#e64980', label: '粉色' },
  ];

  // 获取所有字段（包括内置字段和自定义字段）
  const allFields = useMemo(() => {
    const builtInFields: Array<CustomField & { isBuiltIn: boolean; locked: boolean }> = [
      { id: 'name', name: '任务名', type: 'text' as FieldType, isBuiltIn: true, locked: true, order: 0 },
    ];
    
    const customFieldsWithFlag = customFields.map((f, index) => ({ 
      ...f, 
      isBuiltIn: false, 
      locked: false,
      order: f.order ?? (1 + index)
    }));
    
    return [...builtInFields, ...customFieldsWithFlag].sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB;
    });
  }, [customFields]);

  // 获取可见字段（用于显示在表格中）
  const visibleFields = useMemo(() => {
    return allFields.filter(field => !hiddenColumns.includes(field.id));
  }, [allFields, hiddenColumns]);

  // 计算固定列的总宽度
  const fixedColumnWidth = useMemo(() => {
    return 40 + (visibleFields.length * taskColumnWidth); // 序号列40px + 每个字段的宽度
  }, [visibleFields, taskColumnWidth]);

  // 格式化日期
  const formatDate = (dateStr: string, dateFormat: string = 'YYYY/MM/DD') => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    
    const formatMap: Record<string, string> = {
      'YYYY/MM/DD': 'yyyy/MM/dd',
      'YYYY-MM-DD': 'yyyy-MM-dd',
      'MM/DD/YYYY': 'MM/dd/yyyy',
      'DD/MM/YYYY': 'dd/MM/yyyy',
      'YYYY年MM月DD日': 'yyyy年MM月dd日',
      'MM-DD': 'MM-dd',
    };
    
    const dateFnsFormat = formatMap[dateFormat] || 'yyyy/MM/dd';
    return format(date, dateFnsFormat, { locale: zhCN });
  };

  // 计算工作日天数
  const calculateWorkdays = (startDate: Date, endDate: Date, customWorkdays?: number[]) => {
    // 默认工作日：周一到周五 (1, 2, 3, 4, 5)
    const workdays = customWorkdays || [1, 2, 3, 4, 5];
    
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (workdays.includes(dayOfWeek)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  // 获取任务的实际开始和结束日期
  const getTaskDates = (task: GanttTask): { startDate: string | null; endDate: string | null } => {
    // 如果设置了字段映射，使用字段值
    if (ganttSettings.startDateField && task[ganttSettings.startDateField]) {
      const startDate = task[ganttSettings.startDateField];
      const endDate = ganttSettings.endDateField && task[ganttSettings.endDateField] 
        ? task[ganttSettings.endDateField] 
        : startDate; // 如果没有结束日期，使用开始日期
      return { startDate, endDate };
    }
    
    // 否则使用默认的 startDate 和 endDate 字段
    return {
      startDate: task.startDate || null,
      endDate: task.endDate || null
    };
  };

  // 计算任务持续天数
  const calculateDuration = (startDateStr: string, endDateStr: string) => {
    const startDate = new Date(startDateStr + 'T00:00:00');
    const endDate = new Date(endDateStr + 'T00:00:00');
    
    if (ganttSettings.workdaysOnly) {
      return calculateWorkdays(startDate, endDate, ganttSettings.customWorkdays);
    } else {
      // 自然日计算（包含周末）
      return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
  };

  // Calculate date range based on tasks
  const getDateRange = () => {
    const today = new Date();
    
    if (tasks.length === 0) {
      // Default ranges based on view mode
      switch (viewMode) {
        case 'week':
          return {
            start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
            end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21),
          };
        case 'month':
          return {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth() + 3, 0),
          };
        case 'quarter':
          // Show full year: 6 months before and 6 months after current month
          return {
            start: new Date(today.getFullYear(), today.getMonth() - 6, 1),
            end: new Date(today.getFullYear(), today.getMonth() + 6, 0),
          };
        case 'year':
          return {
            start: new Date(today.getFullYear() - 1, 0, 1),
            end: new Date(today.getFullYear() + 1, 11, 31),
          };
        default:
          return {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: new Date(today.getFullYear(), today.getMonth() + 3, 0),
          };
      }
    }

    // 只考虑有有效日期的任务
    const dates = tasks
      .map(t => getTaskDates(t))
      .filter(d => d.startDate && d.endDate) // 过滤掉没有日期的任务
      .flatMap(d => [new Date(d.startDate!), new Date(d.endDate!)]);
    
    // 如果没有有效日期的任务，使用默认范围
    if (dates.length === 0) {
      const today = new Date();
      switch (viewMode) {
        case 'week':
          return {
            start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
            end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21),
          };
        case 'month':
          return {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth() + 3, 0),
          };
        case 'quarter':
          return {
            start: new Date(today.getFullYear(), today.getMonth() - 6, 1),
            end: new Date(today.getFullYear(), today.getMonth() + 6, 0),
          };
        case 'year':
          return {
            start: new Date(today.getFullYear() - 1, 0, 1),
            end: new Date(today.getFullYear() + 1, 11, 31),
          };
        default:
          return {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: new Date(today.getFullYear(), today.getMonth() + 3, 0),
          };
      }
    }
    
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Add padding based on view mode
    const start = new Date(minDate);
    const end = new Date(maxDate);
    
    switch (viewMode) {
      case 'week':
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() + 84); // 向后延伸84天（12周）
        break;
      case 'month':
        start.setDate(1); // Start from first of month
        start.setMonth(start.getMonth() - 1);
        end.setMonth(end.getMonth() + 5); // 向后延伸4个月，+5是因为要到第5个月的第0天
        end.setDate(0); // 这样会得到第4个月的最后一天
        break;
      case 'quarter':
        // Show 12 months before and 14 months after
        start.setDate(1);
        start.setMonth(start.getMonth() - 12);
        end.setMonth(end.getMonth() + 15); // 向后延伸14个月，+15是因为要到第15个月的第0天
        end.setDate(0); // 这样会得到第14个月的最后一天
        break;
      case 'year':
        start.setMonth(0, 1); // Start from Jan 1 of previous year
        start.setFullYear(start.getFullYear() - 2);
        end.setFullYear(end.getFullYear() + 5); // 向后延伸4年，+5是因为要到第5年
        end.setMonth(0, 0); // 第5年的1月0日 = 第4年的12月31日
        break;
    }

    return { start, end };
  };

  const { start: rangeStart, end: rangeEnd } = getDateRange();

  // Generate date columns - always by day for accurate positioning
  const getDateColumns = () => {
    const columns: Date[] = [];
    // 标准化开始和结束日期，只保留日期部分，去除时间部分
    const start = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
    const end = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
    const current = new Date(start);

    // 使用日期的时间戳进行比较，确保包含结束日期
    while (current.getTime() <= end.getTime()) {
      columns.push(new Date(current));
      current.setDate(current.getDate() + 1); // Always increment by day
    }

    return columns;
  };

  const dateColumns = getDateColumns();

  // Get column width based on view mode
  const getColumnWidth = () => {
    switch (viewMode) {
      case 'week':
        return 160; // 周视图：每天 160px
      case 'month':
        return 60; // 月视图：每天 60px
      case 'quarter':
        return 14; // 季视图：每周 98px (98/7 = 14px per day)
      case 'year':
        return 5.25; // 年视图：每月 158px (158/30 ≈ 5.25px per day)
      default:
        return 60;
    }
  };

  const columnWidth = getColumnWidth();
  const timelineWidth = dateColumns.length * columnWidth;

  // Get week ranges for quarter view
  const getWeekRanges = () => {
    const ranges: { start: Date; end: Date; label: string }[] = [];
    let currentWeekStart = new Date(rangeStart);
    
    // Adjust to Monday
    const day = currentWeekStart.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    currentWeekStart.setDate(currentWeekStart.getDate() + diff);

    while (currentWeekStart <= rangeEnd) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const startDay = currentWeekStart.getDate();
      const endDay = weekEnd.getDate();
      const label = `${startDay}日 - ${endDay}日`;
      
      ranges.push({
        start: new Date(currentWeekStart),
        end: weekEnd,
        label
      });
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    return ranges;
  };

  // Get month groups for quarter/year view
  const getMonthGroups = () => {
    if (dateColumns.length === 0) return [];

    const groups: { year: number; month: number; startIndex: number; count: number }[] = [];
    
    // Get the range of months to display
    const firstDate = dateColumns[0];
    const lastDate = dateColumns[dateColumns.length - 1];
    
    let currentDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    const endDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
    
    // Iterate through all months in the range
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // Find all dates in this month
      const monthDates = dateColumns.filter(d => 
        d.getFullYear() === year && d.getMonth() === month
      );
      
      if (monthDates.length > 0) {
        // Find the start index of this month in dateColumns
        const startIndex = dateColumns.findIndex(d => 
          d.getFullYear() === year && d.getMonth() === month
        );
        
        groups.push({
          year,
          month,
          startIndex,
          count: monthDates.length
        });
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return groups;
  };

  // Determine which dates to show labels for based on view mode
  const shouldShowDateLabel = (date: Date, index: number) => {
    switch (viewMode) {
      case 'week':
        return true; // Show every day
      case 'month':
        return true; // Show every day in month view
      case 'quarter':
        return false; // Don't show individual dates, use week ranges
      case 'year':
        return false; // Don't show individual dates
      default:
        return true;
    }
  };

  const formatDateHeader = (date: Date) => {
    switch (viewMode) {
      case 'week':
      case 'month':
        return date.getDate().toString();
      default:
        return '';
    }
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const scrollToToday = () => {
    const today = new Date();
    const todayIndex = dateColumns.findIndex(d => 
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
    
    if (todayIndex >= 0 && scrollableRef) {
      // 根据视图模式计算偏移量，让"今天"在第二列位置
      let offset = 0;
      switch (viewMode) {
        case 'week':
          // 周视图：显示前1天，今天在第二列
          offset = 1;
          break;
        case 'month':
          // 月视图：显示前1天，今天在第二列
          offset = 1;
          break;
        case 'quarter':
          // 季视图：显示前1周（7天），今天在第二列
          offset = 7;
          break;
        case 'year':
          // 年视图：显示前1月（30天），今天在第二列
          offset = 30;
          break;
      }
      
      const scrollPosition = Math.max(0, (todayIndex - offset)) * columnWidth;
      scrollableRef.scrollLeft = scrollPosition;
    }
  };

  // 组件加载时自动滚动到今天
  React.useEffect(() => {
    if (scrollableRef && dateColumns.length > 0) {
      // 使用 setTimeout 确保 DOM 已经渲染完成
      setTimeout(() => {
        scrollToToday();
      }, 100);
    }
  }, [scrollableRef, dateColumns.length, viewMode]);

  // Get current month/year display
  const getCurrentPeriod = () => {
    if (dateColumns.length === 0) return '';
    const firstDate = dateColumns[0];
    return `${firstDate.getFullYear()}年${firstDate.getMonth() + 1}月`;
  };

  const calculateTaskPosition = (task: GanttTask) => {
    // 获取任务的实际日期
    const { startDate: taskStartDateStr, endDate: taskEndDateStr } = getTaskDates(task);
    
    // 如果没有日期，返回空
    if (!taskStartDateStr || !taskEndDateStr) {
      return null;
    }
    
    // 解析任务的开始和结束日期（只取日期部分，忽略时间）
    const taskStartDate = new Date(taskStartDateStr + 'T00:00:00');
    const taskEndDate = new Date(taskEndDateStr + 'T00:00:00');
    
    // 在dateColumns中找到开始日期的索引
    const startIndex = dateColumns.findIndex(d => {
      const colDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const taskDate = new Date(taskStartDate.getFullYear(), taskStartDate.getMonth(), taskStartDate.getDate());
      return colDate.getTime() === taskDate.getTime();
    });
    
    // 在dateColumns中找到结束日期的索引（结束日期应该包含整天，所以+1）
    const endIndex = dateColumns.findIndex(d => {
      const colDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const taskDate = new Date(taskEndDate.getFullYear(), taskEndDate.getMonth(), taskEndDate.getDate());
      return colDate.getTime() === taskDate.getTime();
    });
    
    if (startIndex === -1 || endIndex === -1) {
      // 如果找不到日期，使用原来的计算方式
      const totalDays = dateColumns.length;
      const startOffset = (taskStartDate.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24);
      const duration = (taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
      const left = (startOffset / totalDays) * 100;
      const width = (duration / totalDays) * 100;
      return { left: `${Math.max(0, left)}%`, width: `${Math.min(100 - left, width)}%` };
    }
    
    // 基于索引计算位置（结束日期+1是为了包含整个结束日）
    const totalDays = dateColumns.length;
    const left = (startIndex / totalDays) * 100;
    const width = ((endIndex - startIndex + 1) / totalDays) * 100;

    return { left: `${Math.max(0, left)}%`, width: `${Math.min(100 - left, width)}%` };
  };

  const handleTaskClick = (task: GanttTask) => {
    if (isReadOnly) return;
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleAddTask = () => {
    if (isReadOnly) return;
    const today = new Date();
    const newTask: GanttTask = {
      id: nanoid(),
      name: '新任务',
      startDate: today.toISOString().split('T')[0],
      endDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    
    // 应用自定义字段的默认值
    customFields.forEach(field => {
      if (field.defaultValue !== undefined && field.defaultValue !== null) {
        newTask[field.id] = field.defaultValue;
      }
    });
    
    setEditingTask(newTask);
    setIsModalOpen(true);
  };

  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setNewFieldName(field.name);
    setNewFieldType(field.type);
    setNewFieldOptions(field.options || ['']);
    setNewFieldAllowedUsers(field.options || []);
    setNewFieldDateFormat((field as any).dateFormat || 'YYYY/MM/DD');
    setNewFieldNumberFormat((field as any).numberFormat || 'integer');
    setNewFieldDefaultValue(field.defaultValue || null);
    setIsAddFieldModalOpen(true);
  };

  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    
    // 如果是单选或多选，需要有至少一个非空选项
    if ((newFieldType === 'select' || newFieldType === 'multiSelect') && 
        newFieldOptions.filter(opt => opt.trim()).length === 0) {
      return;
    }
    
    if (editingField) {
      // 编辑现有字段
      const updatedField: CustomField = {
        ...editingField,
        name: newFieldName,
        type: newFieldType,
        options: newFieldType === 'person' 
          ? newFieldAllowedUsers
          : (newFieldType === 'select' || newFieldType === 'multiSelect') 
            ? newFieldOptions.filter(opt => opt.trim()) 
            : undefined,
        defaultValue: newFieldDefaultValue,
        ...(newFieldType === 'date' && { dateFormat: newFieldDateFormat }),
        ...(newFieldType === 'number' && { numberFormat: newFieldNumberFormat }),
      };
      const newCustomFields = customFields.map(f => f.id === editingField.id ? updatedField : f);
      updateAttributes({ customFields: newCustomFields });
    } else {
      // 新增字段
      const newFieldId = nanoid();
      const newField: CustomField = {
        id: newFieldId,
        name: newFieldName,
        type: newFieldType,
        options: newFieldType === 'person' 
          ? newFieldAllowedUsers
          : (newFieldType === 'select' || newFieldType === 'multiSelect') 
            ? newFieldOptions.filter(opt => opt.trim()) 
            : undefined,
        defaultValue: newFieldDefaultValue,
        ...(newFieldType === 'date' && { dateFormat: newFieldDateFormat }),
        ...(newFieldType === 'number' && { numberFormat: newFieldNumberFormat }),
      };
      const newCustomFields = [...customFields, newField];
      // 新增字段默认为隐藏状态
      const newHiddenColumns = [...hiddenColumns, newFieldId];
      updateAttributes({ 
        customFields: newCustomFields,
        hiddenColumns: newHiddenColumns
      });
    }
    
    setEditingField(null);
    setNewFieldName('');
    setNewFieldType('text');
    setNewFieldOptions(['']);
    setNewFieldAllowedUsers([]);
    setNewFieldDateFormat('YYYY/MM/DD');
    setNewFieldNumberFormat('integer');
    setNewFieldDefaultValue(null);
    setIsAddFieldModalOpen(false);
    setShowFieldTypeMenu(false);
  };

  const handleDeleteField = (fieldId: string) => {
    const newCustomFields = customFields.filter(f => f.id !== fieldId);
    updateAttributes({ customFields: newCustomFields });
  };

  // 字段拖拽排序
  const handleFieldDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(allFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 更新自定义字段的顺序
    const updatedCustomFields = customFields.map(field => {
      const newIndex = items.findIndex(f => f.id === field.id);
      return { ...field, order: newIndex };
    });

    updateAttributes({ customFields: updatedCustomFields });
  };

  // 切换字段可见性
  const toggleFieldVisibility = (fieldId: string) => {
    const newHiddenColumns = hiddenColumns.includes(fieldId)
      ? hiddenColumns.filter(c => c !== fieldId)
      : [...hiddenColumns, fieldId];
    updateAttributes({ hiddenColumns: newHiddenColumns });
  };

  // 保存甘特图设置
  const handleSaveGanttSettings = (settings: GanttSettings) => {
    updateAttributes({ ganttSettings: settings });
    setIsGanttSettingsModalOpen(false);
  };

  const handleTaskResize = (taskId: string, newStartDate: string, newEndDate: string) => {
    const newTasks = tasks.map(t => {
      if (t.id !== taskId) return t;
      
      // 根据配置更新对应的字段
      const updates: any = {};
      if (ganttSettings.startDateField) {
        updates[ganttSettings.startDateField] = newStartDate;
      } else {
        updates.startDate = newStartDate;
      }
      
      if (ganttSettings.endDateField) {
        updates[ganttSettings.endDateField] = newEndDate;
      } else {
        updates.endDate = newEndDate;
      }
      
      return { ...t, ...updates };
    });
    updateAttributes({ tasks: newTasks });
  };

  const handleMouseDown = (e: React.MouseEvent, taskId: string, edge: 'start' | 'end') => {
    if (isReadOnly) return;
    e.stopPropagation();
    setResizingTask({ taskId, edge });
  };

  const handleTaskBarMouseDown = (e: React.MouseEvent, taskId: string) => {
    if (isReadOnly) return;
    e.stopPropagation();
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const taskDates = getTaskDates(task);
    if (!taskDates.startDate || !taskDates.endDate) return;
    
    setDraggingTask({
      taskId,
      startX: e.clientX,
      originalStartDate: new Date(taskDates.startDate + 'T00:00:00'),
      originalEndDate: new Date(taskDates.endDate + 'T00:00:00'),
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 处理拖拽移动
    if (draggingTask && !isReadOnly) {
      const timeline = e.currentTarget as HTMLElement;
      const rect = timeline.getBoundingClientRect();
      const deltaX = e.clientX - draggingTask.startX;
      const dayWidth = rect.width / dateColumns.length;
      const daysDelta = Math.round(deltaX / dayWidth);
      
      if (daysDelta !== 0) {
        const newStartDate = new Date(draggingTask.originalStartDate);
        newStartDate.setDate(newStartDate.getDate() + daysDelta);
        
        const newEndDate = new Date(draggingTask.originalEndDate);
        newEndDate.setDate(newEndDate.getDate() + daysDelta);
        
        const newTasks = tasks.map(t => {
          if (t.id !== draggingTask.taskId) return t;
          
          // 根据配置更新对应的字段
          const updates: any = {};
          if (ganttSettings.startDateField) {
            updates[ganttSettings.startDateField] = newStartDate.toISOString().split('T')[0];
          } else {
            updates.startDate = newStartDate.toISOString().split('T')[0];
          }
          
          if (ganttSettings.endDateField) {
            updates[ganttSettings.endDateField] = newEndDate.toISOString().split('T')[0];
          } else {
            updates.endDate = newEndDate.toISOString().split('T')[0];
          }
          
          return { ...t, ...updates };
        });
        updateAttributes({ tasks: newTasks });
      }
      return;
    }
    
    // 处理调整大小
    if (!resizingTask || isReadOnly) return;

    const timeline = e.currentTarget as HTMLElement;
    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const totalDays = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
    const clickedDay = Math.floor((x / rect.width) * totalDays);
    const newDate = new Date(rangeStart);
    newDate.setDate(newDate.getDate() + clickedDay);
    const newDateStr = newDate.toISOString().split('T')[0];

    const task = tasks.find(t => t.id === resizingTask.taskId);
    if (!task) return;

    const taskDates = getTaskDates(task);
    if (!taskDates.startDate || !taskDates.endDate) return;

    if (resizingTask.edge === 'start') {
      const endDate = new Date(taskDates.endDate);
      if (newDate < endDate) {
        handleTaskResize(resizingTask.taskId, newDateStr, taskDates.endDate);
      }
    } else {
      const startDate = new Date(taskDates.startDate);
      if (newDate > startDate) {
        handleTaskResize(resizingTask.taskId, taskDates.startDate, newDateStr);
      }
    }
  };

  const handleMouseUp = () => {
    setResizingTask(null);
    setDraggingTask(null);
  };

  const handleSaveTask = () => {
    if (!editingTask) return;

    const existingIndex = tasks.findIndex(t => t.id === editingTask.id);
    const newTasks = [...tasks];

    if (existingIndex >= 0) {
      newTasks[existingIndex] = editingTask;
    } else {
      newTasks.push(editingTask);
    }

    updateAttributes({ tasks: newTasks });
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = () => {
    if (!editingTask) return;
    const newTasks = tasks.filter(t => t.id !== editingTask.id);
    updateAttributes({ tasks: newTasks });
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    updateAttributes({ viewMode: mode });
  };

  const toggleColumnVisibility = (column: string) => {
    const newHiddenColumns = hiddenColumns.includes(column)
      ? hiddenColumns.filter(c => c !== column)
      : [...hiddenColumns, column];
    updateAttributes({ hiddenColumns: newHiddenColumns });
  };

  const isColumnVisible = (column: string) => !hiddenColumns.includes(column);

  const fieldTypeOptions = [
    { value: 'text', label: '文本', icon: IconTypography, category: '常规' },
    { value: 'select', label: '单选', icon: IconCircleDot, category: '常规' },
    { value: 'multiSelect', label: '多选', icon: IconCircleCheck, category: '常规' },
    { value: 'person', label: '人员', icon: IconUser, category: '常规' },
    { value: 'group', label: '群组', icon: IconUsers, category: '常规' },
    { value: 'date', label: '日期', icon: IconCalendar, category: '常规' },
    { value: 'number', label: '数字', icon: IconHash, category: '常规' },
    { value: 'checkbox', label: '复选框', icon: IconSquareCheck, category: '常规' },
    { value: 'link', label: '超链接', icon: IconLink, category: '常规' },
  ];

  const getFieldIcon = (type: FieldType) => {
    const option = fieldTypeOptions.find(o => o.value === type);
    return option ? option.icon : IconTypography;
  };

  // 筛选操作符选项
  const filterOperatorOptions = [
    { value: 'equals', label: '等于' },
    { value: 'notEquals', label: '不等于' },
    { value: 'contains', label: '包含' },
    { value: 'notContains', label: '不包含' },
    { value: 'isEmpty', label: '为空' },
    { value: 'isNotEmpty', label: '不为空' },
  ];

  // 检查单个条件是否匹配
  const checkCondition = (task: GanttTask, condition: FilterCondition): boolean => {
    const fieldValue = task[condition.fieldId];
    const { operator, value } = condition;

    switch (operator) {
      case 'isEmpty':
        return fieldValue === null || fieldValue === undefined || fieldValue === '' || 
               (Array.isArray(fieldValue) && fieldValue.length === 0);
      
      case 'isNotEmpty':
        return fieldValue !== null && fieldValue !== undefined && fieldValue !== '' && 
               (!Array.isArray(fieldValue) || fieldValue.length > 0);
      
      case 'equals':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(value);
        }
        return String(fieldValue) === String(value);
      
      case 'notEquals':
        if (Array.isArray(fieldValue)) {
          return !fieldValue.includes(value);
        }
        return String(fieldValue) !== String(value);
      
      case 'contains':
        if (Array.isArray(fieldValue)) {
          return fieldValue.some(v => String(v).toLowerCase().includes(String(value).toLowerCase()));
        }
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      
      case 'notContains':
        if (Array.isArray(fieldValue)) {
          return !fieldValue.some(v => String(v).toLowerCase().includes(String(value).toLowerCase()));
        }
        return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      
      default:
        return true;
    }
  };

  // 应用筛选条件
  const applyFilters = (task: GanttTask): boolean => {
    if (filterConditions.length === 0) return true;

    // 根据逻辑类型应用筛选
    if (filterLogic === 'and') {
      // 所有条件都必须满足
      return filterConditions.every(condition => checkCondition(task, condition));
    } else {
      // 任一条件满足即可
      return filterConditions.some(condition => checkCondition(task, condition));
    }
  };

  // 比较两个值进行排序
  const compareValues = (a: any, b: any, field: any, direction: SortDirection): number => {
    const aValue = a[field.id];
    const bValue = b[field.id];

    // 处理空值
    if (aValue === null || aValue === undefined || aValue === '') {
      if (bValue === null || bValue === undefined || bValue === '') return 0;
      return direction === 'asc' ? 1 : -1; // 空值排在后面
    }
    if (bValue === null || bValue === undefined || bValue === '') {
      return direction === 'asc' ? -1 : 1;
    }

    let result = 0;

    switch (field.type) {
      case 'text':
        // 文本类型：使用 localeCompare 支持中文拼音排序
        result = String(aValue).localeCompare(String(bValue), 'zh-CN', { sensitivity: 'base' });
        break;

      case 'number':
        // 数字类型：直接数值比较
        result = Number(aValue) - Number(bValue);
        break;

      case 'date':
        // 日期类型：转换为时间戳比较
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        result = dateA - dateB;
        break;

      case 'checkbox':
        // 复选框：true > false
        result = (aValue === bValue) ? 0 : (aValue ? -1 : 1);
        break;

      case 'select':
        // 单选：按照选项顺序排序
        if (field.options && Array.isArray(field.options)) {
          const indexA = field.options.indexOf(aValue);
          const indexB = field.options.indexOf(bValue);
          result = indexA - indexB;
        } else {
          result = String(aValue).localeCompare(String(bValue), 'zh-CN');
        }
        break;

      case 'multiSelect':
        // 多选：按照第一个选项的顺序排序
        if (Array.isArray(aValue) && Array.isArray(bValue)) {
          if (field.options && Array.isArray(field.options)) {
            const firstA = aValue[0];
            const firstB = bValue[0];
            if (!firstA && !firstB) return 0;
            if (!firstA) return 1;
            if (!firstB) return -1;
            const indexA = field.options.indexOf(firstA);
            const indexB = field.options.indexOf(firstB);
            result = indexA - indexB;
          } else {
            const firstA = aValue[0] || '';
            const firstB = bValue[0] || '';
            result = String(firstA).localeCompare(String(firstB), 'zh-CN');
          }
        } else {
          result = 0;
        }
        break;

      case 'person':
        // 人员：按照用户名排序
        const userA = userOptions.find(u => u.value === aValue);
        const userB = userOptions.find(u => u.value === bValue);
        const nameA = userA?.label || String(aValue);
        const nameB = userB?.label || String(bValue);
        result = nameA.localeCompare(nameB, 'zh-CN');
        break;

      default:
        // 其他类型：按字符串排序
        result = String(aValue).localeCompare(String(bValue), 'zh-CN');
        break;
    }

    return direction === 'asc' ? result : -result;
  };

  // 应用排序
  const applySorting = (tasksToSort: GanttTask[]): GanttTask[] => {
    if (!autoSort || sortConditions.length === 0) {
      return tasksToSort;
    }

    return [...tasksToSort].sort((a, b) => {
      // 按照排序条件的顺序依次比较
      for (const condition of sortConditions) {
        const field = allFields.find(f => f.id === condition.fieldId);
        if (!field) continue;

        const result = compareValues(a, b, field, condition.direction);
        if (result !== 0) {
          return result;
        }
      }
      return 0;
    });
  };

  // 分组任务
  const groupedTasks = useMemo(() => {
    const filtered = tasks.filter(applyFilters);
    const sorted = applySorting(filtered);

    if (!groupCondition) {
      return [{ groupKey: null, groupLabel: null, tasks: sorted }];
    }

    const field = allFields.find(f => f.id === groupCondition.fieldId);
    if (!field) {
      return [{ groupKey: null, groupLabel: null, tasks: sorted }];
    }

    // 按字段值分组
    const groups = new Map<string, GanttTask[]>();
    
    sorted.forEach(task => {
      const fieldValue = task[groupCondition.fieldId];
      let groupKey: string;
      let groupLabel: string;

      if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
        groupKey = '__empty__';
        groupLabel = '(暂无)';
      } else if (Array.isArray(fieldValue)) {
        // 多选字段：为每个值创建一个分组
        if (fieldValue.length === 0) {
          groupKey = '__empty__';
          groupLabel = '(暂无)';
          if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
          }
          groups.get(groupKey)!.push(task);
        } else {
          fieldValue.forEach(val => {
            groupKey = String(val);
            groupLabel = String(val);
            if (!groups.has(groupKey)) {
              groups.set(groupKey, []);
            }
            groups.get(groupKey)!.push(task);
          });
        }
        return;
      } else if (field.type === 'person') {
        // 人员字段：显示人员名称
        const user = userOptions.find(u => u.value === fieldValue);
        groupKey = String(fieldValue);
        groupLabel = user ? user.label : String(fieldValue);
      } else if (field.type === 'date') {
        // 日期字段：格式化显示
        groupKey = String(fieldValue);
        groupLabel = formatDate(fieldValue, (field as any).dateFormat);
      } else if (field.type === 'checkbox') {
        // 复选框字段
        groupKey = fieldValue ? 'true' : 'false';
        groupLabel = fieldValue ? '已选中' : '未选中';
      } else {
        groupKey = String(fieldValue);
        groupLabel = String(fieldValue);
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(task);
    });

    // 转换为数组并排序分组
    const groupArray = Array.from(groups.entries()).map(([key, tasks]) => {
      const label = key === '__empty__' ? '(暂无)' : 
        tasks.length > 0 ? (() => {
          const firstTask = tasks[0];
          const fieldValue = firstTask[groupCondition.fieldId];
          
          if (Array.isArray(fieldValue)) {
            return key;
          } else if (field?.type === 'person') {
            const user = userOptions.find(u => u.value === fieldValue);
            return user ? user.label : key;
          } else if (field?.type === 'date' && fieldValue) {
            return formatDate(fieldValue, (field as any).dateFormat);
          } else if (field?.type === 'checkbox') {
            return fieldValue ? '已选中' : '未选中';
          }
          return key;
        })() : key;

      return { groupKey: key, groupLabel: label, tasks };
    });

    // 对分组进行排序
    if (field.type === 'select' && field.options) {
      // 单选字段：按选项顺序排序
      groupArray.sort((a, b) => {
        if (a.groupKey === '__empty__') return 1;
        if (b.groupKey === '__empty__') return -1;
        const indexA = field.options!.indexOf(a.groupKey);
        const indexB = field.options!.indexOf(b.groupKey);
        return indexA - indexB;
      });
    } else if (field.type === 'multiSelect' && field.options) {
      // 多选字段：按选项顺序排序
      groupArray.sort((a, b) => {
        if (a.groupKey === '__empty__') return 1;
        if (b.groupKey === '__empty__') return -1;
        const indexA = field.options!.indexOf(a.groupKey);
        const indexB = field.options!.indexOf(b.groupKey);
        return indexA - indexB;
      });
    } else {
      // 其他字段：按字母顺序排序
      groupArray.sort((a, b) => {
        if (a.groupKey === '__empty__') return 1;
        if (b.groupKey === '__empty__') return -1;
        return a.groupLabel.localeCompare(b.groupLabel, 'zh-CN');
      });
    }

    return groupArray;
  }, [tasks, filterConditions, filterLogic, sortConditions, autoSort, groupCondition, allFields, userOptions]);

  // 筛选和排序后的任务列表（用于向后兼容）
  const filteredTasks = useMemo(() => {
    return groupedTasks.flatMap(group => group.tasks);
  }, [groupedTasks]);

  // 添加筛选条件
  const handleAddFilterCondition = () => {
    const newCondition: FilterCondition = {
      id: nanoid(),
      fieldId: 'name',
      operator: 'equals',
      value: '',
    };
    setFilterConditions([...filterConditions, newCondition]);
    setHasUnsavedChanges(true);
  };

  // 更新筛选条件
  const handleUpdateFilterCondition = (id: string, updates: Partial<FilterCondition>) => {
    setFilterConditions(filterConditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
    setHasUnsavedChanges(true);
  };

  // 删除筛选条件
  const handleDeleteFilterCondition = (id: string) => {
    setFilterConditions(filterConditions.filter(c => c.id !== id));
    setHasUnsavedChanges(true);
  };

  // 清空所有筛选条件
  const handleClearFilters = () => {
    setFilterConditions([]);
    setHasUnsavedChanges(true);
  };

  // 添加排序条件
  const handleAddSortCondition = () => {
    const newCondition: SortCondition = {
      id: nanoid(),
      fieldId: 'name',
      direction: 'asc',
    };
    setSortConditions([...sortConditions, newCondition]);
    setHasUnsavedChanges(true);
  };

  // 更新排序条件
  const handleUpdateSortCondition = (id: string, updates: Partial<SortCondition>) => {
    setSortConditions(sortConditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
    setHasUnsavedChanges(true);
  };

  // 删除排序条件
  const handleDeleteSortCondition = (id: string) => {
    setSortConditions(sortConditions.filter(c => c.id !== id));
    setHasUnsavedChanges(true);
  };

  // 清空所有排序条件
  const handleClearSorts = () => {
    setSortConditions([]);
    setHasUnsavedChanges(true);
  };

  // 切换分组折叠状态
  const toggleGroupCollapse = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey);
    } else {
      newCollapsed.add(groupKey);
    }
    setCollapsedGroups(newCollapsed);
  };

  // 设置分组条件
  const handleSetGroupCondition = (fieldId: string | null) => {
    if (fieldId) {
      setGroupCondition({ fieldId });
    } else {
      setGroupCondition(null);
    }
    setIsGroupModalOpen(false);
    setHasUnsavedChanges(true);
  };

  // 清除分组
  const handleClearGroup = () => {
    setGroupCondition(null);
    setCollapsedGroups(new Set());
    setHasUnsavedChanges(true);
  };

  // 保存视图配置
  const handleSaveViewConfig = () => {
    const viewConfig = {
      filterConditions,
      filterLogic,
      sortConditions,
      autoSort,
      groupCondition,
    };
    updateAttributes({ viewConfig });
    setHasUnsavedChanges(false);
  };

  // 右键菜单处理
  const handleContextMenu = (e: React.MouseEvent, taskId: string, type: 'task' | 'bar' = 'bar') => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      taskId,
      x: e.clientX,
      y: e.clientY,
      type,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // 清除时间条（只清除日期，保留任务）
  const handleClearTimeBar = (taskId: string) => {
    console.log('清除时间条 - 任务ID:', taskId);
    console.log('清除前的任务列表:', tasks.map(t => ({ id: t.id, name: t.name, startDate: t.startDate, endDate: t.endDate })));
    
    const newTasks = tasks.map(t => 
      t.id === taskId 
        ? { ...t, startDate: '', endDate: '' } 
        : t
    );
    
    console.log('清除后的任务列表:', newTasks.map(t => ({ id: t.id, name: t.name, startDate: t.startDate, endDate: t.endDate })));
    
    updateAttributes({ tasks: newTasks });
    handleCloseContextMenu();
  };

  // 查看详情
  const handleViewDetails = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setIsModalOpen(true);
    }
    handleCloseContextMenu();
  };

  // 添加评论
  const handleAddComment = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      // 设置任务引用信息
      setTaskReference({
        taskId: task.id,
        taskName: task.name,
      });
      
      // 打开评论侧边栏
      setAsideState({
        tab: 'comments',
        isAsideOpen: true,
      });
    }
    handleCloseContextMenu();
  };

  // 删除记录
  const handleDeleteRecord = (taskId: string) => {
    const newTasks = tasks.filter(t => t.id !== taskId);
    updateAttributes({ tasks: newTasks });
    handleCloseContextMenu();
  };

  // 向上插入行
  const handleInsertRowsAbove = (taskId: string, count: number) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const newTasks = [...tasks];
    const today = new Date();
    
    for (let i = 0; i < count; i++) {
      const newTask: GanttTask = {
        id: nanoid(),
        name: '新任务',
        startDate: today.toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
      
      // 应用自定义字段的默认值
      customFields.forEach(field => {
        if (field.defaultValue !== undefined && field.defaultValue !== null) {
          newTask[field.id] = field.defaultValue;
        }
      });
      
      newTasks.splice(taskIndex, 0, newTask);
    }
    
    updateAttributes({ tasks: newTasks });
    handleCloseContextMenu();
  };

  // 向下插入行
  const handleInsertRowsBelow = (taskId: string, count: number) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const newTasks = [...tasks];
    const today = new Date();
    
    for (let i = 0; i < count; i++) {
      const newTask: GanttTask = {
        id: nanoid(),
        name: '新任务',
        startDate: today.toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
      
      // 应用自定义字段的默认值
      customFields.forEach(field => {
        if (field.defaultValue !== undefined && field.defaultValue !== null) {
          newTask[field.id] = field.defaultValue;
        }
      });
      
      newTasks.splice(taskIndex + 1 + i, 0, newTask);
    }
    
    updateAttributes({ tasks: newTasks });
    handleCloseContextMenu();
  };

  // 排序条件拖拽排序
  const handleSortDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sortConditions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSortConditions(items);
    setHasUnsavedChanges(true);
  };

  // 列宽调整
  const handleColumnResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingColumn(true);
  };

  const handleColumnResize = (e: MouseEvent) => {
    if (!isResizingColumn) return;
    
    const ganttContent = document.querySelector(`.${classes.ganttContent}`) as HTMLElement;
    if (!ganttContent) return;
    
    const rect = ganttContent.getBoundingClientRect();
    const newWidth = e.clientX - rect.left - 40; // 减去序号列的40px
    const fieldCount = visibleFields.length;
    
    if (fieldCount > 0) {
      const newTaskColumnWidth = Math.max(80, Math.min(300, newWidth / fieldCount)); // 限制在80-300px之间
      setTaskColumnWidth(newTaskColumnWidth);
    }
  };

  const handleColumnResizeEnd = () => {
    setIsResizingColumn(false);
  };

  // 添加全局鼠标事件监听
  React.useEffect(() => {
    if (isResizingColumn) {
      document.addEventListener('mousemove', handleColumnResize);
      document.addEventListener('mouseup', handleColumnResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleColumnResize);
        document.removeEventListener('mouseup', handleColumnResizeEnd);
      };
    }
  }, [isResizingColumn, visibleFields.length]);

  // 里程碑相关处理
  const handleMilestoneFlagClick = (dateIndex: number) => {
    if (isReadOnly) return;
    const date = dateColumns[dateIndex];
    // 使用本地日期格式，避免 UTC 时区问题
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // 检查是否已有里程碑
    const existingMilestone = milestones.find(m => m.date === dateStr);
    if (existingMilestone) {
      setMilestoneName(existingMilestone.name);
    } else {
      setMilestoneName('');
    }
    
    setSelectedDateForMilestone(dateStr);
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestone = () => {
    if (!selectedDateForMilestone || !milestoneName.trim()) return;
    
    const existingIndex = milestones.findIndex(m => m.date === selectedDateForMilestone);
    let newMilestones = [...milestones];
    
    if (existingIndex >= 0) {
      // 更新现有里程碑
      newMilestones[existingIndex] = {
        ...newMilestones[existingIndex],
        name: milestoneName.trim()
      };
    } else {
      // 添加新里程碑
      newMilestones.push({
        id: nanoid(),
        date: selectedDateForMilestone,
        name: milestoneName.trim()
      });
    }
    
    updateAttributes({ milestones: newMilestones });
    setIsMilestoneModalOpen(false);
    setMilestoneName('');
    setSelectedDateForMilestone(null);
  };

  const handleDeleteMilestone = () => {
    if (!selectedDateForMilestone) return;
    
    const newMilestones = milestones.filter(m => m.date !== selectedDateForMilestone);
    updateAttributes({ milestones: newMilestones });
    setIsMilestoneModalOpen(false);
    setMilestoneName('');
    setSelectedDateForMilestone(null);
  };

  return (
    <NodeViewWrapper className={classes.ganttWrapper} data-drag-handle>
      <Box className={classes.ganttContainer} onClick={handleCloseContextMenu}>
        {/* Toolbar */}
        <Group justify="space-between" mb="sm" className={classes.toolbar}>
          {/* 左侧快捷设置按钮 */}
          <Group gap="xs">
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              onClick={() => setIsFieldConfigModalOpen(true)}
              disabled={isReadOnly}
              title="字段配置"
            >
              <IconColumns size={18} />
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              onClick={() => setIsGanttSettingsModalOpen(true)}
              disabled={isReadOnly}
              title="甘特图设置"
            >
              <IconSettings size={18} />
            </Button>
            <Button
              size="xs"
              variant={filterConditions.length > 0 ? 'filled' : 'subtle'}
              color={filterConditions.length > 0 ? 'blue' : 'gray'}
              onClick={() => setIsFilterModalOpen(true)}
              title={`筛选${filterConditions.length > 0 ? ` (${filterConditions.length})` : ''}`}
            >
              <IconFilter size={18} />
            </Button>
            <Button
              size="xs"
              variant={sortConditions.length > 0 ? 'filled' : 'subtle'}
              color={sortConditions.length > 0 ? 'blue' : 'gray'}
              onClick={() => setIsSortModalOpen(true)}
              title={`排序${sortConditions.length > 0 ? ` (${sortConditions.length})` : ''}`}
            >
              <IconArrowsSort size={18} />
            </Button>
            <Button
              size="xs"
              variant={groupCondition ? 'filled' : 'subtle'}
              color={groupCondition ? 'blue' : 'gray'}
              onClick={() => setIsGroupModalOpen(true)}
              disabled={isReadOnly}
              title={groupCondition ? `分组 (${allFields.find(f => f.id === groupCondition.fieldId)?.name})` : '分组'}
            >
              <IconLayoutList size={18} />
            </Button>
            <Button
              size="xs"
              variant={hasUnsavedChanges ? 'filled' : 'subtle'}
              color={hasUnsavedChanges ? 'green' : 'gray'}
              onClick={handleSaveViewConfig}
              disabled={isReadOnly || !hasUnsavedChanges}
              title="保存配置"
            >
              <IconDeviceFloppy size={18} />
            </Button>
            {/* 暂时隐藏评论和全屏功能 */}
            {/* <Box style={{ width: '1px', height: '20px', background: 'var(--mantine-color-gray-3)' }} />
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              onClick={() => {}}
              title="评论"
            >
              <IconMessage size={18} />
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              onClick={() => {}}
              title="全屏"
            >
              <IconMaximize size={18} />
            </Button> */}
          </Group>

          {/* 右侧视图切换按钮 */}
          <Group gap="xs">
            <Button
              size="xs"
              variant={viewMode === 'week' ? 'filled' : 'light'}
              onClick={() => handleViewModeChange('week')}
              disabled={isReadOnly}
            >
              周
            </Button>
            <Button
              size="xs"
              variant={viewMode === 'month' ? 'filled' : 'light'}
              onClick={() => handleViewModeChange('month')}
              disabled={isReadOnly}
            >
              月
            </Button>
            <Button
              size="xs"
              variant={viewMode === 'quarter' ? 'filled' : 'light'}
              onClick={() => handleViewModeChange('quarter')}
              disabled={isReadOnly}
            >
              季
            </Button>
            <Button
              size="xs"
              variant={viewMode === 'year' ? 'filled' : 'light'}
              onClick={() => handleViewModeChange('year')}
              disabled={isReadOnly}
            >
              年
            </Button>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconCalendarEvent size={14} />}
              onClick={scrollToToday}
            >
              今天
            </Button>
          </Group>
        </Group>

        {/* Gantt Chart */}
        <Box className={classes.ganttContent}>
          {/* Fixed Left Column */}
          <Box className={classes.fixedColumn} style={{ width: `${fixedColumnWidth}px` }}>
            {/* Month Header Placeholder */}
            <Box className={classes.monthHeader} style={{ height: '36px' }}>
              {/* Empty space to align with month header */}
            </Box>
            <Box className={classes.ganttHeader}>
              <Box className={classes.taskColumn} style={{ width: '40px' }}>#</Box>
              {visibleFields.map(field => (
                <Box key={field.id} className={classes.taskColumn} style={{ width: `${taskColumnWidth}px` }}>
                  {field.name}
                </Box>
              ))}
            </Box>
            {/* Column Resizer */}
            <Box 
              className={classes.columnResizer}
              onMouseDown={handleColumnResizeStart}
              title="拖拽调整列宽"
            />
            <Box className={classes.ganttBody}>
              {groupedTasks.map((group, groupIndex) => {
                const isCollapsed = collapsedGroups.has(group.groupKey || '__no_group__');
                const showGroupHeader = group.groupKey !== null;
                
                return (
                  <React.Fragment key={group.groupKey || '__no_group__'}>
                    {showGroupHeader && (
                      <Box 
                        className={classes.groupHeader}
                        onClick={() => toggleGroupCollapse(group.groupKey!)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Box className={classes.taskColumn} style={{ width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isCollapsed ? <IconChevronRight size={16} /> : <IconChevronDown size={16} />}
                        </Box>
                        <Box className={classes.taskColumn} style={{ width: `${visibleFields.length * taskColumnWidth}px`, fontWeight: 600 }}>
                          {group.groupLabel} ({group.tasks.length})
                        </Box>
                      </Box>
                    )}
                    
                    {!isCollapsed && group.tasks.map((task, taskIndex) => {
                      // 计算全局索引
                      let globalIndex = 0;
                      for (let i = 0; i < groupIndex; i++) {
                        globalIndex += groupedTasks[i].tasks.length;
                      }
                      globalIndex += taskIndex + 1;
                      
                      return (
                        <Box key={task.id} className={classes.taskRow}>
                          <Box className={classes.taskColumn} style={{ width: '40px' }}>{globalIndex}</Box>
                          {visibleFields.map(field => (
                            <Box 
                              key={field.id}
                              className={classes.taskColumn} 
                              style={{ width: `${taskColumnWidth}px`, cursor: isReadOnly ? 'default' : 'pointer' }}
                              onClick={() => !isReadOnly && handleTaskClick(task)}
                              onContextMenu={(e) => handleContextMenu(e, task.id, 'task')}
                            >
                              {field.type === 'date' && task[field.id] 
                                ? formatDate(task[field.id], (field as any).dateFormat)
                                : field.type === 'checkbox'
                                ? (task[field.id] ? '✓' : '')
                                : field.type === 'multiSelect' && Array.isArray(task[field.id])
                                ? task[field.id].join(', ')
                                : task[field.id] || ''}
                            </Box>
                          ))}
                        </Box>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              {!isReadOnly && (
                <Box className={classes.addTaskRow} onClick={handleAddTask}>
                  <IconPlus size={16} />
                </Box>
              )}
            </Box>
          </Box>

          {/* Scrollable Right Area */}
          <Box className={classes.scrollableArea} ref={setScrollableRef}>
            {/* Top Header - Year for year view, Month for others */}
            <Box className={classes.monthHeader}>
              <Box className={classes.timeline} style={{ minWidth: `${timelineWidth}px`, position: 'relative' }}>
                {viewMode === 'year' ? (
                  // Show years for year view
                  (() => {
                    const yearGroups: { year: number; startIndex: number; count: number }[] = [];
                    let currentYear = -1;
                    let startIdx = 0;
                    let count = 0;
                    
                    getMonthGroups().forEach((group, i) => {
                      if (group.year !== currentYear) {
                        if (count > 0) {
                          yearGroups.push({ year: currentYear, startIndex: startIdx, count });
                        }
                        currentYear = group.year;
                        startIdx = group.startIndex;
                        count = group.count;
                      } else {
                        count += group.count;
                      }
                    });
                    if (count > 0) {
                      yearGroups.push({ year: currentYear, startIndex: startIdx, count });
                    }
                    
                    return yearGroups.map((yearGroup) => (
                      <Box 
                        key={yearGroup.year}
                        className={classes.monthLabel}
                        style={{ 
                          width: `${yearGroup.count * columnWidth}px`,
                          left: `${yearGroup.startIndex * columnWidth}px`,
                          position: 'absolute'
                        }}
                      >
                        {yearGroup.year}年
                      </Box>
                    ));
                  })()
                ) : (
                  // Show months for other views
                  getMonthGroups().map((group) => {
                    const leftOffset = group.startIndex * columnWidth;
                    const width = group.count * columnWidth;
                    
                    return (
                      <Box 
                        key={`${group.year}-${group.month}`}
                        className={classes.monthLabel}
                        style={{ 
                          width: `${width}px`,
                          left: `${leftOffset}px`,
                          position: 'absolute'
                        }}
                      >
                        {group.year}年{group.month + 1}月
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>

            <Box className={classes.ganttHeader}>
              <Box className={classes.timeline} style={{ minWidth: `${timelineWidth}px` }}>
                {viewMode === 'year' ? (
                  // Month columns for year view
                  getMonthGroups().map((group) => (
                    <Box 
                      key={`${group.year}-${group.month}`}
                      className={classes.monthColumn}
                      style={{ width: `${group.count * columnWidth}px` }}
                    >
                      {group.month + 1}月
                    </Box>
                  ))
                ) : viewMode === 'quarter' ? (
                  // Week ranges for quarter view
                  getWeekRanges().map((range, i) => {
                    const weekDays = Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    const width = weekDays * columnWidth;
                    return (
                      <Box 
                        key={i}
                        className={classes.weekColumn}
                        style={{ width: `${width}px` }}
                      >
                        {range.label}
                      </Box>
                    );
                  })
                ) : (
                  // Individual dates for week/month view
                  dateColumns.map((date, i) => {
                    // 使用本地日期格式
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;
                    const hasMilestone = milestones.some(m => m.date === dateStr);
                    
                    return (
                      <Box 
                        key={i} 
                        className={`${classes.dateColumn} ${isWeekend(date) ? classes.weekend : ''}`}
                        style={{ width: `${columnWidth}px`, position: 'relative' }}
                        onMouseEnter={() => setHoveredDateIndex(i)}
                        onMouseLeave={() => setHoveredDateIndex(null)}
                      >
                        {shouldShowDateLabel(date, i) ? formatDateHeader(date) : ''}
                        {!isReadOnly && (hoveredDateIndex === i || hasMilestone) && (
                          <Box 
                            className={classes.milestoneFlag}
                            onClick={() => handleMilestoneFlagClick(i)}
                            title="创建里程碑"
                            style={{ opacity: hasMilestone ? 1 : undefined }}
                          >
                            <IconFlag size={16} />
                          </Box>
                        )}
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>

            <Box className={classes.ganttBody} style={{ position: 'relative' }}>
              {/* 今天标记线 - 贯穿所有任务 */}
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayIndex = dateColumns.findIndex(d => {
                  const colDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                  return colDate.getTime() === today.getTime();
                });
                if (todayIndex >= 0) {
                  // 放在今天这一天的中间位置
                  const leftPosition = todayIndex * columnWidth + (columnWidth / 2);
                  return (
                    <Box 
                      className={classes.todayLine}
                      style={{ left: `${leftPosition}px` }}
                    />
                  );
                }
                return null;
              })()}
              
              {/* 里程碑线 - 贯穿所有任务 */}
              {milestones.map((milestone) => {
                const milestoneIndex = dateColumns.findIndex(d => {
                  // 使用本地日期格式进行匹配
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  const colDateStr = `${year}-${month}-${day}`;
                  return colDateStr === milestone.date;
                });
                
                if (milestoneIndex >= 0) {
                  const leftPosition = milestoneIndex * columnWidth + (columnWidth / 2);
                  return (
                    <Box 
                      key={milestone.id}
                      className={classes.milestoneLine}
                      style={{ left: `${leftPosition}px` }}
                    >
                      <Box className={classes.milestoneLabel}>
                        {milestone.name}
                      </Box>
                    </Box>
                  );
                }
                return null;
              })}
              
              {groupedTasks.map((group) => {
                const isCollapsed = collapsedGroups.has(group.groupKey || '__no_group__');
                const showGroupHeader = group.groupKey !== null;
                
                return (
                  <React.Fragment key={group.groupKey || '__no_group__'}>
                    {showGroupHeader && (
                      <Box className={classes.groupHeaderTimeline}>
                        <Box 
                          className={classes.timeline} 
                          style={{ minWidth: `${timelineWidth}px`, position: 'relative' }}
                        >
                          {(viewMode === 'week' || viewMode === 'month' || viewMode === 'quarter') && dateColumns.map((date, i) => (
                            <Box 
                              key={i} 
                              className={`${classes.dateCell} ${isWeekend(date) ? classes.weekend : ''}`}
                              style={{ width: `${columnWidth}px` }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {!isCollapsed && group.tasks.map((task) => (
                      <Box key={task.id} className={classes.taskRow}>
                        <Box 
                          className={classes.timeline} 
                          style={{ minWidth: `${timelineWidth}px`, position: 'relative' }}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                        >
                          {(viewMode === 'week' || viewMode === 'month' || viewMode === 'quarter') && dateColumns.map((date, i) => (
                            <Box 
                              key={i} 
                              className={`${classes.dateCell} ${isWeekend(date) ? classes.weekend : ''}`}
                              style={{ width: `${columnWidth}px` }}
                            />
                          ))}

                          {(() => {
                            // 获取任务的实际日期
                            const taskDates = getTaskDates(task);
                            
                            // 如果任务没有日期，不渲染进度条
                            if (!taskDates.startDate || !taskDates.endDate) {
                              console.log(`任务 ${task.id} (${task.name}) 没有日期，跳过渲染进度条`);
                              return null;
                            }
                            
                            console.log(`渲染任务 ${task.id} (${task.name}) 的进度条`);
                            const position = calculateTaskPosition(task);
                            
                            // 如果无法计算位置，跳过渲染
                            if (!position) {
                              return null;
                            }
                            
                            const duration = calculateDuration(taskDates.startDate, taskDates.endDate);
                            const durationText = ganttSettings.workdaysOnly 
                              ? `${duration} 工作日` 
                              : `${duration} 天`;
                            
                            // 估算文字宽度：任务名 + 天数 + 间距
                            const estimatedTextWidth = (task.name.length * 8) + (durationText.length * 7) + 30;
                            // 计算任务条的实际像素宽度
                            const barWidthPercent = parseFloat(position.width);
                            const barWidthPx = (barWidthPercent / 100) * timelineWidth;
                            
                            // 判断文字是否能放下（留一些余量）
                            const canFitText = barWidthPx > estimatedTextWidth;
                            
                            // 获取标题显示字段的值
                            const getTitleFieldValue = () => {
                              const fieldId = ganttSettings.titleField || 'name';
                              const fieldValue = task[fieldId];
                              
                              if (!fieldValue && fieldValue !== false && fieldValue !== 0) {
                                return task.name; // 如果字段值为空，回退到任务名
                              }
                              
                              // 根据字段类型格式化显示
                              const field = allFields.find(f => f.id === fieldId);
                              if (!field) return String(fieldValue);
                              
                              switch (field.type) {
                                case 'date':
                                  return formatDate(fieldValue, (field as any).dateFormat);
                                case 'checkbox':
                                  return fieldValue ? '✓' : '✗';
                                case 'multiSelect':
                                  return Array.isArray(fieldValue) ? fieldValue.join(', ') : String(fieldValue);
                                case 'person':
                                  // 如果是人员字段，可以显示人员名称
                                  const user = userOptions.find(u => u.value === fieldValue);
                                  return user ? user.label : String(fieldValue);
                                default:
                                  return String(fieldValue);
                              }
                            };
                            
                            const titleFieldValue = getTitleFieldValue();
                            
                            return (
                              <>
                                <Box
                                  className={classes.taskBar}
                                  style={{
                                    ...position,
                                    background: ganttSettings.barColor || '#228be6',
                                    cursor: isReadOnly ? 'pointer' : 'move',
                                  }}
                                  onClick={() => handleTaskClick(task)}
                                  onContextMenu={(e) => handleContextMenu(e, task.id)}
                                  onMouseDown={(e) => {
                                    // 如果点击的是调整大小的手柄，不触发拖拽
                                    const target = e.target as HTMLElement;
                                    if (target.classList.contains(classes.resizeHandle)) {
                                      return;
                                    }
                                    handleTaskBarMouseDown(e, task.id);
                                  }}
                                >
                                  {!isReadOnly && (
                                    <Box
                                      className={classes.resizeHandle}
                                      style={{ left: 0 }}
                                      onMouseDown={(e) => handleMouseDown(e, task.id, 'start')}
                                    />
                                  )}
                                  {canFitText && (
                                    <>
                                      <span className={classes.taskName}>{titleFieldValue}</span>
                                      <span className={classes.taskDuration}>{durationText}</span>
                                    </>
                                  )}
                                  {!isReadOnly && (
                                    <Box
                                      className={classes.resizeHandle}
                                      style={{ right: 0 }}
                                      onMouseDown={(e) => handleMouseDown(e, task.id, 'end')}
                                    />
                                  )}
                                </Box>
                                {!canFitText && (
                                  <Box className={classes.taskLabel} style={{ left: `calc(${position.left} + ${position.width})` }}>
                                    <span>{durationText}-{titleFieldValue}</span>
                                  </Box>
                                )}
                              </>
                            );
                          })()}
                        </Box>
                      </Box>
                    ))}
                  </React.Fragment>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <Text size="lg" fw={600}>
            {editingTask?.name || '新任务'}
          </Text>
        }
        size="lg"
        padding="xl"
        radius="md"
      >
        {editingTask && (
          <DatesProvider settings={{ locale: 'zh-cn', firstDayOfWeek: 1, weekendDays: [0, 6] }}>
          <Stack gap="lg">
            {/* 任务名 */}
            <Box>
              <Text size="xs" fw={500} c="dimmed" mb={8}>
                任务名称
              </Text>
              <TextInput
                value={editingTask.name}
                onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                placeholder="输入任务名称"
                size="md"
                styles={{
                  input: {
                    border: '1px solid var(--mantine-color-gray-3)',
                    borderRadius: 'var(--mantine-radius-sm)',
                    '&:focus': {
                      borderColor: 'var(--mantine-color-blue-5)',
                    }
                  }
                }}
              />
            </Box>

              {/* 自定义字段 */}
              {customFields.map(field => {
                const FieldIcon = getFieldIcon(field.type);
                return (
                  <Box key={field.id}>
                    <Group gap="xs" mb={8}>
                      <FieldIcon size={14} style={{ color: 'var(--mantine-color-gray-6)' }} />
                      <Text 
                        size="xs" 
                        fw={500}
                        c="dimmed"
                        style={{ cursor: isReadOnly ? 'default' : 'pointer' }}
                        onClick={() => !isReadOnly && handleEditField(field)}
                      >
                        {field.name}
                      </Text>
                    </Group>
                    <Group gap="xs" wrap="nowrap" style={{ width: '100%' }}>
                      {field.type === 'person' ? (
                        <Select
                          value={editingTask[field.id] || null}
                          onChange={(value) => setEditingTask({ ...editingTask, [field.id]: value })}
                          data={field.options && field.options.length > 0 
                            ? userOptions.filter(u => field.options?.includes(u.value))
                            : userOptions}
                          placeholder="请选择成员"
                          size="md"
                          style={{ flex: 1 }}
                          styles={{
                            input: {
                              border: '1px solid var(--mantine-color-gray-3)',
                              borderRadius: 'var(--mantine-radius-sm)',
                              '&:focus': {
                                borderColor: 'var(--mantine-color-blue-5)',
                              }
                            }
                          }}
                          searchable
                          clearable
                        />
                      ) : field.type === 'select' && field.options ? (
                        <Select
                          value={editingTask[field.id] || null}
                          onChange={(value) => setEditingTask({ ...editingTask, [field.id]: value })}
                          data={field.options}
                          placeholder="请选择"
                          size="md"
                          style={{ flex: 1 }}
                          styles={{
                            input: {
                              border: '1px solid var(--mantine-color-gray-3)',
                              borderRadius: 'var(--mantine-radius-sm)',
                              '&:focus': {
                                borderColor: 'var(--mantine-color-blue-5)',
                              }
                            }
                          }}
                          clearable
                        />
                      ) : field.type === 'multiSelect' && field.options ? (
                        <MultiSelect
                          value={editingTask[field.id] || []}
                          onChange={(value) => setEditingTask({ ...editingTask, [field.id]: value })}
                          data={field.options}
                          placeholder="请选择"
                          size="md"
                          style={{ flex: 1 }}
                          styles={{
                            input: {
                              border: '1px solid var(--mantine-color-gray-3)',
                              borderRadius: 'var(--mantine-radius-sm)',
                              '&:focus': {
                                borderColor: 'var(--mantine-color-blue-5)',
                              }
                            }
                          }}
                          clearable
                        />
                      ) : field.type === 'date' ? (
                        <DatePickerInput
                          value={editingTask[field.id] ? new Date(editingTask[field.id]) : null}
                          onChange={(date: any) => {
                            if (date) {
                              const dateObj = date instanceof Date ? date : new Date(date);
                              setEditingTask({ ...editingTask, [field.id]: dateObj.toISOString().split('T')[0] });
                            } else {
                              setEditingTask({ ...editingTask, [field.id]: null });
                            }
                          }}
                          placeholder="请选择日期"
                          valueFormat={(field as any).dateFormat || 'YYYY/MM/DD'}
                          size="md"
                          style={{ flex: 1 }}
                          styles={{
                            input: {
                              border: '1px solid var(--mantine-color-gray-3)',
                              borderRadius: 'var(--mantine-radius-sm)',
                              '&:focus': {
                                borderColor: 'var(--mantine-color-blue-5)',
                              }
                            }
                          }}
                          clearable
                        />
                      ) : field.type === 'number' ? (
                        <TextInput
                          type="number"
                          value={editingTask[field.id] ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              setEditingTask({ ...editingTask, [field.id]: null });
                              return;
                            }
                            
                            const numberFormat = (field as any).numberFormat || 'integer';
                            let numValue = parseFloat(value);
                            
                            // 根据格式处理数值
                            if (numberFormat === 'integer') {
                              numValue = Math.round(numValue);
                            } else if (numberFormat.startsWith('decimal-')) {
                              const decimals = parseInt(numberFormat.split('-')[1]);
                              numValue = parseFloat(numValue.toFixed(decimals));
                            }
                            
                            setEditingTask({ ...editingTask, [field.id]: numValue });
                          }}
                          onBlur={(e) => {
                            // 失焦时格式化显示
                            const value = editingTask[field.id];
                            if (value !== null && value !== undefined) {
                              const numberFormat = (field as any).numberFormat || 'integer';
                              if (numberFormat === 'integer') {
                                setEditingTask({ ...editingTask, [field.id]: Math.round(value) });
                              } else if (numberFormat.startsWith('decimal-')) {
                                const decimals = parseInt(numberFormat.split('-')[1]);
                                setEditingTask({ ...editingTask, [field.id]: parseFloat(value.toFixed(decimals)) });
                              }
                            }
                          }}
                          placeholder="请输入数字"
                          size="md"
                          style={{ flex: 1 }}
                          styles={{
                            input: {
                              border: '1px solid var(--mantine-color-gray-3)',
                              borderRadius: 'var(--mantine-radius-sm)',
                              '&:focus': {
                                borderColor: 'var(--mantine-color-blue-5)',
                              }
                            }
                          }}
                          step={(() => {
                            const numberFormat = (field as any).numberFormat || 'integer';
                            if (numberFormat.startsWith('decimal-')) {
                              const decimals = parseInt(numberFormat.split('-')[1]);
                              return Math.pow(10, -decimals);
                            }
                            return 1;
                          })()}
                        />
                      ) : field.type === 'checkbox' ? (
                        <Checkbox
                          checked={editingTask[field.id] || false}
                          onChange={(e) => setEditingTask({ ...editingTask, [field.id]: e.currentTarget.checked })}
                          size="md"
                          style={{ flex: 1 }}
                        />
                      ) : field.type === 'link' ? (
                        <Group gap="xs" style={{ flex: 1 }}>
                          <TextInput
                            value={editingTask[field.id] || ''}
                            onChange={(e) => setEditingTask({ ...editingTask, [field.id]: e.target.value })}
                            placeholder="请输入链接地址"
                            size="md"
                            style={{ flex: 1 }}
                            styles={{
                              input: {
                                border: '1px solid var(--mantine-color-gray-3)',
                                borderRadius: 'var(--mantine-radius-sm)',
                                '&:focus': {
                                  borderColor: 'var(--mantine-color-blue-5)',
                                }
                              }
                            }}
                          />
                          {editingTask[field.id] && (
                            <Button
                              component="a"
                              href={editingTask[field.id]}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="sm"
                              variant="light"
                            >
                              <IconLink size={16} />
                            </Button>
                          )}
                        </Group>
                      ) : (
                        <TextInput
                          value={editingTask[field.id] || ''}
                          onChange={(e) => setEditingTask({ ...editingTask, [field.id]: e.target.value })}
                          placeholder="请输入内容"
                          size="md"
                          style={{ flex: 1 }}
                          styles={{
                            input: {
                              border: '1px solid var(--mantine-color-gray-3)',
                              borderRadius: 'var(--mantine-radius-sm)',
                              '&:focus': {
                                borderColor: 'var(--mantine-color-blue-5)',
                              }
                            }
                          }}
                        />
                      )}
                      {!isReadOnly && (
                        <Button
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={() => handleDeleteField(field.id)}
                          p={4}
                        >
                          <IconX size={16} />
                        </Button>
                      )}
                    </Group>
                  </Box>
                );
              })}

              {/* 日期范围 */}
              <Box>
                <Text size="xs" fw={500} c="dimmed" mb={8}>
                  开始日期
                </Text>
                <DatePickerInput
                  value={editingTask.startDate ? new Date(editingTask.startDate) : null}
                  onChange={(date: any) => {
                    if (date) {
                      const dateObj = date instanceof Date ? date : new Date(date);
                      setEditingTask({ ...editingTask, startDate: dateObj.toISOString().split('T')[0] });
                    } else {
                      setEditingTask({ ...editingTask, startDate: '' });
                    }
                  }}
                  placeholder="选择开始日期"
                  valueFormat="YYYY/MM/DD"
                  size="md"
                  styles={{
                    input: {
                      border: '1px solid var(--mantine-color-gray-3)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      '&:focus': {
                        borderColor: 'var(--mantine-color-blue-5)',
                      }
                    }
                  }}
                  clearable
                />
              </Box>

              <Box>
                <Text size="xs" fw={500} c="dimmed" mb={8}>
                  截止日期
                </Text>
                <DatePickerInput
                  value={editingTask.endDate ? new Date(editingTask.endDate) : null}
                  onChange={(date: any) => {
                    if (date) {
                      const dateObj = date instanceof Date ? date : new Date(date);
                      setEditingTask({ ...editingTask, endDate: dateObj.toISOString().split('T')[0] });
                    } else {
                      setEditingTask({ ...editingTask, endDate: '' });
                    }
                  }}
                  placeholder="选择截止日期"
                  valueFormat="YYYY/MM/DD"
                  size="md"
                  styles={{
                    input: {
                      border: '1px solid var(--mantine-color-gray-3)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      '&:focus': {
                        borderColor: 'var(--mantine-color-blue-5)',
                      }
                    }
                  }}
                  clearable
                />
              </Box>

              {/* 新增字段按钮 */}
              {!isReadOnly && (
                <Button
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsAddFieldModalOpen(true);
                  }}
                  size="md"
                  fullWidth
                  mt="md"
                >
                  新增字段
                </Button>
              )}

            {/* 底部操作按钮 */}
            <Group justify="space-between" mt="xl" pt="lg" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
              {tasks.find(t => t.id === editingTask.id) ? (
                <Button 
                  color="red" 
                  variant="light" 
                  onClick={handleDeleteTask}
                  leftSection={<IconTrash size={16} />}
                >
                  删除任务
                </Button>
              ) : (
                <Box />
              )}
              <Group gap="sm">
                <Button 
                  variant="default" 
                  onClick={() => setIsModalOpen(false)}
                  size="md"
                >
                  取消
                </Button>
                <Button 
                  onClick={handleSaveTask}
                  size="md"
                >
                  保存
                </Button>
              </Group>
            </Group>
          </Stack>
          </DatesProvider>
        )}
      </Modal>

      {/* Add Field Modal */}
      <Modal
        opened={isAddFieldModalOpen}
        onClose={() => {
          setIsAddFieldModalOpen(false);
          setEditingField(null);
          setNewFieldName('');
          setNewFieldType('text');
          setNewFieldOptions(['']);
          setNewFieldAllowedUsers([]);
          setNewFieldDateFormat('YYYY/MM/DD');
          setNewFieldNumberFormat('integer');
          setNewFieldDefaultValue(null);
          setShowFieldTypeMenu(false);
        }}
        title={editingField ? '编辑字段' : '新增字段'}
        size="md"
      >
        <Stack gap="md">
          <Box>
            <Text size="sm" c="dimmed" mb="xs">标题</Text>
            <TextInput
              placeholder="请输入字段标题"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
            />
          </Box>

          <Box>
            <Text size="sm" c="dimmed" mb="xs">字段类型</Text>
            <Menu opened={showFieldTypeMenu} onChange={setShowFieldTypeMenu} width={300}>
              <Menu.Target>
                <Button
                  variant="default"
                  fullWidth
                  justify="space-between"
                  rightSection={<IconChevronRight size={16} />}
                  leftSection={React.createElement(getFieldIcon(newFieldType), { size: 16 })}
                >
                  {fieldTypeOptions.find(o => o.value === newFieldType)?.label || '文本'}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Box p="xs">
                  <Text size="xs" fw={600} c="dimmed" mb="xs">常规</Text>
                  {fieldTypeOptions.filter(o => o.category === '常规').map(option => (
                    <Menu.Item
                      key={option.value}
                      leftSection={<option.icon size={16} />}
                      onClick={() => {
                        setNewFieldType(option.value as FieldType);
                        setShowFieldTypeMenu(false);
                      }}
                    >
                      {option.label}
                    </Menu.Item>
                  ))}
                  <Text size="xs" fw={600} c="dimmed" mt="md" mb="xs">业务</Text>
                  {fieldTypeOptions.filter(o => o.category === '业务').map(option => (
                    <Menu.Item
                      key={option.value}
                      leftSection={<option.icon size={16} />}
                      onClick={() => {
                        setNewFieldType(option.value as FieldType);
                        setShowFieldTypeMenu(false);
                      }}
                    >
                      {option.label}
                    </Menu.Item>
                  ))}
                </Box>
              </Menu.Dropdown>
            </Menu>
          </Box>

          {/* 人员字段 - 选择可用成员 */}
          {newFieldType === 'person' && (
            <Box>
              <Text size="sm" c="dimmed" mb="xs">可选成员</Text>
              <Text size="xs" c="dimmed" mb="sm">
                选择可以在此字段中被分配的成员（不选择则所有成员都可用）
              </Text>
              <MultiSelect
                value={newFieldAllowedUsers}
                onChange={setNewFieldAllowedUsers}
                data={userOptions}
                placeholder="选择可用成员（留空表示所有成员）"
                searchable
                clearable
              />
            </Box>
          )}

          {/* 日期字段 - 日期格式 */}
          {newFieldType === 'date' && (
            <Box>
              <Text size="sm" c="dimmed" mb="xs">日期格式</Text>
              <Select
                value={newFieldDateFormat}
                onChange={(value) => setNewFieldDateFormat(value || 'YYYY/MM/DD')}
                data={(() => {
                  const now = new Date();
                  const year = now.getFullYear();
                  const month = String(now.getMonth() + 1).padStart(2, '0');
                  const day = String(now.getDate()).padStart(2, '0');
                  
                  return [
                    { value: 'YYYY/MM/DD', label: `${year}/${month}/${day}` },
                    { value: 'YYYY-MM-DD', label: `${year}-${month}-${day}` },
                    { value: 'MM/DD/YYYY', label: `${month}/${day}/${year}` },
                    { value: 'DD/MM/YYYY', label: `${day}/${month}/${year}` },
                    { value: 'YYYY年MM月DD日', label: `${year}年${month}月${day}日` },
                    { value: 'MM-DD', label: `${month}-${day}` },
                  ];
                })()}
              />
            </Box>
          )}

          {/* 数字字段 - 数字格式 */}
          {newFieldType === 'number' && (
            <Box>
              <Text size="sm" c="dimmed" mb="xs">数字格式</Text>
              <Select
                value={newFieldNumberFormat}
                onChange={(value) => setNewFieldNumberFormat(value || 'integer')}
                data={[
                  { value: 'integer', label: '整数' },
                  { value: 'thousand', label: '千分位' },
                  { value: 'thousand-decimal', label: '千分位（小数点）' },
                  { value: 'decimal-1', label: '保留 1 位小数' },
                  { value: 'decimal-2', label: '保留 2 位小数' },
                  { value: 'decimal-3', label: '保留 3 位小数' },
                  { value: 'decimal-4', label: '保留 4 位小数' },
                  { value: 'decimal-5', label: '保留 5 位小数' },
                  { value: 'decimal-6', label: '保留 6 位小数' },
                  { value: 'decimal-7', label: '保留 7 位小数' },
                  { value: 'decimal-8', label: '保留 8 位小数' },
                  { value: 'decimal-9', label: '保留 9 位小数' },
                  { value: 'percent', label: '百分比' },
                  { value: 'percent-decimal', label: '百分比（小数点）' },
                ]}
              />
            </Box>
          )}

          {/* 选项管理 - 仅在单选或多选时显示 */}
          {(newFieldType === 'select' || newFieldType === 'multiSelect') && (
            <Box>
              <Text size="sm" c="dimmed" mb="xs">选项内容</Text>
              <Stack gap="xs">
                {newFieldOptions.map((option, index) => (
                  <Group key={index} gap="xs">
                    <TextInput
                      placeholder={`选项${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const updated = [...newFieldOptions];
                        updated[index] = e.target.value;
                        setNewFieldOptions(updated);
                      }}
                      style={{ flex: 1 }}
                    />
                    {newFieldOptions.length > 1 && (
                      <Button
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => {
                          setNewFieldOptions(newFieldOptions.filter((_, i) => i !== index));
                        }}
                      >
                        删除
                      </Button>
                    )}
                  </Group>
                ))}
                <Button
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setNewFieldOptions([...newFieldOptions, ''])}
                  size="sm"
                >
                  添加选项
                </Button>
              </Stack>
              
              {/* 默认值选择器 - 单选/多选 */}
              <Box mt="md">
                <Text size="sm" c="dimmed" mb="xs">默认值</Text>
                {newFieldType === 'select' ? (
                  <Select
                    value={newFieldDefaultValue}
                    onChange={setNewFieldDefaultValue}
                    data={newFieldOptions.filter(opt => opt.trim())}
                    placeholder="请选择选项"
                    clearable
                  />
                ) : newFieldType === 'multiSelect' ? (
                  <MultiSelect
                    value={newFieldDefaultValue || []}
                    onChange={setNewFieldDefaultValue}
                    data={newFieldOptions.filter(opt => opt.trim())}
                    placeholder="请选择选项"
                    clearable
                  />
                ) : null}
              </Box>
            </Box>
          )}

          {/* 默认值选择器 - 人员字段 */}
          {newFieldType === 'person' && (
            <Box>
              <Text size="sm" c="dimmed" mb="xs">默认值</Text>
              <Select
                value={newFieldDefaultValue}
                onChange={setNewFieldDefaultValue}
                data={newFieldAllowedUsers.length > 0 
                  ? userOptions.filter(u => newFieldAllowedUsers.includes(u.value))
                  : userOptions}
                placeholder="请选择成员"
                searchable
                clearable
              />
            </Box>
          )}

          {/* 默认值选择器 - 日期字段 */}
          {newFieldType === 'date' && (
            <Box>
              <Text size="sm" c="dimmed" mb="xs">默认值</Text>
              <DatesProvider settings={{ locale: 'zh-cn', firstDayOfWeek: 1, weekendDays: [0, 6] }}>
                <DatePickerInput
                  value={newFieldDefaultValue ? new Date(newFieldDefaultValue) : null}
                  onChange={(date: any) => {
                    if (date) {
                      const dateObj = date instanceof Date ? date : new Date(date);
                      setNewFieldDefaultValue(dateObj.toISOString().split('T')[0]);
                    } else {
                      setNewFieldDefaultValue(null);
                    }
                  }}
                  placeholder="请选择日期"
                  clearable
                />
              </DatesProvider>
            </Box>
          )}

          {/* 默认值输入框 - 数字字段 */}
          {newFieldType === 'number' && (
            <Box>
              <Text size="sm" c="dimmed" mb="xs">默认值</Text>
              <TextInput
                type="number"
                value={newFieldDefaultValue || ''}
                onChange={(e) => setNewFieldDefaultValue(e.target.value ? Number(e.target.value) : null)}
                placeholder="请输入数字"
                step={(() => {
                  if (newFieldNumberFormat.startsWith('decimal-')) {
                    const decimals = parseInt(newFieldNumberFormat.split('-')[1]);
                    return Math.pow(10, -decimals);
                  }
                  return 1;
                })()}
              />
            </Box>
          )}

          {/* 默认值选择器 - 复选框字段 */}
          {newFieldType === 'checkbox' && (
            <Box>
              <Text size="sm" c="dimmed" mb="xs">默认值</Text>
              <Checkbox
                checked={newFieldDefaultValue || false}
                onChange={(e) => setNewFieldDefaultValue(e.currentTarget.checked)}
                label="默认选中"
              />
            </Box>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setIsAddFieldModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddField} disabled={!newFieldName.trim()}>
              确定
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 字段配置模态框 */}
      <Modal
        opened={isFieldConfigModalOpen}
        onClose={() => setIsFieldConfigModalOpen(false)}
        title="字段配置"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            点击眼睛图标显示字段，显示的字段可以拖拽调整顺序。新增字段默认为隐藏状态。
          </Text>
          
          <DragDropContext onDragEnd={handleFieldDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <Box {...provided.droppableProps} ref={provided.innerRef}>
                  {allFields.map((field, index) => (
                    <Draggable 
                      key={field.id} 
                      draggableId={field.id} 
                      index={index}
                      isDragDisabled={isReadOnly || field.locked}
                    >
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            marginBottom: '0.5rem',
                          }}
                        >
                          <Group
                            gap="xs"
                            p="sm"
                            style={{
                              border: '1px solid var(--mantine-color-gray-3)',
                              borderRadius: 'var(--mantine-radius-sm)',
                              background: snapshot.isDragging 
                                ? 'var(--mantine-color-gray-0)' 
                                : 'white',
                            }}
                          >
                            {/* 拖拽手柄 */}
                            <Box
                              {...provided.dragHandleProps}
                              style={{
                                cursor: field.locked ? 'not-allowed' : 'grab',
                                color: field.locked 
                                  ? 'var(--mantine-color-gray-4)' 
                                  : 'var(--mantine-color-gray-6)',
                              }}
                            >
                              {field.locked ? (
                                <IconLock size={16} />
                              ) : (
                                <IconGripVertical size={16} />
                              )}
                            </Box>

                            {/* 字段图标和名称 */}
                            <Group gap="xs" style={{ flex: 1 }}>
                              {React.createElement(getFieldIcon(field.type), { 
                                size: 16, 
                                style: { color: 'var(--mantine-color-gray-6)' } 
                              })}
                              <Text size="sm">{field.name}</Text>
                            </Group>

                            {/* 可见性切换 */}
                            <Button
                              size="xs"
                              variant="subtle"
                              color="gray"
                              onClick={() => toggleFieldVisibility(field.id)}
                              disabled={isReadOnly || field.locked}
                            >
                              {hiddenColumns.includes(field.id) ? (
                                <IconEyeOff size={16} />
                              ) : (
                                <IconEye size={16} />
                              )}
                            </Button>

                            {/* 操作菜单 */}
                            {!field.isBuiltIn && (
                              <Menu position="bottom-end">
                                <Menu.Target>
                                  <Button
                                    size="xs"
                                    variant="subtle"
                                    color="gray"
                                    disabled={isReadOnly}
                                  >
                                    <IconDots size={16} />
                                  </Button>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    leftSection={<IconEdit size={14} />}
                                    onClick={() => {
                                      handleEditField(field as CustomField);
                                      setIsFieldConfigModalOpen(false);
                                    }}
                                  >
                                    编辑
                                  </Menu.Item>
                                  <Menu.Item
                                    leftSection={<IconTrash size={14} />}
                                    color="red"
                                    onClick={() => handleDeleteField(field.id)}
                                  >
                                    删除
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            )}
                          </Group>
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>

          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setIsFieldConfigModalOpen(false);
              setIsAddFieldModalOpen(true);
            }}
            disabled={isReadOnly}
          >
            新增字段
          </Button>
        </Stack>
      </Modal>

      {/* 甘特图设置模态框 */}
      <Modal
        opened={isGanttSettingsModalOpen}
        onClose={() => setIsGanttSettingsModalOpen(false)}
        title="甘特图设置"
        size="md"
      >
        <GanttSettingsForm
          settings={ganttSettings}
          fields={allFields}
          colorPresets={colorPresets}
          onSave={handleSaveGanttSettings}
          onCancel={() => setIsGanttSettingsModalOpen(false)}
        />
      </Modal>

      {/* 筛选模态框 */}
      <Modal
        opened={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title={
          <Group gap="xs" justify="space-between" style={{ width: '100%' }}>
            <Group gap="xs">
              <Text>设置筛选条件</Text>
              {filterConditions.length > 0 && (
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={handleClearFilters}
                >
                  清空全部
                </Button>
              )}
            </Group>
            {filterConditions.length >= 2 && (
              <Group gap="xs">
                <Text size="sm" c="dimmed">符合以下</Text>
                <Select
                  value={filterLogic}
                  onChange={(value) => {
                    setFilterLogic((value as FilterLogic) || 'and');
                    setHasUnsavedChanges(true);
                  }}
                  data={[
                    { value: 'and', label: '所有' },
                    { value: 'or', label: '任一' },
                  ]}
                  size="xs"
                  style={{ width: '80px' }}
                />
                <Text size="sm" c="dimmed">条件</Text>
              </Group>
            )}
          </Group>
        }
        size="lg"
      >
        <Stack gap="md">
          {filterConditions.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              暂无筛选条件，点击下方按钮添加
            </Text>
          ) : (
            filterConditions.map((condition) => {
              const field = allFields.find(f => f.id === condition.fieldId);
              const customField = customFields.find(f => f.id === condition.fieldId);
              const needsValue = !['isEmpty', 'isNotEmpty'].includes(condition.operator);
              
              return (
                <Group key={condition.id} gap="xs" align="flex-start">
                  {/* 字段选择 */}
                  <Select
                    value={condition.fieldId}
                    onChange={(value) => {
                      if (value) {
                        handleUpdateFilterCondition(condition.id, { 
                          fieldId: value,
                          value: '' // 重置值
                        });
                      }
                    }}
                    data={allFields.map(f => ({
                      value: f.id,
                      label: f.name,
                    }))}
                    placeholder="选择字段"
                    style={{ flex: 1, minWidth: '150px' }}
                  />

                  {/* 操作符选择 */}
                  <Select
                    value={condition.operator}
                    onChange={(value) => {
                      if (value) {
                        handleUpdateFilterCondition(condition.id, { 
                          operator: value as FilterOperator,
                          value: ['isEmpty', 'isNotEmpty'].includes(value) ? undefined : condition.value
                        });
                      }
                    }}
                    data={filterOperatorOptions}
                    placeholder="选择条件"
                    style={{ flex: 1, minWidth: '120px' }}
                  />

                  {/* 值输入 */}
                  {needsValue && field && (
                    <Box style={{ flex: 1, minWidth: '200px' }}>
                      {field.type === 'select' && customField?.options ? (
                        <Select
                          value={condition.value}
                          onChange={(value) => handleUpdateFilterCondition(condition.id, { value })}
                          data={customField.options}
                          placeholder="请选择"
                          clearable
                        />
                      ) : field.type === 'multiSelect' && customField?.options ? (
                        <Select
                          value={condition.value}
                          onChange={(value) => handleUpdateFilterCondition(condition.id, { value })}
                          data={customField.options}
                          placeholder="请选择"
                          clearable
                        />
                      ) : field.type === 'person' ? (
                        <Select
                          value={condition.value}
                          onChange={(value) => handleUpdateFilterCondition(condition.id, { value })}
                          data={customField?.options && customField.options.length > 0 
                            ? userOptions.filter(u => customField.options?.includes(u.value))
                            : userOptions}
                          placeholder="请选择成员"
                          searchable
                          clearable
                        />
                      ) : field.type === 'date' ? (
                        <DatesProvider settings={{ locale: 'zh-cn', firstDayOfWeek: 1, weekendDays: [0, 6] }}>
                          <DatePickerInput
                            value={condition.value ? new Date(condition.value) : null}
                            onChange={(date: any) => {
                              if (date) {
                                const dateObj = date instanceof Date ? date : new Date(date);
                                handleUpdateFilterCondition(condition.id, { 
                                  value: dateObj.toISOString().split('T')[0] 
                                });
                              } else {
                                handleUpdateFilterCondition(condition.id, { value: null });
                              }
                            }}
                            placeholder="请选择日期"
                            clearable
                          />
                        </DatesProvider>
                      ) : field.type === 'number' ? (
                        <TextInput
                          type="number"
                          value={condition.value ?? ''}
                          onChange={(e) => handleUpdateFilterCondition(condition.id, { 
                            value: e.target.value ? Number(e.target.value) : '' 
                          })}
                          placeholder="请输入数字"
                        />
                      ) : field.type === 'checkbox' ? (
                        <Select
                          value={condition.value === true ? 'true' : condition.value === false ? 'false' : null}
                          onChange={(value) => handleUpdateFilterCondition(condition.id, { 
                            value: value === 'true' ? true : value === 'false' ? false : null 
                          })}
                          data={[
                            { value: 'true', label: '已选中' },
                            { value: 'false', label: '未选中' },
                          ]}
                          placeholder="请选择"
                          clearable
                        />
                      ) : (
                        <TextInput
                          value={condition.value || ''}
                          onChange={(e) => handleUpdateFilterCondition(condition.id, { 
                            value: e.target.value 
                          })}
                          placeholder="请输入"
                        />
                      )}
                    </Box>
                  )}

                  {/* 删除按钮 */}
                  <Button
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => handleDeleteFilterCondition(condition.id)}
                  >
                    <IconX size={16} />
                  </Button>
                </Group>
              );
            })
          )}

          {/* 添加条件按钮 */}
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={handleAddFilterCondition}
          >
            添加条件
          </Button>

          {/* 筛选结果提示 */}
          {filterConditions.length > 0 && (
            <Text size="sm" c="dimmed" ta="center">
              共 {tasks.length} 个任务，筛选后显示 {filteredTasks.length} 个
            </Text>
          )}
        </Stack>
      </Modal>

      {/* 分组模态框 */}
      <Modal
        opened={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title={
          <Group gap="xs" justify="space-between" style={{ width: '100%' }}>
            <Text>设置分组条件</Text>
            {groupCondition && (
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                onClick={handleClearGroup}
              >
                清除分组
              </Button>
            )}
          </Group>
        }
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            选择一个字段对任务进行分组显示
          </Text>

          {/* 字段选择列表 */}
          <Stack gap="xs">
            {allFields
              .filter(field => !field.locked) // 排除锁定字段（如任务名）
              .map(field => {
                const FieldIcon = getFieldIcon(field.type);
                const isSelected = groupCondition?.fieldId === field.id;
                
                return (
                  <Box
                    key={field.id}
                    onClick={() => handleSetGroupCondition(field.id)}
                    p="sm"
                    style={{
                      border: isSelected 
                        ? '2px solid var(--mantine-color-blue-6)' 
                        : '1px solid var(--mantine-color-gray-3)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      cursor: 'pointer',
                      background: isSelected 
                        ? 'var(--mantine-color-blue-0)' 
                        : 'white',
                      transition: 'all 0.2s',
                    }}
                    className={classes.groupFieldOption}
                  >
                    <Group gap="xs">
                      <FieldIcon size={18} style={{ color: 'var(--mantine-color-gray-6)' }} />
                      <Text size="sm" fw={isSelected ? 600 : 400}>
                        {field.name}
                      </Text>
                      {isSelected && (
                        <Box ml="auto">
                          <IconCircleCheck size={18} style={{ color: 'var(--mantine-color-blue-6)' }} />
                        </Box>
                      )}
                    </Group>
                  </Box>
                );
              })}
          </Stack>

          {/* 说明 */}
          {groupCondition && (
            <Box p="sm" style={{ 
              background: 'var(--mantine-color-blue-0)', 
              borderRadius: 'var(--mantine-radius-sm)' 
            }}>
              <Text size="xs" c="dimmed">
                • 任务将按照"{allFields.find(f => f.id === groupCondition.fieldId)?.name}"字段的值进行分组<br />
                • 点击分组标题可以折叠/展开该分组<br />
                • 分组仅在本地生效，不影响其他协作者
              </Text>
            </Box>
          )}
        </Stack>
      </Modal>

      {/* 排序模态框 */}
      <Modal
        opened={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        title={
          <Group gap="xs" justify="space-between" style={{ width: '100%' }}>
            <Group gap="xs">
              <Text>设置排序条件</Text>
              {sortConditions.length > 0 && (
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={handleClearSorts}
                >
                  清空全部
                </Button>
              )}
            </Group>
            <Group gap="xs">
              <Text size="sm" c="dimmed">自动排序</Text>
              <Checkbox
                checked={autoSort}
                onChange={(e) => {
                  setAutoSort(e.currentTarget.checked);
                  setHasUnsavedChanges(true);
                }}
              />
            </Group>
          </Group>
        }
        size="lg"
      >
        <Stack gap="md">
          {sortConditions.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              暂无排序条件，点击下方按钮添加
            </Text>
          ) : (
            <DragDropContext onDragEnd={handleSortDragEnd}>
              <Droppable droppableId="sort-conditions">
                {(provided) => (
                  <Box {...provided.droppableProps} ref={provided.innerRef}>
                    {sortConditions.map((condition, index) => {
                      const field = allFields.find(f => f.id === condition.fieldId);
                      const FieldIcon = field ? getFieldIcon(field.type) : IconTypography;
                      
                      // 根据字段类型确定排序方向的显示文本
                      const getSortDirectionLabel = (fieldType: FieldType, direction: SortDirection) => {
                        if (fieldType === 'number' || fieldType === 'date') {
                          return direction === 'asc' ? '0 → 9' : '9 → 0';
                        } else if (fieldType === 'select' || fieldType === 'multiSelect') {
                          return direction === 'asc' ? '选项顺序' : '选项倒序';
                        } else if (fieldType === 'checkbox') {
                          return direction === 'asc' ? '顺序' : '倒序';
                        } else {
                          // 文本类型
                          return direction === 'asc' ? 'A → Z' : 'Z → A';
                        }
                      };

                      return (
                        <Draggable 
                          key={condition.id} 
                          draggableId={condition.id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                marginBottom: '0.5rem',
                              }}
                            >
                              <Group
                                gap="xs"
                                p="sm"
                                align="center"
                                style={{
                                  border: '1px solid var(--mantine-color-gray-3)',
                                  borderRadius: 'var(--mantine-radius-sm)',
                                  background: snapshot.isDragging 
                                    ? 'var(--mantine-color-gray-0)' 
                                    : 'white',
                                }}
                              >
                                {/* 拖拽手柄 */}
                                <Box
                                  {...provided.dragHandleProps}
                                  style={{
                                    cursor: 'grab',
                                    color: 'var(--mantine-color-gray-6)',
                                  }}
                                >
                                  <IconGripVertical size={16} />
                                </Box>

                                {/* 字段选择 */}
                                <Select
                                  value={condition.fieldId}
                                  onChange={(value) => {
                                    if (value) {
                                      handleUpdateSortCondition(condition.id, { fieldId: value });
                                    }
                                  }}
                                  data={allFields.map(f => ({
                                    value: f.id,
                                    label: f.name,
                                  }))}
                                  placeholder="选择字段"
                                  style={{ flex: 1, minWidth: '150px' }}
                                  leftSection={<FieldIcon size={16} />}
                                />

                                {/* 排序方向按钮组 */}
                                <Group gap={4}>
                                  <Button
                                    size="sm"
                                    variant={condition.direction === 'asc' ? 'filled' : 'light'}
                                    onClick={() => handleUpdateSortCondition(condition.id, { direction: 'asc' })}
                                    style={{ minWidth: '100px' }}
                                  >
                                    {field && getSortDirectionLabel(field.type, 'asc')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={condition.direction === 'desc' ? 'filled' : 'light'}
                                    onClick={() => handleUpdateSortCondition(condition.id, { direction: 'desc' })}
                                    style={{ minWidth: '100px' }}
                                  >
                                    {field && getSortDirectionLabel(field.type, 'desc')}
                                  </Button>
                                </Group>

                                {/* 删除按钮 */}
                                <Button
                                  size="sm"
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleDeleteSortCondition(condition.id)}
                                >
                                  <IconX size={16} />
                                </Button>
                              </Group>
                            </Box>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* 添加条件按钮 */}
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={handleAddSortCondition}
          >
            选择条件
          </Button>

          {/* 排序说明 */}
          {sortConditions.length > 0 && (
            <Box p="sm" style={{ 
              background: 'var(--mantine-color-blue-0)', 
              borderRadius: 'var(--mantine-radius-sm)' 
            }}>
              <Text size="xs" c="dimmed">
                • 拖动条件可调整排序优先级<br />
                • 文本字段按 A-Z 排序，中文按拼音首字母排序<br />
                • 数字和日期字段按 0-9 排序<br />
                • 单选/多选字段按选项顺序排序<br />
                • 排序仅在本地生效，不影响其他协作者
              </Text>
            </Box>
          )}
        </Stack>
      </Modal>

      {/* 里程碑模态框 */}
      <Modal
        opened={isMilestoneModalOpen}
        onClose={() => {
          setIsMilestoneModalOpen(false);
          setMilestoneName('');
          setSelectedDateForMilestone(null);
        }}
        title="设置里程碑"
        size="md"
      >
        <Stack gap="md">
          <Box>
            <Text size="sm" c="dimmed" mb="xs">日期</Text>
            <TextInput
              value={selectedDateForMilestone || ''}
              disabled
              styles={{ input: { background: 'var(--mantine-color-gray-1)' } }}
            />
          </Box>
          
          <Box>
            <Text size="sm" c="dimmed" mb="xs">里程碑名称</Text>
            <TextInput
              value={milestoneName}
              onChange={(e) => setMilestoneName(e.target.value)}
              placeholder="请输入里程碑名称"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveMilestone();
                }
              }}
            />
          </Box>

          <Group justify="space-between" mt="md">
            {milestones.some(m => m.date === selectedDateForMilestone) ? (
              <Button color="red" variant="subtle" onClick={handleDeleteMilestone}>
                删除里程碑
              </Button>
            ) : (
              <Box />
            )}
            <Group>
              <Button 
                variant="default" 
                onClick={() => {
                  setIsMilestoneModalOpen(false);
                  setMilestoneName('');
                  setSelectedDateForMilestone(null);
                }}
              >
                取消
              </Button>
              <Button 
                onClick={handleSaveMilestone}
                disabled={!milestoneName.trim()}
              >
                确定
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      {/* 右键菜单 */}
      {contextMenu && (
        <Menu
          opened={true}
          onClose={handleCloseContextMenu}
          position="bottom-start"
          withinPortal
        >
          <Menu.Target>
            <Box
              style={{
                position: 'fixed',
                left: contextMenu.x,
                top: contextMenu.y,
                width: 0,
                height: 0,
              }}
            />
          </Menu.Target>
          <Menu.Dropdown>
            {contextMenu.type === 'task' ? (
              <>
                {/* 任务名称右键菜单 */}
                <Menu.Item
                  leftSection={<IconArrowUp size={16} />}
                  disabled={isReadOnly}
                  closeMenuOnClick={false}
                >
                  <Group gap="xs" wrap="nowrap">
                    <Text size="sm">向上插入</Text>
                    <TextInput
                      size="xs"
                      type="number"
                      min={1}
                      value={insertRowCount}
                      onChange={(e) => setInsertRowCount(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: '60px' }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Text size="sm">行</Text>
                    <Button
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInsertRowsAbove(contextMenu.taskId, insertRowCount);
                      }}
                    >
                      确定
                    </Button>
                  </Group>
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconArrowDown size={16} />}
                  disabled={isReadOnly}
                  closeMenuOnClick={false}
                >
                  <Group gap="xs" wrap="nowrap">
                    <Text size="sm">向下插入</Text>
                    <TextInput
                      size="xs"
                      type="number"
                      min={1}
                      value={insertRowCount}
                      onChange={(e) => setInsertRowCount(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: '60px' }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Text size="sm">行</Text>
                    <Button
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInsertRowsBelow(contextMenu.taskId, insertRowCount);
                      }}
                    >
                      确定
                    </Button>
                  </Group>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconInfoCircle size={16} />}
                  onClick={() => handleViewDetails(contextMenu.taskId)}
                >
                  查看详情
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconMessagePlus size={16} />}
                  onClick={() => handleAddComment(contextMenu.taskId)}
                >
                  添加评论
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={16} />}
                  color="red"
                  onClick={() => handleDeleteRecord(contextMenu.taskId)}
                  disabled={isReadOnly}
                >
                  删除记录
                </Menu.Item>
              </>
            ) : (
              <>
                {/* 进度条右键菜单 */}
                <Menu.Item
                  leftSection={<IconCalendarX size={16} />}
                  onClick={() => handleClearTimeBar(contextMenu.taskId)}
                  disabled={isReadOnly}
                >
                  清除时间条
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconInfoCircle size={16} />}
                  onClick={() => handleViewDetails(contextMenu.taskId)}
                >
                  查看详情
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconMessagePlus size={16} />}
                  onClick={() => handleAddComment(contextMenu.taskId)}
                >
                  添加评论
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={16} />}
                  color="red"
                  onClick={() => handleDeleteRecord(contextMenu.taskId)}
                  disabled={isReadOnly}
                >
                  删除记录
                </Menu.Item>
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      )}
    </NodeViewWrapper>
  );
}

// 甘特图设置表单组件
function GanttSettingsForm({ 
  settings, 
  fields, 
  colorPresets, 
  onSave, 
  onCancel 
}: { 
  settings: GanttSettings;
  fields: any[];
  colorPresets: { value: string; label: string }[];
  onSave: (settings: GanttSettings) => void;
  onCancel: () => void;
}) {
  const [startDateField, setStartDateField] = useState<string | null>(
    settings.startDateField || null
  );
  const [endDateField, setEndDateField] = useState<string | null>(
    settings.endDateField || null
  );
  const [titleField, setTitleField] = useState(settings.titleField || 'name');
  const [barColor, setBarColor] = useState(settings.barColor || '#228be6');
  const [workdaysOnly, setWorkdaysOnly] = useState(settings.workdaysOnly || false);
  const [useCustomWorkdays, setUseCustomWorkdays] = useState(
    settings.customWorkdays && settings.customWorkdays.length > 0
  );
  const [customWorkdays, setCustomWorkdays] = useState<number[]>(
    settings.customWorkdays || [1, 2, 3, 4, 5]
  );

  // 获取所有日期类型的字段，包括内置的开始日期和截止日期
  const dateFields = [
    { id: 'startDate', name: '开始日期', type: 'date' as FieldType },
    { id: 'endDate', name: '截止日期', type: 'date' as FieldType },
    ...fields.filter(f => f.type === 'date')
  ];

  const handleSave = () => {
    onSave({
      startDateField: startDateField || undefined,
      endDateField: endDateField || undefined,
      titleField,
      barColor,
      workdaysOnly,
      customWorkdays: workdaysOnly && useCustomWorkdays ? customWorkdays : undefined,
    });
  };

  const toggleWorkday = (day: number) => {
    if (customWorkdays.includes(day)) {
      setCustomWorkdays(customWorkdays.filter(d => d !== day));
    } else {
      setCustomWorkdays([...customWorkdays, day].sort());
    }
  };

  const weekDays = [
    { value: 1, label: '周一' },
    { value: 2, label: '周二' },
    { value: 3, label: '周三' },
    { value: 4, label: '周四' },
    { value: 5, label: '周五' },
    { value: 6, label: '周六' },
    { value: 0, label: '周日' },
  ];

  return (
    <DatesProvider settings={{ locale: 'zh-cn', firstDayOfWeek: 1, weekendDays: [0, 6] }}>
      <Stack gap="md">
        <Box>
          <Text size="sm" c="dimmed" mb="xs">时间范围</Text>
          <Group gap="sm">
            <Select
              value={startDateField}
              onChange={(value) => setStartDateField(value)}
              placeholder="选择开始时间字段"
              style={{ flex: 1 }}
              clearable
              data={dateFields.map(f => ({ value: f.id, label: f.name }))}
            />
            <Select
              value={endDateField}
              onChange={(value) => setEndDateField(value)}
              placeholder="选择结束时间字段"
              style={{ flex: 1 }}
              clearable
              data={dateFields.map(f => ({ value: f.id, label: f.name }))}
            />
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            选择自定义字段中的日期字段作为时间范围
          </Text>
        </Box>

        <Box>
          <Text size="sm" c="dimmed" mb="xs">标题显示字段</Text>
          <Select
            value={titleField}
            onChange={(value) => setTitleField(value || 'name')}
            data={fields.map(f => ({ value: f.id, label: f.name }))}
            placeholder="选择要在进度条上显示的字段"
          />
        </Box>

        <Box>
          <Text size="sm" c="dimmed" mb="xs">进度条颜色</Text>
          <Group gap="sm">
            {colorPresets.map((preset) => (
              <Box
                key={preset.value}
                onClick={() => setBarColor(preset.value)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--mantine-radius-sm)',
                  background: preset.value,
                  cursor: 'pointer',
                  border: barColor === preset.value 
                    ? '3px solid var(--mantine-color-blue-6)' 
                    : '2px solid var(--mantine-color-gray-3)',
                  transition: 'all 0.2s',
                }}
                title={preset.label}
              />
            ))}
          </Group>
        </Box>

        <Box>
          <Group gap="xs" mb="xs">
            <Checkbox
              checked={workdaysOnly}
              onChange={(e) => setWorkdaysOnly(e.currentTarget.checked)}
              label="仅计算工作日"
            />
          </Group>
          <Text size="xs" c="dimmed" mb="sm">
            勾选后，天数将仅计算工作日，去除周末时间
          </Text>

          {workdaysOnly && (
            <Box>
              <Group gap="xs" mb="xs">
                <Checkbox
                  checked={!useCustomWorkdays}
                  onChange={(e) => {
                    setUseCustomWorkdays(!e.currentTarget.checked);
                    if (e.currentTarget.checked) {
                      setCustomWorkdays([1, 2, 3, 4, 5]); // 重置为默认工作日
                    }
                  }}
                  label="法定工作日（周一至周五）"
                />
              </Group>
              <Group gap="xs" mb="xs">
                <Checkbox
                  checked={useCustomWorkdays}
                  onChange={(e) => setUseCustomWorkdays(e.currentTarget.checked)}
                  label="自定义每周工作日"
                />
              </Group>

              {useCustomWorkdays && (
                <Box mt="sm" p="sm" style={{ 
                  background: 'var(--mantine-color-gray-0)', 
                  borderRadius: 'var(--mantine-radius-sm)' 
                }}>
                  <Text size="xs" c="dimmed" mb="xs">选择工作日：</Text>
                  <Group gap="xs">
                    {weekDays.map((day) => (
                      <Checkbox
                        key={day.value}
                        checked={customWorkdays.includes(day.value)}
                        onChange={() => toggleWorkday(day.value)}
                        label={day.label}
                      />
                    ))}
                  </Group>
                </Box>
              )}
            </Box>
          )}
        </Box>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </Group>
      </Stack>
    </DatesProvider>
  );
}
