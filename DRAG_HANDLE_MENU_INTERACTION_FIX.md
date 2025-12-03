# 拖拽手柄和菜单交互优化

## 问题描述

之前的实现中，当鼠标悬停在拖拽手柄上时会显示菜单，但是：
1. 当鼠标从拖拽手柄移动到菜单时，拖拽手柄会消失
2. 用户难以从拖拽手柄移动到菜单进行操作

## 解决方案

### 核心改进

1. **添加菜单状态追踪** (`isMenuOpen`)
   - 在拖拽手柄插件中添加 `isMenuOpen` 标志
   - 当菜单打开时，拖拽手柄不会隐藏

2. **优化鼠标事件处理**
   - 鼠标进入拖拽手柄时，清除隐藏定时器并显示手柄
   - 鼠标离开拖拽手柄时，检查是否移动到菜单区域
   - 只有当鼠标同时离开拖拽手柄和菜单时，才隐藏它们

3. **菜单关闭通知机制**
   - 使用自定义事件 `drag-handle-menu-closed` 通知拖拽手柄
   - 菜单关闭时更新 `isMenuOpen` 状态并隐藏手柄

### 修改的文件

1. **apps/client/src/features/editor/extensions/custom-drag-handle.ts**
   - 添加 `isMenuOpen` 状态追踪
   - 修改 `hideDragHandle()` 函数，当菜单打开时不隐藏
   - 添加 `hideTimeout` 定时器管理
   - 监听 `drag-handle-menu-closed` 事件

2. **apps/client/src/features/editor/components/drag-handle-menu/drag-handle-menu.tsx**
   - 优化全局鼠标移动监听
   - 确保鼠标在菜单或拖拽手柄区域时保持显示
   - 添加拖拽手柄的 `mouseenter` 事件监听

3. **apps/client/src/features/editor/page-editor.tsx**
   - 菜单关闭时触发 `drag-handle-menu-closed` 事件

## 用户体验改进

- ✅ 鼠标悬停在拖拽手柄上时，延迟 200ms 显示菜单
- ✅ 菜单显示时，拖拽手柄保持可见
- ✅ 鼠标可以在拖拽手柄和菜单之间自由移动
- ✅ 只有当鼠标离开两者时，才会延迟 200ms 后隐藏
- ✅ 交互更加流畅和直观
