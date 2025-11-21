#!/bin/bash

echo "=========================================="
echo "验证斜杠菜单中文筛选功能"
echo "=========================================="
echo ""

# 检查修改的文件
echo "✓ 检查修改的文件..."
echo ""

echo "1. 检查 menu-items.ts 是否支持翻译筛选"
if grep -q "matchesTranslated" apps/client/src/features/editor/components/slash-menu/menu-items.ts; then
    echo "   ✓ getSuggestionItems 函数已添加翻译文本匹配逻辑"
else
    echo "   ✗ 未找到翻译文本匹配逻辑"
    exit 1
fi

if grep -q "t?: (key: string) => string" apps/client/src/features/editor/components/slash-menu/menu-items.ts; then
    echo "   ✓ 函数签名已添加翻译函数参数"
else
    echo "   ✗ 未找到翻译函数参数"
    exit 1
fi

echo ""
echo "2. 检查 slash-command.ts 是否传递翻译函数"
if grep -q "import i18n from '@/i18n'" apps/client/src/features/editor/extensions/slash-command.ts; then
    echo "   ✓ 已导入 i18n"
else
    echo "   ✗ 未导入 i18n"
    exit 1
fi

if grep -q "getSuggestionItems({ query, t: i18n.t })" apps/client/src/features/editor/extensions/slash-command.ts; then
    echo "   ✓ 已传递翻译函数到 getSuggestionItems"
else
    echo "   ✗ 未传递翻译函数"
    exit 1
fi

echo ""
echo "3. 检查中文翻译是否存在"
if grep -q '"Bullet list": "无序列表"' apps/client/public/locales/zh-CN/translation.json; then
    echo "   ✓ 找到'无序列表'翻译"
else
    echo "   ✗ 未找到'无序列表'翻译"
    exit 1
fi

if grep -q '"Numbered list": "有序列表"' apps/client/public/locales/zh-CN/translation.json; then
    echo "   ✓ 找到'有序列表'翻译"
else
    echo "   ✗ 未找到'有序列表'翻译"
    exit 1
fi

echo ""
echo "=========================================="
echo "✓ 所有检查通过！"
echo "=========================================="
echo ""
echo "修改说明："
echo "1. getSuggestionItems 函数现在接受可选的翻译函数参数"
echo "2. 筛选逻辑同时匹配英文原文和翻译后的文本"
echo "3. slash-command 扩展传递 i18n.t 函数进行翻译"
echo ""
echo "测试方法："
echo "1. 启动应用: pnpm dev"
echo "2. 切换到中文界面"
echo "3. 在编辑器中输入 '/'"
echo "4. 输入中文关键词，如'无序'、'有序'、'标题'等"
echo "5. 验证菜单项能够正确筛选显示"
echo ""
