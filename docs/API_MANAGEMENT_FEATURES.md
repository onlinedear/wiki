# API 管理功能开发完成

## 新增功能概览

### 1. 统计卡片 (Stats Cards)
- **总 API Keys**: 显示所有 API 密钥的总数
- **活跃密钥**: 显示未过期的活跃密钥数量
- **即将过期**: 显示 7 天内即将过期的密钥数量
- **总请求数**: 显示所有 API 密钥的累计请求次数

### 2. 状态徽章 (Status Badge)
- **活跃 (Active)**: 绿色徽章，表示密钥正常可用
- **即将过期 (Expiring Soon)**: 橙色徽章，7天内过期
- **已过期 (Expired)**: 红色徽章，密钥已失效

### 3. 权限范围选择器 (Scopes Selector)
支持细粒度的权限控制：
- **Pages**: read, write, delete
- **Spaces**: read, write, delete
- **Users**: read
- **Comments**: read, write, delete

### 4. 增强的创建流程 (Enhanced Creation Flow)
三步向导式创建：

**步骤 1: 基本信息**
- API Key 名称（必填）
- 描述（可选）

**步骤 2: 权限配置**
- 选择资源类型和操作权限
- 支持批量选择

**步骤 3: 安全设置**
- 过期时间选择（30/60/90/365天，自定义，永不过期）
- 高级安全设置（可选）：
  - IP 白名单
  - 速率限制（每小时请求数）

### 5. 改进的表格显示
新增列：
- **状态**: 彩色徽章显示密钥状态
- **权限**: 显示权限范围标签
- **请求数**: 显示使用统计
- **描述**: 在名称下方显示描述信息

新增操作：
- **查看详情**: 眼睛图标，打开详情侧边栏
- **编辑**: 编辑密钥信息
- **撤销**: 删除密钥

### 6. 详情侧边栏 (Details Drawer)
显示完整的 API Key 信息：
- 状态和基本信息
- 权限列表
- 使用统计
- 安全设置（IP 白名单、速率限制）
- 日期信息（创建时间、过期时间）
- 创建者信息

### 7. 搜索和过滤
- **搜索框**: 按名称或描述搜索
- **状态过滤**: 全部/活跃/即将过期/已过期

### 8. 安全提示
页面顶部显示安全最佳实践：
- 安全存储 API 密钥
- 定期轮换密钥
- 使用最小权限原则
- 定期监控使用情况

## 技术实现

### 新增组件
1. `api-key-stats-cards.tsx` - 统计卡片
2. `api-key-status-badge.tsx` - 状态徽章
3. `api-key-scopes-selector.tsx` - 权限选择器
4. `api-key-details-drawer.tsx` - 详情侧边栏

### 更新组件
1. `create-api-key-modal.tsx` - 改为三步向导
2. `api-key-table.tsx` - 增强表格显示
3. `workspace-api-keys.tsx` - 集成所有新功能

### 类型定义更新
- 添加 `ApiKeyScope` 类型
- 添加 `ApiKeyStatus` 类型
- 扩展 `IApiKey` 接口
- 扩展 `ICreateApiKeyRequest` 接口
- 添加 `IApiKeyStats` 接口

### 翻译
已添加所有新功能的中文翻译到 `zh-CN/translation.json`

## 使用方法

1. 访问 `http://localhost:5173/settings/api-keys`（用户级别）
2. 或访问 `http://localhost:5173/settings/workspace`（工作区级别）
3. 点击"创建 API 密钥"按钮
4. 按照三步向导完成创建
5. 在表格中查看、编辑或撤销 API 密钥
6. 点击眼睛图标查看详细信息

## 后端实现

### 数据库结构
已创建 `api_keys` 表，包含以下字段：
- `id` - UUID 主键
- `name` - API Key 名称
- `description` - 描述信息
- `token` - 哈希后的 token（SHA-256）
- `scopes` - 权限范围（JSONB）
- `status` - 状态（active/inactive）
- `creator_id` - 创建者 ID
- `workspace_id` - 工作空间 ID
- `expires_at` - 过期时间
- `last_used_at` - 最后使用时间
- `last_used_ip` - 最后使用 IP
- `usage_count` - 使用次数
- `created_at` - 创建时间
- `updated_at` - 更新时间
- `deleted_at` - 删除时间（软删除）

### API 端点
已实现以下 REST API：

**创建 API Key**
```
POST /workspaces/:workspaceId/api-keys
```

**获取所有 API Keys**
```
GET /workspaces/:workspaceId/api-keys
```

**获取统计信息**
```
GET /workspaces/:workspaceId/api-keys/stats
```

**获取单个 API Key**
```
GET /workspaces/:workspaceId/api-keys/:id
```

**更新 API Key**
```
PUT /workspaces/:workspaceId/api-keys/:id
```

**删除 API Key**
```
DELETE /workspaces/:workspaceId/api-keys/:id
```

### 安全特性
1. **Token 哈希**: 使用 SHA-256 哈希存储 token
2. **一次性显示**: 明文 token 仅在创建时返回
3. **认证守卫**: 实现 `ApiKeyAuthGuard` 用于 API 认证
4. **使用追踪**: 自动记录使用时间、IP 和次数
5. **软删除**: 删除操作不会真正删除数据

### 文件结构
```
apps/server/src/
├── database/
│   ├── migrations/
│   │   ├── 20250912T101500-api-keys.ts
│   │   └── 20250913T101500-update-api-keys.ts
│   ├── repos/
│   │   └── api-key/
│   │       └── api-key.repo.ts
│   └── types/
│       ├── db.d.ts (已更新)
│       └── entity.types.ts (已更新)
└── ee/
    ├── ee.module.ts
    └── api-key/
        ├── api-key.module.ts
        ├── api-key.service.ts
        ├── api-key.controller.ts
        ├── api-key.service.spec.ts
        ├── guards/
        │   └── api-key-auth.guard.ts
        ├── dto/
        │   ├── create-api-key.dto.ts
        │   └── update-api-key.dto.ts
        ├── index.ts
        └── README.md
```

### 使用 API Key 认证
支持两种认证方式：

**1. Authorization Header**
```bash
curl -H "Authorization: Bearer dk_abc123..." \
  https://api.notedoc.com/api/v1/pages
```

**2. X-API-Key Header**
```bash
curl -H "X-API-Key: dk_abc123..." \
  https://api.notedoc.com/api/v1/pages
```

### 下一步建议
1. 运行数据库迁移：`pnpm --filter server migration:up`
2. 实现权限范围验证逻辑
3. 添加 IP 白名单功能
4. 添加速率限制功能
5. 实现 API Key 使用日志
6. 添加 API Key 轮换功能
7. 集成到现有的认证系统

## 截图位置
建议在以下位置截图展示新功能：
1. 统计卡片区域
2. 创建向导的三个步骤
3. 改进后的表格
4. 详情侧边栏
5. 搜索和过滤功能
