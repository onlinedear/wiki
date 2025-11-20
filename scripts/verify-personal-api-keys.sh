#!/bin/bash

# 个人 API 密钥功能验证脚本

echo "=========================================="
echo "个人 API 密钥功能验证"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
PASS=0
FAIL=0

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} 文件存在: $1"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} 文件缺失: $1"
        ((FAIL++))
        return 1
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} 内容验证通过: $3"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} 内容验证失败: $3"
        ((FAIL++))
        return 1
    fi
}

echo "1. 检查前端文件"
echo "----------------------------------------"
check_file "apps/client/src/pages/settings/account/api-keys.tsx"
check_file "apps/client/src/ee/api-key/queries/api-key-query.ts"
check_file "apps/client/src/ee/api-key/services/api-key-service.ts"
echo ""

echo "2. 检查后端文件"
echo "----------------------------------------"
check_file "apps/server/src/ee/api-key/api-key.controller.ts"
check_file "apps/server/src/ee/api-key/api-key.service.ts"
check_file "apps/server/src/database/repos/api-key/api-key.repo.ts"
echo ""

echo "3. 检查前端实现"
echo "----------------------------------------"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "AccountApiKeys" "页面组件定义"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "useGetUserApiKeysQuery" "使用用户 API 密钥查询"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "Personal API Keys" "页面标题"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "About Personal API Keys" "个人密钥说明"
check_content "apps/client/src/ee/api-key/queries/api-key-query.ts" "useGetUserApiKeysQuery" "用户密钥查询 Hook"
check_content "apps/client/src/ee/api-key/queries/api-key-query.ts" "getUserApiKeys" "导入用户密钥服务"
check_content "apps/client/src/ee/api-key/services/api-key-service.ts" "getUserApiKeys" "用户密钥服务方法"
check_content "apps/client/src/ee/api-key/services/api-key-service.ts" "/api-keys/user" "用户密钥 API 端点"
echo ""

echo "4. 检查后端实现"
echo "----------------------------------------"
check_content "apps/server/src/ee/api-key/api-key.controller.ts" "@Get('user')" "用户密钥路由"
check_content "apps/server/src/ee/api-key/api-key.controller.ts" "findUserApiKeys" "用户密钥控制器方法"
check_content "apps/server/src/ee/api-key/api-key.service.ts" "findByUser" "用户密钥服务方法"
check_content "apps/server/src/database/repos/api-key/api-key.repo.ts" "findByCreatorId" "按创建者查询方法"
echo ""

echo "5. 检查路由配置"
echo "----------------------------------------"
check_content "apps/client/src/App.tsx" "account/api-keys" "账户 API 密钥路由"
check_content "apps/client/src/App.tsx" "AccountApiKeys" "导入账户 API 密钥组件"
echo ""

echo "6. 检查语言包"
echo "----------------------------------------"
check_content "apps/client/public/locales/zh-CN/translation.json" "Personal API Keys" "个人 API 密钥翻译"
check_content "apps/client/public/locales/zh-CN/translation.json" "Manage your personal API keys for programmatic access" "个人密钥描述翻译"
check_content "apps/client/public/locales/zh-CN/translation.json" "About Personal API Keys" "关于个人密钥翻译"
check_content "apps/client/public/locales/zh-CN/translation.json" "Personal API keys allow you to access the API with your own permissions" "个人密钥说明翻译"
echo ""

echo "7. 检查组件复用"
echo "----------------------------------------"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "ApiKeyTable" "复用密钥表格组件"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "CreateApiKeyModal" "复用创建密钥弹窗"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "ApiKeyCreatedModal" "复用密钥创建成功弹窗"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "UpdateApiKeyModal" "复用更新密钥弹窗"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "RevokeApiKeyModal" "复用撤销密钥弹窗"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "ApiKeyDetailsDrawer" "复用密钥详情抽屉"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "showUserColumn={false}" "隐藏用户列"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "userMode" "用户模式参数"
echo ""

echo "8. 检查安全特性"
echo "----------------------------------------"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "Security Best Practices" "安全最佳实践提示"
check_content "apps/client/src/pages/settings/account/api-keys.tsx" "IconShieldCheck" "安全图标"
echo ""

echo "9. 检查侧边栏菜单"
echo "----------------------------------------"
check_content "apps/client/src/components/settings/settings-sidebar.tsx" "API keys" "侧边栏 API 密钥菜单项"
check_content "apps/client/src/components/settings/settings-sidebar.tsx" "/settings/account/api-keys" "API 密钥路由路径"
check_content "apps/client/src/components/settings/settings-queries.tsx" "prefetchApiKeys" "API 密钥预加载函数"
check_content "apps/client/src/components/settings/settings-queries.tsx" "getUserApiKeys" "用户 API 密钥预加载"
check_content "apps/client/public/locales/zh-CN/translation.json" "\"API keys\": \"API 密钥\"" "API keys 菜单翻译"
echo ""

echo "=========================================="
echo "验证结果汇总"
echo "=========================================="
echo -e "${GREEN}通过: $PASS${NC}"
echo -e "${RED}失败: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ 所有检查通过！个人 API 密钥功能已正确实现。${NC}"
    echo ""
    echo "后续步骤："
    echo "1. 启动开发服务器: pnpm dev"
    echo "2. 访问页面: http://localhost:5173/settings/account/api-keys"
    echo "3. 测试创建、查看、更新、撤销 API 密钥功能"
    echo "4. 验证权限隔离（用户只能看到自己的密钥）"
    echo "5. 测试搜索和筛选功能"
    echo ""
    exit 0
else
    echo -e "${RED}✗ 发现 $FAIL 个问题，请检查并修复。${NC}"
    echo ""
    exit 1
fi
