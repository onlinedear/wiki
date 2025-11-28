#!/bin/bash

echo "======================================"
echo "  NoteDoc 系统检查和启动"
echo "======================================"
echo ""

# 添加 pnpm 到 PATH
export PATH="$PATH:$(npm config get prefix)/bin"

# 1. 检查 Docker
echo "1. 检查 Docker..."
if docker info > /dev/null 2>&1; then
    echo "   ✅ Docker 正在运行"
    DOCKER_OK=true
else
    echo "   ❌ Docker 未运行"
    echo "   请启动 Docker Desktop 或 OrbStack"
    DOCKER_OK=false
fi
echo ""

# 2. 检查构建
echo "2. 检查构建状态..."
if [ -d "apps/client/dist" ] && [ -d "apps/server/dist" ]; then
    echo "   ✅ 项目已构建"
else
    echo "   ⚠️  项目未构建，正在构建..."
    pnpm build
fi
echo ""

# 3. 提供启动选项
echo "======================================"
echo "  选择启动方式："
echo "======================================"
echo ""
echo "1. Docker Compose 方式（推荐）"
echo "   - 自动启动所有服务"
echo "   - 访问: http://localhost:3001"
echo ""
echo "2. 本地开发方式"
echo "   - 需要手动启动数据库和 Redis"
echo "   - 前端: http://localhost:5173"
echo "   - 后端: http://localhost:3001"
echo ""

if [ "$DOCKER_OK" = true ]; then
    read -p "请选择 (1/2): " choice
    
    case $choice in
        1)
            echo ""
            echo "正在启动 Docker Compose..."
            docker-compose up -d
            echo ""
            echo "======================================"
            echo "  服务启动中..."
            echo "======================================"
            echo ""
            echo "查看日志: docker-compose logs -f notedoc"
            echo "访问应用: http://localhost:3001"
            echo "停止服务: docker-compose down"
            echo ""
            echo "等待服务启动（约 30 秒）..."
            sleep 5
            docker-compose logs --tail=50 notedoc
            ;;
        2)
            echo ""
            echo "正在启动数据库和 Redis..."
            docker-compose up -d db redis
            echo ""
            echo "等待数据库启动..."
            sleep 10
            echo ""
            echo "运行数据库迁移..."
            cd apps/server
            pnpm migration:up
            cd ../..
            echo ""
            echo "======================================"
            echo "  启动开发服务器"
            echo "======================================"
            echo ""
            pnpm dev
            ;;
        *)
            echo "无效选择"
            exit 1
            ;;
    esac
else
    echo "❌ Docker 未运行，无法启动"
    echo ""
    echo "请先启动 Docker，然后重新运行此脚本："
    echo "  ./check-and-start.sh"
    echo ""
    echo "或者手动启动："
    echo "  1. 启动 Docker Desktop/OrbStack"
    echo "  2. 运行: docker-compose up -d"
fi
