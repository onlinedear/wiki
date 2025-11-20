#!/bin/bash

echo "🔍 验证评论功能增强安装"
echo "========================"
echo ""

ERRORS=0
WARNINGS=0

# 检查文档文件
echo "📚 检查文档文件..."
DOCS=(
    "COMMENT_ENHANCEMENTS_README.md"
    "COMMENT_ENHANCEMENTS_QUICKSTART.md"
    "COMMENT_ENHANCEMENTS_TEST_CHECKLIST.md"
    "COMMENT_ENHANCEMENTS_SUMMARY.md"
    "COMMENT_ENHANCEMENTS_INDEX.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "  ✅ $doc"
    else
        echo "  ❌ $doc (缺失)"
        ((ERRORS++))
    fi
done

# 检查脚本文件
echo ""
echo "🔧 检查脚本文件..."
SCRIPTS=(
    "scripts/run-comment-enhancements-migration.sh"
    "scripts/test-comment-enhancements.sh"
    "scripts/demo-comment-enhancements.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo "  ✅ $script (可执行)"
        else
            echo "  ⚠️  $script (不可执行)"
            ((WARNINGS++))
        fi
    else
        echo "  ❌ $script (缺失)"
        ((ERRORS++))
    fi
done

# 检查后端文件
echo ""
echo "🔙 检查后端文件..."
BACKEND_FILES=(
    "apps/server/src/database/migrations/20251118T100000-enhance-comments.ts"
    "apps/server/src/database/repos/comment/comment-reaction.repo.ts"
    "apps/server/src/database/repos/comment/comment-mention.repo.ts"
    "apps/server/src/database/repos/comment/comment-notification.repo.ts"
    "apps/server/src/core/comment/dto/search-comment.dto.ts"
    "apps/server/src/core/comment/dto/reaction.dto.ts"
    "apps/server/src/core/comment/dto/notification.dto.ts"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (缺失)"
        ((ERRORS++))
    fi
done

# 检查前端文件
echo ""
echo "🎨 检查前端文件..."
FRONTEND_FILES=(
    "apps/client/src/features/comment/components/comment-search.tsx"
    "apps/client/src/features/comment/components/comment-reactions.tsx"
    "apps/client/src/features/comment/components/comment-notifications.tsx"
)

for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (缺失)"
        ((ERRORS++))
    fi
done

# 总结
echo ""
echo "========================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ 所有文件验证通过！"
    echo ""
    echo "下一步："
    echo "  1. 运行迁移: ./scripts/run-comment-enhancements-migration.sh"
    echo "  2. 重启服务器"
    echo "  3. 执行测试: ./scripts/test-comment-enhancements.sh"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  验证完成，有 $WARNINGS 个警告"
    echo ""
    echo "建议："
    echo "  运行: chmod +x scripts/*.sh"
    exit 0
else
    echo "❌ 验证失败！"
    echo "  错误: $ERRORS"
    echo "  警告: $WARNINGS"
    exit 1
fi
