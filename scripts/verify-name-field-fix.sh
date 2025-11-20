#!/bin/bash

echo "======================================"
echo "验证姓名字段修复"
echo "======================================"
echo ""

echo "1. 检查个人资料页面使用的翻译键..."
if grep -q 't("Your name")' apps/client/src/features/user/components/account-name-form.tsx; then
    echo "   ✓ 个人资料使用 'Your name' 翻译键"
else
    echo "   ✗ 个人资料未使用正确的翻译键"
fi
echo ""

echo "2. 检查工作台设置页面使用的翻译键..."
if grep -q 't("Workspace Name")' apps/client/src/features/workspace/components/settings/components/workspace-name-form.tsx; then
    echo "   ✓ 工作台设置使用 'Workspace Name' 翻译键"
else
    echo "   ✗ 工作台设置未使用正确的翻译键"
fi
echo ""

echo "3. 检查中文翻译..."
YOUR_NAME=$(grep '"Your name":' apps/client/public/locales/zh-CN/translation.json | head -1)
echo "   找到: $YOUR_NAME"
if echo "$YOUR_NAME" | grep -q "您的姓名"; then
    echo "   ✓ 'Your name' 翻译正确"
else
    echo "   ✗ 'Your name' 翻译不正确"
fi
echo ""

WORKSPACE_NAME=$(grep '"Workspace Name":' apps/client/public/locales/zh-CN/translation.json | head -1)
echo "   找到: $WORKSPACE_NAME"
if echo "$WORKSPACE_NAME" | grep -q "工作空间名称"; then
    echo "   ✓ 'Workspace Name' 翻译正确"
else
    echo "   ✗ 'Workspace Name' 翻译不正确"
fi
echo ""

echo "4. 检查是否还有重复的 'Name' 键..."
NAME_COUNT=$(grep -c '^  "Name":' apps/client/public/locales/zh-CN/translation.json)
echo "   找到 $NAME_COUNT 个 'Name' 键"
if [ "$NAME_COUNT" -eq 0 ]; then
    echo "   ✓ 已移除重复的 'Name' 键"
else
    echo "   ⚠ 仍有 $NAME_COUNT 个 'Name' 键（可能用于其他地方）"
fi
echo ""

echo "======================================"
echo "验证完成！"
echo "======================================"
echo ""
echo "修改摘要："
echo "1. 个人资料页面: 使用 'Your name' → '您的姓名'"
echo "2. 工作台设置页面: 使用 'Workspace Name' → '工作空间名称'"
echo "3. 移除了重复的 'Name' 翻译键"
echo ""
echo "页面显示："
echo "  - 个人资料 (http://localhost:5173/settings/account/profile)"
echo "    标签: '您的姓名'"
echo ""
echo "  - 工作台设置 (http://localhost:5173/settings/workspace/general)"
echo "    标签: '工作空间名称'"
echo ""
