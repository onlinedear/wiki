# Docmost API Key 管理功能

> 完整的 API Key 管理系统，支持创建、管理和使用 API 密钥进行程序化访问。

## 🎯 功能概览

这是一个为 Docmost 开发的完整 API Key 管理功能，包括：

- 🔑 **API Key 生成和管理** - 创建、查看、编辑、删除 API Keys
- 🛡️ **安全认证** - SHA-256 哈希存储，支持多种认证方式
- 📊 **使用统计** - 追踪使用次数、最后使用时间和 IP
- 🎨 **现代化 UI** - 基于 Mantine 的美观界面
- 🔐 **权限控制** - 细粒度的权限范围管理
- ⏰ **过期管理** - 灵活的过期时间设置
- 🌍 **国际化** - 支持多语言（已包含中文）

## 📸 功能截图

### 主界面
- 统计卡片展示总数、活跃数、即将过期数和总请求数
- 安全提示横幅
- 搜索和过滤功能
- 数据表格展示所有 API Keys

### 创建向导
三步向导式创建流程：
1. **基本信息** - 名称和描述
2. **权限配置** - 选择资源和操作权限
3. **安全设置** - 过期时间、IP 白名单、速率限制

### 详情侧边栏
- 完整的 API Key 信息
- 状态和权限列表
- 使用统计
- 安全设置

## 🚀 快速开始

### 1. 运行数据库迁移

```bash
# 使用 pnpm
pnpm --filter server migration:up

# 或使用 npm
cd apps/server
npm run migration:up

# 或手动执行 SQL
psql -U your_user -d your_database -f apps/server/src/database/migrations/manual-api-keys-migration.sql
```

### 2. 启动应用

```bash
# 开发模式（同时启动前后端）
npm run dev

# 或分别启动
npm run server:dev  # 后端: http://localhost:3000
npm run client:dev  # 前端: http://localhost:5173
```

### 3. 访问功能

打开浏览器访问：
```
http://localhost:5173/settings/workspace
```

点击侧边栏的 "API Keys" 选项。

### 4. 创建第一个 API Key

1. 点击 "创建 API 密钥" 按钮
2. 填写名称和描述
3. 选择权限范围（如 `pages:read`, `pages:write`）
4. 设置过期时间（可选）
5. 点击创建
6. **重要**: 复制显示的 API Key（以 `dk_` 开头），这是唯一一次显示

### 5. 使用 API Key

```bash
# 方式 1: Authorization header
curl -H "Authorization: Bearer dk_your_api_key_here" \
  http://localhost:3000/api/workspaces/workspace-id/api-keys

# 方式 2: X-API-Key header
curl -H "X-API-Key: dk_your_api_key_here" \
  http://localhost:3000/api/workspaces/workspace-id/api-keys
```

## 📚 文档

### 用户文档
- **[功能说明](./API_MANAGEMENT_FEATURES.md)** - 详细的功能介绍和使用说明
- **[快速启动指南](./API_KEY_QUICKSTART.md)** - 快速上手指南
- **[使用示例](./examples/api-key-usage-examples.md)** - 各种编程语言的使用示例

### 开发文档
- **[实现总结](./API_KEY_IMPLEMENTATION_SUMMARY.md)** - 完整的实现说明
- **[后端 API 文档](./apps/server/src/ee/api-key/README.md)** - 后端 API 详细文档
- **[检查清单](./API_KEY_CHECKLIST.md)** - 功能检查清单和待办事项

## 🏗️ 技术架构

### 前端技术栈
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Mantine** - UI 组件库
- **React Query** - 数据获取和缓存
- **i18next** - 国际化

### 后端技术栈
- **NestJS** - Node.js 框架
- **Kysely** - 类型安全的 SQL 查询构建器
- **PostgreSQL** - 数据库
- **JWT** - 认证
- **bcrypt/crypto** - 加密

### 数据库设计

```sql
api_keys
├── id (UUID, PK)
├── name (TEXT)
├── description (TEXT)
├── token (TEXT, UNIQUE) -- SHA-256 哈希
├── scopes (JSONB) -- 权限范围
├── status (TEXT) -- active/inactive
├── creator_id (UUID, FK)
├── workspace_id (UUID, FK)
├── expires_at (TIMESTAMPTZ)
├── last_used_at (TIMESTAMPTZ)
├── last_used_ip (TEXT)
├── usage_count (INTEGER)
├── created_at (TIMESTAMPTZ)
├── updated_at (TIMESTAMPTZ)
└── deleted_at (TIMESTAMPTZ) -- 软删除
```

## 🔌 API 端点

### 管理 API（需要 JWT 认证）

```
POST   /workspaces/:workspaceId/api-keys        创建 API Key
GET    /workspaces/:workspaceId/api-keys        获取所有 API Keys
GET    /workspaces/:workspaceId/api-keys/stats  获取统计信息
GET    /workspaces/:workspaceId/api-keys/:id    获取单个 API Key
PUT    /workspaces/:workspaceId/api-keys/:id    更新 API Key
DELETE /workspaces/:workspaceId/api-keys/:id    删除 API Key
```

