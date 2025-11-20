#!/bin/bash

echo "======================================"
echo "验证完整的'页面'改为'文档'翻译"
echo "======================================"
echo ""

echo "检查所有剩余的'页面'翻译..."
echo ""

# 搜索所有包含"页面"的行，排除404页面相关的
REMAINING=$(grep -n "页面" apps/client/public/locales/zh-CN/translation.json | grep -v "404" | grep -v "Sorry, we can't find")

if [ -z "$REMAINING" ]; then
    echo "✓ 所有相关的'页面'都已改为'文档'"
else
    echo "⚠ 仍有以下'页面'翻译："
    echo "$REMAINING"
fi

echo ""
echo "======================================"
echo "已修改的翻译列表："
echo "======================================"
echo ""

echo "基础操作："
echo "  ✓ Pages → 文档"
echo "  ✓ New page → 新建文档"
echo "  ✓ Create page → 创建文档"
echo "  ✓ page/pages → 个文档"
echo ""

echo "文档操作："
echo "  ✓ Page history → 文档历史"
echo "  ✓ Page width → 文档宽度"
echo "  ✓ Export page → 导出文档"
echo "  ✓ Import pages → 导入文档"
echo "  ✓ Move page → 移动文档"
echo "  ✓ Copy page → 复制文档"
echo "  ✓ Delete page → 删除文档"
echo "  ✓ Restore page → 恢复文档"
echo ""

echo "状态和提示："
echo "  ✓ No pages yet → 暂无文档"
echo "  ✓ Page deleted successfully → 文档已成功删除"
echo "  ✓ Page moved to trash → 文档已移至垃圾箱"
echo "  ✓ Page restored successfully → 文档恢复成功"
echo "  ✓ Page copied successfully → 文档复制成功"
echo ""

echo "子文档相关："
echo "  ✓ Subpages → 子文档"
echo "  ✓ Include subpages → 包括子文档"
echo "  ✓ Include sub-pages → 包括子文档"
echo "  ✓ No subpages → 没有子文档"
echo ""

echo "错误提示："
echo "  ✓ Failed to create page → 创建文档失败"
echo "  ✓ Failed to delete page → 删除文档失败"
echo "  ✓ Failed to load page → 文档加载失败"
echo "  ✓ Failed to import pages → 导入文档失败"
echo ""

echo "权限和设置："
echo "  ✓ Can create and edit pages → 能够在空间中创建和编辑文档"
echo "  ✓ Can view pages → 能够在空间中读取文档"
echo "  ✓ Default page edit mode → 默认文档编辑模式"
echo ""

echo "保留的'页面'（指网页）："
echo "  • 404 page not found → 404 页面未找到"
echo "  • Sorry, we can't find the page → 抱歉，我们无法找到你所需要的页面"
echo ""

echo "======================================"
echo "验证完成！"
echo "======================================"
