#!/bin/bash

# 邮件服务配置测试脚本
# 用于测试邮件服务配置功能的 API 端点

set -e

echo "=========================================="
echo "邮件服务配置功能测试"
echo "=========================================="
echo ""

# 配置
API_URL="${API_URL:-http://localhost:3000}"
AUTH_TOKEN="${AUTH_TOKEN:-}"

if [ -z "$AUTH_TOKEN" ]; then
  echo "❌ 错误: 请设置 AUTH_TOKEN 环境变量"
  echo "使用方法: AUTH_TOKEN=your_token ./scripts/test-mail-settings.sh"
  exit 1
fi

echo "📋 测试配置:"
echo "  API URL: $API_URL"
echo ""

# 测试 1: 获取邮件设置
echo "1️⃣  测试获取邮件设置..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=$AUTH_TOKEN" \
  "$API_URL/workspace/mail-settings")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 获取邮件设置成功"
  echo "   响应: $BODY"
else
  echo "❌ 获取邮件设置失败 (HTTP $HTTP_CODE)"
  echo "   响应: $BODY"
fi
echo ""

# 测试 2: 更新邮件设置
echo "2️⃣  测试更新邮件设置..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=$AUTH_TOKEN" \
  -d '{
    "smtpHost": "smtp.example.com",
    "smtpPort": 587,
    "smtpSecure": false,
    "smtpUsername": "test@example.com",
    "smtpPassword": "password123",
    "mailFromAddress": "noreply@example.com",
    "mailFromName": "NoteDoc Test",
    "smtpIgnoreTLS": false
  }' \
  "$API_URL/workspace/mail-settings/update")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 更新邮件设置成功"
  echo "   响应: $BODY"
else
  echo "❌ 更新邮件设置失败 (HTTP $HTTP_CODE)"
  echo "   响应: $BODY"
fi
echo ""

# 测试 3: 测试邮件发送（可选）
if [ -n "$TEST_EMAIL" ]; then
  echo "3️⃣  测试发送测试邮件到 $TEST_EMAIL..."
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Cookie: authToken=$AUTH_TOKEN" \
    -d "{\"email\": \"$TEST_EMAIL\"}" \
    "$API_URL/workspace/mail-settings/test")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 测试邮件发送成功"
    echo "   响应: $BODY"
  else
    echo "❌ 测试邮件发送失败 (HTTP $HTTP_CODE)"
    echo "   响应: $BODY"
  fi
  echo ""
else
  echo "3️⃣  跳过测试邮件发送（设置 TEST_EMAIL 环境变量以启用）"
  echo ""
fi

echo "=========================================="
echo "测试完成"
echo "=========================================="
