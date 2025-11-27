#!/bin/bash

# NoteDoc 开发环境启动脚本
# 用途：快速启动 NoteDoc 开发服务器

set -e

echo "========================================="
echo "  NoteDoc 开发环境启动脚本"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 Node.js
echo -n "检查 Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗${NC} 未安装"
    echo "请安装 Node.js 20+ 版本"
    exit 1
fi

# 检查 PostgreSQL
echo -n "检查 PostgreSQL... "
if brew services list | grep -q "postgresql@16.*started"; then
    echo -e "${GREEN}✓${NC} 运行中"
else
    echo -e "${YELLOW}!${NC} 未运行，尝试启动..."
    brew services start postgresql@16 || {
        echo -e "${RED}✗${NC} 启动失败"
        exit 1
    }
    echo -e "${GREEN}✓${NC} 已启动"
fi

# 检查 Redis
echo -n "检查 Redis... "
if redis-cli ping &> /dev/null; then
    echo -e "${GREEN}✓${NC} 运行中"
else
    echo -e "${YELLOW}!${NC} 未运行，尝试启动..."
    brew services start redis || {
        echo -e "${RED}✗${NC} 启动失败"
        exit 1
    }
    sleep 2
    echo -e "${GREEN}✓${NC} 已启动"
fi

# 检查环境变量文件
echo -n "检查环境变量配置... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} 存在"
else
    echo -e "${YELLOW}!${NC} 不存在，从模板创建..."
    cp .env.example .env
    echo -e "${YELLOW}!${NC} 请编辑 .env 文件配置数据库和其他参数"
    exit 1
fi

# 检查依赖
echo -n "检查项目依赖... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} 已安装"
else
    echo -e "${YELLOW}!${NC} 未安装，开始安装..."
    npx pnpm@10.4.0 install
    echo -e "${GREEN}✓${NC} 安装完成"
fi

# 运行数据库迁移
echo -n "检查数据库迁移... "
cd apps/server
MIGRATION_OUTPUT=$(npx pnpm migration:up 2>&1)
cd ../..
if echo "$MIGRATION_OUTPUT" | grep -q "No pending migrations"; then
    echo -e "${GREEN}✓${NC} 已是最新"
else
    echo -e "${GREEN}✓${NC} 迁移完成"
fi

echo ""
echo "========================================="
echo "  启动开发服务器"
echo "========================================="
echo ""
echo "前端地址: ${GREEN}http://localhost:5173${NC}"
echo "后端地址: ${GREEN}http://localhost:3001${NC}"
echo "健康检查: ${GREEN}http://localhost:3001/api/health${NC}"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动开发服务器（禁用 NX daemon 以避免连接问题）
NX_DAEMON=false npx pnpm dev
