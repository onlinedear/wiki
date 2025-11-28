#!/bin/bash

# 在服务器上构建 Docker 镜像的脚本
# 适用于 AMD64 架构的服务器

set -e

echo "======================================"
echo "在服务器上构建 NoteDoc 镜像"
echo "======================================"
echo ""

PROJECT_DIR="/www/wwwroot/notedoc"

# 检查项目目录
if [ ! -d "$PROJECT_DIR" ]; then
    echo "错误: 项目目录不存在: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

echo "当前目录: $(pwd)"
echo ""

# 检查 Dockerfile
if [ ! -f "Dockerfile" ]; then
    echo "错误: 未找到 Dockerfile"
    exit 1
fi

echo "✓ 找到 Dockerfile"
echo ""

# 停止现有服务
echo "步骤 1: 停止现有服务..."
docker-compose down || true
echo ""

# 删除旧镜像
echo "步骤 2: 删除旧镜像..."
docker rmi notedoc:latest || true
docker rmi notedoc/notedoc:latest || true
echo ""

# 构建镜像
echo "步骤 3: 开始构建镜像..."
echo "提示: 这个过程可能需要 15-30 分钟，请耐心等待"
echo ""

# 使用 BuildKit 构建
export DOCKER_BUILDKIT=1

docker build \
    --progress=plain \
    --platform linux/amd64 \
    -t notedoc:latest \
    -t notedoc/notedoc:latest \
    .

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "✓ 镜像构建成功！"
    echo "======================================"
    echo ""
    docker images | grep notedoc
    echo ""
    
    # 启动服务
    echo "步骤 4: 启动服务..."
    docker-compose up -d
    
    echo ""
    echo "等待服务启动..."
    sleep 5
    
    echo ""
    echo "======================================"
    echo "部署完成！"
    echo "======================================"
    echo ""
    echo "查看日志："
    echo "  docker-compose logs -f notedoc"
    echo ""
    
    docker-compose logs --tail=50 notedoc
else
    echo ""
    echo "======================================"
    echo "✗ 镜像构建失败"
    echo "======================================"
    exit 1
fi
