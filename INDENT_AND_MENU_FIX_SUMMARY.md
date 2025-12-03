# 缩进按钮和菜单交互修复总结

## 修复的问题

### 1. 缩进按钮功能失效
**原因：**
- 使用了不存在的 `increaseIndent()` 和 `decreaseIndent()` 命令
- 错误的禁用逻辑限制了缩进级别

**解决方案：**
- 使用 Tiptap 标准的列表命令：
  - `liftListItem('listItem')` - 减少缩进（向左）
  - `sinkListItem('listItem')` - 增加缩进（向右）
  - `liftListItem('taskItem')` - 任务列表减少缩进
  - `sinkListItem('taskItem')` - 任务列表增加缩进

### 2. 缩进按钮智能禁用
**实现：**
- 使用 `editor.can().liftListItem()` 检查是否可以减少缩进
- 使用 `editor.can().sinkListItem()` 检查是否可以增加缩进
- 非列表项时禁用按钮
- 已经在最外层时禁用"减少缩进"按钮
- 根据编辑器状态动态更新按钮状态

### 3. 菜单显示问题
**原因：**
- 全局鼠标移动监听过于激进，导致菜单无法正常显示

**解决方案：**
- 移除全局鼠标移动监听
- 简化为只监听菜单的 `mouseenter` 和 `mouseleave` 事件
- 增加关闭延迟到 300ms，给用户更多时间移动鼠标
- 保持拖拽手柄在菜单打开时可见

## 修改的文件

### apps/client/src/features/editor/components/drag-handle-menu/drag-handle-menu.tsx

1. **缩进按钮逻辑**：
   - 检查列表类型（有序、无序、任务列表）
   - 使用 `editor.can()` 检查命令是否可执行
   - 根据状态动态禁用按钮

2. **菜单事件处理**：
   - 简化鼠标事件监听
   - 移除全局鼠标移动监听
   - 优化关闭延迟时间

## 用户体验改进

- ✅ 缩进按钮在列表中正常工作
- ✅ 按钮根据实际可执行状态智能禁用
- ✅ 非列表项时按钮置灰显示
- ✅ 菜单显示更加稳定流畅
- ✅ 鼠标在拖拽手柄和菜单之间移动时保持显示
