#!/bin/bash

# 验证斜杠菜单翻译脚本

echo "======================================"
echo "验证斜杠菜单翻译"
echo "======================================"
echo ""

TRANSLATION_FILE="apps/client/public/locales/zh-CN/translation.json"

# 检查翻译文件是否存在
if [ ! -f "$TRANSLATION_FILE" ]; then
    echo "❌ 错误：翻译文件不存在: $TRANSLATION_FILE"
    exit 1
fi

echo "✓ 翻译文件存在"
echo ""

# 需要检查的翻译键
REQUIRED_KEYS=(
    "basic"
    "Text"
    "To-do list"
    "Heading 1"
    "Heading 2"
    "Heading 3"
    "Bullet list"
    "Numbered list"
    "Quote"
    "Code"
    "Divider"
    "Image"
    "Video"
    "File attachment"
    "Table"
    "Toggle block"
    "Callout"
    "Math inline"
    "Math block"
    "Mermaid diagram"
    "Excalidraw diagram"
    "Date"
    "Just start typing with plain text."
    "Track tasks with a to-do list."
    "Big section heading."
    "Medium section heading."
    "Small section heading."
    "Create a simple bullet list."
    "Create a list with numbering."
    "Create block quote."
)

echo "检查必需的翻译键..."
echo ""

MISSING_COUNT=0
FOUND_COUNT=0

for key in "${REQUIRED_KEYS[@]}"; do
    if grep -q "\"$key\":" "$TRANSLATION_FILE"; then
        echo "✓ 找到: $key"
        FOUND_COUNT=$((FOUND_COUNT + 1))
    else
        echo "✗ 缺失: $key"
        MISSING_COUNT=$((MISSING_COUNT + 1))
    fi
done

echo ""
echo "======================================"
echo "验证结果"
echo "======================================"
echo "找到的翻译: $FOUND_COUNT"
echo "缺失的翻译: $MISSING_COUNT"
echo ""

if [ $MISSING_COUNT -eq 0 ]; then
    echo "✓ 所有必需的翻译都已添加！"
    exit 0
else
    echo "✗ 有 $MISSING_COUNT 个翻译缺失"
    exit 1
fi
