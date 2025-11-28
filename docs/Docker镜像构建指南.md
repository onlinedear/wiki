# Docker 镜像构建指南

## 问题：宝塔面板构建卡住

如果在宝塔面板构建时卡在 `nest build` 步骤，这是正常现象，通常需要 5-15 分钟。

## 解决方案

### 方案 1：继续等待（推荐首选）

1. **耐心等待 10-15 分钟**
2. 在宝塔面板查看资源使用情况
3. 确保服务器有足够内存（至少 2GB）

### 方案 2：使用优化构建脚本

在服务器上运行：

```bash
# 给脚本执行权限
chmod +x build-docker-optimized.sh

# 运行优化构建
./build-docker-optimized.sh
```

### 方案 3：本地构建后上传（最快）

如果你有本地 Docker 环境（Mac/Windows）：

#### 步骤 1：在本地构建

```bash
# 在项目目录运行
chmod +x build-and-push.sh
./build-and-push.sh
```

这会生成 `notedoc-latest.tar` 文件。

#### 步骤 2：上传到服务器

使用 FTP 或 SCP 上传：

```bash
# 使用 scp（在本地运行）
scp notedoc-latest.tar root@your-server:/root/

# 或使用宝塔面板的文件管理上传
```

#### 步骤 3：在服务器加载镜像

```bash
# SSH 登录服务器后
cd /root  # 或你上传的目录

# 加载镜像
docker load -i notedoc-latest.tar

# 验证镜像
docker images | grep notedoc

# 启动服务
cd /path/to/notedoc
docker-compose up -d
```

### 方案 4：使用 Docker Hub（如果有账号）

#### 在本地构建并推送

```bash
# 登录 Docker Hub
docker login

# 构建并打标签
docker build -t your-username/notedoc:latest .

# 推送到 Docker Hub
docker push your-username/notedoc:latest
```

#### 在服务器拉取

修改 `docker-compose.yml`：

```yaml
services:
  notedoc:
    image: your-username/notedoc:latest
```

然后运行：

```bash
docker-compose pull
docker-compose up -d
```

## 构建时间参考

- **本地 Mac（M1/M2）**: 5-10 分钟
- **本地 Windows/Intel Mac**: 10-15 分钟
- **服务器（2核4G）**: 15-25 分钟
- **服务器（1核2G）**: 25-40 分钟或失败

## 常见问题

### 1. 构建失败：内存不足

**症状**: 构建过程中突然停止，或显示 "Killed"

**解决**:
```bash
# 检查内存
free -h

# 如果内存不足，添加 swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 2. 构建失败：磁盘空间不足

**症状**: "no space left on device"

**解决**:
```bash
# 检查磁盘空间
df -h

# 清理 Docker 缓存
docker system prune -a
```

### 3. 网络问题导致依赖下载失败

**症状**: npm install 或 pnpm install 失败

**解决**:
```bash
# 在 Dockerfile 中添加国内镜像源
# 或在本地构建后上传
```

## 推荐方案总结

| 场景 | 推荐方案 | 时间 |
|------|---------|------|
| 服务器资源充足（4G+） | 方案 2：优化构建 | 15-20 分钟 |
| 服务器资源不足（2G-） | 方案 3：本地构建上传 | 10 分钟 + 上传时间 |
| 有 Docker Hub 账号 | 方案 4：推送到仓库 | 一次构建，多次使用 |
| 首次尝试 | 方案 1：继续等待 | 10-15 分钟 |

## 验证构建成功

```bash
# 查看镜像
docker images | grep notedoc

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f notedoc

# 检查服务状态
docker-compose ps
```

## 需要帮助？

如果以上方案都不行，可以：

1. 检查服务器配置是否满足最低要求
2. 查看完整的构建日志
3. 考虑使用更高配置的服务器
