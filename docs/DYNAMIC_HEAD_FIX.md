# 动态 Head 修复

## 问题

1. **页面标题闪现**: 标题显示工作空间名称后又变回 "Docmost"
2. **Favicon 未更新**: 浏览器图标没有更换为工作空间图标

## 原因分析

### 标题问题
- React Helmet 与其他地方设置的 title 冲突
- 可能有多个组件在设置 document.title

### Favicon 问题
- 简单的移除和添加策略不够可靠
- 浏览器缓存 favicon
- 需要强制刷新机制

## 解决方案

### 1. 移除 React Helmet
不再使用 React Helmet，直接操作 DOM

### 2. 改进标题更新
```typescript
useEffect(() => {
  // 直接设置 document.title
  document.title = workspaceName;
}, [workspaceName]);
```

### 3. 改进 Favicon 更新策略

**新策略**:
1. 查找现有的 favicon 元素（而不是删除）
2. 如果存在，更新 href
3. 如果不存在，创建新元素
4. 添加时间戳强制刷新缓存

```typescript
useEffect(() => {
  if (workspaceLogo) {
    // 查找或创建 16x16 favicon
    let favicon16 = document.querySelector('link[rel="icon"][sizes="16x16"]');
    if (favicon16) {
      favicon16.href = workspaceLogo;
    } else {
      favicon16 = document.createElement('link');
      favicon16.rel = 'icon';
      favicon16.type = 'image/png';
      favicon16.sizes = '16x16';
      favicon16.href = workspaceLogo;
      document.head.appendChild(favicon16);
    }

    // 查找或创建 32x32 favicon
    let favicon32 = document.querySelector('link[rel="icon"][sizes="32x32"]');
    if (favicon32) {
      favicon32.href = workspaceLogo;
    } else {
      favicon32 = document.createElement('link');
      favicon32.rel = 'icon';
      favicon32.type = 'image/png';
      favicon32.sizes = '32x32';
      favicon32.href = workspaceLogo;
      document.head.appendChild(favicon32);
    }

    // 添加时间戳强制刷新
    const timestamp = new Date().getTime();
    favicon16.href = `${workspaceLogo}?t=${timestamp}`;
    favicon32.href = `${workspaceLogo}?t=${timestamp}`;
  }
}, [workspaceLogo]);
```

### 4. 更新 Apple Meta 标签
```typescript
useEffect(() => {
  let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (appleMeta) {
    appleMeta.content = workspaceName;
  } else {
    appleMeta = document.createElement('meta');
    appleMeta.name = 'apple-mobile-web-app-title';
    appleMeta.content = workspaceName;
    document.head.appendChild(appleMeta);
  }
}, [workspaceName]);
```

## 修改内容

**文件**: `apps/client/src/components/ui/dynamic-head.tsx`

**主要变化**:
1. 移除 React Helmet 依赖
2. 使用 `document.title` 直接设置标题
3. 改进 favicon 更新逻辑
4. 添加时间戳防止缓存
5. 组件返回 `null`（不渲染任何内容）

## 测试步骤

1. **清除浏览器缓存**
   - Chrome: Ctrl+Shift+Delete (Windows) 或 Cmd+Shift+Delete (Mac)
   - 选择"缓存的图片和文件"
   - 清除

2. **刷新页面**
   - 硬刷新: Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)

3. **验证标题**
   - 查看浏览器标签页标题
   - 应该显示工作空间名称
   - 不应该闪现或变回 "Docmost"

4. **验证图标**
   - 查看浏览器标签页图标
   - 如果设置了工作空间图标，应该显示该图标
   - 可能需要等待几秒钟

5. **测试动态更新**
   - 进入设置修改工作空间名称
   - 保存后刷新页面
   - 标题应该立即更新

## 技术细节

### 为什么不用 React Helmet？
- React Helmet 在某些情况下会与其他 title 设置冲突
- 直接操作 DOM 更可靠
- 减少依赖

### 时间戳的作用
- `?t=${timestamp}` 添加到 URL 末尾
- 浏览器认为这是新的资源
- 强制重新下载图标
- 绕过缓存机制

### 为什么创建多个 favicon？
- 不同浏览器和设备使用不同尺寸
- 16x16: 小图标
- 32x32: 标准图标
- 通用: 兼容性

## 预期效果

### 标题
- ✅ 登录后立即显示工作空间名称
- ✅ 不会闪现或变回默认值
- ✅ 刷新页面后保持正确

### 图标
- ✅ 显示工作空间图标（如果设置了）
- ✅ 不受浏览器缓存影响
- ✅ 动态更新生效

---

**修复时间**: 2025-11-18  
**修复者**: Kiro AI Assistant
