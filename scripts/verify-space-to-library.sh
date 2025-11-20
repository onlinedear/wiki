#!/bin/bash

echo "======================================"
echo "验证'空间'改为'文档库'的翻译"
echo "======================================"
echo ""

echo "检查所有剩余的'空间'翻译..."
echo ""

# 搜索所有包含"空间"的行，排除工作空间相关的
REMAINING=$(grep -n "空间" apps/client/public/locales/zh-CN/translation.json | grep -v "工作空间" | grep -v "Workspace")

if [ -z "$REMAINING" ]; then
    echo "✓ 所有相关的'空间'都已改为'文档库'"
else
    echo "⚠ 仍有以下'空间'翻译："
    echo "$REMAINING"
fi

echo ""
echo "======================================"
echo "已修改的翻译列表："
echo "======================================"
echo ""

echo "基础概念："
echo "  ✓ Space → 文档库"
echo "  ✓ Spaces → 文档库"
echo "  ✓ Space name → 文档库名称"
echo "  ✓ Space description → 文档库描述"
echo "  ✓ Space settings → 文档库设置"
echo "  ✓ Space menu → 文档库菜单"
echo "  ✓ Space slug → 文档库短链接"
echo ""

echo "操作相关："
echo "  ✓ Create space → 创建文档库"
echo "  ✓ Delete space → 删除文档库"
echo "  ✓ Export space → 导出文档库"
echo "  ✓ View all spaces → 查看所有文档库"
echo "  ✓ Find a space → 查找文档库"
echo "  ✓ Search for spaces → 搜索文档库"
echo ""

echo "成员管理："
echo "  ✓ Add space members → 添加文档库成员"
echo "  ✓ Remove space member → 移除文档库成员"
echo "  ✓ Spaces you belong to → 您所属的文档库"
echo ""

echo "权限相关："
echo "  ✓ Can create and edit pages in space → 能够在文档库中创建和编辑文档"
echo "  ✓ Can view pages in space → 能够在文档库中读取文档"
echo "  ✓ Has full access to space settings → 能够更改全部文档库设置"
echo ""

echo "提示消息："
echo "  ✓ Space created successfully → 文档库创建成功"
echo "  ✓ Space updated successfully → 文档库更新成功"
echo "  ✓ Space deleted successfully → 文档库已成功删除"
echo "  ✓ No space found → 未找到文档库"
echo ""

echo "文档操作："
echo "  ✓ Move page to a different space → 将文档移动到不同的文档库"
echo "  ✓ Copy page to a different space → 将文档复制到不同的文档库"
echo "  ✓ Copy to space → 复制到文档库"
echo ""

echo "保留的'空间'（指工作空间）："
echo "  • Workspace → 工作空间"
echo "  • Workspace Name → 工作空间名称"
echo "  • Workspace settings → 工作区设置"
echo "  • Setup workspace → 设置工作空间"
echo "  • Join the workspace → 加入工作空间"
echo ""

echo "======================================"
echo "验证完成！"
echo "======================================"
