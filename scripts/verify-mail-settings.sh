#!/bin/bash

# 邮件服务配置功能验证脚本
# 检查所有必要的文件和配置是否正确

set -e

echo "=========================================="
echo "邮件服务配置功能验证"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# 检查函数
check_file() {
  if [ -f "$1" ]; then
    echo "✅ $1"
  else
    echo "❌ $1 (缺失)"
    ((ERRORS++))
  fi
}

check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo "✅ $1 包含 '$2'"
  else
    echo "❌ $1 不包含 '$2'"
    ((ERRORS++))
  fi
}

echo "📋 检查后端文件..."
echo ""

# DTO 文件
check_file "apps/server/src/core/workspace/dto/update-mail-settings.dto.ts"
check_file "apps/server/src/core/workspace/dto/test-mail.dto.ts"

# 服务和控制器
check_file "apps/server/src/core/workspace/services/workspace.service.ts"
check_file "apps/server/src/core/workspace/controllers/workspace.controller.ts"

# 数据库 repo
check_file "apps/server/src/database/repos/workspace/workspace.repo.ts"

# 邮件服务
check_file "apps/server/src/integrations/mail/mail.service.ts"

echo ""
echo "📋 检查前端文件..."
echo ""

# 页面组件
check_file "apps/client/src/pages/settings/system/mail-settings.tsx"

# 服务和查询
check_file "apps/client/src/features/workspace/services/mail-settings-service.ts"
check_file "apps/client/src/features/workspace/queries/mail-settings-query.ts"

# 路由和菜单
check_file "apps/client/src/App.tsx"
check_file "apps/client/src/components/settings/settings-sidebar.tsx"

echo ""
echo "📋 检查关键代码..."
echo ""

# 检查后端方法
check_content "apps/server/src/core/workspace/services/workspace.service.ts" "getMailSettings"
check_content "apps/server/src/core/workspace/services/workspace.service.ts" "updateMailSettings"
check_content "apps/server/src/core/workspace/services/workspace.service.ts" "testMailSettings"

# 检查后端端点
check_content "apps/server/src/core/workspace/controllers/workspace.controller.ts" "mail-settings"
check_content "apps/server/src/core/workspace/controllers/workspace.controller.ts" "mail-settings/update"
check_content "apps/server/src/core/workspace/controllers/workspace.controller.ts" "mail-settings/test"

# 检查数据库方法
check_content "apps/server/src/database/repos/workspace/workspace.repo.ts" "updateMailSettings"
check_content "apps/server/src/database/repos/workspace/workspace.repo.ts" "getMailSettings"

# 检查邮件测试方法
check_content "apps/server/src/integrations/mail/mail.service.ts" "sendTestEmail"

# 检查前端路由
check_content "apps/client/src/App.tsx" "mail-settings"
check_content "apps/client/src/App.tsx" "MailSettings"

# 检查菜单项
check_content "apps/client/src/components/settings/settings-sidebar.tsx" "Mail service"
check_content "apps/client/src/components/settings/settings-sidebar.tsx" "IconMail"

echo ""
echo "📋 检查翻译..."
echo ""

# 检查中文翻译
check_content "apps/client/public/locales/zh-CN/translation.json" "Mail service"
check_content "apps/client/public/locales/zh-CN/translation.json" "邮件服务"
check_content "apps/client/public/locales/zh-CN/translation.json" "SMTP configuration"
check_content "apps/client/public/locales/zh-CN/translation.json" "Test email"

echo ""
echo "📋 检查文档..."
echo ""

check_file "docs/邮件服务配置说明.md"
check_file "docs/邮件服务快速开始.md"
check_file "scripts/test-mail-settings.sh"

echo ""
echo "=========================================="
echo "验证结果"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ]; then
  echo "✅ 所有检查通过！"
  echo ""
  echo "📝 下一步:"
  echo "  1. 启动开发服务器: pnpm dev"
  echo "  2. 以管理员身份登录"
  echo "  3. 访问: 设置 → 系统 → 邮件服务"
  echo "  4. 配置 SMTP 并测试"
  echo ""
  echo "📚 文档:"
  echo "  - 完整说明: docs/邮件服务配置说明.md"
  echo "  - 快速开始: docs/邮件服务快速开始.md"
  echo ""
  exit 0
else
  echo "❌ 发现 $ERRORS 个错误"
  if [ $WARNINGS -gt 0 ]; then
    echo "⚠️  发现 $WARNINGS 个警告"
  fi
  echo ""
  echo "请检查上述错误并修复"
  exit 1
fi
