#!/bin/bash

# 验证用户注册功能实现
# Verify user registration implementation

echo "=========================================="
echo "验证用户注册功能实现"
echo "Verifying User Registration Implementation"
echo "=========================================="
echo ""

# 检查后端文件
echo "1. 检查后端文件 / Checking backend files"
echo "----------------------------------------"

files=(
  "apps/server/src/core/auth/dto/register.dto.ts"
  "apps/server/src/core/auth/auth.controller.ts"
  "apps/server/src/core/auth/services/auth.service.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file"
  else
    echo "✗ $file (缺失 / missing)"
  fi
done

echo ""

# 检查前端文件
echo "2. 检查前端文件 / Checking frontend files"
echo "----------------------------------------"

files=(
  "apps/client/src/pages/auth/register.tsx"
  "apps/client/src/features/auth/components/register-form.tsx"
  "apps/client/src/features/auth/services/auth-service.ts"
  "apps/client/src/features/auth/types/auth.types.ts"
  "apps/client/src/lib/app-route.ts"
  "apps/client/src/App.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file"
  else
    echo "✗ $file (缺失 / missing)"
  fi
done

echo ""

# 检查关键代码
echo "3. 检查关键代码 / Checking key code"
echo "----------------------------------------"

# 检查注册端点
if grep -q "@Post('register')" apps/server/src/core/auth/auth.controller.ts; then
  echo "✓ 注册端点已添加 / Register endpoint added"
else
  echo "✗ 注册端点未找到 / Register endpoint not found"
fi

# 检查注册路由
if grep -q "REGISTER:" apps/client/src/lib/app-route.ts; then
  echo "✓ 注册路由已添加 / Register route added"
else
  echo "✗ 注册路由未找到 / Register route not found"
fi

# 检查注册页面路由
if grep -q "register.*RegisterPage" apps/client/src/App.tsx; then
  echo "✓ 注册页面路由已配置 / Register page route configured"
else
  echo "✗ 注册页面路由未配置 / Register page route not configured"
fi

# 检查登录页面的注册链接
if grep -q "Don't have an account" apps/client/src/features/auth/components/login-form.tsx; then
  echo "✓ 登录页面注册链接已添加 / Register link added to login page"
else
  echo "✗ 登录页面注册链接未添加 / Register link not added to login page"
fi

echo ""

# 检查翻译文件
echo "4. 检查翻译文件 / Checking translation files"
echo "----------------------------------------"

# 检查英文翻译
if grep -q '"Register":' apps/client/public/locales/en-US/translation.json; then
  echo "✓ 英文翻译已添加 / English translations added"
else
  echo "✗ 英文翻译未添加 / English translations not added"
fi

# 检查中文翻译
if grep -q '"Register":' apps/client/public/locales/zh-CN/translation.json; then
  echo "✓ 中文翻译已添加 / Chinese translations added"
else
  echo "✗ 中文翻译未添加 / Chinese translations not added"
fi

echo ""

# 检查文档
echo "5. 检查文档 / Checking documentation"
echo "----------------------------------------"

docs=(
  "docs/用户注册功能说明.md"
  "docs/用户注册快速开始.md"
  "scripts/test-register.sh"
)

for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    echo "✓ $doc"
  else
    echo "✗ $doc (缺失 / missing)"
  fi
done

echo ""

# 检查 DTO 验证
echo "6. 检查数据验证 / Checking data validation"
echo "----------------------------------------"

if grep -q "confirmPassword" apps/server/src/core/auth/dto/register.dto.ts; then
  echo "✓ 确认密码字段已添加 / Confirm password field added"
else
  echo "✗ 确认密码字段未添加 / Confirm password field not added"
fi

if grep -q "MinLength(8)" apps/server/src/core/auth/dto/register.dto.ts; then
  echo "✓ 密码长度验证已添加 / Password length validation added"
else
  echo "✗ 密码长度验证未添加 / Password length validation not added"
fi

echo ""

# 检查用户角色设置
echo "7. 检查用户角色设置 / Checking user role assignment"
echo "----------------------------------------"

if grep -q "UserRole.USER" apps/server/src/core/auth/services/auth.service.ts; then
  echo "✓ 用户角色设置为 USER / User role set to USER"
else
  echo "✗ 用户角色未正确设置 / User role not properly set"
fi

echo ""

# 检查 SSO 强制登录保护
echo "8. 检查 SSO 强制登录保护 / Checking SSO enforcement protection"
echo "----------------------------------------"

if grep -q "validateSsoEnforcement" apps/server/src/core/auth/auth.controller.ts; then
  echo "✓ SSO 强制登录验证已添加 / SSO enforcement validation added"
else
  echo "✗ SSO 强制登录验证未添加 / SSO enforcement validation not added"
fi

if grep -q "enforceSso" apps/client/src/features/auth/components/register-form.tsx; then
  echo "✓ 前端 SSO 检测已添加 / Frontend SSO detection added"
else
  echo "✗ 前端 SSO 检测未添加 / Frontend SSO detection not added"
fi

echo ""
echo "=========================================="
echo "验证完成 / Verification Complete"
echo "=========================================="
echo ""
echo "下一步 / Next steps:"
echo "1. 启动开发服务器: pnpm dev"
echo "2. 访问注册页面: http://localhost:5173/register"
echo "3. 运行测试脚本: ./scripts/test-register.sh"
echo ""
