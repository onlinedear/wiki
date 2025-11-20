#!/bin/bash

# API 密钥列显示验证脚本
# 验证个人 API 密钥页面的列顺序是否正确

echo "======================================"
echo "API 密钥列显示验证"
echo "======================================"
echo ""

# 定义颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 计数器
PASS=0
FAIL=0

# 检查函数
check_file_content() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$file"; then
        echo -e "${GREEN}✓${NC} $description"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} $description"
        ((FAIL++))
        return 1
    fi
}

echo "1. 检查个人 API 密钥页面配置"
echo "-----------------------------------"
PERSONAL_API_KEYS="apps/client/src/pages/settings/account/api-keys.tsx"

if [ -f "$PERSONAL_API_KEYS" ]; then
    echo -e "${GREEN}✓${NC} 个人 API 密钥页面文件存在"
    ((PASS++))
    
    # 检查是否启用了 showUserColumn
    if grep -q "showUserColumn={true}" "$PERSONAL_API_KEYS"; then
        echo -e "${GREEN}✓${NC} showUserColumn 已设置为 true"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} showUserColumn 未设置为 true"
        ((FAIL++))
    fi
else
    echo -e "${RED}✗${NC} 个人 API 密钥页面文件不存在"
    ((FAIL++))
fi

echo ""
echo "2. 检查 API 密钥表格组件列顺序"
echo "-----------------------------------"
API_KEY_TABLE="apps/client/src/ee/api-key/components/api-key-table.tsx"

if [ -f "$API_KEY_TABLE" ]; then
    echo -e "${GREEN}✓${NC} API 密钥表格组件文件存在"
    ((PASS++))
    
    # 检查表头列顺序
    # 应该是：Status -> Name -> Permissions -> User -> Requests -> Last used -> Expires
    
    # 提取表头部分
    HEADER_SECTION=$(sed -n '/<Table.Thead>/,/<\/Table.Thead>/p' "$API_KEY_TABLE")
    
    # 检查 Permissions 是否在 User 之前
    PERMISSIONS_LINE=$(echo "$HEADER_SECTION" | grep -n "Permissions" | cut -d: -f1)
    USER_LINE=$(echo "$HEADER_SECTION" | grep -n "showUserColumn.*User" | cut -d: -f1)
    
    if [ -n "$PERMISSIONS_LINE" ] && [ -n "$USER_LINE" ]; then
        if [ "$PERMISSIONS_LINE" -lt "$USER_LINE" ]; then
            echo -e "${GREEN}✓${NC} 表头列顺序正确：Permissions 在 User 之前"
            ((PASS++))
        else
            echo -e "${RED}✗${NC} 表头列顺序错误：User 在 Permissions 之前"
            ((FAIL++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} 无法确定列顺序"
    fi
    
    # 检查表体部分的列顺序
    # 查找 Permissions 和 User 列的相对位置
    BODY_SECTION=$(sed -n '/Table.Tbody/,/\/Table.Tbody/p' "$API_KEY_TABLE")
    
    # 检查 scopes（权限）是否在 creator（用户）之前
    SCOPES_LINE=$(echo "$BODY_SECTION" | grep -n "apiKey.scopes" | head -1 | cut -d: -f1)
    CREATOR_LINE=$(echo "$BODY_SECTION" | grep -n "apiKey.creator" | head -1 | cut -d: -f1)
    
    if [ -n "$SCOPES_LINE" ] && [ -n "$CREATOR_LINE" ]; then
        if [ "$SCOPES_LINE" -lt "$CREATOR_LINE" ]; then
            echo -e "${GREEN}✓${NC} 表体列顺序正确：Permissions 在 User 之前"
            ((PASS++))
        else
            echo -e "${RED}✗${NC} 表体列顺序错误：User 在 Permissions 之前"
            ((FAIL++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} 无法确定表体列顺序"
    fi
else
    echo -e "${RED}✗${NC} API 密钥表格组件文件不存在"
    ((FAIL++))
fi

echo ""
echo "3. 检查工作区 API 管理页面配置"
echo "-----------------------------------"
WORKSPACE_API_KEYS="apps/client/src/ee/api-key/pages/workspace-api-keys.tsx"

if [ -f "$WORKSPACE_API_KEYS" ]; then
    echo -e "${GREEN}✓${NC} 工作区 API 管理页面文件存在"
    ((PASS++))
    
    # 检查是否启用了 showUserColumn
    if grep -q "showUserColumn" "$WORKSPACE_API_KEYS"; then
        echo -e "${GREEN}✓${NC} 工作区页面使用 showUserColumn 配置"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} 工作区页面未使用 showUserColumn 配置"
        ((FAIL++))
    fi
else
    echo -e "${RED}✗${NC} 工作区 API 管理页面文件不存在"
    ((FAIL++))
fi

echo ""
echo "4. 检查翻译文件"
echo "-----------------------------------"

# 检查中文翻译
ZH_FILE="apps/client/public/locales/zh-CN/translation.json"
if grep -q '"User":' "$ZH_FILE" && grep -q '"Permissions":' "$ZH_FILE"; then
    echo -e "${GREEN}✓${NC} 中文翻译包含 User 和 Permissions"
    ((PASS++))
else
    echo -e "${RED}✗${NC} 中文翻译缺少 User 或 Permissions"
    ((FAIL++))
fi

# 检查英文翻译
EN_FILE="apps/client/public/locales/en-US/translation.json"
if grep -q '"User":' "$EN_FILE" && grep -q '"Permissions":' "$EN_FILE"; then
    echo -e "${GREEN}✓${NC} 英文翻译包含 User 和 Permissions"
    ((PASS++))
else
    echo -e "${RED}✗${NC} 英文翻译缺少 User 或 Permissions"
    ((FAIL++))
fi

echo ""
echo "======================================"
echo "验证结果汇总"
echo "======================================"
echo -e "通过: ${GREEN}$PASS${NC}"
echo -e "失败: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ 所有检查通过！API 密钥列显示已正确配置。${NC}"
    echo ""
    echo "列顺序："
    echo "  1. 状态 (Status)"
    echo "  2. 名称 (Name)"
    echo "  3. 权限 (Permissions)"
    echo "  4. 用户 (User) - 显示 API 创建者"
    echo "  5. 请求数 (Requests)"
    echo "  6. 最后使用 (Last used)"
    echo "  7. 过期时间 (Expires)"
    echo "  8. 操作 (Actions)"
    exit 0
else
    echo -e "${RED}✗ 发现 $FAIL 个问题，请检查上述失败项。${NC}"
    exit 1
fi
