#!/bin/bash

# 图片上传/移除翻译验证脚本
# 验证所有图片上传和移除相关的文案是否已正确翻译

echo "======================================"
echo "图片上传/移除翻译验证"
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
check_translation() {
    local key=$1
    local file=$2
    local description=$3
    
    if grep -q "\"$key\":" "$file"; then
        echo -e "${GREEN}✓${NC} $description"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $description - 缺失翻译键: $key"
        ((FAIL++))
    fi
}

echo "1. 检查中文翻译文件 (zh-CN)"
echo "-----------------------------------"
ZH_FILE="apps/client/public/locales/zh-CN/translation.json"

check_translation "Upload image" "$ZH_FILE" "上传图片"
check_translation "Remove image" "$ZH_FILE" "移除图片"
check_translation "Image exceeds 10MB limit." "$ZH_FILE" "图片超过限制"
check_translation "Failed to upload image" "$ZH_FILE" "上传失败"
check_translation "Image removed successfully" "$ZH_FILE" "移除成功"
check_translation "Failed to remove image" "$ZH_FILE" "移除失败"

echo ""
echo "2. 检查英文翻译文件 (en-US)"
echo "-----------------------------------"
EN_FILE="apps/client/public/locales/en-US/translation.json"

check_translation "Upload image" "$EN_FILE" "Upload image"
check_translation "Remove image" "$EN_FILE" "Remove image"
check_translation "Image exceeds 10MB limit." "$EN_FILE" "Image exceeds limit"
check_translation "Failed to upload image" "$EN_FILE" "Upload failed"
check_translation "Image removed successfully" "$EN_FILE" "Remove success"
check_translation "Failed to remove image" "$EN_FILE" "Remove failed"

echo ""
echo "3. 检查 AvatarUploader 组件"
echo "-----------------------------------"
UPLOADER_FILE="apps/client/src/components/common/avatar-uploader.tsx"

if [ -f "$UPLOADER_FILE" ]; then
    echo -e "${GREEN}✓${NC} AvatarUploader 组件存在"
    ((PASS++))
    
    # 检查是否使用了 t() 函数进行翻译
    if grep -q 't("Upload image")' "$UPLOADER_FILE"; then
        echo -e "${GREEN}✓${NC} 使用 t() 翻译 'Upload image'"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} 未使用 t() 翻译 'Upload image'"
        ((FAIL++))
    fi
    
    if grep -q 't("Remove image")' "$UPLOADER_FILE"; then
        echo -e "${GREEN}✓${NC} 使用 t() 翻译 'Remove image'"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} 未使用 t() 翻译 'Remove image'"
        ((FAIL++))
    fi
else
    echo -e "${RED}✗${NC} AvatarUploader 组件不存在"
    ((FAIL++))
fi

echo ""
echo "4. 检查使用 AvatarUploader 的组件"
echo "-----------------------------------"

# 检查用户头像组件
ACCOUNT_AVATAR="apps/client/src/features/user/components/account-avatar.tsx"
if [ -f "$ACCOUNT_AVATAR" ] && grep -q "AvatarUploader" "$ACCOUNT_AVATAR"; then
    echo -e "${GREEN}✓${NC} 用户头像组件使用 AvatarUploader"
    ((PASS++))
else
    echo -e "${RED}✗${NC} 用户头像组件未正确使用 AvatarUploader"
    ((FAIL++))
fi

# 检查工作区图标组件
WORKSPACE_ICON="apps/client/src/features/workspace/components/settings/components/workspace-icon.tsx"
if [ -f "$WORKSPACE_ICON" ] && grep -q "AvatarUploader" "$WORKSPACE_ICON"; then
    echo -e "${GREEN}✓${NC} 工作区图标组件使用 AvatarUploader"
    ((PASS++))
else
    echo -e "${RED}✗${NC} 工作区图标组件未正确使用 AvatarUploader"
    ((FAIL++))
fi

# 检查文档库图标组件
SPACE_DETAILS="apps/client/src/features/space/components/space-details.tsx"
if [ -f "$SPACE_DETAILS" ] && grep -q "AvatarUploader" "$SPACE_DETAILS"; then
    echo -e "${GREEN}✓${NC} 文档库图标组件使用 AvatarUploader"
    ((PASS++))
else
    echo -e "${RED}✗${NC} 文档库图标组件未正确使用 AvatarUploader"
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
    echo -e "${GREEN}✓ 所有检查通过！图片上传/移除翻译已正确配置。${NC}"
    exit 0
else
    echo -e "${RED}✗ 发现 $FAIL 个问题，请检查上述失败项。${NC}"
    exit 1
fi
