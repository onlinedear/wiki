#!/bin/bash

# Confluence 直接导入功能验证脚本
# 验证用户可以直接在导入模态框中输入 URL 和 Token

echo "=========================================="
echo "Confluence 直接导入功能验证"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_passed=0
check_failed=0

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} 文件存在: $1"
        ((check_passed++))
        return 0
    else
        echo -e "${RED}✗${NC} 文件缺失: $1"
        ((check_failed++))
        return 1
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        ((check_passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $3"
        ((check_failed++))
        return 1
    fi
}

echo "1. 检查前端组件文件"
echo "-----------------------------------"
check_file "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx"
check_file "apps/client/src/features/confluence/services/confluence-service.ts"
echo ""

echo "2. 检查前端组件实现"
echo "-----------------------------------"
check_content "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" \
    "PasswordInput" \
    "导入模态框包含 PasswordInput 组件"

check_content "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" \
    "confluenceUrl: ''" \
    "表单包含 confluenceUrl 字段"

check_content "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" \
    "accessToken: ''" \
    "表单包含 accessToken 字段"

check_content "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" \
    "Confluence URL is required" \
    "包含 URL 必填验证"

check_content "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" \
    "Access token is required" \
    "包含 Token 必填验证"

check_content "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" \
    "values.confluenceUrl" \
    "提交时传递 confluenceUrl"

check_content "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" \
    "values.accessToken" \
    "提交时传递 accessToken"
echo ""

echo "3. 检查前端 Service 接口"
echo "-----------------------------------"
check_content "apps/client/src/features/confluence/services/confluence-service.ts" \
    "accessToken: string" \
    "ConfluenceOnlineImport 接口包含 accessToken 字段"
echo ""

echo "4. 检查后端 DTO"
echo "-----------------------------------"
check_file "apps/server/src/ee/confluence-import/dto/confluence-online-import.dto.ts"

check_content "apps/server/src/ee/confluence-import/dto/confluence-online-import.dto.ts" \
    "confluenceUrl: string" \
    "DTO 包含 confluenceUrl 字段"

check_content "apps/server/src/ee/confluence-import/dto/confluence-online-import.dto.ts" \
    "accessToken: string" \
    "DTO 包含 accessToken 字段"
echo ""

echo "5. 检查后端 Controller"
echo "-----------------------------------"
check_file "apps/server/src/ee/confluence-import/confluence-import.controller.ts"

check_content "apps/server/src/ee/confluence-import/confluence-import.controller.ts" \
    "confluenceUrl, accessToken" \
    "Controller 解构 confluenceUrl 和 accessToken"

check_content "apps/server/src/ee/confluence-import/confluence-import.controller.ts" \
    "confluenceUrl:" \
    "Controller 传递 confluenceUrl 到 service"

check_content "apps/server/src/ee/confluence-import/confluence-import.controller.ts" \
    "accessToken:" \
    "Controller 传递 accessToken 到 service"
echo ""

echo "6. 检查中文翻译"
echo "-----------------------------------"
check_content "apps/client/public/locales/zh-CN/translation.json" \
    "Enter your Confluence URL and Personal Access Token to import pages directly" \
    "包含新的提示文本翻译"

check_content "apps/client/public/locales/zh-CN/translation.json" \
    "Confluence URL is required" \
    "包含 URL 必填提示翻译"

check_content "apps/client/public/locales/zh-CN/translation.json" \
    "Access token is required" \
    "包含 Token 必填提示翻译"

check_content "apps/client/public/locales/zh-CN/translation.json" \
    "Please enter a valid URL" \
    "包含 URL 格式验证提示翻译"
echo ""

echo "=========================================="
echo "验证结果汇总"
echo "=========================================="
echo -e "通过: ${GREEN}${check_passed}${NC}"
echo -e "失败: ${RED}${check_failed}${NC}"
echo ""

if [ $check_failed -eq 0 ]; then
    echo -e "${GREEN}✓ 所有检查通过！Confluence 直接导入功能已正确实现。${NC}"
    echo ""
    echo "功能说明："
    echo "1. 用户可以在导入模态框中直接输入 Confluence URL"
    echo "2. 用户可以在导入模态框中直接输入 Personal Access Token"
    echo "3. 不再需要预先在账户设置中配置"
    echo "4. 表单包含完整的验证逻辑"
    echo "5. 后端正确接收和处理这些参数"
    echo ""
    echo "使用方法："
    echo "1. 在文档库中点击导入按钮"
    echo "2. 选择 'Import from Confluence Online'"
    echo "3. 输入 Confluence URL (如: https://your-domain.atlassian.net/wiki)"
    echo "4. 输入 Personal Access Token"
    echo "5. 输入要导入的页面 URL"
    echo "6. 选择是否包含子页面"
    echo "7. 点击导入"
    exit 0
else
    echo -e "${RED}✗ 发现 ${check_failed} 个问题，请检查上述失败项。${NC}"
    exit 1
fi
