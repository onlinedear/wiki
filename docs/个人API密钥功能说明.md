# 个人 API 密钥功能说明

## 功能概述

在 `http://localhost:5173/settings/account/api-keys` 页面实现了个人 API 密钥管理功能，允许用户创建和管理自己的 API 密钥，用于编程访问 Docmost API。

## 功能特点

### 1. 与工作区 API 管理联动
- 个人 API 密钥继承用户在工作区中的角色和访问权限
- 使用与工作区 API 管理相同的组件和服务
- 数据存储在同一张 `apiKeys` 表中，通过 `creatorId` 区分

### 2. 核心功能
- **创建 API 密钥**：支持设置名称、描述、权限范围、过期时间等
- **查看密钥列表**：显示用户创建的所有 API 密钥
- **搜索和筛选**：按名称、描述、状态筛选密钥
- **更新密钥**：修改密钥的名称、描述、权限等
- **撤销密钥**：删除不再使用的 API 密钥
- **查看详情**：查看密钥的详细信息和使用统计

### 3. 安全特性
- 密钥仅在创建时显示一次
- 支持设置过期时间（30天、60天、90天、365天、自定义、永不过期）
- 支持高级安全设置（IP 白名单、速率限制）
- 提供安全最佳实践提示

## 实现细节

### 前端实现

#### 1. 页面组件
**文件**: `apps/client/src/pages/settings/account/api-keys.tsx`

主要功能：
- 显示个人 API 密钥列表
- 提供搜索和筛选功能
- 集成创建、更新、撤销、查看详情等操作
- 显示安全提示和使用说明

#### 2. 查询 Hook
**文件**: `apps/client/src/ee/api-key/queries/api-key-query.ts`

新增 `useGetUserApiKeysQuery`：
```typescript
export function useGetUserApiKeysQuery(
  params?: QueryParams,
): UseQueryResult<IApiKey[], Error>
```

#### 3. API 服务
**文件**: `apps/client/src/ee/api-key/services/api-key-service.ts`

新增 `getUserApiKeys` 方法：
```typescript
export async function getUserApiKeys(
  workspaceId: string,
  params?: QueryParams,
): Promise<IApiKey[]>
```

#### 4. 组件复用
复用工作区 API 管理的所有组件：
- `ApiKeyTable` - API 密钥表格
- `CreateApiKeyModal` - 创建密钥弹窗（添加 `userMode` 参数）
- `ApiKeyCreatedModal` - 密钥创建成功弹窗
- `UpdateApiKeyModal` - 更新密钥弹窗
- `RevokeApiKeyModal` - 撤销密钥弹窗
- `ApiKeyDetailsDrawer` - 密钥详情抽屉

### 后端实现

#### 1. 控制器
**文件**: `apps/server/src/ee/api-key/api-key.controller.ts`

新增路由：
```typescript
@Get('user')
async findUserApiKeys(
  @Param('workspaceId') workspaceId: string,
  @AuthUser() user: User,
)
```

路径：`GET /workspaces/:workspaceId/api-keys/user`

#### 2. 服务
**文件**: `apps/server/src/ee/api-key/api-key.service.ts`

新增方法：
```typescript
async findByUser(workspaceId: string, userId: string)
```

#### 3. 数据仓库
**文件**: `apps/server/src/database/repos/api-key/api-key.repo.ts`

新增方法：
```typescript
async findByCreatorId(
  workspaceId: string,
  creatorId: string,
  trx?: KyselyTransaction,
): Promise<ApiKey[]>
```

### 路由配置

**文件**: `apps/client/src/App.tsx`

```typescript
<Route path={"account/api-keys"} element={<AccountApiKeys />} />
```

### 语言包

**文件**: `apps/client/public/locales/zh-CN/translation.json`

新增翻译：
- `"Personal API Keys": "个人 API 密钥"`
- `"Manage your personal API keys for programmatic access": "管理您的个人 API 密钥以进行编程访问"`
- `"About Personal API Keys": "关于个人 API 密钥"`
- `"Personal API keys allow you to access the API with your own permissions. These keys inherit your workspace role and access rights.": "个人 API 密钥允许您使用自己的权限访问 API。这些密钥继承您的工作区角色和访问权限。"`

## 使用流程

### 1. 访问页面
导航到 `设置 > 账户 > API 密钥` 或直接访问 `/settings/account/api-keys`

