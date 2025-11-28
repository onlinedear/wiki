# NoteDoc 完整部署和更新指南

## 目录

1. [首次部署](#首次部署)
2. [日常更新流程](#日常更新流程)
3. [数据库迁移说明](#数据库迁移说明)
4. [备份与恢复](#备份与恢复)
5. [常见问题](#常见问题)

---

## 首次部署

### 环境要求

- **本地**: Mac（Apple Silicon 或 Intel）+ Docker Desktop
- **服务器**: Linux（AMD64 架构）+ Docker + Docker Compose
- **宝塔面板**: 已安装并配置

### 步骤 1: 本地构建镜像

在本地 Mac 上执行：

```bash
# 1. 进入项目目录
cd /path/to/notedoc

# 2. 构建 AMD64 架构的镜像
docker build --platform linux/amd64 -t notedoc:latest .

# 3. 保存镜像为 tar 文件
docker save -o notedoc-latest.tar notedoc:latest

# 4. 查看文件大小
ls -lh notedoc-latest.tar
```

**预计时间**: 5-10 分钟  
**文件大小**: 约 650MB

### 步骤 2: 上传镜像到服务器

**方式 A: 使用宝塔面板（推荐）**

1. 打开宝塔面板 → 文件管理
2. 上传 `notedoc-latest.tar` 到 `/root/` 目录
3. 等待上传完成

**方式 B: 使用 scp 命令**

```bash
scp notedoc-latest.tar root@你的服务器IP:/root/
```

### 步骤 3: 服务器部署

SSH 登录服务器后执行：

```bash
# 1. 加载镜像
cd /root
docker load -i notedoc-latest.tar

# 2. 验证镜像
docker images | grep notedoc

# 3. 进入项目目录
cd /www/wwwroot/notedoc

# 4. 启动服务
docker-compose up -d

# 5. 查看日志
docker-compose logs -f notedoc
```

看到以下日志表示成功：
```
[Nest] XX - LOG [NestApplication] Nest application successfully started
[Nest] XX - LOG [NestApplication] Listening on http://127.0.0.1:3000
```

### 步骤 4: 配置反向代理

在宝塔面板：

1. **添加网站**
   - 域名: `notedoc.cn`
   - PHP 版本: 纯静态

2. **配置反向代理**
   - 目标 URL: `http://127.0.0.1:3000`
   - 发送域名: `$host`
   - 高级配置添加：
   ```nginx
   proxy_set_header Upgrade $http_upgrade;
   proxy_set_header Connection "upgrade";
   ```

3. **配置 SSL**
   - 申请 Let's Encrypt 免费证书
   - 开启强制 HTTPS

4. **访问测试**
   - 浏览器打开 `https://notedoc.cn`
   - 创建管理员账号

---

## 日常更新流程

当你修改了代码（新增功能、修复 Bug）后，按以下流程更新：

### 更新步骤

#### 1. 本地构建新镜像

```bash
# 进入项目目录
cd /path/to/notedoc

# 清理旧镜像（可选）
docker rmi notedoc:latest

# 构建新镜像
docker build --platform linux/amd64 -t notedoc:latest .

# 保存为 tar 文件
docker save -o notedoc-latest.tar notedoc:latest
```

#### 2. 上传到服务器

使用宝塔面板或 scp 上传 `notedoc-latest.tar` 到 `/root/`

#### 3. 服务器更新部署

```bash
# SSH 登录服务器

# 1. 进入项目目录
cd /www/wwwroot/notedoc

# 2. 备份数据库（重要！）
docker-compose exec db pg_dump -U notedoc notedoc > backup-$(date +%Y%m%d-%H%M%S).sql

# 3. 停止服务
docker-compose down

# 4. 删除旧镜像
docker rmi notedoc:latest

# 5. 加载新镜像
cd /root
docker load -i notedoc-latest.tar

# 6. 返回项目目录
cd /www/wwwroot/notedoc

# 7. 启动服务
docker-compose up -d

# 8. 查看日志
docker-compose logs -f notedoc
```

#### 4. 验证更新

1. 查看日志确认启动成功
2. 访问网站测试新功能
3. 检查数据是否正常

### 快速更新脚本

创建 `update.sh` 脚本简化更新流程：

```bash
#!/bin/bash

echo "======================================"
echo "NoteDoc 更新部署脚本"
echo "======================================"

PROJECT_DIR="/www/wwwroot/notedoc"
TAR_FILE="/root/notedoc-latest.tar"

cd $PROJECT_DIR

# 备份数据库
echo "1. 备份数据库..."
docker-compose exec -T db pg_dump -U notedoc notedoc > backup-$(date +%Y%m%d-%H%M%S).sql

# 停止服务
echo "2. 停止服务..."
docker-compose down

# 删除旧镜像
echo "3. 删除旧镜像..."
docker rmi notedoc:latest

# 加载新镜像
echo "4. 加载新镜像..."
docker load -i $TAR_FILE

# 启动服务
echo "5. 启动服务..."
docker-compose up -d

# 等待启动
echo "6. 等待服务启动..."
sleep 5

# 显示日志
echo "7. 查看日志..."
docker-compose logs --tail=50 notedoc

echo ""
echo "======================================"
echo "更新完成！"
echo "======================================"
```

使用方法：
```bash
chmod +x update.sh
./update.sh
```

---

## 数据库迁移说明

### 数据库会受影响吗？

**不会丢失数据！** 但需要注意以下几点：

#### 1. 数据持久化

Docker Compose 配置中使用了 Volume 持久化数据：

```yaml
volumes:
  db_data:  # 数据库数据
  notedoc_data:  # 文件存储
```

这些数据存储在宿主机上，**不会因为容器重启或镜像更新而丢失**。

#### 2. 自动数据库迁移

NoteDoc 启动时会自动执行数据库迁移：

```
[DatabaseMigrationService] Migration "20240324T085400-uuid_v7_fn" executed successfully
[DatabaseMigrationService] Migration "20240324T085500-workspaces" executed successfully
...
```

- **新增表/字段**: 自动创建，不影响现有数据
- **修改表结构**: 自动迁移，保留现有数据
- **删除字段**: 通常会保留数据，只是不再使用

#### 3. 迁移安全性

- ✅ **向前兼容**: 新版本可以读取旧版本的数据
- ✅ **自动备份**: 建议每次更新前手动备份
- ✅ **回滚支持**: 如果更新失败，可以恢复备份

#### 4. 何时需要特别注意

以下情况需要特别小心：

- **大版本升级**: 如 v0.x → v1.x
- **破坏性更改**: 查看 CHANGELOG 中的 BREAKING CHANGES
- **自定义修改**: 如果你修改了数据库结构

### 数据库迁移最佳实践

```bash
# 1. 更新前备份
docker-compose exec db pg_dump -U notedoc notedoc > backup-before-update.sql

# 2. 更新镜像并启动
docker-compose down
docker load -i notedoc-latest.tar
docker-compose up -d

# 3. 查看迁移日志
docker-compose logs notedoc | grep Migration

# 4. 如果失败，恢复备份
docker-compose down
docker-compose up -d db
docker-compose exec -T db psql -U notedoc notedoc < backup-before-update.sql
```

---

## 备份与恢复

### 备份

#### 1. 备份数据库

```bash
# 完整备份
docker-compose exec db pg_dump -U notedoc notedoc > backup-$(date +%Y%m%d).sql

# 压缩备份
docker-compose exec db pg_dump -U notedoc notedoc | gzip > backup-$(date +%Y%m%d).sql.gz
```

#### 2. 备份文件存储

```bash
# 备份上传的文件
tar -czf storage-backup-$(date +%Y%m%d).tar.gz data/storage/
```

#### 3. 自动备份脚本

创建 `backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

cd /www/wwwroot/notedoc

# 备份数据库
docker-compose exec -T db pg_dump -U notedoc notedoc | gzip > $BACKUP_DIR/db-$DATE.sql.gz

# 备份文件
tar -czf $BACKUP_DIR/storage-$DATE.tar.gz data/storage/

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR"
```

设置定时任务（每天凌晨 2 点）：
```bash
crontab -e
# 添加：
0 2 * * * /www/wwwroot/notedoc/backup.sh
```

### 恢复

#### 1. 恢复数据库

```bash
# 停止应用
docker-compose stop notedoc

# 恢复数据库
docker-compose exec -T db psql -U notedoc notedoc < backup-20241127.sql

# 或从压缩文件恢复
gunzip -c backup-20241127.sql.gz | docker-compose exec -T db psql -U notedoc notedoc

# 重启应用
docker-compose start notedoc
```

#### 2. 恢复文件存储

```bash
# 停止应用
docker-compose stop notedoc

# 恢复文件
tar -xzf storage-backup-20241127.tar.gz

# 重启应用
docker-compose start notedoc
```

---

## 常见问题

### 1. 更新后无法启动

**症状**: 容器启动后立即退出

**排查**:
```bash
# 查看日志
docker-compose logs notedoc

# 常见原因：
# - 数据库迁移失败
# - 环境变量配置错误
# - 端口被占用
```

**解决**: 恢复备份，检查日志中的错误信息

### 2. 更新后功能异常

**症状**: 某些功能不工作或报错

**排查**:
```bash
# 查看浏览器控制台错误
# 查看服务器日志
docker-compose logs -f notedoc
```

**解决**: 
- 清除浏览器缓存
- 检查是否有数据库迁移失败
- 回滚到旧版本

### 3. 数据丢失

**症状**: 更新后数据不见了

**原因**: 
- 使用了 `docker-compose down -v`（删除了 Volume）
- 数据库连接配置错误

**解决**: 从备份恢复

### 4. 镜像构建失败

**症状**: 本地构建时报错

**常见原因**:
- 依赖安装失败（网络问题）
- TypeScript 编译错误
- 内存不足

**解决**:
```bash
# 清理缓存重新构建
docker system prune -a
docker build --no-cache --platform linux/amd64 -t notedoc:latest .
```

### 5. 上传镜像太慢

**症状**: 上传 650MB 文件很慢

**优化方案**:
- 使用服务器直接构建（避免上传）
- 使用 Docker Registry（高级）
- 压缩 tar 文件：`gzip notedoc-latest.tar`

---

## 更新检查清单

每次更新前检查：

- [ ] 已备份数据库
- [ ] 已备份文件存储
- [ ] 已阅读 CHANGELOG
- [ ] 已在本地测试新功能
- [ ] 已通知用户（如果是重大更新）
- [ ] 准备好回滚方案

更新后验证：

- [ ] 服务正常启动
- [ ] 数据库迁移成功
- [ ] 现有功能正常
- [ ] 新功能正常
- [ ] 文件上传/下载正常
- [ ] 协作编辑正常

---

## 总结

### 数据安全保证

1. **Docker Volume 持久化**: 数据不会因容器重启丢失
2. **自动数据库迁移**: 新版本自动适配数据库结构
3. **定期备份**: 每次更新前自动备份
4. **快速回滚**: 出问题可以立即恢复

### 更新流程总结

```
本地修改代码 
  ↓
本地构建镜像（AMD64）
  ↓
上传到服务器
  ↓
备份数据库
  ↓
停止服务 → 加载新镜像 → 启动服务
  ↓
验证功能
```

### 关键命令速查

```bash
# 构建
docker build --platform linux/amd64 -t notedoc:latest .
docker save -o notedoc-latest.tar notedoc:latest

# 部署
docker load -i notedoc-latest.tar
docker-compose down
docker-compose up -d

# 备份
docker-compose exec db pg_dump -U notedoc notedoc > backup.sql

# 恢复
docker-compose exec -T db psql -U notedoc notedoc < backup.sql

# 日志
docker-compose logs -f notedoc
```

---

## 需要帮助？

如果遇到问题：

1. 查看日志：`docker-compose logs notedoc`
2. 检查容器状态：`docker-compose ps`
3. 验证镜像：`docker images | grep notedoc`
4. 测试数据库连接：`docker-compose exec db psql -U notedoc`

记住：**更新前一定要备份！**
