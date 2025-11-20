#!/bin/bash

echo "======================================"
echo "验证页面副本命名修改"
echo "======================================"
echo ""

echo "1. 检查中文翻译文件中的'Duplicate'翻译..."
DUPLICATE_TRANSLATION=$(grep -A 0 '"Duplicate":' apps/client/public/locales/zh-CN/translation.json | head -1)
echo "   找到: $DUPLICATE_TRANSLATION"
if echo "$DUPLICATE_TRANSLATION" | grep -q "创建副本"; then
    echo "   ✓ 'Duplicate'已正确翻译为'创建副本'"
else
    echo "   ✗ 'Duplicate'翻译不正确"
fi
echo ""

echo "2. 检查中文翻译文件中的成功消息..."
SUCCESS_MSG=$(grep '"Page duplicated successfully":' apps/client/public/locales/zh-CN/translation.json)
echo "   找到: $SUCCESS_MSG"
if echo "$SUCCESS_MSG" | grep -q "副本创建成功"; then
    echo "   ✓ 成功消息已更新"
else
    echo "   ✗ 成功消息未正确更新"
fi
echo ""

echo "3. 检查服务器端代码中的副本命名逻辑..."
if grep -q '${originalTitle}副本' apps/server/src/core/page/services/page.service.ts; then
    echo "   ✓ 服务器端代码已更新为'标题+副本'格式"
else
    echo "   ✗ 服务器端代码未正确更新"
fi
echo ""

echo "4. 验证不再使用'Copy of'前缀..."
if grep -q 'Copy of ${originalTitle}' apps/server/src/core/page/services/page.service.ts; then
    echo "   ✗ 仍在使用'Copy of'前缀"
else
    echo "   ✓ 已移除'Copy of'前缀"
fi
echo ""

echo "======================================"
echo "验证完成！"
echo "======================================"
echo ""
echo "修改摘要："
echo "1. 菜单选项'重复' → '创建副本'"
echo "2. 副本命名'Copy of 标题' → '标题副本'"
echo ""
echo "示例："
echo "  原页面标题: '我的文档'"
echo "  副本标题: '我的文档副本'"
echo ""