### 2. 创建 API 密钥
1. 点击"创建 API 密钥"按钮
2. 填写基本信息（名称、描述）
3. 选择权限范围（读取、写入、删除等）
4. 设置安全选项（过期时间、IP 白名单、速率限制）
5. 确认创建
6. **重要**：立即复制并保存 API 密钥（仅显示一次）

### 3. 管理密钥
- **搜索**：在搜索框中输入关键词
- **筛选**：按状态筛选（全部、活跃、即将过期、已过期）
- **查看详情**：点击"查看详情"按钮
- **更新**：点击"编辑"按钮修改密钥信息
- **撤销**：点击"撤销"按钮删除密钥

## 与工作区 API 管理的区别

| 特性 | 个人 API 密钥 | 工作区 API 管理 |
|------|--------------|----------------|
| 访问路径 | `/settings/account/api-keys` | `/settings/api-keys` |
| 权限要求 | 所有用户 | 管理员 |
| 显示范围 | 仅显示当前用户创建的密钥 | 显示所有用户的密钥 |
| 创建者列 | 不显示（都是自己） | 显示创建者信息 |
| 权限继承 | 继承用户的工作区角色 | 可以设置任意权限 |

## 安全建议

1. **妥善保管密钥**：API 密钥仅在创建时显示一次，请立即复制并安全保存
2. **定期轮换**：建议定期创建新密钥并撤销旧密钥
3. **最小权限原则**：仅授予必需的权限
4. **设置过期时间**：避免使用永不过期的密钥
5. **监控使用情况**：定期检查密钥的使用统计
6. **IP 白名单**：在可能的情况下限制访问 IP
7. **速率限制**：设置合理的请求速率限制

## 技术栈

- **前端框架**：React + TypeScript
- **UI 组件**：Mantine
- **状态管理**：TanStack Query (React Query)
- **路由**：React Router
- **国际化**：i18next
- **后端框架**：NestJS
- **数据库**：PostgreSQL + Kysely ORM

## 文件清单

### 前端文件
- `apps/client/src/pages/settings/account/api-keys.tsx` - 个人 API 密钥页面
- `apps/client/src/ee/api-key/queries/api-key-query.ts` - 查询 Hook（新增）
- `apps/client/src/ee/api-key/services/api-key-service.ts` - API 服务（新增）
- `apps/client/src/App.tsx` - 路由配置（修改）
- `apps/client/public/locales/zh-CN/translation.json` - 语言包（新增）

### 后端文件
- `apps/server/src/ee/api-key/api-key.controller.ts` - 控制器（新增路由）
- `apps/server/src/ee/api-key/api-key.service.ts` - 服务（新增方法）
- `apps/server/src/database/repos/api-key/api-key.repo.ts` - 数据仓库（新增方法）

### 复用组件
- `apps/client/src/ee/api-key/components/api-key-table.tsx`
- `apps/client/src/ee/api-key/components/create-api-key-modal.tsx`
- `apps/client/src/ee/api-key/components/api-key-created-modal.tsx`
- `apps/client/src/ee/api-key/components/update-api-key-modal.tsx`
- `apps/client/src/ee/api-key/components/revoke-api-key-modal.tsx`
- `apps/client/src/ee/api-key/components/api-key-details-drawer.tsx`

## 测试建议

1. **功能测试**
   - 创建 API 密钥
   - 查看密钥列表
   - 搜索和筛选密钥
   - 更新密钥信息
   - 撤销密钥
   - 查看密钥详情

2. **权限测试**
   - 验证用户只能看到自己创建的密钥
   - 验证用户不能操作其他用户的密钥

3. **安全测试**
   - 验证密钥仅在创建时显示一次
   - 验证过期密钥无法使用
   - 验证 IP 白名单功能
   - 验证速率限制功能

4. **UI/UX 测试**
   - 验证所有提示信息正确显示
   - 验证表单验证正常工作
   - 验证响应式布局
   - 验证国际化翻译

## 后续优化建议

1. **使用统计**：添加更详细的 API 密钥使用统计和图表
2. **通知提醒**：密钥即将过期时发送通知
3. **审计日志**：记录 API 密钥的所有操作历史
4. **批量操作**：支持批量撤销密钥
5. **导出功能**：支持导出密钥列表（不含密钥值）
6. **权限模板**：提供常用权限组合的快速选择
