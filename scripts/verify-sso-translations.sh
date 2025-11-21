#!/bin/bash

# SSO 翻译验证脚本

echo "🔍 验证 SSO 中文翻译..."
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

PASSED=0
FAILED=0

check_translation() {
    if grep -q "\"$1\":" apps/client/public/locales/zh-CN/translation.json 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1 - 翻译缺失"
        ((FAILED++))
    fi
}

echo "检查 SSO 相关翻译..."
echo ""

check_translation "Enforce SSO"
check_translation "Once enforced, members will not be able to login with email and password."
check_translation "Create SSO"
check_translation "Toggle sso enforcement"
check_translation "Display name"
check_translation "Entity ID"
check_translation "Callback URL (ACS)"
check_translation "IDP Login URL"
check_translation "IDP Certificate"
check_translation "Group sync"
check_translation "Allow signup"
check_translation "Issuer URL"
check_translation "Client ID"
check_translation "Client Secret"
check_translation "OpenID (OIDC)"
check_translation "LDAP / Active Directory"

echo ""
echo "📊 总结"
echo "=========================================="
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ 所有 SSO 翻译已完成！${NC}"
    exit 0
else
    echo -e "${RED}✗ 部分翻译缺失${NC}"
    exit 1
fi
