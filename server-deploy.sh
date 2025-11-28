#!/bin/bash

# 服务器部署脚本
# 在服务器上运行此脚本来加载镜像并启动服务

set -e

echo "======================================"
echo "NoteDoc 服务器部署脚本"
echo "======================================"
echo ""

# 配置变量
TAR_FILE="/root/notedoc-latest.tar"
PROJECT_DIR="/www/wwwroot/notedoc"  # 根据实际情况修改

# 检查 tar 文件是否存在
if [ ! -f "$TAR_FILE" ]; then
    echo "错误: 找不到镜像文件 $TAR_FILE"
    echo "请确保已上传 notedoc-latest.tar 到 /root/ 目录"
    exit 1
fi

echo "✓ 找到镜像文件: $TAR_FILE"
echo ""

# 检查项目目录
if [ ! -d "$PROJECT_DIR" ]; then
    echo "错误: 项目目录不存在: $PROJECT_DIR"
    echo "请修改脚本中的 PROJECT_DIR 变量"
    exit 1
fi

echo "✓ 项目目录: $PROJECT_DIR"
echo ""

# 停止现有服务
echo "步骤 1: 停止现有服务..."
cd "$PROJECT_DIR"
if [ -f "docker-compose.yml" ]; then
    docker-compose down || true
    echo "✓ 已停止现有服务"
else
    echo "⚠ 未找到 docker-compose.yml，跳过停止服务"
fi
echo ""

# 加载镜像
echo "步骤 2: 加载 Docker 镜像..."
docker load -i "$TAR_FILE"
if [ $? -eq 0 ]; then
    echo "✓ 镜像加载成功"
else
    echo "✗ 镜像加载失败"
    exit 1
fi
echo ""

# 验证镜像
echo "步骤 3: 验证镜像..."
docker images | grep notedoc
echo ""

# 检查 docker-compose.yml
echo "步骤 4: 检查配置文件..."
if [ ! -f "$PROJECT_DIR/docker-compose.yml" ]; then
    echo "✗ 错误: 未找到 docker-compose.yml"
    echo "请确保配置文件存在"
    exit 1
fi
echo "✓ 配置文件存在"
echo ""

# 启动服务
echo "步骤 5: 启动服务..."
docker-compose up -d
if [ $? -eq 0 ]; then
    echo "✓ 服务启动成功"
else
    echo "✗ 服务启动失败"
    exit 1
fi
echo ""

# 等待服务启动
echo "等待服务启动..."
sleep 5
echo ""

# 查看服务状态
echo "步骤 6: 检查服务状态..."
docker-compose ps
echo ""

# 显示日志
echo "======================================"
echo "部署完成！"
echo "======================================"
echo ""
echo "查看日志："
echo "  docker-compose logs -f notedoc"
echo ""
echo "检查状态："
echo "  docker-compose ps"
echo ""
echo "重启服务："
echo "  docker-compose restart notedoc"
echo ""
echo "停止服务："
echo "  docker-compose down"
echo ""
echo "正在显示最近的日志..."
echo "======================================"
docker-compose logs --tail=50 notedoc
