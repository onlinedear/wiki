---
creator: "${author}"
created: "${createTime}"
last_modified_by: "${author}"
last_modified: "${updateTime}"
version: "v1.0"
visibility: "internal"
---
# 本地部署总结报告

**创建日期**: 2025-11-29
**项目**: NoteDoc (Docmost)

## 1. 环境搭建与依赖安装

- **依赖管理**: 使用 `pnpm` 作为包管理器。
  - 执行了 `npm install -g pnpm` 更新/安装 pnpm。
  - 执行了 `pnpm install` 安装项目所有依赖（包括 workspace 中的依赖）。
- **Docker 服务**:
  - 启动了 PostgreSQL 数据库和 Redis 缓存服务。
  - 镜像: `postgres:16-alpine`, `redis:7.2-alpine`。

## 2. 配置变更与调整

### 端口冲突解决 (PostgreSQL)
由于本地环境中端口 `5432` 已被占用，我们对数据库端口进行了重新映射：
- **docker-compose.yml**: 将 `db` 服务的端口映射从 `5432:5432` 修改为 `5433:5432`。
- **.env**: 更新 `DATABASE_URL` 连接串，将端口指向 `5433`。
  ```bash
  DATABASE_URL="postgresql://notedoc:STRONG_DB_PASSWORD@localhost:5433/notedoc?schema=public"
  ```

### 环境变量配置 (.env)
- 基于 `.env.example` 创建了 `.env` 文件。
- 生成了随机的 `APP_SECRET`。
- 启用了调试模式 `DEBUG_MODE=true`。
- 配置了基本的邮件、存储和 URL 设置。

### 前端构建修复
在启动前端开发服务器时遇到了 `@tiptap/pm` 解析错误。
- **文件**: `apps/client/vite.config.ts`
- **问题**: `optimizeDeps.include` 中包含的 `@tiptap/pm` 导致 Vite 预构建失败，因为该包缺少 `.` 导出。
- **修复**: 从 `include` 数组中移除了 `@tiptap/pm`，保留了具体的子路径（如 `@tiptap/pm/state` 等）。

## 3. 数据库迁移
- 成功执行了数据库迁移命令 `npx pnpm --filter server run migration:latest`。
- 数据库已初始化完成，包含所有必要的表结构（用户、空间、页面等）。

## 4. 启动指南

将来如果需要重新启动本地开发环境，请按照以下步骤操作：

1. **启动基础服务 (Docker)**:
   ```bash
   docker-compose up -d db redis
   ```

2. **启动开发服务器**:
   建议在两个终端中分别启动前后端，以便查看日志：
   
   **终端 1 (后端)**:
   ```bash
   NX_DAEMON=false npx pnpm run server:dev
   ```
   
   **终端 2 (前端)**:
   ```bash
   NX_DAEMON=false npx pnpm --filter client run dev --force
   ```

## 5. 访问信息

- **前端应用**: [http://localhost:5173/](http://localhost:5173/)
- **后端 API**: [http://localhost:3000/](http://localhost:3000/)
- **数据库端口**: `5433` (本地连接时使用)
- **Redis 端口**: `6379`
