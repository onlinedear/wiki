# API Key 功能快速启动指南

## 1. 运行数据库迁移

首先需要运行数据库迁移来创建 `api_keys` 表：

```bash
# 在项目根目录执行
pnpm --filter server migration:up
```

这将执行以下迁移：
- `20250912T101500-api-keys.ts` - 创建基础表
- `20250913T101500-update-api-keys.ts` - 添加额外字段

## 2. 启动开发服务器

```bash
# 启动后端
pnpm --filter server start:dev

# 启动前端（新终端）
pnpm --filter client dev
```

## 3. 访问 API Key 管理页面

打开浏览器访问：
```
http://localhost:5173/settings/workspace
```

然后点击侧边栏的 "API Keys" 选项。

## 4. 创建第一个 API Key

1. 点击 "创建 API 密钥" 按钮
2. **步骤 1**: 输入名称和描述
   - 名称：例如 "测试密钥"
   - 描述：例如 "用于测试 API 访问"
3. **步骤 2**: 选择权限范围
   - 勾选需要的权限，例如 "Pages: Read"
4. **步骤 3**: 设置过期时间
   - 选择 "30 天" 或自定义时间
5. 点击 "创建" 按钮
6. **重要**: 复制显示的 API Key（以 `dk_` 开头），这是唯一一次显示

## 5. 测试 API Key

### 使用 curl 测试

```bash
# 方式 1: 使用 Authorization header
curl -H "Authorization: Bearer dk_your_api_key_here" \
  http://localhost:3000/api/workspaces/your-workspace-id/api-keys

# 方式 2: 使用 X-API-Key header
curl -H "X-API-Key: dk_your_api_key_here" \
  http://localhost:3000/api/workspaces/your-workspace-id/api-keys
```

### 使用 JavaScript 测试

```javascript
// 使用 fetch
const response = await fetch('http://localhost:3000/api/workspaces/workspace-id/api-keys', {
  headers: {
    'Authorization': 'Bearer dk_your_api_key_here'
  }
});

const data = await response.json();
console.log(data);
```

### 使用 Python 测试

```python
import requests

headers = {
    'Authorization': 'Bearer dk_your_api_key_here'
}

response = requests.get(
    'http://localhost:3000/api/workspaces/workspace-id/api-keys',
    headers=headers
)

print(response.json())
```

## 6. 管理 API Keys

### 查看所有 API Keys
在管理页面可以看到：
- 统计卡片（总数、活跃、即将过期、总请求数）
- API Keys 列表表格
- 每个 API Key 的状态、权限、使用次数等

### 查看详情
点击表格中的眼睛图标，可以查看：
- 完整的权限列表
- 使用统计
- 安全设置
- 创建和过期时间

### 编辑 API Key
点击编辑图标可以修改：
- 名称
- 描述
- 权限范围
- 状态（启用/禁用）
- 过期时间

### 撤销 API Key
点击删除图标可以撤销（软删除）API Key。

## 7. API 端点说明

### 创建 API Key
```http
POST /workspaces/:workspaceId/api-keys
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "My API Key",
  "description": "用于自动化脚本",
  "scopes": ["pages:read", "pages:write"],
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

### 获取所有 API Keys
```http
GET /workspaces/:workspaceId/api-keys
Authorization: Bearer <jwt-token>
```

### 获取统计信息
```http
GET /workspaces/:workspaceId/api-keys/stats
Authorization: Bearer <jwt-token>
```

### 更新 API Key
```http
PUT /workspaces/:workspaceId/api-keys/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "inactive"
}
```

### 删除 API Key
```http
DELETE /workspaces/:workspaceId/api-keys/:id
Authorization: Bearer <jwt-token>
```

## 8. 权限范围说明

当前支持的权限范围：

| 资源 | 操作 | 说明 |
|------|------|------|
| pages | read | 读取页面 |
| pages | write | 创建和编辑页面 |
| pages | delete | 删除页面 |
| spaces | read | 读取空间 |
| spaces | write | 创建和编辑空间 |
| spaces | delete | 删除空间 |
| users | read | 读取用户信息 |
| comments | read | 读取评论 |
| comments | write | 创建和编辑评论 |
| comments | delete | 删除评论 |

## 9. 安全最佳实践

1. **安全存储**: 将 API Key 存储在环境变量中，不要硬编码
2. **最小权限**: 只授予必要的权限
3. **定期轮换**: 定期更新 API Key
4. **监控使用**: 定期检查使用统计
5. **及时撤销**: 不再使用的 API Key 应立即撤销

## 10. 故障排查

### API Key 无效
- 检查 token 格式是否正确（应以 `dk_` 开头）
- 确认 API Key 状态为 "active"
- 检查是否已过期

### 权限不足
- 确认 API Key 包含所需的权限范围
- 检查用户是否有权限访问该资源

### 数据库错误
- 确认已运行数据库迁移
- 检查数据库连接配置

## 11. 开发调试

### 查看日志
```bash
# 后端日志
pnpm --filter server start:dev

# 查看数据库查询
# 在 .env 文件中设置
DEBUG=kysely:query
```

### 测试 API Key 验证
```typescript
// 在控制器中使用 ApiKeyAuthGuard
import { UseGuards } from '@nestjs/common';
import { ApiKeyAuthGuard } from '../ee/api-key/guards/api-key-auth.guard';

@UseGuards(ApiKeyAuthGuard)
@Get('protected-route')
async protectedRoute(@Req() req) {
  // req.apiKey 包含验证后的 API Key 信息
  // req.user 包含用户信息
  return { message: 'Success', apiKey: req.apiKey };
}
```

## 12. 下一步

- [ ] 实现权限范围验证逻辑
- [ ] 添加 IP 白名单功能
- [ ] 添加速率限制
- [ ] 实现使用日志记录
- [ ] 添加 API Key 轮换功能
- [ ] 集成到现有路由的认证中

## 需要帮助？

查看详细文档：
- 后端实现：`apps/server/src/ee/api-key/README.md`
- 功能说明：`API_MANAGEMENT_FEATURES.md`
