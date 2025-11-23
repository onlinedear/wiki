# API 密钥使用完整指南

> 本指南将详细介绍如何在 NoteDoc 中创建、管理和使用 API 密钥，帮助您实现程序化访问和自动化集成。

## 📋 目录

- [什么是 API 密钥](#什么是-api-密钥)
- [快速开始](#快速开始)
- [创建 API 密钥](#创建-api-密钥)
- [使用 API 密钥](#使用-api-密钥)
- [管理 API 密钥](#管理-api-密钥)
- [权限范围详解](#权限范围详解)
- [安全最佳实践](#安全最佳实践)
- [编程语言示例](#编程语言示例)
- [常见问题](#常见问题)
- [故障排查](#故障排查)

---

## 什么是 API 密钥

API 密钥（API Key）是一种用于程序化访问 NoteDoc 的认证凭证。它允许您：

- 🤖 **自动化操作** - 通过脚本自动创建、更新文档
- 🔗 **系统集成** - 将 NoteDoc 与其他系统集成
- 📊 **数据同步** - 自动同步数据到 NoteDoc
- 🔄 **CI/CD 集成** - 在持续集成流程中更新文档
- 📱 **第三方应用** - 开发基于 NoteDoc 的应用

### API 密钥的特点

✅ **安全存储** - 使用 SHA-256 哈希加密存储  
✅ **细粒度权限** - 可以精确控制访问范围  
✅ **使用追踪** - 记录每次使用的时间和 IP  
✅ **灵活过期** - 支持自定义过期时间  
✅ **随时撤销** - 可以随时禁用或删除  

---

## 快速开始

### 第一步：访问 API 密钥管理页面

1. 登录 NoteDoc
2. 点击右上角的用户头像
3. 选择 **"设置"** → **"工作空间"**
4. 在左侧菜单中点击 **"API 密钥"**


### 第二步：创建您的第一个 API 密钥

1. 点击 **"创建 API 密钥"** 按钮
2. 按照向导填写信息（详见下文）
3. **重要**：复制生成的密钥（以 `dk_` 开头），这是唯一一次显示

### 第三步：测试 API 密钥

使用以下命令快速测试：

```bash
curl -H "Authorization: Bearer dk_你的密钥" \
  http://localhost:3000/api/workspaces/工作空间ID/api-keys
```

如果返回 JSON 数据，说明密钥可以正常使用！

---

## 创建 API 密钥

### 创建向导详解

API 密钥创建采用三步向导式流程，让配置更加清晰：

#### 步骤 1：基本信息

**名称**（必填）
- 为密钥起一个有意义的名称
- 建议包含用途信息，如 "自动化备份脚本"、"CI/CD 部署"
- 示例：`生产环境部署密钥`、`数据同步脚本`

**描述**（可选）
- 详细说明这个密钥的用途
- 记录使用场景和负责人
- 示例：`用于每日自动备份所有文档到云存储，由运维团队管理`

#### 步骤 2：权限配置

选择此密钥可以执行的操作。遵循**最小权限原则**，只授予必要的权限。

**文档权限**
- ✅ `pages:read` - 读取文档内容
- ✅ `pages:write` - 创建和编辑文档
- ✅ `pages:delete` - 删除文档

**文档库权限**
- ✅ `spaces:read` - 读取文档库信息
- ✅ `spaces:write` - 创建和编辑文档库
- ✅ `spaces:delete` - 删除文档库

**用户权限**
- ✅ `users:read` - 读取用户信息

**评论权限**
- ✅ `comments:read` - 读取评论
- ✅ `comments:write` - 创建和编辑评论
- ✅ `comments:delete` - 删除评论

**权限选择建议**：
- 📖 只读操作：选择 `pages:read`、`spaces:read`
- 📝 内容管理：选择 `pages:read`、`pages:write`
- 🗑️ 完全控制：选择所有相关权限


#### 步骤 3：安全设置

**过期时间**
- **30 天** - 适合临时测试
- **90 天** - 适合短期项目
- **1 年** - 适合长期使用
- **永不过期** - 适合核心系统（需定期审查）
- **自定义** - 选择特定日期

**建议**：
- 测试环境：30 天
- 生产环境：90 天或 1 年，并设置提醒
- 关键系统：定期轮换（每 90 天）

**IP 白名单**（即将支持）
- 限制只有特定 IP 可以使用此密钥
- 提高安全性

**速率限制**（即将支持）
- 限制每分钟/小时的请求次数
- 防止滥用

### 创建成功后

创建成功后，系统会显示完整的 API 密钥：

```
dk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

⚠️ **重要提示**：
- 这是**唯一一次**可以看到完整密钥
- 请立即复制并保存到安全的地方
- 数据库中只存储加密后的哈希值
- 如果丢失，只能重新创建新密钥

**推荐存储方式**：
- 环境变量文件（`.env`）
- 密钥管理服务（如 AWS Secrets Manager、HashiCorp Vault）
- 密码管理器（如 1Password、LastPass）

---

## 使用 API 密钥

### 认证方式

NoteDoc 支持两种 API 密钥认证方式：

#### 方式 1：Authorization Header（推荐）

```bash
curl -H "Authorization: Bearer dk_你的密钥" \
  http://localhost:3000/api/endpoint
```

这是最常用的方式，符合 OAuth 2.0 标准。

#### 方式 2：X-API-Key Header

```bash
curl -H "X-API-Key: dk_你的密钥" \
  http://localhost:3000/api/endpoint
```

这是一种简化的方式，某些工具可能更容易使用。

### API 端点说明

所有 API 端点都需要包含工作空间 ID：

```
基础 URL: http://localhost:3000/api
完整路径: /workspaces/{workspaceId}/资源路径
```

**如何获取工作空间 ID**：
1. 登录 NoteDoc
2. 查看浏览器地址栏
3. URL 中包含的 UUID 即为工作空间 ID

示例：`http://localhost:5173/workspace/abc123-def456-...`


### 基本 API 操作示例

#### 1. 获取所有 API 密钥

```bash
curl -X GET \
  "http://localhost:3000/api/workspaces/工作空间ID/api-keys" \
  -H "Authorization: Bearer dk_你的密钥"
```

**响应示例**：
```json
[
  {
    "id": "uuid-1234",
    "name": "生产环境密钥",
    "description": "用于生产环境部署",
    "scopes": ["pages:read", "pages:write"],
    "status": "active",
    "createdAt": "2025-01-01T00:00:00Z",
    "expiresAt": "2025-12-31T23:59:59Z",
    "lastUsedAt": "2025-11-20T10:30:00Z",
    "usageCount": 1523,
    "creator": {
      "id": "user-uuid",
      "name": "张三",
      "email": "zhangsan@example.com"
    }
  }
]
```

#### 2. 获取统计信息

```bash
curl -X GET \
  "http://localhost:3000/api/workspaces/工作空间ID/api-keys/stats" \
  -H "Authorization: Bearer dk_你的密钥"
```

**响应示例**：
```json
{
  "total": 5,
  "active": 3,
  "inactive": 2,
  "expiringWithin7Days": 1,
  "totalRequests": 15234
}
```

#### 3. 创建新的 API 密钥

```bash
curl -X POST \
  "http://localhost:3000/api/workspaces/工作空间ID/api-keys" \
  -H "Authorization: Bearer dk_你的密钥" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试密钥",
    "description": "用于开发测试",
    "scopes": ["pages:read"],
    "expiresAt": "2025-12-31T23:59:59Z"
  }'
```

**响应示例**：
```json
{
  "id": "new-uuid",
  "name": "测试密钥",
  "token": "dk_新生成的完整密钥",
  "scopes": ["pages:read"],
  "status": "active",
  "expiresAt": "2025-12-31T23:59:59Z",
  "createdAt": "2025-11-20T12:00:00Z"
}
```

⚠️ 注意：`token` 字段只在创建时返回一次！

#### 4. 更新 API 密钥

```bash
curl -X PUT \
  "http://localhost:3000/api/workspaces/工作空间ID/api-keys/密钥ID" \
  -H "Authorization: Bearer dk_你的密钥" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "更新后的名称",
    "description": "更新后的描述",
    "scopes": ["pages:read", "pages:write"],
    "status": "active"
  }'
```

#### 5. 禁用 API 密钥

```bash
curl -X PUT \
  "http://localhost:3000/api/workspaces/工作空间ID/api-keys/密钥ID" \
  -H "Authorization: Bearer dk_你的密钥" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

#### 6. 删除 API 密钥

```bash
curl -X DELETE \
  "http://localhost:3000/api/workspaces/工作空间ID/api-keys/密钥ID" \
  -H "Authorization: Bearer dk_你的密钥"
```

注意：这是软删除，数据不会真正从数据库中删除。


---

## 管理 API 密钥

### 查看密钥列表

在 API 密钥管理页面，您可以看到：

**统计卡片**
- 📊 总密钥数
- ✅ 活跃密钥数
- ⚠️ 即将过期的密钥数
- 📈 总请求次数

**密钥列表表格**

| 列名 | 说明 |
|------|------|
| 名称 | 密钥的名称 |
| 创建者 | 创建此密钥的用户 |
| 权限 | 授予的权限范围数量 |
| 状态 | active（活跃）/ inactive（禁用）/ expired（已过期）|
| 使用次数 | 累计使用次数 |
| 最后使用 | 最后一次使用的时间 |
| 创建时间 | 密钥创建时间 |
| 过期时间 | 密钥过期时间 |
| 操作 | 查看、编辑、删除按钮 |

### 查看密钥详情

点击表格中的 👁️ 图标，可以在侧边栏查看完整信息：

**基本信息**
- 名称和描述
- 创建者信息
- 创建时间和过期时间

**权限列表**
- 显示所有授予的权限
- 按资源类型分组

**使用统计**
- 总使用次数
- 最后使用时间
- 最后使用的 IP 地址

**安全设置**
- 状态（活跃/禁用）
- 过期时间
- IP 白名单（如果配置）

### 编辑密钥

点击 ✏️ 图标可以修改：

✅ **可以修改**：
- 名称
- 描述
- 权限范围
- 状态（启用/禁用）
- 过期时间

❌ **不能修改**：
- 密钥本身（token）
- 创建者
- 工作空间
- 创建时间

如果需要更改密钥本身，必须创建新密钥并删除旧密钥。

### 禁用 vs 删除

**禁用密钥**
- 密钥暂时不可用
- 可以随时重新启用
- 保留所有历史记录
- 适合临时停用

**删除密钥**
- 密钥永久不可用
- 无法恢复（软删除）
- 保留历史记录但不可见
- 适合不再需要的密钥

### 搜索和过滤

**搜索功能**
- 按名称搜索
- 按创建者搜索
- 实时搜索，无需点击按钮

**过滤功能**
- 按状态过滤：全部 / 活跃 / 禁用 / 已过期
- 按权限过滤：包含特定权限的密钥
- 按创建时间排序


---

## 权限范围详解

### 权限格式

权限采用 `资源:操作` 的格式，例如 `pages:read`。

### 文档权限（Pages）

#### `pages:read` - 读取文档
**允许的操作**：
- 获取文档列表
- 读取文档内容
- 查看文档元数据
- 搜索文档

**使用场景**：
- 📊 数据分析和报表
- 🔍 内容搜索和索引
- 📱 只读应用
- 📖 文档浏览器

**示例**：
```bash
# 获取所有文档
curl -H "Authorization: Bearer dk_密钥" \
  http://localhost:3000/api/pages
```

#### `pages:write` - 创建和编辑文档
**允许的操作**：
- 创建新文档
- 编辑现有文档
- 更新文档内容
- 修改文档属性

**使用场景**：
- ✍️ 自动化内容发布
- 🔄 内容同步
- 📝 批量更新
- 🤖 内容生成

**示例**：
```bash
# 创建新文档
curl -X POST \
  -H "Authorization: Bearer dk_密钥" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新文档",
    "content": "文档内容",
    "spaceId": "文档库ID"
  }' \
  http://localhost:3000/api/pages
```

#### `pages:delete` - 删除文档
**允许的操作**：
- 删除文档
- 移动文档到垃圾箱
- 永久删除文档

**使用场景**：
- 🗑️ 清理过期内容
- 🔄 内容迁移
- 🧹 批量清理

**⚠️ 警告**：此权限具有破坏性，请谨慎授予！

### 文档库权限（Spaces）

#### `spaces:read` - 读取文档库
**允许的操作**：
- 获取文档库列表
- 查看文档库信息
- 读取文档库设置

**使用场景**：
- 📊 组织结构分析
- 🗂️ 文档库浏览
- 📈 统计报表

#### `spaces:write` - 创建和编辑文档库
**允许的操作**：
- 创建新文档库
- 编辑文档库信息
- 更新文档库设置

**使用场景**：
- 🏗️ 自动化项目创建
- 🔄 批量配置
- 📁 组织结构管理

#### `spaces:delete` - 删除文档库
**允许的操作**：
- 删除文档库
- 移动文档库到垃圾箱

**⚠️ 警告**：此权限具有高度破坏性，请极其谨慎！

### 用户权限（Users）

#### `users:read` - 读取用户信息
**允许的操作**：
- 获取用户列表
- 查看用户资料
- 读取用户权限

**使用场景**：
- 👥 用户管理
- 📊 成员统计
- 🔍 用户搜索


### 评论权限（Comments）

#### `comments:read` - 读取评论
**允许的操作**：
- 获取评论列表
- 查看评论内容
- 读取评论元数据

**使用场景**：
- 💬 评论分析
- 📊 反馈收集
- 🔍 内容审核

#### `comments:write` - 创建和编辑评论
**允许的操作**：
- 创建新评论
- 编辑现有评论
- 回复评论

**使用场景**：
- 🤖 自动回复
- 💬 批量评论
- 🔔 通知系统

#### `comments:delete` - 删除评论
**允许的操作**：
- 删除评论
- 批量删除评论

**使用场景**：
- 🧹 内容审核
- 🗑️ 垃圾评论清理

### 权限组合建议

**只读访问**（最安全）
```json
["pages:read", "spaces:read", "users:read", "comments:read"]
```
适合：数据分析、报表生成、内容浏览

**内容管理**（常用）
```json
["pages:read", "pages:write", "spaces:read", "comments:read", "comments:write"]
```
适合：内容发布、文档同步、自动化更新

**完全控制**（谨慎使用）
```json
[
  "pages:read", "pages:write", "pages:delete",
  "spaces:read", "spaces:write", "spaces:delete",
  "users:read",
  "comments:read", "comments:write", "comments:delete"
]
```
适合：管理员工具、完整备份、系统迁移

---

## 安全最佳实践

### 1. 密钥存储

❌ **不要这样做**：
```javascript
// 硬编码在代码中
const API_KEY = 'dk_a1b2c3d4e5f6...';
```

✅ **应该这样做**：
```javascript
// 使用环境变量
const API_KEY = process.env.DOCMOST_API_KEY;
```

**推荐的存储方式**：

**开发环境** - 使用 `.env` 文件
```bash
# .env
DOCMOST_API_KEY=dk_你的密钥
DOCMOST_WORKSPACE_ID=你的工作空间ID
```

```javascript
// 使用 dotenv 加载
require('dotenv').config();
const apiKey = process.env.DOCMOST_API_KEY;
```

**生产环境** - 使用密钥管理服务
- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- Google Cloud Secret Manager

**本地开发** - 使用密码管理器
- 1Password
- LastPass
- Bitwarden

### 2. 最小权限原则

只授予完成任务所需的最小权限。

**示例场景**：

📖 **场景：自动生成文档报表**
```json
{
  "scopes": ["pages:read", "spaces:read"]
}
```
不需要写入和删除权限。

✍️ **场景：自动发布文档**
```json
{
  "scopes": ["pages:read", "pages:write", "spaces:read"]
}
```
需要读取和写入，但不需要删除。

🗑️ **场景：清理过期内容**
```json
{
  "scopes": ["pages:read", "pages:delete"]
}
```
需要读取和删除，但不需要写入。


### 3. 定期轮换密钥

建立密钥轮换计划：

**测试环境**：每 30 天
**开发环境**：每 90 天
**生产环境**：每 90-180 天

**轮换步骤**：
1. 创建新密钥
2. 在应用中配置新密钥
3. 测试新密钥是否正常工作
4. 禁用旧密钥（观察 24 小时）
5. 确认无问题后删除旧密钥

### 4. 监控使用情况

定期检查 API 密钥的使用情况：

**检查项目**：
- ✅ 使用次数是否异常
- ✅ 最后使用时间是否符合预期
- ✅ 使用的 IP 地址是否正确
- ✅ 是否有未使用的密钥

**异常情况处理**：
- 🚨 使用次数突然激增 → 可能被滥用，立即禁用
- 🚨 陌生 IP 地址 → 可能泄露，立即撤销
- 🚨 长期未使用 → 考虑删除

### 5. 设置过期时间

始终为 API 密钥设置合理的过期时间：

**推荐设置**：
- 🧪 测试用途：7-30 天
- 🔧 开发用途：30-90 天
- 🏭 生产用途：90-365 天
- ⚠️ 避免：永不过期

**过期提醒**：
- 在过期前 7 天收到通知
- 在过期前 1 天收到紧急通知
- 过期后密钥自动失效

### 6. 网络安全

**HTTPS 传输**
```bash
# ✅ 使用 HTTPS
curl -H "Authorization: Bearer dk_密钥" \
  https://your-domain.com/api/...

# ❌ 避免使用 HTTP（生产环境）
curl -H "Authorization: Bearer dk_密钥" \
  http://your-domain.com/api/...
```

**IP 白名单**（即将支持）
```json
{
  "ipWhitelist": ["192.168.1.100", "10.0.0.0/24"]
}
```

### 7. 代码安全

**不要提交到版本控制**

`.gitignore` 文件应包含：
```
.env
.env.local
.env.*.local
secrets/
```

**检查是否泄露**：
```bash
# 检查 Git 历史中是否有密钥
git log -p | grep -i "dk_"
```

**如果不小心提交了密钥**：
1. 立即撤销该密钥
2. 创建新密钥
3. 使用 `git filter-branch` 或 `BFG Repo-Cleaner` 清理历史
4. 强制推送到远程仓库

### 8. 团队协作

**密钥命名规范**：
```
[环境]-[用途]-[负责人]
例如：prod-backup-ops-team
     dev-testing-zhangsan
```

**文档记录**：
- 📝 记录每个密钥的用途
- 👤 记录负责人和联系方式
- 📅 记录创建和过期时间
- 🔄 记录轮换计划

**权限分离**：
- 开发人员：只能创建开发环境密钥
- 运维人员：可以创建生产环境密钥
- 管理员：可以管理所有密钥

---

## 编程语言示例

### JavaScript / Node.js

#### 使用 Fetch API

```javascript
// config.js
require('dotenv').config();

const config = {
  apiKey: process.env.DOCMOST_API_KEY,
  workspaceId: process.env.DOCMOST_WORKSPACE_ID,
  baseUrl: process.env.DOCMOST_API_URL || 'http://localhost:3000/api'
};

module.exports = config;
```

```javascript
// api-client.js
const config = require('./config');

class NoteDocClient {
  constructor() {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.workspaceId = config.workspaceId;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/workspaces/${this.workspaceId}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${response.status} - ${error.message}`);
    }

    return response.json();
  }

  // 获取所有 API 密钥
  async getApiKeys() {
    return this.request('/api-keys');
  }

  // 创建 API 密钥
  async createApiKey(data) {
    return this.request('/api-keys', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 更新 API 密钥
  async updateApiKey(id, data) {
    return this.request(`/api-keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 删除 API 密钥
  async deleteApiKey(id) {
    return this.request(`/api-keys/${id}`, {
      method: 'DELETE'
    });
  }

  // 获取统计信息
  async getStats() {
    return this.request('/api-keys/stats');
  }
}

module.exports = NoteDocClient;
```


**使用示例**：

```javascript
// main.js
const NoteDocClient = require('./api-client');

async function main() {
  const client = new NoteDocClient();

  try {
    // 获取所有 API 密钥
    const keys = await client.getApiKeys();
    console.log(`找到 ${keys.length} 个 API 密钥`);

    // 创建新密钥
    const newKey = await client.createApiKey({
      name: '自动化脚本密钥',
      description: '用于每日备份',
      scopes: ['pages:read', 'spaces:read'],
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    console.log('新密钥创建成功！');
    console.log('Token:', newKey.token);
    console.log('⚠️ 请立即保存此 token！');

    // 获取统计信息
    const stats = await client.getStats();
    console.log('统计信息:', stats);

  } catch (error) {
    console.error('错误:', error.message);
  }
}

main();
```

#### 使用 Axios

```javascript
// axios-client.js
const axios = require('axios');
const config = require('./config');

const client = axios.create({
  baseURL: `${config.baseUrl}/workspaces/${config.workspaceId}`,
  headers: {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
client.interceptors.request.use(
  config => {
    console.log(`请求: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
client.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API 错误:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

module.exports = client;
```

**使用示例**：

```javascript
const client = require('./axios-client');

// 获取所有密钥
const keys = await client.get('/api-keys');

// 创建密钥
const newKey = await client.post('/api-keys', {
  name: '测试密钥',
  scopes: ['pages:read']
});

// 更新密钥
await client.put(`/api-keys/${keyId}`, {
  name: '更新后的名称'
});

// 删除密钥
await client.delete(`/api-keys/${keyId}`);
```

### Python

#### 基础实现

```python
# config.py
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('DOCMOST_API_KEY')
WORKSPACE_ID = os.getenv('DOCMOST_WORKSPACE_ID')
BASE_URL = os.getenv('DOCMOST_API_URL', 'http://localhost:3000/api')
```

```python
# notedoc_client.py
import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import config

class NoteDocClient:
    def __init__(self):
        self.base_url = config.BASE_URL
        self.api_key = config.API_KEY
        self.workspace_id = config.WORKSPACE_ID
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        })
    
    def _url(self, endpoint: str) -> str:
        """构建完整的 URL"""
        return f'{self.base_url}/workspaces/{self.workspace_id}{endpoint}'
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """发送 HTTP 请求"""
        url = self._url(endpoint)
        response = self.session.request(method, url, **kwargs)
        response.raise_for_status()
        return response.json() if response.content else None
    
    def get_api_keys(self) -> List[Dict]:
        """获取所有 API 密钥"""
        return self._request('GET', '/api-keys')
    
    def create_api_key(
        self,
        name: str,
        description: Optional[str] = None,
        scopes: Optional[List[str]] = None,
        expires_at: Optional[str] = None
    ) -> Dict:
        """创建新的 API 密钥"""
        data = {'name': name}
        if description:
            data['description'] = description
        if scopes:
            data['scopes'] = scopes
        if expires_at:
            data['expiresAt'] = expires_at
        
        result = self._request('POST', '/api-keys', json=data)
        print(f"✅ 新密钥创建成功！")
        print(f"Token: {result['token']}")
        print(f"⚠️ 请立即保存此 token！")
        return result
    
    def update_api_key(self, key_id: str, **updates) -> Dict:
        """更新 API 密钥"""
        return self._request('PUT', f'/api-keys/{key_id}', json=updates)
    
    def delete_api_key(self, key_id: str) -> None:
        """删除 API 密钥"""
        self._request('DELETE', f'/api-keys/{key_id}')
        print(f"✅ 密钥 {key_id} 已删除")
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        return self._request('GET', '/api-keys/stats')
    
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        self.session.close()
```


**使用示例**：

```python
# main.py
from notedoc_client import NoteDocClient
from datetime import datetime, timedelta

def main():
    # 使用上下文管理器
    with NoteDocClient() as client:
        # 获取所有密钥
        keys = client.get_api_keys()
        print(f"找到 {len(keys)} 个 API 密钥")
        
        for key in keys:
            print(f"- {key['name']}: {key['status']}")
        
        # 创建新密钥（90天后过期）
        expires_at = (datetime.now() + timedelta(days=90)).isoformat()
        new_key = client.create_api_key(
            name='Python 脚本密钥',
            description='用于自动化任务',
            scopes=['pages:read', 'pages:write'],
            expires_at=expires_at
        )
        
        # 获取统计信息
        stats = client.get_stats()
        print(f"\n统计信息:")
        print(f"- 总数: {stats['total']}")
        print(f"- 活跃: {stats['active']}")
        print(f"- 禁用: {stats['inactive']}")

if __name__ == '__main__':
    main()
```

#### 高级功能示例

```python
# advanced_examples.py
from notedoc_client import NoteDocClient
from datetime import datetime, timedelta
import time

class ApiKeyManager:
    """API 密钥管理器"""
    
    def __init__(self):
        self.client = NoteDocClient()
    
    def check_expiring_keys(self, days: int = 7):
        """检查即将过期的密钥"""
        keys = self.client.get_api_keys()
        now = datetime.now()
        threshold = now + timedelta(days=days)
        
        expiring = []
        for key in keys:
            if key.get('expiresAt'):
                expires_at = datetime.fromisoformat(key['expiresAt'].replace('Z', '+00:00'))
                if now < expires_at <= threshold:
                    expiring.append(key)
        
        if expiring:
            print(f"⚠️ 发现 {len(expiring)} 个即将过期的密钥:")
            for key in expiring:
                print(f"  - {key['name']}: {key['expiresAt']}")
        else:
            print("✅ 没有即将过期的密钥")
        
        return expiring
    
    def rotate_key(self, old_key_id: str, name: str, scopes: list):
        """轮换密钥"""
        print(f"🔄 开始轮换密钥: {name}")
        
        # 创建新密钥
        expires_at = (datetime.now() + timedelta(days=90)).isoformat()
        new_key = self.client.create_api_key(
            name=f"{name} (新)",
            scopes=scopes,
            expires_at=expires_at
        )
        
        print(f"✅ 新密钥已创建")
        print(f"⏳ 请更新应用配置，然后等待 24 小时...")
        
        # 在实际应用中，这里应该等待确认
        # time.sleep(24 * 60 * 60)
        
        # 禁用旧密钥
        self.client.update_api_key(old_key_id, status='inactive')
        print(f"✅ 旧密钥已禁用")
        
        return new_key
    
    def cleanup_unused_keys(self, days: int = 30):
        """清理长期未使用的密钥"""
        keys = self.client.get_api_keys()
        now = datetime.now()
        threshold = now - timedelta(days=days)
        
        unused = []
        for key in keys:
            if key.get('lastUsedAt'):
                last_used = datetime.fromisoformat(key['lastUsedAt'].replace('Z', '+00:00'))
                if last_used < threshold:
                    unused.append(key)
            elif key.get('createdAt'):
                created = datetime.fromisoformat(key['createdAt'].replace('Z', '+00:00'))
                if created < threshold:
                    unused.append(key)
        
        if unused:
            print(f"🧹 发现 {len(unused)} 个长期未使用的密钥:")
            for key in unused:
                print(f"  - {key['name']}")
                # 可以选择禁用或删除
                # self.client.delete_api_key(key['id'])
        
        return unused

# 使用示例
if __name__ == '__main__':
    manager = ApiKeyManager()
    
    # 检查即将过期的密钥
    manager.check_expiring_keys(days=7)
    
    # 清理未使用的密钥
    manager.cleanup_unused_keys(days=30)
```

### Go

```go
// config.go
package main

import (
    "os"
)

type Config struct {
    APIKey      string
    WorkspaceID string
    BaseURL     string
}

func LoadConfig() *Config {
    return &Config{
        APIKey:      os.Getenv("DOCMOST_API_KEY"),
        WorkspaceID: os.Getenv("DOCMOST_WORKSPACE_ID"),
        BaseURL:     getEnvOrDefault("DOCMOST_API_URL", "http://localhost:3000/api"),
    }
}

func getEnvOrDefault(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
```

```go
// client.go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

type NoteDocClient struct {
    config     *Config
    httpClient *http.Client
}

type ApiKey struct {
    ID          string   `json:"id"`
    Name        string   `json:"name"`
    Description string   `json:"description,omitempty"`
    Token       string   `json:"token,omitempty"`
    Scopes      []string `json:"scopes"`
    Status      string   `json:"status"`
    ExpiresAt   string   `json:"expiresAt,omitempty"`
    CreatedAt   string   `json:"createdAt"`
}

func NewNoteDocClient(config *Config) *NoteDocClient {
    return &NoteDocClient{
        config:     config,
        httpClient: &http.Client{},
    }
}

func (c *NoteDocClient) request(method, endpoint string, body interface{}) ([]byte, error) {
    url := fmt.Sprintf("%s/workspaces/%s%s", c.config.BaseURL, c.config.WorkspaceID, endpoint)
    
    var reqBody io.Reader
    if body != nil {
        jsonData, err := json.Marshal(body)
        if err != nil {
            return nil, err
        }
        reqBody = bytes.NewBuffer(jsonData)
    }
    
    req, err := http.NewRequest(method, url, reqBody)
    if err != nil {
        return nil, err
    }
    
    req.Header.Set("Authorization", "Bearer "+c.config.APIKey)
    req.Header.Set("Content-Type", "application/json")
    
    resp, err := c.httpClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    respBody, err := io.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }
    
    if resp.StatusCode >= 400 {
        return nil, fmt.Errorf("API error: %d - %s", resp.StatusCode, string(respBody))
    }
    
    return respBody, nil
}

func (c *NoteDocClient) GetApiKeys() ([]ApiKey, error) {
    data, err := c.request("GET", "/api-keys", nil)
    if err != nil {
        return nil, err
    }
    
    var keys []ApiKey
    if err := json.Unmarshal(data, &keys); err != nil {
        return nil, err
    }
    
    return keys, nil
}

func (c *NoteDocClient) CreateApiKey(name, description string, scopes []string, expiresAt string) (*ApiKey, error) {
    body := map[string]interface{}{
        "name":        name,
        "description": description,
        "scopes":      scopes,
    }
    if expiresAt != "" {
        body["expiresAt"] = expiresAt
    }
    
    data, err := c.request("POST", "/api-keys", body)
    if err != nil {
        return nil, err
    }
    
    var key ApiKey
    if err := json.Unmarshal(data, &key); err != nil {
        return nil, err
    }
    
    return &key, nil
}
```


```go
// main.go
package main

import (
    "fmt"
    "log"
)

func main() {
    config := LoadConfig()
    client := NewNoteDocClient(config)
    
    // 获取所有密钥
    keys, err := client.GetApiKeys()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("找到 %d 个 API 密钥\n", len(keys))
    for _, key := range keys {
        fmt.Printf("- %s: %s\n", key.Name, key.Status)
    }
    
    // 创建新密钥
    newKey, err := client.CreateApiKey(
        "Go 应用密钥",
        "用于 Go 应用程序",
        []string{"pages:read", "pages:write"},
        "",
    )
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("\n✅ 新密钥创建成功！")
    fmt.Printf("Token: %s\n", newKey.Token)
    fmt.Println("⚠️ 请立即保存此 token！")
}
```

### PHP

```php
<?php
// config.php
class Config {
    public static function get($key, $default = null) {
        return getenv($key) ?: $default;
    }
}

// NoteDocClient.php
class NoteDocClient {
    private $apiKey;
    private $workspaceId;
    private $baseUrl;
    
    public function __construct() {
        $this->apiKey = Config::get('DOCMOST_API_KEY');
        $this->workspaceId = Config::get('DOCMOST_WORKSPACE_ID');
        $this->baseUrl = Config::get('DOCMOST_API_URL', 'http://localhost:3000/api');
    }
    
    private function request($method, $endpoint, $data = null) {
        $url = "{$this->baseUrl}/workspaces/{$this->workspaceId}{$endpoint}";
        
        $options = [
            'http' => [
                'method' => $method,
                'header' => [
                    "Authorization: Bearer {$this->apiKey}",
                    "Content-Type: application/json"
                ],
                'ignore_errors' => true
            ]
        ];
        
        if ($data !== null) {
            $options['http']['content'] = json_encode($data);
        }
        
        $context = stream_context_create($options);
        $response = file_get_contents($url, false, $context);
        
        if ($response === false) {
            throw new Exception("请求失败");
        }
        
        return json_decode($response, true);
    }
    
    public function getApiKeys() {
        return $this->request('GET', '/api-keys');
    }
    
    public function createApiKey($name, $description = null, $scopes = [], $expiresAt = null) {
        $data = ['name' => $name];
        if ($description) $data['description'] = $description;
        if ($scopes) $data['scopes'] = $scopes;
        if ($expiresAt) $data['expiresAt'] = $expiresAt;
        
        return $this->request('POST', '/api-keys', $data);
    }
    
    public function updateApiKey($id, $updates) {
        return $this->request('PUT', "/api-keys/{$id}", $updates);
    }
    
    public function deleteApiKey($id) {
        return $this->request('DELETE', "/api-keys/{$id}");
    }
}

// 使用示例
$client = new NoteDocClient();

// 获取所有密钥
$keys = $client->getApiKeys();
echo "找到 " . count($keys) . " 个 API 密钥\n";

// 创建新密钥
$newKey = $client->createApiKey(
    'PHP 应用密钥',
    '用于 PHP 应用程序',
    ['pages:read', 'pages:write']
);

echo "✅ 新密钥创建成功！\n";
echo "Token: {$newKey['token']}\n";
echo "⚠️ 请立即保存此 token！\n";
?>
```

### Ruby

```ruby
# config.rb
require 'dotenv/load'

class Config
  def self.api_key
    ENV['DOCMOST_API_KEY']
  end
  
  def self.workspace_id
    ENV['DOCMOST_WORKSPACE_ID']
  end
  
  def self.base_url
    ENV['DOCMOST_API_URL'] || 'http://localhost:3000/api'
  end
end

# notedoc_client.rb
require 'net/http'
require 'json'
require 'uri'

class NoteDocClient
  def initialize
    @api_key = Config.api_key
    @workspace_id = Config.workspace_id
    @base_url = Config.base_url
  end
  
  def get_api_keys
    request(:get, '/api-keys')
  end
  
  def create_api_key(name:, description: nil, scopes: [], expires_at: nil)
    data = { name: name }
    data[:description] = description if description
    data[:scopes] = scopes unless scopes.empty?
    data[:expiresAt] = expires_at if expires_at
    
    request(:post, '/api-keys', data)
  end
  
  def update_api_key(id, updates)
    request(:put, "/api-keys/#{id}", updates)
  end
  
  def delete_api_key(id)
    request(:delete, "/api-keys/#{id}")
  end
  
  private
  
  def request(method, endpoint, data = nil)
    url = URI("#{@base_url}/workspaces/#{@workspace_id}#{endpoint}")
    
    http = Net::HTTP.new(url.host, url.port)
    
    request = case method
              when :get then Net::HTTP::Get.new(url)
              when :post then Net::HTTP::Post.new(url)
              when :put then Net::HTTP::Put.new(url)
              when :delete then Net::HTTP::Delete.new(url)
              end
    
    request['Authorization'] = "Bearer #{@api_key}"
    request['Content-Type'] = 'application/json'
    request.body = data.to_json if data
    
    response = http.request(request)
    
    raise "API Error: #{response.code} - #{response.body}" unless response.is_a?(Net::HTTPSuccess)
    
    JSON.parse(response.body) unless response.body.empty?
  end
end

# 使用示例
client = NoteDocClient.new

# 获取所有密钥
keys = client.get_api_keys
puts "找到 #{keys.length} 个 API 密钥"

# 创建新密钥
new_key = client.create_api_key(
  name: 'Ruby 应用密钥',
  description: '用于 Ruby 应用程序',
  scopes: ['pages:read', 'pages:write']
)

puts "\n✅ 新密钥创建成功！"
puts "Token: #{new_key['token']}"
puts "⚠️ 请立即保存此 token！"
```

---

## 常见问题

### Q1: API 密钥和用户密码有什么区别？

**API 密钥**：
- 用于程序化访问
- 可以设置细粒度权限
- 可以随时撤销
- 有使用追踪
- 适合自动化和集成

**用户密码**：
- 用于人工登录
- 拥有用户的所有权限
- 需要通过账户设置修改
- 适合日常使用

### Q2: 我可以创建多少个 API 密钥？

目前没有硬性限制，但建议：
- 每个应用/服务使用独立的密钥
- 不同环境（开发/测试/生产）使用不同密钥
- 定期清理不再使用的密钥

### Q3: API 密钥丢失了怎么办？

API 密钥一旦创建，明文只显示一次。如果丢失：
1. 无法找回原密钥
2. 需要创建新密钥
3. 删除或禁用旧密钥

**预防措施**：
- 创建时立即保存到安全位置
- 使用密钥管理服务
- 记录密钥的用途和位置


### Q4: 如何知道 API 密钥是否被泄露？

**检查指标**：
- ✅ 使用次数突然激增
- ✅ 出现陌生的 IP 地址
- ✅ 在非工作时间有大量请求
- ✅ 执行了未授权的操作

**发现泄露后的处理**：
1. 立即禁用或删除该密钥
2. 创建新密钥
3. 检查是否有数据损失
4. 审查访问日志
5. 加强安全措施

### Q5: API 密钥可以共享吗？

**不建议共享**，原因：
- 无法追踪具体使用者
- 难以管理权限
- 安全风险增加
- 撤销时影响所有使用者

**推荐做法**：
- 每个应用使用独立密钥
- 每个环境使用独立密钥
- 每个团队成员使用独立密钥（如需要）

### Q6: 如何在 CI/CD 中使用 API 密钥？

**GitHub Actions 示例**：

```yaml
name: Deploy Documentation

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to NoteDoc
        env:
          DOCMOST_API_KEY: ${{ secrets.DOCMOST_API_KEY }}
          WORKSPACE_ID: ${{ secrets.WORKSPACE_ID }}
        run: |
          node scripts/deploy.js
```

**GitLab CI 示例**：

```yaml
deploy:
  stage: deploy
  script:
    - node scripts/deploy.js
  variables:
    DOCMOST_API_KEY: $DOCMOST_API_KEY
    WORKSPACE_ID: $WORKSPACE_ID
  only:
    - main
```

**最佳实践**：
- 使用 CI/CD 平台的密钥管理功能
- 不要在配置文件中硬编码
- 限制密钥权限
- 定期轮换

### Q7: API 密钥过期后会发生什么？

**过期后**：
- 密钥立即失效
- 所有使用该密钥的请求都会被拒绝
- 返回 401 Unauthorized 错误
- 状态自动变为 "expired"

**如何避免**：
- 设置过期提醒
- 提前创建新密钥
- 实施密钥轮换计划
- 监控密钥状态

### Q8: 可以修改已创建的 API 密钥吗？

**可以修改**：
- ✅ 名称
- ✅ 描述
- ✅ 权限范围
- ✅ 状态（启用/禁用）
- ✅ 过期时间

**不能修改**：
- ❌ 密钥本身（token）
- ❌ 创建者
- ❌ 工作空间
- ❌ 创建时间

如需更改密钥本身，必须创建新密钥。

### Q9: 如何测试 API 密钥是否有效？

**快速测试**：

```bash
# 测试密钥是否有效
curl -I -H "Authorization: Bearer dk_你的密钥" \
  http://localhost:3000/api/workspaces/工作空间ID/api-keys

# 返回 200 表示有效
# 返回 401 表示无效或过期
```

**详细测试**：

```javascript
async function testApiKey(apiKey) {
  try {
    const response = await fetch(
      'http://localhost:3000/api/workspaces/工作空间ID/api-keys',
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    if (response.ok) {
      console.log('✅ API 密钥有效');
      return true;
    } else {
      console.log('❌ API 密钥无效:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return false;
  }
}
```

### Q10: 如何批量管理 API 密钥？

**批量创建示例**：

```javascript
const keys = [
  { name: '开发环境', scopes: ['pages:read'] },
  { name: '测试环境', scopes: ['pages:read', 'pages:write'] },
  { name: '生产环境', scopes: ['pages:read', 'pages:write'] }
];

for (const keyConfig of keys) {
  const newKey = await client.createApiKey(keyConfig);
  console.log(`创建: ${keyConfig.name} - ${newKey.token}`);
}
```

**批量清理示例**：

```python
def cleanup_expired_keys(client):
    """清理所有已过期的密钥"""
    keys = client.get_api_keys()
    now = datetime.now()
    
    for key in keys:
        if key.get('expiresAt'):
            expires_at = datetime.fromisoformat(key['expiresAt'].replace('Z', '+00:00'))
            if expires_at < now:
                client.delete_api_key(key['id'])
                print(f"删除过期密钥: {key['name']}")
```

---

## 故障排查

### 错误 1: "Invalid API key format"

**原因**：API 密钥格式不正确

**解决方案**：
- 确认密钥以 `dk_` 开头
- 检查是否有多余的空格或换行
- 确认复制了完整的密钥

```bash
# 错误示例
Authorization: Bearer abc123...

# 正确示例
Authorization: Bearer dk_abc123...
```

### 错误 2: "API key is inactive"

**原因**：密钥已被禁用

**解决方案**：
1. 登录 NoteDoc 管理界面
2. 找到该密钥
3. 将状态改为 "active"
4. 或创建新密钥

### 错误 3: "API key has expired"

**原因**：密钥已过期

**解决方案**：
1. 创建新密钥
2. 更新应用配置
3. 删除旧密钥

**预防**：
- 设置过期提醒
- 实施定期轮换

### 错误 4: "Unauthorized"

**可能原因**：
- 密钥无效或已删除
- 密钥没有所需权限
- 请求的资源不存在
- 工作空间 ID 错误

**排查步骤**：

1. **验证密钥格式**
```bash
echo $DOCMOST_API_KEY | grep "^dk_"
```

2. **测试密钥有效性**
```bash
curl -I -H "Authorization: Bearer $DOCMOST_API_KEY" \
  http://localhost:3000/api/workspaces/$WORKSPACE_ID/api-keys
```

3. **检查权限**
- 确认密钥包含所需的权限范围
- 查看密钥详情中的权限列表

4. **验证工作空间 ID**
- 确认 URL 中的工作空间 ID 正确
- 检查是否有访问该工作空间的权限


### 错误 5: "Rate limit exceeded"（即将支持）

**原因**：超过速率限制

**解决方案**：
- 减少请求频率
- 实施请求队列
- 使用缓存减少 API 调用
- 联系管理员提高限制

**示例：实施重试机制**

```javascript
async function requestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // 速率限制，等待后重试
        const retryAfter = response.headers.get('Retry-After') || 60;
        console.log(`速率限制，等待 ${retryAfter} 秒...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 错误 6: "Network error" / "Connection refused"

**可能原因**：
- 服务器未运行
- 网络连接问题
- 防火墙阻止
- URL 配置错误

**排查步骤**：

1. **检查服务器状态**
```bash
curl http://localhost:3000/health
```

2. **检查网络连接**
```bash
ping your-domain.com
```

3. **验证 URL 配置**
```javascript
console.log('Base URL:', process.env.DOCMOST_API_URL);
console.log('Workspace ID:', process.env.WORKSPACE_ID);
```

4. **检查防火墙规则**
```bash
# Linux
sudo iptables -L

# macOS
sudo pfctl -s rules
```

### 错误 7: "Invalid JSON"

**原因**：请求体格式错误

**解决方案**：

```javascript
// ❌ 错误：忘记 JSON.stringify
fetch(url, {
  method: 'POST',
  body: { name: 'test' }  // 错误！
});

// ✅ 正确
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'test' })
});
```

### 调试技巧

#### 1. 启用详细日志

```javascript
// Node.js
const DEBUG = process.env.DEBUG === 'true';

async function request(url, options) {
  if (DEBUG) {
    console.log('Request:', {
      url,
      method: options.method,
      headers: options.headers,
      body: options.body
    });
  }
  
  const response = await fetch(url, options);
  
  if (DEBUG) {
    console.log('Response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: await response.clone().text()
    });
  }
  
  return response;
}
```

#### 2. 使用代理工具

使用 Charles、Fiddler 或 mitmproxy 查看 HTTP 请求：

```bash
# 使用 mitmproxy
mitmproxy -p 8080

# 配置代理
export HTTP_PROXY=http://localhost:8080
export HTTPS_PROXY=http://localhost:8080
```

#### 3. 检查响应头

```javascript
const response = await fetch(url, options);

console.log('Status:', response.status);
console.log('Headers:', Object.fromEntries(response.headers));
console.log('Body:', await response.text());
```

#### 4. 验证环境变量

```bash
# 检查环境变量是否正确加载
echo "API Key: $DOCMOST_API_KEY"
echo "Workspace ID: $WORKSPACE_ID"
echo "Base URL: $DOCMOST_API_URL"

# 检查 .env 文件
cat .env | grep DOCMOST
```

---

## 实际应用场景

### 场景 1: 自动化文档备份

**需求**：每天自动备份所有文档到云存储

**实现**：

```javascript
// backup.js
const NoteDocClient = require('./notedoc-client');
const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3();
const client = new NoteDocClient();

async function backupDocuments() {
  console.log('🔄 开始备份文档...');
  
  try {
    // 获取所有文档
    const pages = await client.getPages();
    console.log(`找到 ${pages.length} 个文档`);
    
    // 创建备份数据
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      pages: pages
    };
    
    // 保存到本地
    const filename = `backup-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
    console.log(`✅ 本地备份完成: ${filename}`);
    
    // 上传到 S3
    await s3.putObject({
      Bucket: 'notedoc-backups',
      Key: `backups/${filename}`,
      Body: fs.readFileSync(filename),
      ContentType: 'application/json'
    }).promise();
    
    console.log('✅ 云端备份完成');
    
    // 清理本地文件
    fs.unlinkSync(filename);
    
  } catch (error) {
    console.error('❌ 备份失败:', error.message);
    // 发送告警通知
    await sendAlert('备份失败', error.message);
  }
}

// 每天凌晨 2 点执行
const schedule = require('node-schedule');
schedule.scheduleJob('0 2 * * *', backupDocuments);

console.log('📅 备份任务已启动');
```

### 场景 2: 内容同步

**需求**：将 Markdown 文件自动同步到 NoteDoc

**实现**：

```javascript
// sync.js
const NoteDocClient = require('./notedoc-client');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const client = new NoteDocClient();

async function syncMarkdownFiles(directory) {
  console.log(`🔄 同步目录: ${directory}`);
  
  const files = fs.readdirSync(directory)
    .filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 解析 Front Matter
    const { data, content: markdown } = matter(content);
    
    try {
      // 检查文档是否已存在
      const existingPage = await client.findPageByTitle(data.title);
      
      if (existingPage) {
        // 更新现有文档
        await client.updatePage(existingPage.id, {
          content: markdown,
          updatedAt: new Date().toISOString()
        });
        console.log(`✅ 更新: ${data.title}`);
      } else {
        // 创建新文档
        await client.createPage({
          title: data.title,
          content: markdown,
          spaceId: data.spaceId || process.env.DEFAULT_SPACE_ID
        });
        console.log(`✅ 创建: ${data.title}`);
      }
    } catch (error) {
      console.error(`❌ 同步失败 ${file}:`, error.message);
    }
  }
  
  console.log('✅ 同步完成');
}

// 监听文件变化
const chokidar = require('chokidar');
const watcher = chokidar.watch('docs/**/*.md');

watcher.on('change', async (filePath) => {
  console.log(`📝 文件变化: ${filePath}`);
  await syncMarkdownFiles(path.dirname(filePath));
});

console.log('👀 开始监听文件变化...');
```


### 场景 3: 文档搜索服务

**需求**：构建一个独立的文档搜索服务

**实现**：

```javascript
// search-service.js
const express = require('express');
const NoteDocClient = require('./notedoc-client');

const app = express();
const client = new NoteDocClient();

// 缓存文档内容
let documentsCache = [];
let lastUpdate = null;

// 更新缓存
async function updateCache() {
  try {
    documentsCache = await client.getPages();
    lastUpdate = new Date();
    console.log(`✅ 缓存更新: ${documentsCache.length} 个文档`);
  } catch (error) {
    console.error('❌ 缓存更新失败:', error.message);
  }
}

// 每 5 分钟更新一次缓存
setInterval(updateCache, 5 * 60 * 1000);
updateCache(); // 启动时立即更新

// 搜索 API
app.get('/api/search', (req, res) => {
  const { q, limit = 10 } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: '缺少搜索关键词' });
  }
  
  // 简单的全文搜索
  const results = documentsCache
    .filter(doc => {
      const searchText = `${doc.title} ${doc.content}`.toLowerCase();
      return searchText.includes(q.toLowerCase());
    })
    .slice(0, parseInt(limit))
    .map(doc => ({
      id: doc.id,
      title: doc.title,
      excerpt: getExcerpt(doc.content, q),
      url: `/pages/${doc.id}`
    }));
  
  res.json({
    query: q,
    total: results.length,
    results,
    lastUpdate
  });
});

// 获取摘要
function getExcerpt(content, query, length = 200) {
  const index = content.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) {
    return content.substring(0, length) + '...';
  }
  
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + query.length + 150);
  
  return '...' + content.substring(start, end) + '...';
}

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    documentsCount: documentsCache.length,
    lastUpdate
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 搜索服务运行在端口 ${PORT}`);
});
```

### 场景 4: 文档统计报表

**需求**：生成文档统计报表并发送邮件

**实现**：

```python
# report.py
from notedoc_client import NoteDocClient
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class DocumentReporter:
    def __init__(self):
        self.client = NoteDocClient()
    
    def generate_report(self, days=7):
        """生成过去 N 天的统计报表"""
        pages = self.client.get_pages()
        now = datetime.now()
        threshold = now - timedelta(days=days)
        
        # 统计数据
        total_pages = len(pages)
        new_pages = [p for p in pages if self._parse_date(p.get('createdAt')) > threshold]
        updated_pages = [p for p in pages if self._parse_date(p.get('updatedAt')) > threshold]
        
        # 按空间分组
        spaces = {}
        for page in pages:
            space_id = page.get('spaceId', 'unknown')
            if space_id not in spaces:
                spaces[space_id] = []
            spaces[space_id].append(page)
        
        # 生成报表
        report = f"""
        📊 NoteDoc 文档统计报表
        ========================
        
        报表时间: {now.strftime('%Y-%m-%d %H:%M:%S')}
        统计周期: 过去 {days} 天
        
        📈 总体统计
        -----------
        - 文档总数: {total_pages}
        - 新增文档: {len(new_pages)}
        - 更新文档: {len(updated_pages)}
        - 文档库数: {len(spaces)}
        
        📁 文档库分布
        -----------
        """
        
        for space_id, space_pages in spaces.items():
            report += f"- {space_id}: {len(space_pages)} 个文档\n"
        
        report += f"""
        
        🆕 最近新增的文档
        ---------------
        """
        
        for page in new_pages[:5]:
            report += f"- {page['title']} ({page['createdAt']})\n"
        
        return report
    
    def _parse_date(self, date_str):
        """解析日期字符串"""
        if not date_str:
            return datetime.min
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    
    def send_email(self, report, recipients):
        """发送邮件报表"""
        msg = MIMEMultipart()
        msg['From'] = 'noreply@notedoc.com'
        msg['To'] = ', '.join(recipients)
        msg['Subject'] = f'NoteDoc 文档统计报表 - {datetime.now().strftime("%Y-%m-%d")}'
        
        msg.attach(MIMEText(report, 'plain', 'utf-8'))
        
        # 发送邮件
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login('your-email@gmail.com', 'your-password')
            server.send_message(msg)
        
        print('✅ 报表已发送')

# 使用示例
if __name__ == '__main__':
    reporter = DocumentReporter()
    report = reporter.generate_report(days=7)
    print(report)
    
    # 发送给管理员
    # reporter.send_email(report, ['admin@example.com'])
```

### 场景 5: CI/CD 集成

**需求**：在部署时自动更新文档

**实现**：

```javascript
// deploy-docs.js
const NoteDocClient = require('./notedoc-client');
const fs = require('fs');
const path = require('path');

const client = new NoteDocClient();

async function deployDocumentation() {
  console.log('🚀 开始部署文档...');
  
  try {
    // 读取版本信息
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const version = packageJson.version;
    
    // 读取 CHANGELOG
    const changelog = fs.readFileSync('CHANGELOG.md', 'utf-8');
    
    // 创建或更新发布说明
    const releaseNotes = {
      title: `版本 ${version} 发布说明`,
      content: `
# 版本 ${version}

发布时间: ${new Date().toISOString()}

${changelog}

---
*此文档由 CI/CD 自动生成*
      `,
      spaceId: process.env.RELEASE_NOTES_SPACE_ID
    };
    
    // 查找现有文档
    const existingPage = await client.findPageByTitle(releaseNotes.title);
    
    if (existingPage) {
      await client.updatePage(existingPage.id, {
        content: releaseNotes.content
      });
      console.log(`✅ 更新发布说明: ${releaseNotes.title}`);
    } else {
      await client.createPage(releaseNotes);
      console.log(`✅ 创建发布说明: ${releaseNotes.title}`);
    }
    
    // 更新 API 文档
    await updateApiDocs();
    
    console.log('✅ 文档部署完成');
    
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    process.exit(1);
  }
}

async function updateApiDocs() {
  // 从 OpenAPI 规范生成文档
  const openApiSpec = JSON.parse(fs.readFileSync('openapi.json', 'utf-8'));
  
  // 生成 Markdown 文档
  const markdown = generateMarkdownFromOpenApi(openApiSpec);
  
  await client.updatePageByTitle('API 文档', {
    content: markdown
  });
  
  console.log('✅ API 文档已更新');
}

function generateMarkdownFromOpenApi(spec) {
  // 简化的 OpenAPI 转 Markdown
  let markdown = `# ${spec.info.title}\n\n`;
  markdown += `${spec.info.description}\n\n`;
  markdown += `版本: ${spec.info.version}\n\n`;
  
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, details] of Object.entries(methods)) {
      markdown += `## ${method.toUpperCase()} ${path}\n\n`;
      markdown += `${details.summary}\n\n`;
      markdown += `${details.description || ''}\n\n`;
    }
  }
  
  return markdown;
}

// 执行部署
deployDocumentation();
```

---

## 总结

### 核心要点

1. **安全第一**
   - 使用环境变量存储密钥
   - 遵循最小权限原则
   - 定期轮换密钥
   - 监控使用情况

2. **合理规划**
   - 为不同用途创建独立密钥
   - 设置合理的过期时间
   - 记录密钥用途和负责人
   - 建立轮换计划

3. **持续监控**
   - 定期检查使用统计
   - 关注异常活动
   - 及时清理无用密钥
   - 设置过期提醒

4. **最佳实践**
   - 使用密钥管理服务
   - 实施错误处理和重试
   - 记录详细日志
   - 编写完善的文档

### 下一步

- 📖 阅读 [API 文档](./apps/server/src/ee/api-key/README.md)
- 🔧 查看 [功能说明](./API_MANAGEMENT_FEATURES.md)
- 💻 尝试 [代码示例](./examples/api-key-usage-examples.md)
- 🚀 开始创建您的第一个 API 密钥

### 获取帮助

如果遇到问题：
1. 查看本指南的故障排查部分
2. 检查 API 密钥状态和权限
3. 查看服务器日志
4. 联系技术支持

---

**文档版本**: 1.0.0  
**最后更新**: 2025-11-20  
**维护者**: NoteDoc 团队

祝您使用愉快！🎉
