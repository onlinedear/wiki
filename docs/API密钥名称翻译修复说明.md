# API 密钥名称翻译修复说明

## 问题描述

在 API 密钥管理页面中，表格的"名称"列标题显示为 "Site Name"（站点名称），而不是 "API 密钥名称" 或简单的 "名称"。

## 问题原因

在语言包 `apps/client/public/locales/zh-CN/translation.json` 中：
- 存在 `"Workspace Name": "站点名称"` 的翻译
- 但缺少通用的 `"Name": "名称"` 翻译

当代码中使用 `t("Name")` 时，i18n 可能会匹配到 `"Workspace Name"` 并显示为 "站点名称"。

## 使用 "Name" 的位置

### 1. API 密钥表格
**文件**: `apps/client/src/ee/api-key/components/api-key-table.tsx`

```typescript
<Table.Th>{t("Name")}</Table.Th>
```

### 2. 创建 API 密钥表单
**文件**: `apps/client/src/ee/api-key/components/create-api-key-modal.tsx`

```typescript
<TextInput
  label={t("Name")}
  placeholder={t("e.g., Production API Key")}
  description={t("A descriptive name for this API key")}
  required
  {...form.getInputProps("name")}
/>
```

### 3. 更新 API 密钥表单
**文件**: `apps/client/src/ee/api-key/components/update-api-key-modal.tsx`

```typescript
<TextInput
  label={t("Name")}
  placeholder={t("Enter a descriptive token name")}
  required
  {...form.getInputProps("name")}
/>
```

## 解决方案

在语言包中添加通用的 "Name" 翻译：

```json
{
  "Name": "名称"
}
```

### 修改位置

**文件**: `apps/client/public/locales/zh-CN/translation.json`

在 API 密钥相关翻译附近添加：

```json
{
  "Basic Info": "基本信息",
  "Name and description": "名称和描述",
  "Name": "名称",
  "Create a new API key to access the Docmost API programmatically": "创建新的 API 密钥以编程方式访问 Docmost API"
}
```

## 修复效果

### 修复前
- 表格列标题：**站点名称** ❌
- 表单标签：**站点名称** ❌

### 修复后
- 表格列标题：**名称** ✅
- 表单标签：**名称** ✅

## 影响范围

此修复影响以下页面和组件：

### 1. 个人 API 密钥页面
**路径**: `/settings/account/api-keys`

- ✅ 表格列标题：名称
- ✅ 创建表单：名称
- ✅ 更新表单：名称

### 2. 工作区 API 管理页面
**路径**: `/settings/api-keys`

- ✅ 表格列标题：名称
- ✅ 创建表单：名称
- ✅ 更新表单：名称

### 3. 其他可能使用 "Name" 的地方

由于添加了通用的 "Name" 翻译，其他使用 `t("Name")` 的地方也会受益，显示为 "名称" 而不是 "站点名称"。

## 相关翻译

### 现有的名称相关翻译

```json
{
  "Group name": "用户组名称",
  "Space name": "文档库名称",
  "Workspace Name": "站点名称",
  "Your name": "您的姓名",
  "Your Name": "您的姓名",
  "Display name": "显示名称",
  "Name": "名称"  // 新增
}
```

### 翻译优先级

i18n 会按照以下优先级匹配翻译：
1. 精确匹配（如 `"Workspace Name"`）
2. 通用匹配（如 `"Name"`）

因此：
- `t("Workspace Name")` → "站点名称" ✅
- `t("Name")` → "名称" ✅

## 测试验证

### 个人 API 密钥页面测试

1. 访问 `/settings/account/api-keys`
2. ✅ 验证：表格列标题显示 "名称"
3. 点击"创建 API 密钥"
4. ✅ 验证：表单标签显示 "名称"
5. 创建一个 API 密钥
6. 点击"编辑"
7. ✅ 验证：更新表单标签显示 "名称"

### 工作区 API 管理页面测试

1. 访问 `/settings/api-keys`（需要管理员权限）
2. ✅ 验证：表格列标题显示 "名称"
3. 点击"创建 API 密钥"
4. ✅ 验证：表单标签显示 "名称"
5. 创建一个 API 密钥
6. 点击"编辑"
7. ✅ 验证：更新表单标签显示 "名称"

### 其他页面测试

检查其他可能使用 `t("Name")` 的页面，确保翻译正确：
- ✅ 用户组管理：应显示 "用户组名称"（使用 `t("Group name")`）
- ✅ 文档库管理：应显示 "文档库名称"（使用 `t("Space name")`）
- ✅ 工作区设置：应显示 "站点名称"（使用 `t("Workspace Name")`）

## 注意事项

### 1. 翻译键的命名规范

- **通用翻译**：使用简单的键名（如 `"Name"`）
- **特定翻译**：使用描述性的键名（如 `"Workspace Name"`, `"Group name"`）

### 2. 避免翻译冲突

确保通用翻译不会覆盖特定翻译：
- ✅ `t("Name")` → "名称"
- ✅ `t("Workspace Name")` → "站点名称"
- ✅ `t("Group name")` → "用户组名称"

### 3. 翻译一致性

在整个应用中保持翻译的一致性：
- 表格列标题使用 "名称"
- 表单标签使用 "名称"
- 详情页面使用 "名称"

## 相关文件

### 修改的文件
- `apps/client/public/locales/zh-CN/translation.json` - 添加 "Name" 翻译

### 使用 "Name" 的文件
- `apps/client/src/ee/api-key/components/api-key-table.tsx` - 表格列标题
- `apps/client/src/ee/api-key/components/create-api-key-modal.tsx` - 创建表单
- `apps/client/src/ee/api-key/components/update-api-key-modal.tsx` - 更新表单

## 总结

通过在语言包中添加通用的 `"Name": "名称"` 翻译，修复了 API 密钥管理页面中名称列显示为 "站点名称" 的问题。

现在：
- ✅ 表格列标题正确显示为 "名称"
- ✅ 表单标签正确显示为 "名称"
- ✅ 不影响其他特定的名称翻译（如 "站点名称"、"用户组名称" 等）

这个修复提升了用户界面的准确性和一致性。

---

**修改文件**：`apps/client/public/locales/zh-CN/translation.json`

**修改内容**：添加 `"Name": "名称"` 翻译
