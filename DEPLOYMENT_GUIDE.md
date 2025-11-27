# NoteDoc 部署快速参考

> 本文档提供 NoteDoc 的快速部署参考，详细文档请查看 `docs/` 目录。

## 🚀 快速开始

### 本地开发环境

```bash
# 一键启动开发服务器
./start-dev.sh
```

访问：
- 前端：http://localhost:5173
- 后端：http://localhost:3001

### 生产环境部署

```bash
# 一键部署到生产服务器（需要 sudo）
sudo ./deploy-production.sh
```

## 📋 环境要求

### 开发环境
- Node.js 20+
- pnpm 10.4.0
- PostgreSQL 16+
- Redis 7.2+

### 生产环境
- Docker + Docker Compose
- 2核 CPU / 4GB 内存 / 20GB 磁盘

## 📚 完整文档

| 文档 | 说明 |
|------|------|
| [本地开发环境启动指南](./docs/本地开发环境启动指南.md) | 详细的本地开发配置和启动步骤 |
| [生产环境部署指南](./docs/生产环境部署指南.md) | Docker、手动部署、云平台等多种方案 |
| [启动运行总结](./docs/启动运行总结.md) | 本次启动的完整记录和技术总结 |
| [Vercel 部署指南](./docs/Vercel部署指南.md) | Vercel 平台一键部署 |
| [宝塔面板部署指南](./docs/宝塔面板部署指南.md) | 宝塔面板 Docker 部署 |

## 🛠️ 常用命令

### 开发

```bash
# 启动开发服务器
npx pnpm dev

# 仅启动前端
npx pnpm client:dev

# 仅启动后端
npx pnpm server:dev

# 构建项目
npx pnpm build
```

### 数据库

```bash
cd apps/server

# 运行迁移
npx pnpm migration:up

# 创建迁移
npx pnpm migration:create <name>

# 生成类型
npx pnpm migration:codegen
```

### Docker 部署

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新应用
docker-compose pull && docker-compose up -d
```

## 🔧 配置说明

### 环境变量（.env）

```bash
# 应用配置
APP_URL=http://localhost:3001
PORT=3001
APP_SECRET=<32字符随机字符串>

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/notedoc

# Redis
REDIS_URL=redis://127.0.0.1:6379

# 存储（local 或 s3）
STORAGE_DRIVER=local

# 邮件服务
MAIL_DRIVER=smtp
MAIL_FROM_ADDRESS=noreply@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 生成安全密钥

```bash
# APP_SECRET（32字节）
openssl rand -hex 32

# 数据库密码（24字符）
openssl rand -base64 24
```

## 🌐 部署方案对比

| 方案 | 难度 | 适用场景 | 优点 |
|------|------|----------|------|
| Docker Compose | ⭐ | 小型团队 | 一键部署，易维护 |
| 手动部署 | ⭐⭐⭐ | 自定义需求 | 完全控制 |
| Vercel | ⭐ | 个人/测试 | 免费，自动部署 |
| 宝塔面板 | ⭐⭐ | 国内服务器 | 图形界面 |

## 🔒 安全建议

### 必须配置
- ✅ 使用强密码（APP_SECRET 至少 32 字符）
- ✅ 启用 HTTPS（生产环境必须）
- ✅ 配置防火墙（只开放 80/443 端口）
- ✅ 定期备份数据库和文件

### 推荐配置
- 配置 Redis 密码
- 启用 fail2ban 防暴力破解
- 设置自动备份脚本
- 配置监控和告警

## 📊 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端开发服务器 | 5173 | Vite |
| 后端 API | 3001 | NestJS |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存 |

## 🆘 常见问题

### NX Daemon 连接失败
```bash
npx nx reset
NX_DAEMON=false npx pnpm dev
```

### pnpm 命令未找到
```bash
npx pnpm@10.4.0 <command>
```

### 数据库连接失败
```bash
# macOS
brew services start postgresql@16

# Linux
sudo systemctl start postgresql
```

### 端口被占用
修改 `.env` 中的 `PORT` 配置

## 📞 技术支持

- **GitHub Issues**: https://github.com/onlinedear/wiki/issues
- **讨论区**: https://github.com/onlinedear/wiki/discussions
- **官方文档**: https://notedoc.cn/docs

## 📝 许可证

- **核心功能**: AGPL 3.0
- **企业版**: 专有许可证（位于 `apps/*/src/ee/`）

---

**快速链接**：
- [完整部署指南](./docs/生产环境部署指南.md)
- [本地开发指南](./docs/本地开发环境启动指南.md)
- [启动运行总结](./docs/启动运行总结.md)
