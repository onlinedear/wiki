#!/bin/bash

echo "======================================"
echo "  NoteDoc 本地启动脚本"
echo "======================================"
echo ""

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未安装，正在安装..."
    npm install -g pnpm@10.4.0
fi

echo "✓ pnpm 已安装: $(pnpm --version)"
echo ""

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "❌ .env 文件不存在"
    echo "请复制 .env.example 并配置："
    echo "  cp .env.example .env"
    exit 1
fi

echo "✓ .env 文件存在"
echo ""

# 提示数据库和 Redis
echo "⚠️  请确保以下服务正在运行："
echo "  1. PostgreSQL (localhost:5432)"
echo "  2. Redis (localhost:6379)"
echo ""
echo "如果使用 Docker，请运行："
echo "  docker-compose up -d db redis"
echo ""

read -p "服务已准备好？按 Enter 继续，或 Ctrl+C 取消..."

# 运行数据库迁移
echo ""
echo "正在运行数据库迁移..."
cd apps/server
pnpm migration:up
cd ../..

# 启动服务
echo ""
echo "======================================"
echo "  启动 NoteDoc 服务"
echo "======================================"
echo ""
echo "前端: http://localhost:5173"
echo "后端: http://localhost:3001"
echo ""

pnpm dev
