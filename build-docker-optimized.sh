#!/bin/bash

# 优化的 Docker 构建脚本
# 适用于宝塔面板或其他服务器环境

set -e

echo "======================================"
echo "NoteDoc Docker 优化构建脚本"
echo "======================================"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装"
    exit 1
fi

# 清理旧的构建缓存（可选）
read -p "是否清理旧的构建缓存？这会让首次构建更慢，但可以解决缓存问题 (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "清理构建缓存..."
    docker builder prune -f
fi

# 设置构建参数
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo ""
echo "开始构建镜像..."
echo "提示: 这个过程可能需要 10-20 分钟，请耐心等待"
echo ""

# 使用 BuildKit 构建，显示详细输出
docker build \
    --progress=plain \
    --build-arg NODE_OPTIONS="--max-old-space-size=4096" \
    -t notedoc/notedoc:latest \
    -f Dockerfile \
    .

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "构建成功！"
    echo "======================================"
    echo ""
    echo "镜像信息："
    docker images notedoc/notedoc:latest
    echo ""
    echo "下一步："
    echo "1. 运行: docker-compose up -d"
    echo "2. 查看日志: docker-compose logs -f"
else
    echo ""
    echo "======================================"
    echo "构建失败！"
    echo "======================================"
    echo ""
    echo "可能的原因："
    echo "1. 内存不足（建议至少 2GB）"
    echo "2. 磁盘空间不足"
    echo "3. 网络问题导致依赖下载失败"
    echo ""
    echo "建议："
    echo "1. 检查服务器资源: free -h && df -h"
    echo "2. 尝试使用预构建镜像"
    echo "3. 在本地构建后上传到服务器"
    exit 1
fi
