# NoteDoc Vercel 一键部署指南

本指南将帮助你在 Vercel 平台上快速部署 NoteDoc。

## ⚠️ 重要说明

NoteDoc 是一个全栈应用，包含前端、后端和实时协作服务器。Vercel 主要适合部署前端应用，**不推荐在 Vercel 上部署完整的 NoteDoc 应用**，原因如下：

1. **后端限制**：Vercel 的 Serverless Functions 有执行时间限制（10秒免费版，60秒专业版）
2. **数据库要求**：需要外部 PostgreSQL 数据库（推荐使用 Vercel Postgres 或 Supabase）
3. **Redis 要求**：需要外部 Redis 服务（推荐使用 Upstash Redis）
4. **WebSocket 限制**：实时协作功能需要持久连接，Vercel 不完全支持
5. **存储限制**：需要配置 S3 兼容的对象存储服务

## 🎯 推荐部署方案

对于生产环境，我们强烈推荐以下部署方案：

### 方案 1：Docker 部署（最推荐）
使用 Docker Compose 在 VPS 或云服务器上部署，这是最简单和最稳定的方案。

```bash
# 下载 docker-compose.yml
curl -O https://raw.githubusercontent.com/onlinedear/wiki/main/docker-compose.yml

# 启动服务
docker-compose up -d
```

查看 [完整部署指南](./NoteDoc完整部署指南.md) 了解详情。

### 方案 2：云平台部署
- **Railway**：支持 Docker，自动配置数据库和 Redis
- **Render**：支持 Docker，提供托管数据库
- **DigitalOcean App Platform**：支持 Docker，一键部署
- **AWS/GCP/Azure**：使用容器服务（ECS、Cloud Run、Container Apps）

### 方案 3：混合部署（前端 Vercel + 后端其他平台）
- 前端部署到 Vercel（静态资源和 CDN 加速）
- 后端部署到支持长连接的平台（Railway、Render、VPS）

## 📋 Vercel 部署前准备

如果你仍然想在 Vercel 上尝试部署，需要先准备以下服务：

### 1. PostgreSQL 数据库

**选项 A：Vercel Postgres（推荐）**
```bash
# 在 Vercel 项目中添加 Postgres
# 访问：https://vercel.com/dashboard -> Storage -> Create Database -> Postgres
```

**选项 B：Supabase（免费）**
```bash
# 1. 访问 https://supabase.com
# 2. 创建新项目
# 3. 获取数据库连接字符串
```

**选项 C：Neon（免费）**
```bash
# 1. 访问 https://neon.tech
# 2. 创建新项目
# 3. 获取连接字符串
```

### 2. Redis 服务

**Upstash Redis（推荐，免费）**
```bash
# 1. 访问 https://upstash.com
# 2. 创建 Redis 数据库
# 3. 获取 REDIS_URL
```

### 3. S3 对象存储

**选项 A：Cloudflare R2（推荐）**
- 免费额度：10GB 存储，每月 1000 万次读取
- 兼容 S3 API

**选项 B：AWS S3**
- 按使用量付费

**选项 C：MinIO（自托管）**
- 需要额外的服务器

## 🚀 Vercel 部署步骤

### 步骤 1：Fork 仓库

