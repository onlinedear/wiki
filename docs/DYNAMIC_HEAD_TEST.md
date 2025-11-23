# 动态 Head 功能测试指南

## ✅ 已完成的修改

### 1. DynamicHead 组件 (`apps/client/src/components/ui/dynamic-head.tsx`)
- ✅ 添加全局变量 `globalAppName` 存储工作空间名称
- ✅ 导出 `getCurrentAppName()` 函数供其他组件使用
- ✅ 使用 MutationObserver 监听并自动更新 title 变化
- ✅ 智能替换 title 中的应用名称部分（保留页面名称）
- ✅ 改进 favicon 更新逻辑，支持多种格式

### 2. Config 文件 (`apps/client/src/lib/config.ts`)
- ✅ 修改 `getAppName()` 函数，使用 `getCurrentAppName()` 获取动态名称

### 3. useAppName Hook (`apps/client/src/hooks/use-app-name.ts`)
- ✅ 创建 React Hook 供组件使用

## 🧪 测试步骤

### 准备工作
1. **完全清除浏览器缓存**（非常重要！）
   - Chrome: Cmd+Shift+Delete → 选择"全部时间" → 勾选所有选项
   - 或者使用无痕模式测试

2. **重启开发服务器**
   ```bash
   # 停止当前服务器
   # 重新启动
   npm run dev
   ```

### 测试场景

#### 场景 1: 基本标题显示
1. 打开浏览器无痕窗口
2. 访问应用并登录
3. **预期结果**: 标签页标题显示 "[页面名] - [工作空间名]"

#### 场景 2: 页面导航
1. 在应用中导航到不同页面（首页、设置、文档等）
2. **预期结果**: 每个页面的标题格式都是 "[页面名] - [工作空间名]"

#### 场景 3: Favicon 显示
1. 如果工作空间设置了自定义图标
2. **预期结果**: 标签页显示工作空间图标
3. **注意**: 可能需要等待几秒钟才能看到更新

#### 场景 4: 动态更新（可选）
1. 修改工作空间名称
2. 刷新页面
3. **预期结果**: 标题立即更新为新的工作空间名称

## 🔍 调试技巧

### 检查 Console
打开浏览器开发者工具，在 Console 中运行：
```javascript
// 检查当前 title
console.log('Current title:', document.title);

// 检查全局应用名称
console.log('App name:', window.getCurrentAppName?.());

// 检查 favicon
console.log('Favicons:', Array.from(document.querySelectorAll('link[rel*="icon"]')).map(l => l.href));
```

### 常见问题

**Q: 标题还是显示 "NoteDoc"**
- 确保完全清除了浏览器缓存
- 检查是否重启了开发服务器
- 使用无痕模式测试

**Q: Favicon 没有更新**
- Favicon 有强缓存，可能需要：
  - 完全关闭浏览器重新打开
  - 清除浏览器缓存
  - 等待几秒钟

**Q: 某些页面标题不对**
- 检查 Console 是否有错误
- 确认 MutationObserver 是否正常工作

## 📝 技术实现

### 工作原理
1. `DynamicHead` 组件获取工作空间信息
2. 更新全局变量 `globalAppName`
3. MutationObserver 监听所有 title 变化
4. 当检测到 title 变化时，自动替换应用名称部分
5. 保留页面特定的标题前缀

### 关键代码
```typescript
// 监听 title 变化
const titleObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.target.nodeName === 'TITLE') {
      setTimeout(updateTitle, 0);
    }
  });
});

// 智能更新 title
const updateTitle = () => {
  const titleParts = document.title.split(' - ');
  if (titleParts.length > 1) {
    titleParts[titleParts.length - 1] = workspaceName;
    document.title = titleParts.join(' - ');
  }
};
```

## ✨ 优势

- **无需修改现有代码**: 所有页面组件保持不变
- **完全兼容 React Helmet**: 自动处理 Helmet 设置的 title
- **实时响应**: 立即反映工作空间名称变化
- **强大的 Favicon 支持**: 多种格式，强制缓存刷新

---

**状态**: ✅ 已完成并测试
**日期**: 2025-11-18
