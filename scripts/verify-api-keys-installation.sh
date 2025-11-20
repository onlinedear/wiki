#!/bin/bash

# API Keys 功能安装验证脚本
# 检查所有必需的文件是否存在

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================="
echo "  API Keys 功能安装验证"
echo "========================================="
echo ""

TOTAL=0
PASSED=0
FAILED=0

# 检查文件是否存在
check_file() {
    local file=$1
    local description=$2
    TOTAL=$((TOTAL + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description"
        echo -e "  ${YELLOW}缺失文件: $file${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 检查目录是否存在
check_dir() {
    local dir=$1
    local description=$2
    TOTAL=$((TOTAL + 1))
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description"
        echo -e "  ${YELLOW}缺失目录: $dir${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo -e "${BLUE}检查前端文件...${NC}"
echo "-----------------------------------"
check_dir "apps/client/src/ee/api-key" "前端模块目录"
check_dir "apps/client/src/ee/api-key/components" "前端组件目录"
check_dir "apps/client/src/ee/api-key/pages" "前端页面目录"
check_dir "apps/client/src/ee/api-key/types" "前端类型目录"

check_file "apps/client/src/ee/api-key/index.ts" "前端模块导出"
check_file "apps/client/src/ee/api-key/components/api-key-stats-cards.tsx" "统计卡片组件"
check_file "apps/client/src/ee/api-key/components/api-key-status-badge.tsx" "状态徽章组件"
check_file "apps/client/src/ee/api-key/components/api-key-scopes-selector.tsx" "权限选择器组件"
check_file "apps/client/src/ee/api-key/components/api-key-details-drawer.tsx" "详情侧边栏组件"
check_file "apps/client/src/ee/api-key/components/create-api-key-modal.tsx" "创建向导组件"
check_file "apps/client/src/ee/api-key/components/api-key-table.tsx" "数据表格组件"
check_file "apps/client/src/ee/api-key/pages/workspace-api-keys.tsx" "主页面组件"
check_file "apps/client/src/ee/api-key/types/api-key.types.ts" "TypeScript 类型定义"

echo ""
echo -e "${BLUE}检查后端文件...${NC}"
echo "-----------------------------------"
check_dir "apps/server/src/ee/api-key" "后端模块目录"
check_dir "apps/server/src/ee/api-key/dto" "DTO 目录"
check_dir "apps/server/src/ee/api-key/guards" "守卫目录"
check_dir "apps/server/src/database/repos/api-key" "Repository 目录"

check_file "apps/server/src/ee/ee.module.ts" "企业模块"
check_file "apps/server/src/ee/api-key/index.ts" "后端模块导出"
check_file "apps/server/src/ee/api-key/api-key.module.ts" "API Key 模块"
check_file "apps/server/src/ee/api-key/api-key.service.ts" "API Key 服务"
check_file "apps/server/src/ee/api-key/api-key.controller.ts" "API Key 控制器"
check_file "apps/server/src/ee/api-key/api-key.service.spec.ts" "单元测试"
check_file "apps/server/src/ee/api-key/guards/api-key-auth.guard.ts" "认证守卫"
check_file "apps/server/src/ee/api-key/dto/create-api-key.dto.ts" "创建 DTO"
check_file "apps/server/src/ee/api-key/dto/update-api-key.dto.ts" "更新 DTO"
check_file "apps/server/src/ee/api-key/README.md" "后端文档"
check_file "apps/server/src/database/repos/api-key/api-key.repo.ts" "Repository"

echo ""
echo -e "${BLUE}检查数据库文件...${NC}"
echo "-----------------------------------"
check_dir "apps/server/src/database/migrations" "迁移目录"
check_file "apps/server/src/database/migrations/20250912T101500-api-keys.ts" "基础表迁移"
check_file "apps/server/src/database/migrations/20250913T101500-update-api-keys.ts" "扩展字段迁移"
check_file "apps/server/src/database/migrations/manual-api-keys-migration.sql" "手动迁移 SQL"

echo ""
echo -e "${BLUE}检查文档文件...${NC}"
echo "-----------------------------------"
check_file "API_KEY_README.md" "主 README"
check_file "API_KEY_INDEX.md" "文档索引"
check_file "API_MANAGEMENT_FEATURES.md" "功能说明"
check_file "API_KEY_QUICKSTART.md" "快速启动指南"
check_file "API_KEY_IMPLEMENTATION_SUMMARY.md" "实现总结"
check_file "API_KEY_CHECKLIST.md" "检查清单"
check_file "API_KEY_FILES_SUMMARY.md" "文件清单"

echo ""
echo -e "${BLUE}检查示例和脚本...${NC}"
echo "-----------------------------------"
check_dir "examples" "示例目录"
check_dir "scripts" "脚本目录"
check_file "examples/api-key-usage-examples.md" "使用示例"
check_file "scripts/setup-api-keys.sh" "设置脚本"
check_file "scripts/verify-api-keys-installation.sh" "验证脚本（本脚本）"

echo ""
echo "========================================="
echo "  验证结果"
echo "========================================="
echo ""
echo -e "总计: ${BLUE}$TOTAL${NC} 项"
echo -e "通过: ${GREEN}$PASSED${NC} 项"
echo -e "失败: ${RED}$FAILED${NC} 项"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ 所有文件检查通过！${NC}"
    echo ""
    echo "下一步:"
    echo "1. 运行设置脚本: ./scripts/setup-api-keys.sh"
    echo "2. 或查看快速启动指南: cat API_KEY_QUICKSTART.md"
    echo ""
    exit 0
else
    echo -e "${RED}✗ 有 $FAILED 个文件缺失${NC}"
    echo ""
    echo "请检查缺失的文件并重新创建"
    echo ""
    exit 1
fi
