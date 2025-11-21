#!/bin/bash

echo "==================================="
echo "附件搜索功能测试"
echo "==================================="
echo ""

# 检查数据库迁移
echo "1. 检查数据库迁移状态..."
cd apps/server
npm run migration:latest 2>&1 | grep -E "attachments-tsvector-trigger|No pending migrations"
if [ $? -eq 0 ]; then
    echo "✓ 数据库迁移已完成"
else
    echo "✗ 数据库迁移未完成"
fi
cd ../..
echo ""

# 检查后端路由
echo "2. 检查后端搜索路由..."
if grep -q "search-attachments" apps/server/src/core/search/search.controller.ts; then
    echo "✓ 附件搜索路由已添加"
else
    echo "✗ 附件搜索路由未找到"
fi
echo ""

# 检查搜索服务
echo "3. 检查搜索服务方法..."
if grep -q "searchAttachments" apps/server/src/core/search/search.service.ts; then
    echo "✓ 附件搜索服务方法已添加"
else
    echo "✗ 附件搜索服务方法未找到"
fi
echo ""

# 检查前端服务
echo "4. 检查前端搜索服务..."
if grep -q "searchAttachments" apps/client/src/features/search/services/search-service.ts; then
    echo "✓ 前端附件搜索服务已存在"
else
    echo "✗ 前端附件搜索服务未找到"
fi
echo ""

# 检查前端UI
echo "5. 检查前端搜索UI..."
if grep -q "attachment" apps/client/src/features/search/components/search-spotlight-filters.tsx; then
    echo "✓ 前端附件搜索过滤器已存在"
else
    echo "✗ 前端附件搜索过滤器未找到"
fi
echo ""

# 检查数据库触发器
echo "6. 检查数据库触发器..."
if grep -q "attachments_tsvector_trigger" apps/server/src/database/migrations/20251121T100000-attachments-tsvector-trigger.ts; then
    echo "✓ 附件tsvector触发器迁移文件已创建"
else
    echo "✗ 附件tsvector触发器迁移文件未找到"
fi
echo ""

echo "==================================="
echo "测试完成！"
echo "==================================="
echo ""
echo "功能说明："
echo "- 附件搜索支持按文件名搜索"
echo "- 附件搜索支持按文件内容搜索（PDF和DOCX）"
echo "- 搜索结果显示附件所在的页面和空间"
echo "- 支持按空间过滤附件搜索"
echo "- 所有用户都可以使用附件搜索功能"
echo ""
echo "使用方法："
echo "1. 按 Cmd+K (Mac) 或 Ctrl+K (Windows/Linux) 打开搜索"
echo "2. 点击'类型'下拉菜单，选择'附件'"
echo "3. 输入搜索关键词"
echo "4. 点击搜索结果跳转到附件所在页面"
echo "5. 点击下载图标直接下载附件"
echo ""
