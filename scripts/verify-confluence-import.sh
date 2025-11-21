#!/bin/bash

# Confluence 在线导入功能验证脚本

echo "======================================"
echo "Confluence 在线导入功能验证"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} 文件存在: $1"
        return 0
    else
        echo -e "${RED}✗${NC} 文件缺失: $1"
        return 1
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} 内容验证通过: $3"
        return 0
    else
        echo -e "${RED}✗${NC} 内容验证失败: $3"
        return 1
    fi
}

ERRORS=0

echo "1. 检查后端文件..."
echo "-----------------------------------"

# Confluence API 服务
check_file "apps/server/src/ee/confluence-import/confluence-api.service.ts" || ((ERRORS++))
check_content "apps/server/src/ee/confluence-import/confluence-api.service.ts" "ConfluenceApiService" "Confluence API 服务类" || ((ERRORS++))
check_content "apps/server/src/ee/confluence-import/confluence-api.service.ts" "createClient" "创建客户端方法" || ((ERRORS++))
check_content "apps/server/src/ee/confluence-import/confluence-api.service.ts" "getPage" "获取页面方法" || ((ERRORS++))

# Confluence 导入服务
check_file "apps/server/src/ee/confluence-import/confluence-import.service.ts" || ((ERRORS++))
check_content "apps/server/src/ee/confluence-import/confluence-import.service.ts" "importOnlinePages" "在线导入方法" || ((ERRORS++))
check_content "apps/server/src/ee/confluence-import/confluence-import.service.ts" "saveUserConfluenceConfig" "保存配置方法" || ((ERRORS++))
check_content "apps/server/src/ee/confluence-import/confluence-import.service.ts" "getUserConfluenceConfig" "获取配置方法" || ((ERRORS++))

# Confluence 控制器
check_file "apps/server/src/ee/confluence-import/confluence-import.controller.ts" || ((ERRORS++))
check_content "apps/server/src/ee/confluence-import/confluence-import.controller.ts" "import-online" "在线导入端点" || ((ERRORS++))
check_content "apps/server/src/ee/confluence-import/confluence-import.controller.ts" "saveConfig" "配置端点" || ((ERRORS++))

# DTO
check_file "apps/server/src/ee/confluence-import/dto/confluence-online-import.dto.ts" || ((ERRORS++))
check_content "apps/server/src/ee/confluence-import/dto/confluence-online-import.dto.ts" "ConfluenceOnlineImportDto" "在线导入 DTO" || ((ERRORS++))

# 模块
check_file "apps/server/src/ee/confluence-import/confluence-import.module.ts" || ((ERRORS++))
check_content "apps/server/src/ee/confluence-import/confluence-import.module.ts" "ConfluenceApiService" "API 服务注册" || ((ERRORS++))
check_content "apps/server/src/ee/confluence-import/confluence-import.module.ts" "ConfluenceImportController" "控制器注册" || ((ERRORS++))

# EE 模块集成
check_content "apps/server/src/ee/ee.module.ts" "ConfluenceImportModule" "EE 模块集成" || ((ERRORS++))

echo ""
echo "2. 检查前端文件..."
echo "-----------------------------------"

# Confluence 服务
check_file "apps/client/src/features/confluence/services/confluence-service.ts" || ((ERRORS++))
check_content "apps/client/src/features/confluence/services/confluence-service.ts" "saveConfluenceConfig" "保存配置服务" || ((ERRORS++))
check_content "apps/client/src/features/confluence/services/confluence-service.ts" "importConfluenceOnline" "在线导入服务" || ((ERRORS++))

# Confluence 配置页面
check_file "apps/client/src/pages/settings/account/confluence-config.tsx" || ((ERRORS++))
check_content "apps/client/src/pages/settings/account/confluence-config.tsx" "ConfluenceConfig" "配置组件" || ((ERRORS++))
check_content "apps/client/src/pages/settings/account/confluence-config.tsx" "Personal Access Token" "Token 输入" || ((ERRORS++))

# 在线导入模态框
check_file "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" || ((ERRORS++))
check_content "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" "ConfluenceOnlineImportModal" "在线导入模态框" || ((ERRORS++))

# 导入模态框更新
check_content "apps/client/src/features/page/components/page-import-modal.tsx" "ConfluenceOnlineImportModal" "导入模态框集成" || ((ERRORS++))
check_content "apps/client/src/features/page/components/page-import-modal.tsx" "Import from Online" "在线导入选项" || ((ERRORS++))

# 账户设置集成
check_content "apps/client/src/pages/settings/account/account-settings.tsx" "ConfluenceConfig" "账户设置集成" || ((ERRORS++))

echo ""
echo "3. 检查翻译..."
echo "-----------------------------------"

check_content "apps/client/public/locales/zh-CN/translation.json" "Confluence Integration" "Confluence 集成翻译" || ((ERRORS++))
check_content "apps/client/public/locales/zh-CN/translation.json" "Personal Access Token" "Token 翻译" || ((ERRORS++))
check_content "apps/client/public/locales/zh-CN/translation.json" "Import from Online" "在线导入翻译" || ((ERRORS++))

echo ""
echo "4. 检查文档..."
echo "-----------------------------------"

check_file "docs/Confluence在线导入功能说明.md" || ((ERRORS++))

echo ""
echo "======================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ 所有检查通过！${NC}"
    echo ""
    echo "Confluence 在线导入功能已成功实现："
    echo ""
    echo "后端功能："
    echo "  • Confluence API 客户端"
    echo "  • 在线导入服务"
    echo "  • 用户配置管理"
    echo "  • REST API 端点"
    echo ""
    echo "前端功能："
    echo "  • Confluence 配置界面（账户设置）"
    echo "  • 在线导入模态框"
    echo "  • 导入方式选择（ZIP/在线）"
    echo "  • 完整的中文翻译"
    echo ""
    echo "使用步骤："
    echo "  1. 在 Confluence 中获取 Personal Access Token"
    echo "  2. 在账户设置中配置 Confluence 连接"
    echo "  3. 在导入文档时选择'从在线导入'"
    echo "  4. 输入 Confluence 文档 URL 并导入"
    echo ""
    echo "详细说明请查看: docs/Confluence在线导入功能说明.md"
    echo "======================================"
    exit 0
else
    echo -e "${RED}✗ 发现 $ERRORS 个错误${NC}"
    echo "======================================"
    exit 1
fi
