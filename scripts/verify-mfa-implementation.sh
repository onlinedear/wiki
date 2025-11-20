#!/bin/bash

echo "=== MFA 功能实现验证 ==="
echo ""

# 检查服务端文件
echo "1. 检查服务端 MFA 文件..."
files=(
  "apps/server/src/ee/mfa/mfa.module.ts"
  "apps/server/src/ee/mfa/mfa.controller.ts"
  "apps/server/src/ee/mfa/mfa.service.ts"
  "apps/server/src/ee/mfa/dto/mfa.dto.ts"
  "apps/server/src/database/repos/user-mfa/user-mfa.repo.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file 存在"
  else
    echo "✗ $file 不存在"
  fi
done

echo ""
echo "2. 检查 EE 模块配置..."
if grep -q "MfaModule" apps/server/src/ee/ee.module.ts; then
  echo "✓ MfaModule 已添加到 EE 模块"
else
  echo "✗ MfaModule 未添加到 EE 模块"
fi

echo ""
echo "3. 检查数据库模块配置..."
if grep -q "UserMfaRepo" apps/server/src/database/database.module.ts; then
  echo "✓ UserMfaRepo 已添加到数据库模块"
else
  echo "✗ UserMfaRepo 未添加到数据库模块"
fi

echo ""
echo "4. 检查客户端 Security 页面..."
if grep -q "MfaSettings" apps/client/src/ee/security/pages/security.tsx; then
  echo "✓ MfaSettings 已集成到 Security 页面"
else
  echo "✗ MfaSettings 未集成到 Security 页面"
fi

echo ""
echo "5. 检查依赖包..."
if grep -q "otplib" package.json; then
  echo "✓ otplib 已添加到 package.json"
else
  echo "✗ otplib 未添加到 package.json"
fi

if grep -q "qrcode" package.json; then
  echo "✓ qrcode 已存在于 package.json"
else
  echo "✗ qrcode 未添加到 package.json"
fi

echo ""
echo "6. 检查中文翻译..."
if grep -q "Security & SSO" apps/client/public/locales/zh-CN/translation.json; then
  echo "✓ Security & SSO 翻译已添加"
else
  echo "✗ Security & SSO 翻译未添加"
fi

echo ""
echo "7. 检查 MFA API 端点..."
methods=(
  "getStatus"
  "setup"
  "enable"
  "disable"
  "verify"
  "regenerateBackupCodes"
  "validateAccess"
)

echo "MFA 控制器应该提供以下方法："
for method in "${methods[@]}"; do
  if grep -q "$method" apps/server/src/ee/mfa/mfa.controller.ts; then
    echo "✓ $method"
  else
    echo "✗ $method"
  fi
done

echo ""
echo "=== 验证完成 ==="
echo ""
echo "下一步操作："
echo "1. 运行 'pnpm install' 安装 otplib 依赖"
echo "2. 确保数据库迁移已运行（user_mfa 表应该已存在）"
echo "3. 重启开发服务器"
echo "4. 访问 /settings/security 页面测试 MFA 功能"
echo "5. 测试 MFA 设置流程：设置 -> 启用 -> 验证 -> 禁用"