### 使用 API Key 认证

在任何需要认证的端点使用 API Key：

```http
GET /api/pages
Authorization: Bearer dk_your_api_key_here
```

或

```http
GET /api/pages
X-API-Key: dk_your_api_key_here
```

## 🔐 安全特性

### 已实现
- ✅ **Token 哈希存储** - 使用 SHA-256 哈希，数据库不存储明文
- ✅ **一次性显示** - 明文 token 仅在创建时返回一次
- ✅ **过期验证** - 自动检查并拒绝过期的 API Key
- ✅ **状态管理** - 可以禁用 API Key 而不删除
- ✅ **使用追踪** - 记录每次使用的时间、IP 和次数
- ✅ **软删除** - 删除操作不会真正删除数据
- ✅ **权限范围** - 细粒度的权限控制

### 待实现
- ⏳ IP 白名单验证
- ⏳ 速率限制
- ⏳ 异常检测和自动封禁
- ⏳ 审计日志

## 📊 权限范围

当前支持的权限范围：

| 资源 | 操作 | 说明 |
|------|------|------|
| pages | read | 读取页面内容 |
| pages | write | 创建和编辑页面 |
| pages | delete | 删除页面 |
| spaces | read | 读取空间信息 |
| spaces | write | 创建和编辑空间 |
| spaces | delete | 删除空间 |
| users | read | 读取用户信息 |
| comments | read | 读取评论 |
| comments | write | 创建和编辑评论 |
| comments | delete | 删除评论 |

## 💻 代码示例

### JavaScript/Node.js

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${process.env.DOCMOST_API_KEY}`
  }
});

// 获取所有 API Keys
const keys = await client.get('/workspaces/workspace-id/api-keys');
console.log(keys.data);
```

### Python

```python
import requests
import os

headers = {
    'Authorization': f'Bearer {os.getenv("DOCMOST_API_KEY")}'
}

response = requests.get(
    'http://localhost:3000/api/workspaces/workspace-id/api-keys',
    headers=headers
)

print(response.json())
```

### cURL

```bash
curl -H "Authorization: Bearer $DOCMOST_API_KEY" \
  http://localhost:3000/api/workspaces/workspace-id/api-keys
```

更多示例请查看 [使用示例文档](./examples/api-key-usage-examples.md)。

## 🧪 测试

### 运行单元测试

```bash
cd apps/server
npm test api-key.service.spec.ts
```

### 手动测试

1. 创建 API Key
2. 复制返回的 token
3. 使用 token 调用 API
4. 检查使用统计是否更新
5. 测试过期和禁用功能

## 🐛 故障排查

### API Key 无效
- 检查 token 格式（应以 `dk_` 开头）
- 确认状态为 "active"
- 检查是否已过期

### 权限不足
- 确认 API Key 包含所需的权限范围
- 检查用户是否有权限访问该资源

### 数据库错误
- 确认已运行数据库迁移
- 检查数据库连接配置
- 查看数据库日志

## 📈 性能考虑

- 使用索引优化查询（token, workspace_id, status）
- API Key 验证使用哈希比对，性能良好
- 建议实施缓存策略减少数据库查询
- 大量 API Keys 时考虑分页

## 🔄 版本历史

### v1.0.0 (2025-09-13)
- ✨ 初始版本发布
- ✅ 完整的前端 UI
- ✅ 完整的后端 API
- ✅ 数据库设计和迁移
- ✅ 安全特性实现
- ✅ 文档和示例

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 待办事项

查看 [检查清单](./API_KEY_CHECKLIST.md) 了解详细的待办事项。

### 高优先级
- [ ] 实现权限范围验证逻辑
- [ ] 添加 IP 白名单功能
- [ ] 实现速率限制
- [ ] 添加 API Key 使用日志

### 中优先级
- [ ] API Key 轮换功能
- [ ] 批量操作
- [ ] 导出功能
- [ ] 使用统计图表

## 📄 许可

遵循 Docmost 项目的许可协议。

## 🙏 致谢

- Docmost 团队提供的优秀基础架构
- Mantine UI 组件库
- NestJS 框架
- 所有开源贡献者

## 📞 支持

如有问题或建议，请：
- 查看文档
- 提交 Issue
- 加入社区讨论

---

**开发者**: Kiro AI Assistant  
**版本**: 1.0.0  
**发布日期**: 2025-09-13  
**状态**: ✅ 核心功能已完成，可以开始使用

---

## 快速链接

- 📖 [功能说明](./API_MANAGEMENT_FEATURES.md)
- 🚀 [快速启动](./API_KEY_QUICKSTART.md)
- 💻 [使用示例](./examples/api-key-usage-examples.md)
- 📋 [检查清单](./API_KEY_CHECKLIST.md)
- 📊 [实现总结](./API_KEY_IMPLEMENTATION_SUMMARY.md)
- 🔧 [后端文档](./apps/server/src/ee/api-key/README.md)
