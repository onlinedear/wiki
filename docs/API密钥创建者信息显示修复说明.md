# API 密钥创建者信息显示修复说明

## 问题描述

在工作区 API 管理页面 (`/settings/api-keys`) 中：
1. **用户列显示问题**：用户列没有显示创建 API 密钥的用户名
2. **权限列显示问题**：权限列显示为 "0"

## 问题分析

### 1. 用户列问题
**原因**：后端查询 API 密钥时，没有关联查询用户表，导致 `creator` 字段为空。

**数据库查询**：
```typescript
// 修改前 - 只查询 apiKeys 表
return db
  .selectFrom('apiKeys')
  .selectAll()
  .where('workspaceId', '=', workspaceId)
  .execute();
```

### 2. 权限列问题
**原因**：前端显示逻辑不够友好，已在之前的优化中修复。

## 解决方案

### 修改数据库查询，关联用户表

在 `apps/server/src/database/repos/api-key/api-key.repo.ts` 中修改两个方法：

#### 1. findByWorkspaceId（工作区 API 管理）

```typescript
async findByWorkspaceId(
  workspaceId: string,
  trx?: KyselyTransaction,
): Promise<ApiKey[]> {
  const db = dbOrTx(this.db, trx);
  return db
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
      sql<any>`json_build_object(
        'id', users.id,
        'name', users.name,
        'email', users.email,
        'avatarUrl', users."avatarUrl"
      )`.as('creator'),
    ])
    .where('apiKeys.workspaceId', '=', workspaceId)
    .where('apiKeys.deletedAt', 'is', null)
    .orderBy('apiKeys.createdAt', 'desc')
    .execute() as any;
}
```

#### 2. findByCreatorId（个人 API 密钥）

```typescript
async findByCreatorId(
  workspaceId: string,
  creatorId: string,
  trx?: KyselyTransaction,
): Promise<ApiKey[]> {
  const db = dbOrTx(this.db, trx);
  return db
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
      sql<any>`json_build_object(
        'id', users.id,
        'name', users.name,
        'email', users.email,
        'avatarUrl', users."avatarUrl"
      )`.as('creator'),
    ])
    .where('apiKeys.workspaceId', '=', workspaceId)
    .where('apiKeys.creatorId', '=', creatorId)
    .where('apiKeys.deletedAt', 'is', null)
    .orderBy('apiKeys.createdAt', 'desc')
    .execute() as any;
}
```

## 技术实现

### 1. LEFT JOIN 用户表

使用 `leftJoin` 关联用户表，即使用户被删除，API 密钥记录仍然可以查询到。

```typescript
.leftJoin('users', 'users.id', 'apiKeys.creatorId')
```

### 2. 构建 creator 对象

使用 PostgreSQL 的 `json_build_object` 函数构建创建者对象：

```typescript
sql<any>`json_build_object(
  'id', users.id,
  'name', users.name,
  'email', users.email,
  'avatarUrl', users."avatarUrl"
)`.as('creator')
```

### 3. 返回的数据结构

```typescript
{
  id: "uuid",
  name: "Production API Key",
  description: "用于生产环境",
  creatorId: "user-uuid",
  workspaceId: "workspace-uuid",
  scopes: ["pages:read", "pages:write"],
  status: "active",
  expiresAt: "2024-12-31T23:59:59Z",
  lastUsedAt: "2024-11-19T10:30:00Z",
  usageCount: 150,
  createdAt: "2024-11-01T00:00:00Z",
  creator: {
    id: "user-uuid",
    name: "张三",
    email: "zhangsan@example.com",
    avatarUrl: "https://..."
  }
}
```

## 前端显示

### 工作区 API 管理页面

**用户列**：
```typescript
{showUserColumn && apiKey.creator && (
  <Table.Td>
    <Group gap="xs" wrap="nowrap">
      <CustomAvatar
        avatarUrl={apiKey.creator?.avatarUrl}
        name={apiKey.creator.name}
        size="sm"
      />
      <Text fz="sm" lineClamp={1}>
        {apiKey.creator.name}
      </Text>
    </Group>
  </Table.Td>
)}
```

