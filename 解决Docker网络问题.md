# Docker 网络连接问题解决方案

## 问题

无法连接到 Docker Hub (`registry-1.docker.io`)

## 解决方案

### 方案 1：配置 Docker 镜像加速器（推荐）

#### 对于 OrbStack：

1. 打开 OrbStack 应用
2. 点击菜单栏图标 → Settings
3. 找到 Docker 设置
4. 添加镜像源（Registry Mirrors）：

```
https://docker.m.daocloud.io
https://docker.1panel.live
```

5. 重启 OrbStack

#### 或者手动编辑配置文件：

```bash
# 创建或编辑 Docker 配置
mkdir -p ~/.docker
cat > ~/.docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live"
  ]
}
EOF

# 重启 Docker（OrbStack）
# 在 OrbStack 应用中重启
```

### 方案 2：检查网络连接

```bash
# 测试 Docker Hub 连接
curl -I https://registry-1.docker.io/v2/

# 如果失败，检查代理设置
echo $HTTP_PROXY
echo $HTTPS_PROXY
```

### 方案 3：使用代理

如果你有代理，配置 Docker 使用代理：

```bash
# 编辑 ~/.docker/config.json
{
  "proxies": {
    "default": {
      "httpProxy": "http://proxy.example.com:8080",
      "httpsProxy": "http://proxy.example.com:8080"
    }
  }
}
```

### 方案 4：直接在服务器构建（备选）

如果本地网络问题无法解决，回到服务器构建：

```bash
# SSH 登录服务器
ssh root@你的服务器IP

# 进入项目目录
cd /www/wwwroot/notedoc

# 使用优化脚本构建
chmod +x build-docker-optimized.sh
./build-docker-optimized.sh
```

## 下一步

配置好镜像加速器后，重新运行：

```bash
./build-and-push.sh
```
