#!/bin/bash

echo "==================================="
echo "修复附件搜索功能"
echo "==================================="
echo ""

echo "此脚本将修复附件搜索中的常见问题"
echo ""

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "✗ 未找到 .env 文件"
    echo "  请确保在项目根目录运行此脚本"
    exit 1
fi

# 获取数据库连接信息
source .env

echo "1. 检查数据库连接..."
if [ -z "$DATABASE_URL" ]; then
    echo "✗ DATABASE_URL 未设置"
    exit 1
fi
echo "✓ 数据库连接配置正常"
echo ""

echo "2. 更新附件的 tsv 字段..."
echo "正在执行 SQL 更新..."

# 使用 psql 执行更新
if command -v psql &> /dev/null; then
    psql "$DATABASE_URL" -f scripts/update-attachment-tsv.sql
    if [ $? -eq 0 ]; then
        echo "✓ 附件 tsv 字段更新成功"
    else
        echo "✗ 更新失败，请检查数据库连接"
        exit 1
    fi
else
    echo "⚠ 未找到 psql 命令"
    echo "  请手动执行 scripts/update-attachment-tsv.sql"
    echo "  或使用数据库管理工具运行该脚本"
fi
echo ""

echo "3. 验证触发器..."
if command -v psql &> /dev/null; then
    TRIGGER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'attachments_tsvector_update';")
    if [ "$TRIGGER_COUNT" -gt 0 ]; then
        echo "✓ 附件 tsvector 触发器已存在"
    else
        echo "✗ 触发器未找到，请运行迁移："
        echo "  cd apps/server && npm run migration:up"
    fi
else
    echo "⚠ 跳过触发器验证（需要 psql）"
fi
echo ""

echo "==================================="
echo "修复完成"
echo "==================================="
echo ""
echo "后续步骤："
echo "1. 重启后端服务"
echo "2. 在浏览器中测试附件搜索"
echo "3. 如果仍有问题，请查看后端日志"
echo ""
