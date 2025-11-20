#!/bin/bash

echo "======================================"
echo "验证文档库图标和名称翻译"
echo "======================================"
echo ""

echo "1. 检查翻译文件..."
echo ""

echo "   检查 'Space icon':"
SPACE_ICON=$(grep '"Space icon":' apps/client/public/locales/zh-CN/translation.json)
if [ -n "$SPACE_ICON" ]; then
    echo "   $SPACE_ICON"
    if echo "$SPACE_ICON" | grep -q "文档库图标"; then
        echo "   ✓ 'Space icon' 翻译正确"
    else
        echo "   ✗ 'Space icon' 翻译不正确"
    fi
else
    echo "   ✗ 未找到 'Space icon' 翻译"
fi
echo ""

echo "   检查 'Workspace icon':"
WORKSPACE_ICON=$(grep '"Workspace icon":' apps/client/public/locales/zh-CN/translation.json)
if [ -n "$WORKSPACE_ICON" ]; then
    echo "   $WORKSPACE_ICON"
    if echo "$WORKSPACE_ICON" | grep -q "工作空间图标"; then
        echo "   ✓ 'Workspace icon' 翻译正确"
    else
        echo "   ✗ 'Workspace icon' 翻译不正确"
    fi
else
    echo "   ✗ 未找到 'Workspace icon' 翻译"
fi
echo ""

echo "   检查 'Space name':"
SPACE_NAME=$(grep '"Space name":' apps/client/public/locales/zh-CN/translation.json)
if [ -n "$SPACE_NAME" ]; then
    echo "   $SPACE_NAME"
    if echo "$SPACE_NAME" | grep -q "文档库名称"; then
        echo "   ✓ 'Space name' 已存在且翻译正确"
    else
        echo "   ⚠ 'Space name' 翻译可能需要检查"
    fi
else
    echo "   ✗ 未找到 'Space name' 翻译"
fi
echo ""

echo "2. 检查代码使用..."
echo ""

echo "   检查文档库详情组件:"
if grep -q 't("Space icon")' apps/client/src/features/space/components/space-details.tsx; then
    echo "   ✓ space-details.tsx 使用 'Space icon'"
else
    echo "   ✗ space-details.tsx 未使用 'Space icon'"
fi

if grep -q 't("Space name")' apps/client/src/features/space/components/edit-space-form.tsx; then
    echo "   ✓ edit-space-form.tsx 使用 'Space name'"
else
    echo "   ✗ edit-space-form.tsx 未使用 'Space name'"
fi
echo ""

echo "   检查工作空间图标组件:"
if grep -q 't("Workspace icon")' apps/client/src/features/workspace/components/settings/components/workspace-icon.tsx; then
    echo "   ✓ workspace-icon.tsx 使用 'Workspace icon'"
else
    echo "   ✗ workspace-icon.tsx 未使用 'Workspace icon'"
fi
echo ""

echo "======================================"
echo "验证完成！"
echo "======================================"
echo ""
echo "修改摘要："
echo "1. 文档库图标: 'Space icon' → '文档库图标'"
echo "2. 工作空间图标: 'Workspace icon' → '工作空间图标'"
echo "3. 文档库名称: 'Space name' → '文档库名称'"
echo ""
echo "使用场景："
echo "  - 文档库设置页面 (/s/{slug}/settings)"
echo "    • 图标上传区域显示 '文档库图标'"
echo "    • 名称输入框显示 '文档库名称'"
echo ""
echo "  - 工作空间设置页面 (/settings/workspace/general)"
echo "    • 图标上传区域显示 '工作空间图标'"
echo ""
