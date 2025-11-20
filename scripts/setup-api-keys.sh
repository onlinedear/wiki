#!/bin/bash

# API Keys 功能设置脚本
# 用于快速部署 API Keys 功能

set -e

echo "========================================="
echo "  Docmost API Keys 功能设置"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo "步骤 1/4: 检查依赖..."
echo "-----------------------------------"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到 Node.js，请先安装 Node.js${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js 已安装: $(node --version)${NC}"

# 检查包管理器
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
    echo -e "${GREEN}✓ 使用 pnpm: $(pnpm --version)${NC}"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
    echo -e "${GREEN}✓ 使用 npm: $(npm --version)${NC}"
else
    echo -e "${RED}错误: 未找到 npm 或 pnpm${NC}"
    exit 1
fi

# 检查 PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠ 未找到 psql 命令，将跳过自动数据库迁移${NC}"
    echo -e "${YELLOW}  请手动执行 SQL 文件: apps/server/src/database/migrations/manual-api-keys-migration.sql${NC}"
    SKIP_DB=true
else
    echo -e "${GREEN}✓ PostgreSQL 已安装${NC}"
    SKIP_DB=false
fi

echo ""
echo "步骤 2/4: 安装依赖..."
echo "-----------------------------------"

if [ "$PKG_MANAGER" = "pnpm" ]; then
    pnpm install
else
    npm install
fi

echo -e "${GREEN}✓ 依赖安装完成${NC}"

echo ""
echo "步骤 3/4: 数据库迁移..."
echo "-----------------------------------"

if [ "$SKIP_DB" = false ]; then
    # 检查 .env 文件
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠ 未找到 .env 文件${NC}"
        echo "请创建 .env 文件并配置 DATABASE_URL"
        echo "示例: DATABASE_URL=postgresql://user:password@localhost:5432/docmost"
        echo ""
        read -p "是否继续手动迁移? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
        MANUAL_MIGRATION=true
    else
        MANUAL_MIGRATION=false
    fi

    if [ "$MANUAL_MIGRATION" = false ]; then
        echo "正在运行数据库迁移..."
        if [ "$PKG_MANAGER" = "pnpm" ]; then
            pnpm --filter server migration:up
        else
            cd apps/server && npm run migration:up && cd ../..
        fi
        echo -e "${GREEN}✓ 数据库迁移完成${NC}"
    else
        echo -e "${YELLOW}请手动执行以下命令进行数据库迁移:${NC}"
        echo ""
        echo "  psql -U your_user -d your_database -f apps/server/src/database/migrations/manual-api-keys-migration.sql"
        echo ""
    fi
else
    echo -e "${YELLOW}请手动执行以下命令进行数据库迁移:${NC}"
    echo ""
    echo "  psql -U your_user -d your_database -f apps/server/src/database/migrations/manual-api-keys-migration.sql"
    echo ""
fi

echo ""
echo "步骤 4/4: 验证安装..."
echo "-----------------------------------"

# 检查文件是否存在
FILES=(
    "apps/client/src/ee/api-key/index.ts"
    "apps/server/src/ee/api-key/api-key.module.ts"
    "apps/server/src/database/repos/api-key/api-key.repo.ts"
)

ALL_FILES_EXIST=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file 不存在${NC}"
        ALL_FILES_EXIST=false
    fi
done

echo ""
echo "========================================="
if [ "$ALL_FILES_EXIST" = true ]; then
    echo -e "${GREEN}✓ 安装完成！${NC}"
else
    echo -e "${RED}✗ 安装未完成，请检查缺失的文件${NC}"
    exit 1
fi
echo "========================================="
echo ""

echo "下一步操作:"
echo ""
echo "1. 启动开发服务器:"
echo "   ${PKG_MANAGER} run dev"
echo ""
echo "2. 访问 API Keys 管理页面:"
echo "   http://localhost:5173/settings/workspace"
echo ""
echo "3. 查看文档:"
echo "   - 快速启动: cat API_KEY_QUICKSTART.md"
echo "   - 功能说明: cat API_MANAGEMENT_FEATURES.md"
echo "   - 使用示例: cat examples/api-key-usage-examples.md"
echo ""
echo "4. 测试 API:"
echo "   创建一个 API Key 后，使用以下命令测试:"
echo "   curl -H \"Authorization: Bearer dk_your_key\" http://localhost:3000/api/workspaces/workspace-id/api-keys"
echo ""

echo -e "${GREEN}祝使用愉快！${NC}"
