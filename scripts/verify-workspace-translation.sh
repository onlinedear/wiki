#!/bin/bash

echo "======================================"
echo "验证工作空间翻译"
echo "======================================"
echo ""

echo "检查翻译..."
echo ""

echo "1. Workspace icon:"
WORKSPACE_ICON=$(grep '"Workspace icon":' apps/client/public/locales/zh-CN/translation.json)
echo "   $WORKSPACE_ICON"
if echo "$WORKSPACE_ICON" | grep -q "站点图标"; then
    echo "   ✓ 'Workspace icon' → '站点图标'"
else
    echo "   ✗ 'Workspace icon' 翻译不正确"
fi
echo ""

echo "2. Workspace Name:"
WORKSPACE_NAME=$(grep '"Workspace Name":' apps/client/public/locales/zh-CN/translation.json)
echo "   $WORKSPACE_NAME"
if echo "$WORKSPACE_NAME" | grep -q "站点名称"; then
    echo "   ✓ 'Workspace Name' → '站点名称'"
else
    echo "   ✗ 'Workspace Name' 翻译不正确"
fi
echo ""

echo "3. Space icon:"
SPACE_ICON=$(grep '"Space icon":' apps/client/public/locales/zh-CN/translation.json)
echo "   $SPACE_ICON"
if echo "$SPACE_ICON" | grep -q "文档库图标"; then
    echo "   ✓ 'Space icon' → '文档库图标'"
else
    echo "   ✗ 'Space icon' 翻译不正确"
fi
echo ""

echo "4. Space name:"
SPACE_NAME=$(grep '"Space name":' apps/client/public/locales/zh-CN/translation.json)
echo "   $SPACE_NAME"
if echo "$SPACE_NAME" | grep -q "文档库名称"; then
    echo "   ✓ 'Space name' → '文档库名称'"
else
    echo "   ✗ 'Space name' 翻译不正确"
fi
echo ""

echo "======================================"
echo "验证完成！"
echo "======================================"
echo ""
echo "翻译对照表："
echo ""
echo "工作空间设置 (/settings/workspace/general):"
echo "  • 图标: '站点图标'"
echo "  • 名称: '站点名称'"
echo ""
echo "文档库设置 (/s/{slug}/settings):"
echo "  • 图标: '文档库图标'"
echo "  • 名称: '文档库名称'"
echo ""
echo "术语层级："
echo "  站点 (Workspace)"
echo "    └── 文档库 (Space)"
echo "        └── 文档 (Document)"
echo "            └── 子文档 (Subpage)"
echo ""
