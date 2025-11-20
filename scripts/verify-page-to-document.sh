#!/bin/bash

echo "======================================"
echo "验证'页面'改为'文档'的翻译"
echo "======================================"
echo ""

echo "1. 检查关键翻译..."
echo ""

echo "   检查 'Pages' (左侧菜单标题):"
PAGES=$(grep '"Pages":' apps/client/public/locales/zh-CN/translation.json | head -1)
echo "   $PAGES"
if echo "$PAGES" | grep -q '"文档"'; then
    echo "   ✓ 'Pages' 已改为 '文档'"
else
    echo "   ✗ 'Pages' 未正确修改"
fi
echo ""

echo "   检查 'New page' (新建按钮):"
NEW_PAGE=$(grep '"New page":' apps/client/public/locales/zh-CN/translation.json)
echo "   $NEW_PAGE"
if echo "$NEW_PAGE" | grep -q '"新建文档"'; then
    echo "   ✓ 'New page' 已改为 '新建文档'"
else
    echo "   ✗ 'New page' 未正确修改"
fi
echo ""

echo "   检查 'Create page':"
CREATE_PAGE=$(grep '"Create page":' apps/client/public/locales/zh-CN/translation.json)
echo "   $CREATE_PAGE"
if echo "$CREATE_PAGE" | grep -q '"创建文档"'; then
    echo "   ✓ 'Create page' 已改为 '创建文档'"
else
    echo "   ✗ 'Create page' 未正确修改"
fi
echo ""

echo "   检查 'No pages yet':"
NO_PAGES=$(grep '"No pages yet":' apps/client/public/locales/zh-CN/translation.json)
echo "   $NO_PAGES"
if echo "$NO_PAGES" | grep -q '"暂无文档"'; then
    echo "   ✓ 'No pages yet' 已改为 '暂无文档'"
else
    echo "   ✗ 'No pages yet' 未正确修改"
fi
echo ""

echo "   检查 'pages' (复数形式):"
PAGES_LOWER=$(grep '"pages":' apps/client/public/locales/zh-CN/translation.json | head -1)
echo "   $PAGES_LOWER"
if echo "$PAGES_LOWER" | grep -q '"个文档"'; then
    echo "   ✓ 'pages' 已改为 '个文档'"
else
    echo "   ✗ 'pages' 未正确修改"
fi
echo ""

echo "   检查 'page' (单数形式):"
PAGE_SINGLE=$(grep '"page":' apps/client/public/locales/zh-CN/translation.json | head -1)
echo "   $PAGE_SINGLE"
if echo "$PAGE_SINGLE" | grep -q '"个文档"'; then
    echo "   ✓ 'page' 已改为 '个文档'"
else
    echo "   ✗ 'page' 未正确修改"
fi
echo ""

echo "======================================"
echo "验证完成！"
echo "======================================"
echo ""
echo "修改摘要："
echo "1. 左侧菜单标题: 'Pages' → '文档'"
echo "2. 新建按钮: 'New page' → '新建文档'"
echo "3. 创建操作: 'Create page' → '创建文档'"
echo "4. 空状态提示: 'No pages yet' → '暂无文档'"
echo "5. 计数单位: 'page/pages' → '个文档'"
echo ""
echo "注意："
echo "- 保留了'页面历史'、'页面宽度'等UI相关的'页面'翻译"
echo "- 只修改了指代文档内容的'页面'为'文档'"
echo ""