1. 访问 [NoteDoc GitHub 仓库](https://github.com/onlinedear/wiki)
2. 点击右上角的 "Fork" 按钮
3. Fork 到你的 GitHub 账号

### 步骤 2：创建 Vercel 项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 选择你 Fork 的 NoteDoc 仓库
4. 点击 "Import"

### 步骤 3：配置构建设置

在 Vercel 项目设置中配置：

**Framework Preset**: Other

**Build Command**:
```bash
pnpm install && pnpm build
```

**Output Directory**:
```
apps/client/dist
```

**Install Command**:
```bash
pnpm install
```

### 步骤 4：配置环境变量

在 Vercel 项目设置 → Environment Variables 中添加：

```bash
# 应用配置
APP_URL=https://your-app.vercel.app
APP_SECRET=your-32-character-secret-key
PORT=3000

# JWT 配置
JWT_TOKEN_EXPIRES_IN=30d

# 数据库（从 Vercel Postgres 或 Supabase 获取）
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis（从 Upstash 获取）
REDIS_URL=redis://default:password@host:6379

# 存储配置（必须使用 S3）
STORAGE_DRIVER=s3
AWS_S3_ACCESS_KEY_ID=your-access-key
AWS_S3_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_REGION=auto
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ENDPOINT=https://your-endpoint.r2.cloudflarestorage.com
AWS_S3_FORCE_PATH_STYLE=true

# 邮件配置（可选）
MAIL_DRIVER=smtp
MAIL_FROM_ADDRESS=hello@example.com
MAIL_FROM_NAME=NoteDoc
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
SMTP_SECURE=false

# 其他配置
FILE_UPLOAD_SIZE_LIMIT=50mb
DISABLE_TELEMETRY=false
DEBUG_MODE=false
```

### 步骤 5：创建 vercel.json 配置

在项目根目录创建 `vercel.json` 文件：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/client/dist/**",
      "use": "@vercel/static"
    },
    {
      "src": "apps/server/dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/server/dist/main.js"
    },
    {
      "src": "/(.*)",
      "dest": "apps/client/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 步骤 6：运行数据库迁移

部署后，需要手动运行数据库迁移：

```bash
# 克隆你的仓库到本地
git clone https://github.com/your-username/wiki.git
cd wiki

# 安装依赖
pnpm install

# 设置数据库 URL
export DATABASE_URL="your-database-url"

# 运行迁移
cd apps/server
pnpm migration:up
```

### 步骤 7：部署

1. 点击 "Deploy" 按钮
2. 等待构建完成
3. 访问你的 Vercel 域名

## ⚡ 一键部署按钮

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/onlinedear/wiki&env=APP_URL,APP_SECRET,DATABASE_URL,REDIS_URL,STORAGE_DRIVER,AWS_S3_ACCESS_KEY_ID,AWS_S3_SECRET_ACCESS_KEY,AWS_S3_REGION,AWS_S3_BUCKET,AWS_S3_ENDPOINT&project-name=notedoc&repository-name=notedoc)

点击上面的按钮，按照提示配置环境变量即可快速部署。

## 🔧 故障排查

### 问题 1：构建失败

**解决方案**：
- 确保使用 Node.js 22.x
- 检查 pnpm 版本是否为 10.4.0
- 查看构建日志中的具体错误信息

### 问题 2：数据库连接失败

**解决方案**：
- 检查 DATABASE_URL 格式是否正确
- 确保数据库允许来自 Vercel 的连接
- 在 Vercel Postgres 中，连接字符串会自动配置

### 问题 3：实时协作不工作

**原因**：Vercel 的 Serverless Functions 不支持持久 WebSocket 连接

**解决方案**：
- 将协作服务器部署到支持 WebSocket 的平台（Railway、Render）
- 配置 COLLAB_SERVER_URL 环境变量指向外部协作服务器

### 问题 4：文件上传失败

**解决方案**：
- 确保配置了 S3 存储（Vercel 不支持本地存储）
- 检查 S3 凭证和权限配置
- 验证 bucket 名称和 endpoint 是否正确

### 问题 5：函数超时

**原因**：Vercel Serverless Functions 有执行时间限制

**解决方案**：
- 升级到 Vercel Pro 计划（60秒超时）
- 优化长时间运行的操作
- 考虑使用其他部署方案

## 📊 性能优化

### 1. 启用 Vercel Edge Network
在 `vercel.json` 中配置：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. 配置 CDN 缓存
- 静态资源自动通过 Vercel CDN 分发
- 配置合适的缓存策略

### 3. 数据库优化
- 使用连接池
- 启用数据库查询缓存
- 选择地理位置接近的数据库区域

## 🔐 安全建议

1. **使用强密钥**：
   ```bash
   # 生成 APP_SECRET
   openssl rand -hex 32
   ```

2. **配置环境变量**：
   - 不要在代码中硬编码敏感信息
   - 使用 Vercel 的环境变量管理

3. **启用 HTTPS**：
   - Vercel 自动提供 SSL 证书
   - 确保 APP_URL 使用 https://

4. **配置 CORS**：
   - 限制允许的域名
   - 在后端配置正确的 CORS 策略

## 📚 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Upstash Redis](https://docs.upstash.com/redis)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [NoteDoc 完整部署指南](./NoteDoc完整部署指南.md)

## 💡 最佳实践

1. **使用 Docker 部署**：对于生产环境，强烈推荐使用 Docker
2. **监控和日志**：配置 Vercel Analytics 和日志监控
3. **备份数据库**：定期备份 PostgreSQL 数据库
4. **测试环境**：创建独立的测试环境进行验证
5. **版本控制**：使用 Git 分支管理不同环境的配置

## 🆘 获取帮助

如果遇到问题：

1. 查看 [GitHub Issues](https://github.com/onlinedear/wiki/issues)
2. 访问 [讨论区](https://github.com/onlinedear/wiki/discussions)
3. 查看 [完整文档](./README.md)

---

**注意**：由于 Vercel 的限制，我们强烈建议在生产环境中使用 Docker 部署或其他支持长连接的平台。Vercel 部署更适合用于演示和测试目的。
