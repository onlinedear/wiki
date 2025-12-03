# 最后编辑信息和内存监控功能实现

## 实现的功能

### 1. 内存监控优化
- **位置调整**: 窗口位置从 `top: 20px` 调整为 `top: 70px`（下移50px）
- **默认隐藏**: 组件默认状态改为隐藏（`visible: false`）
- **快捷键切换**: 使用 `Ctrl+M` 快捷键显示/隐藏内存监控窗口
- **按需统计**: 只有在窗口可见时才进行内存统计，隐藏时停止统计以节省性能

### 2. 最后编辑信息显示
- **位置**: 显示在文档标题下方
- **内容**: 显示最后编辑人的头像、名称和最后修改时间
- **数据来源**: 从文档历史记录（Page History）API获取最新的编辑记录
- **交互**: 
  - 鼠标悬停显示"文档历史"提示
  - 点击后打开文档历史弹窗

## 修改的文件

### 1. `apps/client/src/components/common/memory-monitor.tsx`
- 添加快捷键监听（Ctrl+M）
- 修改默认可见状态为 false
- 调整窗口位置（top: 70px）
- 优化内存统计逻辑，只在可见时运行

### 2. `apps/client/src/features/editor/title-editor.tsx`
- 导入 `LastEditInfo` 组件
- 在标题编辑器下方添加最后编辑信息显示

### 3. 新增文件

#### `apps/client/src/features/editor/components/last-edit-info/last-edit-info.tsx`
- 创建最后编辑信息组件
- 使用 `usePageHistoryListQuery` 获取文档历史
- 使用 `date-fns` 格式化时间显示
- 支持多语言（i18n）
- 点击打开文档历史弹窗

#### `apps/client/src/features/editor/components/last-edit-info/last-edit-info.module.css`
- 定义组件样式
- 添加悬停效果

## 技术细节

### 数据获取
- 使用 TanStack Query 的 `usePageHistoryListQuery` hook
- 从返回的历史记录列表中取第一条（最新记录）
- 数据包含：`lastUpdatedBy`（用户信息）、`updatedAt`（更新时间）

### 时间格式化
- 使用 `date-fns` 的 `formatDistanceToNow` 函数
- 支持多语言 locale（中文、英文、日文、韩文等）
- 显示相对时间（如"2小时前"）

### 状态管理
- 使用 Jotai 的 `historyAtoms` 控制文档历史弹窗的显示状态
- 点击最后编辑信息时，设置 `historyAtoms` 为 true 打开弹窗

### 样式设计
- 使用 Mantine UI 组件（Avatar, Group, Text, Tooltip）
- 头像、名称和修改时间在同一水平线上显示
- 使用竖线（|）分隔名称和时间
- 左侧对齐：与编辑器内容区保持相同的 3rem 左边距（移动端为 1rem）
- 悬停时背景色变化，提供视觉反馈
- 圆角设计，与整体UI风格一致

## 使用说明

### 内存监控
1. 在文档编辑页面按 `Ctrl+M` 显示内存监控窗口
2. 再次按 `Ctrl+M` 隐藏窗口
3. 窗口位置在页面右上角，距离顶部70px

### 最后编辑信息
1. 在文档标题下方自动显示最后编辑人信息
2. 鼠标悬停查看"文档历史"提示
3. 点击打开完整的文档历史记录弹窗

## 兼容性
- 翻译文件已存在，支持所有语言
- 使用现有的API和组件，无需后端修改
- 与现有的文档历史功能完全兼容
