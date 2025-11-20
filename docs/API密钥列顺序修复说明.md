# API 密钥列顺序修复说明

## 问题描述

在个人 API 密钥页面（`http://localhost:5173/settings/api-keys`）中，表格列的显示存在以下问题：

1. **缺少"用户"列**：原本应该显示 API 创建者的用户名，但该列未显示
2. **列顺序错误**：原来的顺序是"用户"列在"权限"列之前，需要调整为"权限"列在"用户"列之前

## 期望的列顺序

修复后的列顺序应该是：

1. **状态** (Status) - API 密钥的状态（活跃/过期等）
2. **名称** (Name) - API 密钥的名称和描述
3. **权限** (Permissions) - API 密钥的权限范围
4. **用户** (User) - API 创建者的用户名（带头像）
5. **请求数** (Requests) - API 密钥的使用次数
6. **最后使用** (Last used) - 最后一次使用时间
7. **过期时间** (Expires) - 密钥过期时间
8. **操作** (Actions) - 编辑、撤销等操作按钮

## 修复内容

### 1. 启用用户列显示

**文件**: `apps/client/src/pages/settings/account/api-keys.tsx`

修改 `ApiKeyTable` 组件的 `showUserColumn` 属性：

```tsx
// 修改前
<ApiKeyTable
  apiKeys={filteredApiKeys}
  isLoading={isLoading}
  showUserColumn={false}  // ❌ 不显示用户列
  onUpdate={handleUpdate}
  onRevoke={handleRevoke}
  onViewDetails={handleViewDetails}
/>

// 修改后
<ApiKeyTable
  apiKeys={filteredApiKeys}
  isLoading={isLoading}
  showUserColumn={true}  // ✅ 显示用户列
  onUpdate={handleUpdate}
  onRevoke={handleRevoke}
  onViewDetails={handleViewDetails}
/>
```

### 2. 调整列顺序

**文件**: `apps/client/src/ee/api-key/components/api-key-table.tsx`

#### 表头部分

```tsx
// 修改前
<Table.Thead>
  <Table.Tr>
    <Table.Th>{t("Status")}</Table.Th>
    <Table.Th>{t("Name")}</Table.Th>
    {showUserColumn && <Table.Th>{t("User")}</Table.Th>}  // ❌ 用户列在前
    <Table.Th>{t("Permissions")}</Table.Th>  // ❌ 权限列在后
    <Table.Th>{t("Requests")}</Table.Th>
    <Table.Th>{t("Last used")}</Table.Th>
    <Table.Th>{t("Expires")}</Table.Th>
    <Table.Th></Table.Th>
  </Table.Tr>
</Table.Thead>

// 修改后
<Table.Thead>
  <Table.Tr>
    <Table.Th>{t("Status")}</Table.Th>
    <Table.Th>{t("Name")}</Table.Th>
    <Table.Th>{t("Permissions")}</Table.Th>  // ✅ 权限列在前
    {showUserColumn && <Table.Th>{t("User")}</Table.Th>}  // ✅ 用户列在后
    <Table.Th>{t("Requests")}</Table.Th>
    <Table.Th>{t("Last used")}</Table.Th>
    <Table.Th>{t("Expires")}</Table.Th>
    <Table.Th></Table.Th>
  </Table.Tr>
</Table.Thead>
```

#### 表体部分

调整了 `<Table.Td>` 的顺序，确保权限列在用户列之前显示。

### 3. 补充翻译

**文件**: `apps/client/public/locales/en-US/translation.json`

添加了缺失的 "Permissions" 翻译键：

```json
{
  "Permissions": "Permissions"
}
```

中文翻译文件中已经存在该键：

```json
{
  "Permissions": "权限"
}
```

## 涉及的文件

### 核心文件
1. `apps/client/src/pages/settings/account/api-keys.tsx` - 个人 API 密钥页面
2. `apps/client/src/ee/api-key/components/api-key-table.tsx` - API 密钥表格组件

### 翻译文件
3. `apps/client/public/locales/en-US/translation.json` - 英文翻译
4. `apps/client/public/locales/zh-CN/translation.json` - 中文翻译

### 验证脚本
5. `scripts/verify-api-key-columns.sh` - 列顺序验证脚本

## 验证方法

运行验证脚本：

```bash
./scripts/verify-api-key-columns.sh
```

该脚本会检查：
- ✓ 个人 API 密钥页面是否启用了 showUserColumn
- ✓ API 密钥表格组件的表头列顺序是否正确
- ✓ API 密钥表格组件的表体列顺序是否正确
- ✓ 工作区 API 管理页面的配置
- ✓ 中英文翻译文件是否包含必需的键

## 测试步骤

### 1. 访问个人 API 密钥页面
1. 登录系统
2. 进入 "设置" → "API 密钥"
3. 查看 API 密钥列表表格

### 2. 验证列顺序
确认表格列的顺序为：
1. 状态
2. 名称
3. **权限** ← 应该在这里
4. **用户** ← 应该在这里（显示创建者头像和用户名）
5. 请求数
6. 最后使用
7. 过期时间
8. 操作

### 3. 验证用户列内容
- 用户列应该显示 API 创建者的头像和用户名
- 在个人 API 密钥页面，所有 API 密钥的创建者都应该是当前登录用户

### 4. 验证权限列内容
- 权限列应该显示 API 密钥的权限范围
- 如果有多个权限，应该显示第一个权限和 "+N" 的标记
- 鼠标悬停时应该显示完整的权限列表

## 影响范围

### 个人 API 密钥页面
- ✅ 现在显示"用户"列，展示 API 创建者信息
- ✅ 列顺序已调整为：权限 → 用户
- ✅ 用户体验改善：更清晰地展示 API 密钥信息

### 工作区 API 管理页面
- ✅ 保持不变，继续显示所有用户的 API 密钥
- ✅ 列顺序与个人页面保持一致

### 多语言支持
- ✅ 中英文环境下都能正确显示列标题
- ✅ 补充了英文翻译中缺失的 "Permissions" 键

## 注意事项

1. **用户列显示条件**：只有当 `showUserColumn={true}` 时才显示用户列
2. **创建者信息**：用户列显示的是 `apiKey.creator` 的信息（头像和用户名）
3. **权限显示**：权限列会智能显示，如果权限过多会折叠显示
4. **响应式设计**：表格支持横向滚动，确保在小屏幕上也能正常显示

## 相关页面

- **个人 API 密钥页面**: `/settings/api-keys`
- **工作区 API 管理页面**: `/settings/workspace/api-management`（仅管理员可见）

## 完成状态

✅ 个人 API 密钥页面启用用户列  
✅ 列顺序已调整（权限 → 用户）  
✅ 翻译文件已补充  
✅ 验证脚本已创建  
✅ 所有检查通过  
✅ 文档已完成
