# 拖拽手柄菜单完整修复总结

## 修复的问题

### 1. 菜单无法自动显示
**原因：** `onMenuOpen` 回调在 `useMemo` 内部定义，导致闭包问题，拖拽手柄插件绑定的是旧的回调引用。

**解决方案：**
- 使用 `useCallback` 创建稳定的 `handleMenuOpen` 回调
- 将回调添加到 `extensions` 的依赖项中
- 确保回调引用在组件生命周期内保持稳定

### 2. 缩进按钮功能失效
**原因：**
- 使用了不存在的 `increaseIndent()` 和 `decreaseIndent()` 命令
- 错误的禁用逻辑限制了缩进级别

**解决方案：**
- 使用 Tiptap 标准命令：`liftListItem()` 和 `sinkListItem()`
- 使用 `editor.can()` 检查命令是否可执行
- 直接检查节点类型，而不仅依赖 `blockState`

### 3. 菜单和拖拽手柄交互不流畅
**原因：** 事件处理逻辑不完善，导致菜单或拖拽手柄过早消失。

**解决方案：**
- 添加全局鼠标移动监听，实时跟踪鼠标位置
- 当鼠标在菜单或拖拽手柄区域时，保持两者都显示
- 只有当鼠标同时离开两者时，才延迟关闭
- 使用 `isMenuOpen` 标志防止菜单打开时拖拽手柄被隐藏

## 修改的文件

### 1. apps/client/src/features/editor/page-editor.tsx
- 添加 `useCallback` 导入
- 创建稳定的 `handleMenuOpen` 回调
- 将回调添加到 `extensions` 的依赖项中
- 移除调试日志

### 2. apps/client/src/features/editor/extensions/custom-drag-handle.ts
- 添加 `isMenuOpen` 状态追踪
- 修改 `hideDragHandle()` 函数，当菜单打开时不隐藏
- 优化鼠标事件处理逻辑
- 监听 `drag-handle-menu-closed` 事件
- 移除调试日志

### 3. apps/client/src/features/editor/components/drag-handle-menu/drag-handle-menu.tsx
- 优化缩进按钮逻辑，直接检查节点类型
- 使用 `editor.can()` 智能禁用按钮
- 添加全局鼠标移动监听
- 优化菜单关闭逻辑

## 最终效果

✅ **菜单自动显示** - 鼠标悬停拖拽手柄 200ms 后自动显示菜单
✅ **拖拽手柄保持可见** - 菜单打开时拖拽手柄不会消失
✅ **流畅的交互** - 鼠标可以在拖拽手柄和菜单之间自由移动
✅ **智能关闭** - 只有当鼠标离开两者时才会延迟关闭
✅ **缩进功能正常** - 列表项可以正确增加和减少缩进
✅ **智能禁用** - 缩进按钮根据实际可执行状态自动禁用

## 技术要点

1. **React Hooks 最佳实践**
   - 使用 `useCallback` 创建稳定的回调引用
   - 正确管理 `useMemo` 的依赖项
   - 避免闭包陷阱

2. **事件处理优化**
   - 结合多种鼠标事件（`mouseenter`、`mouseleave`、`mousemove`）
   - 使用延迟关闭提升用户体验
   - 全局事件监听实现跨组件交互

3. **Tiptap 命令使用**
   - 使用 `editor.can()` 检查命令可执行性
   - 正确使用列表相关命令
   - 区分不同类型的列表（普通列表 vs 任务列表）

4. **状态管理**
   - 使用自定义事件实现组件间通信
   - 维护菜单打开状态防止意外隐藏
   - 实时更新按钮状态
