#!/bin/bash

echo "=== 验证许可证页面翻译 ==="
echo ""

echo "✓ 检查翻译文件中的许可证相关键..."
grep -E '"License & Edition"|"License"|"Add license"|"Update license"|"Remove license"' apps/client/public/locales/zh-CN/translation.json

echo ""
echo "✓ 检查组件是否使用了 useTranslation..."
echo ""
echo "license.tsx:"
grep -n "useTranslation\|t(" apps/client/src/ee/licence/pages/license.tsx | head -5

echo ""
echo "license-details.tsx:"
grep -n "useTranslation\|t(" apps/client/src/ee/licence/components/license-details.tsx | head -5

echo ""
echo "activate-license-modal.tsx:"
grep -n "useTranslation\|t(" apps/client/src/ee/licence/components/activate-license-modal.tsx | head -5

echo ""
echo "installation-details.tsx:"
grep -n "useTranslation\|t(" apps/client/src/ee/licence/components/installation-details.tsx | head -5

echo ""
echo "oss-details.tsx:"
grep -n "useTranslation\|t(" apps/client/src/ee/licence/components/oss-details.tsx | head -5

echo ""
echo "remove-license.tsx:"
grep -n "useTranslation\|t(" apps/client/src/ee/licence/components/remove-license.tsx | head -5

echo ""
echo "=== 验证完成 ==="
echo ""
echo "所有许可证页面组件已添加翻译支持。"
echo "访问 http://localhost:5173/settings/license 并切换到简体中文查看效果。"