显示效果：
- 头像 + 用户名
- 例如：[头像] 张三

### 个人 API 密钥页面

不显示用户列（`showUserColumn={false}`），但数据中仍包含 creator 信息，保持数据一致性。

## 修复效果

### 修复前
- ❌ 用户列：空白或显示错误
- ❌ 权限列：显示 "0"

### 修复后
- ✅ 用户列：显示头像 + 用户名
- ✅ 权限列：显示完整权限（如 `pages:read` `+2`）

## 数据库性能考虑

### 1. LEFT JOIN vs INNER JOIN
使用 `LEFT JOIN` 而不是 `INNER JOIN`，原因：
- 即使用户被删除，API 密钥记录仍然可以查询到
- 避免因用户删除导致 API 密钥查询失败

### 2. 索引优化
确保以下字段有索引：
- `apiKeys.workspaceId`
- `apiKeys.creatorId`
- `apiKeys.deletedAt`
- `users.id`

### 3. 查询性能
- 使用 `json_build_object` 在数据库层面构建 JSON 对象，减少应用层处理
- 只查询需要的用户字段（id, name, email, avatarUrl）

## 测试验证

### 工作区 API 管理页面测试

1. **正常用户**
   - 创建 API 密钥
   - ✅ 验证：用户列显示创建者头像和名称
   - ✅ 验证：权限列显示完整权限

2. **多个用户**
   - 不同用户创建多个 API 密钥
   - ✅ 验证：每个密钥显示正确的创建者

3. **用户被删除**
   - 删除创建 API 密钥的用户
   - ✅ 验证：API 密钥仍然可以查询到
   - ✅ 验证：用户列显示为空或默认值

### 个人 API 密钥页面测试

1. **创建密钥**
   - 创建 API 密钥
   - ✅ 验证：不显示用户列
   - ✅ 验证：权限列显示完整权限

2. **数据一致性**
   - 在个人页面创建密钥
   - 切换到工作区管理页面
   - ✅ 验证：显示正确的创建者信息

## 相关文件

### 修改的文件
- `apps/server/src/database/repos/api-key/api-key.repo.ts` - 数据库查询

### 影响的页面
- `/settings/api-keys` - 工作区 API 管理（显示用户列）
- `/settings/account/api-keys` - 个人 API 密钥（不显示用户列）

## 注意事项

1. **类型转换**：使用 `as any` 进行类型转换，因为 Kysely 无法自动推断 JSON 对象的类型

2. **字段引用**：在 WHERE 和 ORDER BY 子句中使用 `apiKeys.` 前缀，避免字段名冲突

3. **NULL 处理**：使用 `LEFT JOIN` 时，如果用户不存在，creator 字段会是 null

4. **avatarUrl 字段**：注意 PostgreSQL 中字段名大小写敏感，使用双引号 `"avatarUrl"`

## 后续优化建议

1. **缓存用户信息**：对于频繁查询的用户信息，可以考虑缓存

2. **批量查询优化**：如果 API 密钥数量很多，可以考虑分页查询

3. **用户删除处理**：当用户被删除时，可以显示 "已删除的用户" 或保留用户名快照

4. **头像加载优化**：使用懒加载或占位符优化头像加载

## 总结

通过在数据库查询中关联用户表，成功修复了工作区 API 管理页面的用户列显示问题。现在：

- ✅ 用户列正确显示创建者的头像和名称
- ✅ 权限列显示完整的权限信息
- ✅ 数据查询性能良好
- ✅ 支持用户删除场景

这个修复提升了工作区 API 管理的可用性，管理员可以清楚地看到每个 API 密钥是由谁创建的。

---

**修改文件**：`apps/server/src/database/repos/api-key/api-key.repo.ts`

**修改方法**：
- `findByWorkspaceId` - 添加用户关联查询
- `findByCreatorId` - 添加用户关联查询
