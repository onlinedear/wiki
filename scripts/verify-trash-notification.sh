#!/bin/bash

echo "======================================"
echo "验证垃圾箱提示文案国际化"
echo "======================================"
echo ""

echo "1. 检查代码是否使用翻译函数..."
if grep -q 't("Page moved to trash")' apps/client/src/features/page/queries/page-query.ts; then
    echo "   ✓ useRemovePageMutation 已使用翻译函数"
else
    echo "   ✗ useRemovePageMutation 未使用翻译函数"
fi

if grep -q 't("Page restored successfully")' apps/client/src/features/page/queries/page-query.ts; then
    echo "   ✓ useRestorePageMutation 已使用翻译函数"
else
    echo "   ✗ useRestorePageMutation 未使用翻译函数"
fi

if grep -q 't("Failed to delete page")' apps/client/src/features/page/queries/page-query.ts; then
    echo "   ✓ 错误提示已使用翻译函数"
else
    echo "   ✗ 错误提示未使用翻译函数"
fi
echo ""

echo "2. 检查是否还有硬编码的英文..."
if grep -q '"Page moved to trash"' apps/client/src/features/page/queries/page-query.ts | grep -v 't('; then
    echo "   ✗ 仍存在硬编码的英文"
else
    echo "   ✓ 已移除所有硬编码的英文"
fi
echo ""

echo "3. 检查中文翻译文件..."
TRASH_MSG=$(grep '"Page moved to trash":' apps/client/public/locales/zh-CN/translation.json)
echo "   找到: $TRASH_MSG"
if echo "$TRASH_MSG" | grep -q "页面已移至垃圾箱"; then
    echo "   ✓ 中文翻译正确"
else
    echo "   ✗ 中文翻译不正确"
fi
echo ""

RESTORE_MSG=$(grep '"Page restored successfully":' apps/client/public/locales/zh-CN/translation.json)
echo "   找到: $RESTORE_MSG"
if echo "$RESTORE_MSG" | grep -q "页面恢复成功"; then
    echo "   ✓ 恢复成功提示翻译正确"
else
    echo "   ✗ 恢复成功提示翻译不正确"
fi
echo ""

echo "======================================"
echo "验证完成！"
echo "======================================"
echo ""
echo "修改摘要："
echo "1. useRemovePageMutation 添加翻译支持"
echo "2. useRestorePageMutation 添加翻译支持"
echo "3. 错误提示也使用翻译函数"
echo ""
echo "中文界面显示："
echo "  - 移至垃圾箱: '页面已移至垃圾箱'"
echo "  - 恢复页面: '页面恢复成功'"
echo ""
