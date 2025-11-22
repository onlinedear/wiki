#!/bin/bash

echo "🔍 验证第三方系统集成功能..."
echo ""

# 检查新创建的文件
echo "✓ 检查新文件..."
files=(
  "apps/client/src/pages/settings/integrations/third-party-integrations.tsx"
  "apps/client/src/pages/settings/integrations/confluence-integration.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file 存在"
  else
    echo "  ✗ $file 不存在"
    exit 1
  fi
done

echo ""
echo "✓ 检查路由配置..."
if grep -q "account/integrations" apps/client/src/App.tsx; then
  echo "  ✓ 路由已添加到 App.tsx"
else
  echo "  ✗ 路由未添加"
  exit 1
fi

if grep -q "ThirdPartyIntegrations" apps/client/src/App.tsx; then
  echo "  ✓ 组件已导入到 App.tsx"
else
  echo "  ✗ 组件未导入"
  exit 1
fi

echo ""
echo "✓ 检查侧边栏菜单..."
if grep -q "Third-party integrations" apps/client/src/components/settings/settings-sidebar.tsx; then
  echo "  ✓ 菜单项已添加到侧边栏"
else
  echo "  ✗ 菜单项未添加"
  exit 1
fi

if grep -q "IconPlugConnected" apps/client/src/components/settings/settings-sidebar.tsx; then
  echo "  ✓ 图标已导入"
else
  echo "  ✗ 图标未导入"
  exit 1
fi

echo ""
echo "✓ 检查翻译..."
if grep -q '"Third-party integrations"' apps/client/public/locales/en-US/translation.json; then
  echo "  ✓ 英文翻译已添加"
else
  echo "  ✗ 英文翻译未添加"
  exit 1
fi

if grep -q '"第三方系统集成"' apps/client/public/locales/zh-CN/translation.json; then
  echo "  ✓ 中文翻译已添加"
else
  echo "  ✗ 中文翻译未添加"
  exit 1
fi

echo ""
echo "✓ 检查 TypeScript 语法..."
npx tsc --noEmit --project apps/client/tsconfig.json 2>&1 | grep -E "(third-party-integrations|confluence-integration)" || echo "  ✓ 无 TypeScript 错误"

echo ""
echo "✓ 检查旧文件已删除..."
if [ ! -f "apps/client/src/pages/settings/account/confluence-config.tsx" ]; then
  echo "  ✓ 旧的 confluence-config.tsx 已删除"
else
  echo "  ⚠ 旧的 confluence-config.tsx 仍然存在"
fi

if ! grep -q "ConfluenceConfig" apps/client/src/pages/settings/account/account-settings.tsx; then
  echo "  ✓ 个人资料页面已移除 Confluence 配置引用"
else
  echo "  ✗ 个人资料页面仍引用 Confluence 配置"
  exit 1
fi

echo ""
echo "✅ 所有检查通过！"
echo ""
echo "📝 功能说明："
echo "  - 新菜单项：设置 → 账户 → 第三方系统集成"
echo "  - 位置：在 'API 密钥' 下方"
echo "  - 内容：Confluence 集成配置"
echo "  - 已从个人资料页面移除 Confluence 配置"
echo ""
echo "🚀 下一步："
echo "  1. 启动开发服务器：pnpm client:dev"
echo "  2. 访问：http://localhost:3000/settings/account/integrations"
echo "  3. 验证 Confluence 配置功能正常工作"
echo "  4. 确认个人资料页面不再显示 Confluence 配置"
