# Confluence 直接导入功能更新说明

## 更新概述

**更新日期**：2024-11-20

Confluence 在线导入功能已更新，现在用户可以直接在导入模态框中输入 Confluence URL 和 Personal Access Token，无需预先在账户设置中配置。

## 主要变更

### 1. 导入模态框增强

**文件**：`apps/client/src/features/confluence/components/confluence-online-import-modal.tsx`

**新增字段**：
- Confluence URL 输入框
- Personal Access Token 输入框（密码类型）

**表单验证**：
- Confluence URL 必填验证
- URL 格式验证（必须以 http 开头）
- Access Token 必填验证
- 页面 URL 必填验证

### 2. 前端 Service 更新

**文件**：`apps/client/src/features/confluence/services/confluence-service.ts`

**接口变更**：
```typescript
export interface ConfluenceOnlineImport {
  confluenceUrl: string;      // 新增
  accessToken: string;         // 新增
  pageId: string;
  spaceId: string;
  includeChildren?: boolean;
}
```

### 3. 后端支持

**文件**：
- `apps/server/src/ee/confluence-import/dto/confluence-online-import.dto.ts`
- `apps/server/src/ee/confluence-import/confluence-import.controller.ts`

后端已经支持接收 `confluenceUrl` 和 `accessToken` 参数，无需额外修改。

### 4. 中文翻译

**文件**：`apps/client/public/locales/zh-CN/translation.json`

**新增翻译键**：
- `"Enter your Confluence URL and Personal Access Token to import pages directly."`
- `"Confluence URL is required"`
- `"Please enter a valid URL"`
- `"Access token is required"`

## 使用方式

### 推荐方式：预配置 + 快速导入

1. **首次使用**：在账户设置中配置 Confluence 连接
   - 访问 设置 → 账户 → 我的资料
   - 找到 "Confluence Integration" 部分
   - 输入 Confluence URL 和 Personal Access Token
   - 保存配置

2. **后续导入**：只需输入页面 URL
   - 打开导入模态框
   - 系统自动使用已保存的配置
   - 只需输入要导入的页面 URL
   - 选择是否包含子页面
   - 点击导入

### 备选方式：临时导入（无需预配置）

如果不想保存配置，可以每次导入时手动输入：
1. 打开导入模态框
2. 输入 Confluence URL
3. 输入 Personal Access Token
4. 输入页面 URL
5. 选择是否包含子页面
6. 点击导入

## 用户体验改进

### 智能配置检测

**更新日期**：2024-11-20

导入模态框现在会自动检测用户是否已配置 Confluence 连接：

1. **有预配置时**：
   - 显示绿色提示："使用已保存的 Confluence 配置"
   - 自动隐藏 URL 和 Token 输入框
   - 只需输入页面 URL 即可导入
   - 提供"更改设置"链接快速跳转到配置页面

2. **无预配置时**：
   - 显示蓝色提示："输入 Confluence URL 和 Token"
   - 显示所有输入框
   - 提供"保存以供将来使用"链接引导用户配置
   - 支持临时导入，无需保存配置

### 优点

1. **更快捷**：预配置后只需输入页面 URL
2. **更灵活**：可以选择使用预配置或临时输入
3. **更友好**：智能提示引导用户完成配置
4. **更高效**：减少重复输入，提升工作效率

### 向后兼容

- 账户设置中的 Confluence 配置功能完整保留
- 支持预配置和临时导入两种方式
- 用户可以根据需求自由选择

## 技术实现

### 前端表单结构

```typescript
const form = useForm({
  initialValues: {
    confluenceUrl: '',
    accessToken: '',
    pageUrl: '',
    includeChildren: true,
  },
  validate: {
    confluenceUrl: (value) => {
      if (!value) return t('Confluence URL is required');
      if (!value.startsWith('http')) return t('Please enter a valid URL');
      return null;
    },
    accessToken: (value) => {
      if (!value) return t('Access token is required');
      return null;
    },
    pageUrl: (value) => {
      if (!value) return t('Page URL is required');
      if (!value.includes('confluence') && !value.includes('/pages/')) {
        return t('Please enter a valid Confluence page URL');
      }
      return null;
    },
  },
});
```

### API 调用

```typescript
const result = await importConfluenceOnline({
  confluenceUrl: values.confluenceUrl,
  accessToken: values.accessToken,
  pageId,
  spaceId,
  includeChildren: values.includeChildren,
});
```

## 验证脚本

运行以下脚本验证功能实现：

```bash
./scripts/verify-confluence-direct-import.sh
```

该脚本会检查：
- 前端组件是否包含新字段
- 表单验证是否正确
- Service 接口是否更新
- 后端 DTO 和 Controller 是否支持
- 中文翻译是否完整

## 测试建议

### 功能测试

1. **直接导入测试**
   - 输入有效的 Confluence URL 和 Token
   - 输入页面 URL
   - 验证导入成功

2. **表单验证测试**
   - 留空 Confluence URL，验证错误提示
   - 输入无效的 URL（不以 http 开头），验证错误提示
   - 留空 Access Token，验证错误提示
   - 留空页面 URL，验证错误提示

3. **错误处理测试**
   - 输入无效的 Token，验证错误提示
   - 输入无效的页面 URL，验证错误提示
   - 测试网络错误情况

### UI/UX 测试

1. 验证所有字段的标签和占位符文本正确显示
2. 验证 PasswordInput 组件正确隐藏 Token
3. 验证提示信息（Alert）文本正确
4. 验证中文翻译正确显示

## 相关文件

### 前端
- `apps/client/src/features/confluence/components/confluence-online-import-modal.tsx`
- `apps/client/src/features/confluence/services/confluence-service.ts`
- `apps/client/public/locales/zh-CN/translation.json`

### 后端
- `apps/server/src/ee/confluence-import/dto/confluence-online-import.dto.ts`
- `apps/server/src/ee/confluence-import/confluence-import.controller.ts`
- `apps/server/src/ee/confluence-import/confluence-import.service.ts`

### 文档
- `docs/Confluence在线导入功能说明.md`
- `docs/Confluence直接导入更新说明.md`（本文档）

### 脚本
- `scripts/verify-confluence-direct-import.sh`

## 错误处理改进

### 附件下载容错

**更新日期**：2024-11-20

**问题**：当 Confluence 附件下载失败（404 错误）时，会导致整个导入过程失败并返回 500 错误。

**解决方案**：
1. 修改 `downloadAttachment` 方法返回 `Buffer | null`，失败时返回 null 而不是抛出错误
2. 在 `processConfluenceAttachments` 中检查下载结果，跳过失败的附件
3. 记录警告日志但继续处理其他附件
4. 在日志中显示成功处理的附件数量

**影响**：
- 附件下载失败不再导致整个导入失败
- 用户可以成功导入页面内容，即使部分附件不可用
- 提供更好的用户体验和错误恢复能力

## 后续优化建议

1. **记住最后使用的 URL**：可以在 localStorage 中保存最后使用的 Confluence URL
2. **Token 管理**：提供选项让用户选择是否保存 Token
3. **多实例支持**：允许用户保存多个 Confluence 实例配置
4. **批量导入**：支持一次导入多个页面
5. **导入历史**：记录导入历史，方便用户查看和重新导入
6. **附件重试机制**：对失败的附件提供重试功能
7. **导入报告**：显示导入摘要，包括成功/失败的页面和附件数量
