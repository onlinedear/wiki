# Confluence 导入功能 - 最终版本说明

## 功能概述

NoteDoc 现在支持从 Confluence 直接导入文档，提供了灵活且用户友好的导入体验。

## 核心特性

### 1. 智能配置管理

**预配置方式**（推荐）：
- 在账户设置中一次性配置 Confluence URL 和 Personal Access Token
- 后续导入时自动使用已保存的配置
- 只需输入页面 URL 即可快速导入

**临时导入方式**：
- 无需预先配置
- 每次导入时手动输入 URL 和 Token
- 适合偶尔使用或从不同 Confluence 实例导入

### 2. 智能界面

导入模态框会自动检测配置状态：

**已配置时**：
```
✓ 使用已保存的 Confluence 配置。 更改设置

[Confluence Page URL] *
[✓ Include child pages]
[Import from Confluence]
```

**未配置时**：
```
ℹ 输入您的 Confluence URL 和个人访问令牌以直接导入文档。 保存以供将来使用

[Confluence URL] *
[Personal Access Token] *
[Confluence Page URL] *
[✓ Include child pages]
[Import from Confluence]
```

### 3. 容错处理

**附件下载容错**：
- 附件下载失败不会导致整个导入失败
- 自动跳过无法下载的附件
- 记录详细日志便于排查
- 显示成功处理的附件数量

**错误提示**：
- 清晰的表单验证提示
- 友好的错误消息
- 详细的服务器日志

## 使用指南

### 首次使用（推荐流程）

1. **配置 Confluence 连接**
   ```
   设置 → 账户 → 我的资料 → Confluence Integration
   ```
   - 输入 Confluence URL（如：`https://your-domain.atlassian.net/wiki`）
   - 输入 Personal Access Token
   - 点击"测试连接"验证
   - 点击"保存配置"

2. **导入文档**
   ```
   文档库 → 导入 → Import from Confluence Online
   ```
   - 粘贴 Confluence 页面 URL
   - 选择是否包含子页面
   - 点击"导入"

### 临时导入（无需配置）

```
文档库 → 导入 → Import from Confluence Online
```
- 输入 Confluence URL
- 输入 Personal Access Token
- 粘贴页面 URL
- 选择是否包含子页面
- 点击"导入"

## 技术实现

### 前端

**组件**：
- `confluence-online-import-modal.tsx` - 智能导入模态框
- `confluence-config.tsx` - 配置管理页面

**特性**：
- 自动检测配置状态
- 动态显示/隐藏输入框
- 完整的表单验证
- 友好的用户提示

### 后端

**服务**：
- `ConfluenceImportService` - 导入逻辑
- `ConfluenceApiService` - Confluence API 调用

**特性**：
- 使用 `@AuthUser()` 和 `@AuthWorkspace()` 装饰器
- 正确的用户和工作区认证
- 附件下载容错处理
- 详细的日志记录

**关键修复**：
1. 使用正确的 NestJS 装饰器获取用户信息
2. 附件下载失败时返回 null 而不是抛出错误
3. 在闭包中捕获变量确保正确传递

## 支持的 URL 格式

```
✓ https://your-domain.atlassian.net/wiki/pages/123456/Page+Title
✓ https://your-domain.atlassian.net/wiki/pages/viewpage.action?pageId=123456
```

## 配置要求

### Confluence Personal Access Token

**权限要求**：
- 读取页面内容
- 读取附件
- 读取页面层级结构

**获取方式**：
1. 登录 Confluence
2. 点击头像 → Settings
3. 选择 Personal Access Tokens
4. 创建新令牌
5. 复制令牌（只显示一次）

**参考文档**：
https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html

## 导入内容

### 支持导入

- ✓ 页面标题和内容
- ✓ 页面层级结构（父子关系）
- ✓ 附件（图片、文档等）
- ✓ 页面元数据（标签等）
- ✓ 子页面（可选）

### 不支持

- ✗ 评论
- ✗ 页面历史版本
- ✗ 用户权限
- ✗ 页面模板

## 故障排查

### 问题 1：导入失败 - 500 错误

**原因**：workspaceId 为 null

**解决**：已修复，使用正确的装饰器获取用户信息

### 问题 2：附件下载失败

**原因**：某些附件可能因权限或其他原因无法下载

**解决**：已实现容错，跳过失败的附件继续导入

### 问题 3：无法提取页面 ID

**原因**：URL 格式不支持

**解决**：使用直接包含页面 ID 的 URL 格式

## 性能考虑

- 批量处理附件下载
- 分层级处理页面导入
- 事务保证数据一致性
- 详细日志便于监控

## 安全考虑

- Token 在传输中加密
- 可选择不保存 Token
- 配置存储在用户设置中
- 完整的权限验证

## 未来优化建议

1. **批量导入**：支持一次导入多个页面
2. **导入历史**：记录导入历史便于追踪
3. **增量导入**：支持更新已导入的页面
4. **附件重试**：对失败的附件提供重试功能
5. **导入报告**：显示详细的导入摘要
6. **多实例支持**：保存多个 Confluence 实例配置
7. **后台任务**：大量页面导入时使用后台任务

## 相关文件

### 前端
- `apps/client/src/features/confluence/components/confluence-online-import-modal.tsx`
- `apps/client/src/pages/settings/account/confluence-config.tsx`
- `apps/client/src/features/confluence/services/confluence-service.ts`

### 后端
- `apps/server/src/ee/confluence-import/confluence-import.controller.ts`
- `apps/server/src/ee/confluence-import/confluence-import.service.ts`
- `apps/server/src/ee/confluence-import/confluence-api.service.ts`
- `apps/server/src/ee/confluence-import/dto/confluence-online-import.dto.ts`

### 文档
- `docs/Confluence在线导入功能说明.md`
- `docs/Confluence直接导入更新说明.md`
- `docs/Confluence导入功能最终版本.md`（本文档）

### 脚本
- `scripts/verify-confluence-direct-import.sh` - 功能验证
- `scripts/test-confluence-direct-import.sh` - 测试指南

## 版本历史

### v1.0 - 初始版本
- 基础的在线导入功能
- 需要预先配置

### v2.0 - 直接导入
- 支持在导入时直接输入凭据
- 无需预先配置

### v3.0 - 智能配置（当前版本）
- 自动检测配置状态
- 智能显示/隐藏输入框
- 附件下载容错
- 完整的错误处理
- 友好的用户提示

## 总结

Confluence 导入功能现已完整实现，提供了灵活、友好且可靠的导入体验。用户可以选择预配置或临时导入，系统会智能地适应不同的使用场景。
