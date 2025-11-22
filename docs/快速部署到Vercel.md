# 快速部署到 Vercel

## 🚀 一键部署

点击下面的按钮，3 分钟内完成部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/onlinedear/wiki&env=APP_URL,APP_SECRET,DATABASE_URL,REDIS_URL,STORAGE_DRIVER&project-name=docmost&repository-name=docmost)

## 📋 部署前准备（5分钟）

### 1. 创建数据库（2分钟）

**推荐：Vercel Postgres（免费）**
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 Storage → Create Database → Postgres
3. 复制 `DATABASE_URL`

**或者使用 Supabase（免费）**
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 在 Settings → Database 中复制连接字符串

### 2. 创建 Redis（2分钟）

**Upstash Redis（免费）**
1. 访问 [upstash.com](https://upstash.com)
2. 创建 Redis 数据库
3. 复制 `REDIS_URL`

### 3. 配置存储（1分钟）

**Cloudflare R2（推荐，免费10GB）**
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. R2 → Create bucket
3. 创建 API Token，获取：
   - `AWS_S3_ACCESS_KEY_ID`
   - `AWS_S3_SECRET_ACCESS_KEY`
   - `AWS_S3_ENDPOINT`
   - `AWS_S3_BUCKET`

## 🔧 环境变量配置

点击部署按钮后，填写以下环境变量：

```bash
# 必填项
APP_URL=https://your-app.vercel.app
APP_SECRET=生成一个32字符的随机字符串
DATABASE_URL=从步骤1获取
REDIS_URL=从步骤2获取

# 存储配置
STORAGE_DRIVER=s3
AWS_S3_ACCESS_KEY_ID=从步骤3获取
AWS_S3_SECRET_ACCESS_KEY=从步骤3获取
AWS_S3_REGION=auto
AWS_S3_BUCKET=从步骤3获取
AWS_S3_ENDPOINT=从步骤3获取
AWS_S3_FORCE_PATH_STYLE=true

# 可选项
MAIL_DRIVER=smtp
MAIL_FROM_ADDRESS=hello@example.com
FILE_UPLOAD_SIZE_LIMIT=50mb
```

### 生成 APP_SECRET

在终端运行：
```bash
openssl rand -hex 32
```

或访问：https://generate-secret.vercel.app/32

## 📝 部署步骤

1. **点击部署按钮** → Fork 仓库到你的 GitHub
2. **填写环境变量** → 粘贴上面准备的值
3. **点击 Deploy** → 等待 2-3 分钟
4. **运行数据库迁移**：
   ```bash
   # 克隆仓库
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
5. **访问应用** → 打开 Vercel 提供的域名

## ✅ 验证部署

访问你的应用：
- 首页应该正常加载
- 可以注册新账号
- 可以创建文档库
- 可以创建和编辑文档

## ⚠️ 重要提示

**Vercel 限制**：
- ❌ 实时协作功能可能不稳定（WebSocket 限制）
- ❌ 不支持本地文件存储（必须使用 S3）
- ⚠️ Serverless Functions 有执行时间限制

**推荐方案**：
- ✅ **生产环境**：使用 Docker 部署到 VPS
- ✅ **测试/演示**：Vercel 部署
- ✅ **混合部署**：前端 Vercel + 后端 Railway/Render

## 🔧 故障排查

### 构建失败
- 检查 Node.js 版本（需要 22.x）
- 查看构建日志中的错误信息

### 数据库连接失败
- 验证 `DATABASE_URL` 格式
- 确保数据库允许外部连接

### 文件上传失败
- 检查 S3 配置是否正确
- 验证 bucket 权限设置

## 📚 更多信息

- [完整 Vercel 部署指南](./Vercel部署指南.md)
- [Docker 部署指南](./Docmost完整部署指南.md)
- [GitHub 讨论区](https://github.com/onlinedear/wiki/discussions)

---

**需要帮助？** 在 [GitHub Issues](https://github.com/onlinedear/wiki/issues) 提问
