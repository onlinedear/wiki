# API 密钥自动刷新修复说明

## 问题描述

在"设置 > 账户 > API 密钥"和"设置 > 工作区 > API 管理"页面中，创建、更新或删除 API 密钥后，页面不会自动刷新，需要手动刷新页面才能看到更改。

## 问题原因

在 `apps/client/src/ee/api-key/queries/api-key-query.ts` 中，mutation 的 `onSuccess` 回调只失效了以下查询缓存：
- `"api-key-list"` - 工作区 API 密钥列表
- `"api-key-stats"` - API 密钥统计

但没有失效：
- `"user-api-key-list"` - 个人 API 密钥列表

这导致在个人 API 密钥页面进行操作后，查询缓存没有被失效，页面不会自动刷新。

## 解决方案

在所有 API 密钥相关的 mutation 中，添加 `"user-api-key-list"` 到缓存失效列表。

### 修改的 Mutation

1. **useCreateApiKeyMutation** - 创建 API 密钥
2. **useUpdateApiKeyMutation** - 更新 API 密钥
3. **useRevokeApiKeyMutation** - 撤销 API 密钥

### 修改内容

**修改前：**
```typescript
queryClient.invalidateQueries({
  predicate: (item) =>
    ["api-key-list", "api-key-stats"].includes(item.queryKey[0] as string),
});
```

**修改后：**
```typescript
queryClient.invalidateQueries({
  predicate: (item) =>
    ["api-key-list", "user-api-key-list", "api-key-stats"].includes(item.queryKey[0] as string),
});
```

## 影响范围

此修复影响以下页面：
- ✅ **个人 API 密钥页面** (`/settings/account/api-keys`)
  - 创建密钥后自动刷新列表
  - 更新密钥后自动刷新列表
  - 撤销密钥后自动刷新列表

- ✅ **工作区 API 管理页面** (`/settings/api-keys`)
  - 创建密钥后自动刷新列表
  - 更新密钥后自动刷新列表
  - 撤销密钥后自动刷新列表

## 技术细节

### 查询缓存键

1. **工作区 API 密钥列表**
   ```typescript
   queryKey: ["api-key-list", workspace?.id, params]
   ```

2. **个人 API 密钥列表**
   ```typescript
   queryKey: ["user-api-key-list", workspace?.id, params]
   ```

3. **API 密钥统计**
   ```typescript
   queryKey: ["api-key-stats", workspace?.id]
   ```

### 缓存失效策略

使用 `predicate` 函数来匹配所有相关的查询缓存：
```typescript
queryClient.invalidateQueries({
  predicate: (item) =>
    ["api-key-list", "user-api-key-list", "api-key-stats"].includes(
      item.queryKey[0] as string
    ),
});
```

这会失效所有以这些键开头的查询，无论它们的其他参数（如 workspaceId、params）是什么。

## 测试验证

### 个人 API 密钥页面测试

1. **创建密钥**
   - 访问 `/settings/account/api-keys`
   - 点击"创建 API 密钥"
   - 填写信息并创建
   - ✅ 验证：列表自动刷新，新密钥出现在列表中

2. **更新密钥**
   - 点击某个密钥的"编辑"按钮
   - 修改名称或描述
   - 保存更改
   - ✅ 验证：列表自动刷新，显示更新后的信息

3. **撤销密钥**
   - 点击某个密钥的"撤销"按钮
   - 确认撤销
   - ✅ 验证：列表自动刷新，密钥从列表中消失

### 工作区 API 管理页面测试

1. **创建密钥**
   - 访问 `/settings/api-keys`（需要管理员权限）
   - 点击"创建 API 密钥"
   - 填写信息并创建
   - ✅ 验证：列表自动刷新，新密钥出现在列表中

2. **更新密钥**
   - 点击某个密钥的"编辑"按钮
   - 修改名称或描述
   - 保存更改
   - ✅ 验证：列表自动刷新，显示更新后的信息

3. **撤销密钥**
   - 点击某个密钥的"撤销"按钮
   - 确认撤销
   - ✅ 验证：列表自动刷新，密钥从列表中消失

### 跨页面测试

1. **在个人页面创建，在管理页面查看**
   - 在 `/settings/account/api-keys` 创建密钥
   - 切换到 `/settings/api-keys`（管理员）
   - ✅ 验证：新密钥出现在管理页面列表中

2. **在管理页面撤销，在个人页面查看**
   - 在 `/settings/api-keys` 撤销某个密钥
   - 切换到 `/settings/account/api-keys`
   - ✅ 验证：密钥从个人页面列表中消失

## 相关文件

- `apps/client/src/ee/api-key/queries/api-key-query.ts` - 修改的文件

## 注意事项

1. **缓存失效是全局的**：失效操作会影响所有相关的查询缓存，包括不同页面的缓存。

2. **自动重新获取**：当缓存被失效后，如果有组件正在使用这些查询，React Query 会自动重新获取数据。

3. **性能考虑**：使用 `predicate` 函数可以精确控制哪些查询需要被失效，避免不必要的重新获取。

4. **一致性保证**：确保所有修改 API 密钥的操作都失效相同的缓存键，保持数据一致性。

## 总结

通过在所有 API 密钥 mutation 的 `onSuccess` 回调中添加 `"user-api-key-list"` 到缓存失效列表，解决了个人 API 密钥页面不自动刷新的问题。现在无论在哪个页面进行操作，所有相关页面的数据都会自动刷新。

---

**修改文件**：`apps/client/src/ee/api-key/queries/api-key-query.ts`

**修改内容**：在 `useCreateApiKeyMutation`、`useUpdateApiKeyMutation`、`useRevokeApiKeyMutation` 的缓存失效列表中添加 `"user-api-key-list"`
