# API 密钥权限显示优化说明

## 问题描述

在"设置 > 账户 > API 密钥"和"设置 > 工作区 > API 管理"页面中，权限列显示为 "0"，而不是显示具体的权限信息。

## 问题分析

1. **后端数据正确**：后端正确返回了 `scopes` 数组数据
2. **前端逻辑存在**：前端已有处理 scopes 的逻辑，但显示方式不够友好
3. **显示问题**：原有代码只显示第一个权限的资源类型（如 "pages"），没有显示完整的权限（如 "pages:read"）

## 解决方案

优化权限列的显示方式，使用 Tooltip 浮层来展示完整的权限列表。

### 优化内容

#### 1. 显示完整的权限格式

**修改前：**
```typescript
<Badge size="xs" variant="light">
  {apiKey.scopes[0].split(":")[0]}  // 只显示 "pages"
</Badge>
```

**修改后：**
```typescript
<Badge size="xs" variant="light">
  {apiKey.scopes[0].split(":")[0]}:{apiKey.scopes[0].split(":")[1]}  // 显示 "pages:read"
</Badge>
```

#### 2. 使用 Tooltip 显示所有权限

当鼠标悬停在权限列上时，显示完整的权限列表：

```typescript
<Tooltip
  label={
    <div style={{ maxWidth: 300 }}>
      {apiKey.scopes.map((scope, idx) => (
        <div key={idx}>• {scope}</div>
      ))}
    </div>
  }
  withinPortal
  multiline
>
  {/* 权限徽章 */}
</Tooltip>
```

#### 3. 改进多权限显示

当有多个权限时，显示 "+N" 徽章：

```typescript
{apiKey.scopes.length > 1 && (
  <Badge size="xs" variant="light" color="gray">
    +{apiKey.scopes.length - 1}
  </Badge>
)}
```

## 显示效果

### 单个权限
- 显示：`pages:read`
- 鼠标悬停：显示 `• pages:read`

### 多个权限
- 显示：`pages:read` `+2`
- 鼠标悬停：显示完整列表
  ```
  • pages:read
  • pages:write
  • comments:read
  ```

### 无权限限制
- 显示：`全部`（灰色文本）

## 权限类型说明

API 密钥支持以下权限类型：

### 文档权限
- `pages:read` - 读取文档
- `pages:write` - 写入文档
- `pages:delete` - 删除文档

### 文档库权限
- `spaces:read` - 读取文档库
- `spaces:write` - 写入文档库
- `spaces:delete` - 删除文档库

### 用户权限
- `users:read` - 读取用户信息

### 评论权限
- `comments:read` - 读取评论
- `comments:write` - 写入评论
- `comments:delete` - 删除评论

## 技术实现

### 组件结构

```typescript
<Table.Td>
  {apiKey.scopes && apiKey.scopes.length > 0 ? (
    <Tooltip
      label={/* 完整权限列表 */}
      withinPortal
      multiline
    >
      <Group gap={4} style={{ cursor: 'pointer' }}>
        <Badge size="xs" variant="light">
          {/* 第一个权限 */}
        </Badge>
        {apiKey.scopes.length > 1 && (
          <Badge size="xs" variant="light" color="gray">
            {/* +N 徽章 */}
          </Badge>
        )}
      </Group>
    </Tooltip>
  ) : (
    <Text fz="xs" c="dimmed">
      {t("All")}
    </Text>
  )}
</Table.Td>
```

### 样式特点

1. **紧凑显示**：使用小尺寸徽章（`size="xs"`）
2. **视觉层次**：第一个权限使用默认颜色，"+N" 使用灰色
3. **交互提示**：鼠标悬停时显示指针光标（`cursor: 'pointer'`）
4. **多行支持**：Tooltip 支持多行显示（`multiline`）
5. **最大宽度**：限制 Tooltip 最大宽度为 300px，避免过宽

## 用户体验改进

### 改进前
- ❌ 只显示资源类型（如 "pages"），不知道具体权限
- ❌ 多个权限时，Tooltip 只显示文本列表，不够直观
- ❌ 无法快速了解 API 密钥的权限范围

### 改进后
- ✅ 显示完整权限（如 "pages:read"），一目了然
- ✅ 鼠标悬停显示所有权限，清晰明了
- ✅ 使用徽章和列表，视觉效果更好
- ✅ 快速了解 API 密钥的权限范围

## 测试验证

### 测试场景

1. **单个权限**
   - 创建只有一个权限的 API 密钥（如 `pages:read`）
   - ✅ 验证：显示 `pages:read` 徽章
   - ✅ 验证：鼠标悬停显示 `• pages:read`

2. **多个权限**
   - 创建有多个权限的 API 密钥（如 `pages:read`, `pages:write`, `comments:read`）
   - ✅ 验证：显示 `pages:read` `+2` 徽章
   - ✅ 验证：鼠标悬停显示完整列表

3. **无权限限制**
   - 创建没有设置权限的 API 密钥
   - ✅ 验证：显示 "全部" 灰色文本

4. **响应式测试**
   - 在不同屏幕尺寸下测试
   - ✅ 验证：Tooltip 正确显示，不超出屏幕

5. **国际化测试**
   - 切换到不同语言
   - ✅ 验证：权限名称正确显示（英文保持不变）

## 相关文件

- `apps/client/src/ee/api-key/components/api-key-table.tsx` - 修改的文件

## 注意事项

1. **权限格式**：权限格式为 `resource:action`（如 `pages:read`）
2. **数据类型**：`scopes` 是字符串数组，存储在数据库的 JSONB 字段中
3. **空值处理**：如果 `scopes` 为空或 null，显示 "全部"
4. **Tooltip 性能**：使用 `withinPortal` 确保 Tooltip 正确渲染在 Portal 中

## 后续优化建议

1. **权限翻译**：考虑将权限名称翻译为中文（如 "文档:读取"）
2. **权限图标**：为不同权限类型添加图标
3. **权限分组**：在 Tooltip 中按资源类型分组显示
4. **权限说明**：添加权限的详细说明
5. **颜色编码**：使用不同颜色区分读、写、删除权限

## 总结

通过优化权限列的显示方式，现在用户可以：
- ✅ 快速查看 API 密钥的主要权限
- ✅ 通过鼠标悬停查看完整的权限列表
- ✅ 更好地理解和管理 API 密钥的权限范围

这个改进提升了用户体验，使 API 密钥管理更加直观和高效。

---

**修改文件**：`apps/client/src/ee/api-key/components/api-key-table.tsx`

**修改内容**：优化权限列的显示，使用完整的权限格式和 Tooltip 浮层
