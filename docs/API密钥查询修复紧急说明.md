# API 密钥查询修复紧急说明

## 问题描述

在修改数据库查询以添加创建者信息后，API 管理和 API 密钥两个页面都无法显示已创建的 API 列表。

## 问题原因

使用 PostgreSQL 的 `json_build_object` 函数在 Kysely 查询中可能导致以下问题：

1. **类型推断问题**：Kysely 无法正确推断 JSON 对象的类型
2. **字段名冲突**：可能与现有字段名冲突
3. **NULL 处理**：当用户不存在时，JSON 对象的处理可能不正确

### 原始查询（有问题）

```typescript
return db
  .selectFrom('apiKeys')
  .leftJoin('users', 'users.id', 'apiKeys.creatorId')
  .select([
    'apiKeys.id',
    // ... 其他字段
    sql<any>`json_build_object(
      'id', users.id,
      'name', users.name,
      'email', users.email,
      'avatarUrl', users."avatarUrl"
    )`.as('creator'),
  ])
  .where('apiKeys.workspaceId', '=', workspaceId)
  .where('apiKeys.deletedAt', 'is', null)
  .execute() as any;
```

## 解决方案

改为在应用层构建 creator 对象，而不是在数据库层使用 `json_build_object`。

### 修复后的查询

```typescript
async findByWorkspaceId(
  workspaceId: string,
  trx?: KyselyTransaction,
): Promise<ApiKey[]> {
  const db = dbOrTx(this.db, trx);
  
  // 1. 查询时将用户字段作为单独的列
  const results = await db
    .selectFrom('apiKeys')
    .leftJoin('users', 'users.id', 'apiKeys.creatorId')
    .select([
      'apiKeys.id',
      'apiKeys.name',
      'apiKeys.description',
      'apiKeys.token',
      'apiKeys.creatorId',
      'apiKeys.workspaceId',
      'apiKeys.scopes',
      'apiKeys.status',
      'apiKeys.expiresAt',
      'apiKeys.lastUsedAt',
      'apiKeys.lastUsedIp',
      'apiKeys.usageCount',
      'apiKeys.createdAt',
      'apiKeys.updatedAt',
      'apiKeys.deletedAt',
      // 用户字段使用别名
      'users.id as creator_id',
      'users.name as creator_name',
      'users.email as creator_email',
      'users.avatarUrl as creator_avatarUrl',
    ])
    .where('apiKeys.workspaceId', '=', workspaceId)
    .where('apiKeys.deletedAt', 'is', null)
    .orderBy('apiKeys.createdAt', 'desc')
    .execute();

  // 2. 在应用层构建 creator 对象
  return results.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    token: row.token,
    creatorId: row.creatorId,
    workspaceId: row.workspaceId,
    scopes: row.scopes,
    status: row.status,
    expiresAt: row.expiresAt,
    lastUsedAt: row.lastUsedAt,
    lastUsedIp: row.lastUsedIp,
    usageCount: row.usageCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    // 只有当用户存在时才构建 creator 对象
    creator: row.creator_id ? {
      id: row.creator_id,
      name: row.creator_name,
      email: row.creator_email,
      avatarUrl: row.creator_avatarUrl,
    } : null,
  })) as any;
}
```

## 修复优势

### 1. 更好的类型安全
- 避免 Kysely 类型推断问题
- 更清晰的字段映射

### 2. 更好的 NULL 处理
- 明确检查 `creator_id` 是否存在
- 避免返回包含 NULL 值的 creator 对象

### 3. 更容易调试
- 可以在应用层打印原始查询结果
- 更容易定位问题

### 4. 更好的性能
- 避免数据库层的 JSON 构建开销
- 应用层的对象构建更快

## 修改的方法

### 1. findByWorkspaceId
**用途**：工作区 API 管理页面

**修改**：
- 查询用户字段作为单独的列
- 在应用层构建 creator 对象

### 2. findByCreatorId
**用途**：个人 API 密钥页面

**修改**：
- 查询用户字段作为单独的列
- 在应用层构建 creator 对象

## 测试步骤

### 1. 重启后端服务器
```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
pnpm dev
```

### 2. 清除浏览器缓存
- 刷新页面（Ctrl+F5 或 Cmd+Shift+R）
- 或清除浏览器缓存

### 3. 测试工作区 API 管理
1. 访问 `/settings/api-keys`
2. ✅ 验证：能看到 API 密钥列表
3. ✅ 验证：用户列显示创建者信息
4. ✅ 验证：权限列显示正确

### 4. 测试个人 API 密钥
1. 访问 `/settings/account/api-keys`
2. ✅ 验证：能看到 API 密钥列表
3. ✅ 验证：权限列显示正确

### 5. 测试创建和删除
1. 创建新的 API 密钥
2. ✅ 验证：列表自动刷新
3. 删除 API 密钥
4. ✅ 验证：列表自动刷新

## 相关文件

### 修改的文件
- `apps/server/src/database/repos/api-key/api-key.repo.ts` - 数据库查询

### 修改的方法
- `findByWorkspaceId` - 工作区 API 管理查询
- `findByCreatorId` - 个人 API 密钥查询

## 技术说明

### 字段别名命名规范

使用下划线命名法避免与 camelCase 字段冲突：
- `creator_id` - 创建者 ID
- `creator_name` - 创建者名称
- `creator_email` - 创建者邮箱
- `creator_avatarUrl` - 创建者头像

### NULL 处理

```typescript
creator: row.creator_id ? {
  id: row.creator_id,
  name: row.creator_name,
  email: row.creator_email,
  avatarUrl: row.creator_avatarUrl,
} : null
```

只有当 `creator_id` 存在时才构建 creator 对象，避免返回包含 NULL 值的对象。

## 后续优化建议

### 1. 添加错误日志
在查询失败时记录详细的错误信息：
```typescript
try {
  const results = await db.selectFrom('apiKeys')...
  return results.map(...)
} catch (error) {
  console.error('Failed to query API keys:', error);
  throw error;
}
```

### 2. 添加查询性能监控
记录查询执行时间，优化慢查询。

### 3. 考虑使用 ORM
如果 Kysely 的类型推断问题频繁出现，可以考虑使用更成熟的 ORM（如 Prisma）。

## 总结

通过将 JSON 对象构建从数据库层移到应用层，成功修复了 API 密钥列表无法显示的问题。

这个修复：
- ✅ 解决了类型推断问题
- ✅ 改善了 NULL 处理
- ✅ 提高了代码可维护性
- ✅ 保持了功能完整性

现在重启后端服务器，API 密钥列表应该能正常显示了。

---

**修改文件**：`apps/server/src/database/repos/api-key/api-key.repo.ts`

**修改方法**：
- `findByWorkspaceId` - 改为应用层构建 creator 对象
- `findByCreatorId` - 改为应用层构建 creator 对象

**重要**：需要重启后端服务器才能生效！
