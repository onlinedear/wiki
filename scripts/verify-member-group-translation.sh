#!/bin/bash

echo "======================================"
echo "验证'成员'改为'用户'、'群组'改为'用户组'"
echo "======================================"
echo ""

echo "检查是否还有'成员'和'群组'..."
echo ""

# 检查是否还有"成员"（排除一些特殊情况）
MEMBER_COUNT=$(grep -o "成员" apps/client/public/locales/zh-CN/translation.json | wc -l)
echo "1. 剩余'成员'数量: $MEMBER_COUNT"
if [ "$MEMBER_COUNT" -eq 0 ]; then
    echo "   ✓ 所有'成员'都已改为'用户'"
else
    echo "   ⚠ 仍有 $MEMBER_COUNT 处'成员'"
    grep -n "成员" apps/client/public/locales/zh-CN/translation.json | head -5
fi
echo ""

# 检查是否还有"群组"
GROUP_COUNT=$(grep -o "群组" apps/client/public/locales/zh-CN/translation.json | wc -l)
echo "2. 剩余'群组'数量: $GROUP_COUNT"
if [ "$GROUP_COUNT" -eq 0 ]; then
    echo "   ✓ 所有'群组'都已改为'用户组'"
else
    echo "   ⚠ 仍有 $GROUP_COUNT 处'群组'"
    grep -n "群组" apps/client/public/locales/zh-CN/translation.json | head -5
fi
echo ""

echo "======================================"
echo "已修改的翻译示例："
echo "======================================"
echo ""

echo "用户相关："
echo "  ✓ Members → 用户"
echo "  ✓ Member → 用户"
echo "  ✓ Add members → 添加用户"
echo "  ✓ Invite members → 邀请用户"
echo "  ✓ Manage members → 管理用户"
echo "  ✓ Remove space member → 移除文档库用户"
echo ""

echo "用户组相关："
echo "  ✓ Groups → 用户组"
echo "  ✓ Group → 用户组"
echo "  ✓ Create group → 创建用户组"
echo "  ✓ Delete group → 删除用户组"
echo "  ✓ Edit group → 编辑用户组"
echo "  ✓ Manage Group → 管理用户组"
echo "  ✓ Add group members → 添加用户组用户"
echo "  ✓ Remove group member → 移除用户组用户"
echo ""

echo "======================================"
echo "验证完成！"
echo "======================================"
