# Confluence 在线导入 500 错误修复说明

## 问题描述

前端导入 Confluence 文档时报错：
```
POST http://localhost:5173/api/confluence/import-online 500 (Internal Server Error)
```

后端日志显示：
```
Error: invalid firstChar on key
at PageService.nextPagePosition
```

## 问题原因

后端代码存在两个问题：

### 1. 变量作用域问题
`importOnlinePages` 方法中，`pagesMap` 变量在 try 块内定义，但后续代码在 try-catch 块外使用该变量，导致变量作用域错误。

### 2. 位置键生成问题
`generatePositionKeys` 方法调用 `pageService.nextPagePosition(spaceId)` 时，该方法内部可能从数据库读取到无效的 position 值，导致 fractional-indexing 库抛出 "invalid firstChar on key" 错误。

## 修复内容

### 1. 修复变量作用域问题

**文件**: `apps/server/src/ee/confluence-import/confluence-import.service.ts`

将 try-catch 块后的代码移入 try 块内，确保 `pagesMap` 变量在正确的作用域中使用。

### 2. 修复位置键生成逻辑

**文件**: `apps/server/src/ee/confluence-import/confluence-import.service.ts`

改进 `generatePositionKeys` 方法：
- 不再调用 `pageService.nextPagePosition()`，而是直接查询数据库获取最后一个根页面的位置
- **添加位置键验证**：检查数据库中的位置键是否有效（必须以 a-z 开头）
- 如果数据库中的位置键无效，从头开始生成新的位置键
- 使用查询到的有效位置作为起始位置，为所有导入的页面生成新的位置键

```typescript
// 直接查询最后一个根页面
const lastRootPage = await this.db
  .selectFrom('pages')
  .select(['position'])
  .where('spaceId', '=', spaceId)
  .where('parentPageId', 'is', null)
  .where('deletedAt', 'is', null)
  .orderBy('position', (ob) => ob.collate('C').desc())
  .limit(1)
  .executeTakeFirst();

// 验证位置键 - 必须以小写字母 a-z 开头
let prevPos: string | null = null;
if (lastRootPage?.position) {
  const firstChar = lastRootPage.position.charAt(0);
  if (firstChar >= 'a' && firstChar <= 'z') {
    prevPos = lastRootPage.position;
  } else {
    this.logger.warn(`Invalid position key found: ${lastRootPage.position}`);
  }
}

// 为每个页面生成位置键
rootSibs.forEach((page) => {
  page.position = generateJitteredKeyBetween(prevPos, null);
  prevPos = page.position;
});
```

### 3. 增强错误处理和日志

添加了更详细的日志输出，便于调试：
- 验证 workspace 和 space 是否存在
- 记录每个步骤的执行状态
- 在各个关键点添加 debug 日志

### 4. 改进控制器错误处理

**文件**: `apps/server/src/ee/confluence-import/confluence-import.controller.ts`

在 `importOnline` 方法中添加 try-catch 块，确保错误被正确捕获和返回给前端。

## 测试步骤

1. 确保已配置 Confluence 连接（在个人设置中）
2. 在文档库中点击导入 → Confluence 在线导入
3. 输入 Confluence 页面 URL（例如：`https://your-domain.atlassian.net/wiki/pages/123456/Page+Title`）
4. 选择是否包含子页面
5. 点击导入按钮
6. 查看后端日志确认导入过程

## 预期结果

- 导入请求不再返回 500 错误
- 后端日志显示详细的导入过程：
  ```
  [ConfluenceImportService] Starting online Confluence import for page xxx
  [ConfluenceImportService] Fetching main page xxx from Confluence
  [ConfluenceImportService] Found X pages to import
  [ConfluenceImportService] Converting Confluence pages to internal format
  [ConfluenceImportService] Generating position keys
  [ConfluenceImportService] Processing X levels of pages
  [ConfluenceImportService] Successfully imported X Confluence pages online
  ```
- 页面成功导入到指定的文档库中
- 如果出现错误，会返回具体的错误信息

## 注意事项

- 确保 Confluence URL 和 Access Token 配置正确
- 确保目标 Space 存在且用户有权限
- 大量页面导入可能需要较长时间，建议先测试单个页面
- 如果 Confluence 页面包含附件，附件也会被下载并保存

## 技术细节

### 位置键生成机制

导入的页面使用 fractional-indexing 算法生成位置键：
- 查询目标 Space 中最后一个根页面的位置
- 从该位置开始，为每个导入的页面生成递增的位置键
- 子页面也使用相同的算法生成位置键

### 错误处理

- 如果 Space 不存在，返回错误：`Space xxx not found in workspace xxx`
- 如果 Confluence API 调用失败，返回具体的 API 错误信息
- 如果页面处理失败，会记录具体的页面名称和错误信息
