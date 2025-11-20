# 站点品牌定制

## 修改内容

### 动态更新页面 Title 和 Favicon ✅

**功能**: 根据工作空间设置动态更新浏览器标签页的标题和图标

**来源**: 工作空间设置 → 常规 → 名称和图标

---

## 实现方式

### 1. 创建 DynamicHead 组件

**文件**: `apps/client/src/components/ui/dynamic-head.tsx`

**功能**:
- 监听工作空间信息变化
- 动态更新页面 title
- 动态更新 favicon
- 更新 Apple 移动端应用标题

**实现细节**:
```typescript
import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { currentUserAtom } from '@/features/user/atoms/current-user-atom';
import { Helmet } from 'react-helmet-async';

export function DynamicHead() {
  const currentUser = useAtomValue(currentUserAtom);
  const workspace = currentUser?.workspace;

  const workspaceName = workspace?.name || 'Docmost';
  const workspaceLogo = workspace?.logo;

  useEffect(() => {
    // 动态更新 favicon
    if (workspaceLogo) {
      // 移除现有的 favicon
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach((favicon) => favicon.remove());

      // 添加新的 favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = workspaceLogo;
      document.head.appendChild(link);
    }
  }, [workspaceLogo]);

  return (
    <Helmet>
      <title>{workspaceName}</title>
      <meta name="apple-mobile-web-app-title" content={workspaceName} />
    </Helmet>
  );
}
```

---

### 2. 集成到应用

**文件**: `apps/client/src/App.tsx`

**修改**:
```typescript
import { DynamicHead } from "@/components/ui/dynamic-head";

export default function App() {
  // ...
  return (
    <>
      <DynamicHead />
      <Routes>
        {/* ... */}
      </Routes>
    </>
  );
}
```

---

## 更新的元素

### 1. 页面标题 (Title)
- **位置**: 浏览器标签页标题
- **默认值**: "Docmost"
- **动态值**: 工作空间名称
- **更新方式**: React Helmet

### 2. Favicon (图标)
- **位置**: 浏览器标签页图标
- **默认值**: `/icons/favicon-32x32.png`
- **动态值**: 工作空间图标 URL
- **更新方式**: DOM 操作

### 3. Apple 移动端标题
- **位置**: iOS 添加到主屏幕时的名称
- **默认值**: "Docmost"
- **动态值**: 工作空间名称
- **更新方式**: React Helmet

---

## 工作原理

### 初始加载
1. 页面加载时显示默认的 "Docmost" 标题和图标
2. 用户登录后，获取工作空间信息
3. DynamicHead 组件检测到工作空间信息
4. 自动更新标题和图标

### 动态更新
1. 用户修改工作空间名称或图标
2. 工作空间信息更新
3. DynamicHead 组件自动响应变化
4. 页面标题和图标实时更新

---

## 测试步骤

### 1. 测试默认状态
- 清除浏览器缓存
- 访问登录页面
- 确认标签页显示 "Docmost"

### 2. 测试登录后
- 登录账号
- 确认标签页标题变为工作空间名称
- 确认标签页图标变为工作空间图标（如果设置了）

### 3. 测试动态更新
- 进入 设置 → 工作空间 → 常规
- 修改工作空间名称
- 保存后刷新页面
- 确认标签页标题已更新

### 4. 测试图标更新
- 进入 设置 → 工作空间 → 常规
- 上传新的工作空间图标
- 保存后刷新页面
- 确认标签页图标已更新

---

## 技术细节

### 使用的技术
- **React Helmet Async**: 管理 HTML head 标签
- **Jotai**: 状态管理（获取工作空间信息）
- **useEffect**: 监听变化并更新 DOM

### Favicon 更新策略
1. 检测到新的工作空间图标
2. 查找并移除所有现有的 favicon 链接
3. 创建新的 link 元素
4. 设置正确的属性（rel, type, href）
5. 添加到 document.head

### 回退机制
- 如果工作空间没有设置名称，显示 "Docmost"
- 如果工作空间没有设置图标，保留默认 favicon

---

## 修改统计

- **新增文件**: 1 个
- **修改文件**: 1 个
- **新增代码**: ~40 行

---

## 完成状态

✅ 动态更新页面标题  
✅ 动态更新 Favicon  
✅ 支持 Apple 移动端  
✅ 自动响应工作空间变化  
✅ 无 TypeScript 错误  
✅ 可以测试

---

## 注意事项

1. **图标格式**: 工作空间图标应该是 PNG 或 ICO 格式
2. **图标大小**: 建议使用 32x32 或 16x16 像素
3. **缓存**: 浏览器可能会缓存 favicon，需要强制刷新
4. **权限**: 确保工作空间图标 URL 可以公开访问

---

**修改时间**: 2025-11-18  
**修改者**: Kiro AI Assistant
