#!/bin/bash

# 测试用户注册功能
# Test user registration functionality

echo "=========================================="
echo "测试用户注册功能 / Testing User Registration"
echo "=========================================="
echo ""

# 测试数据
TEST_EMAIL="testuser@example.com"
TEST_NAME="测试用户"
TEST_PASSWORD="TestPassword123"

echo "1. 测试注册 API 端点 / Testing registration API endpoint"
echo "   POST /api/auth/register"
echo ""

# 测试注册请求
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"${TEST_NAME}\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"confirmPassword\": \"${TEST_PASSWORD}\"
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "2. 验证注册后的用户 / Verify registered user"
echo "   应该能够使用注册的邮箱和密码登录"
echo "   Should be able to login with registered email and password"
echo ""

# 测试登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "3. 测试密码不匹配的情况 / Testing password mismatch"
echo ""

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Another User\",
    \"email\": \"another@example.com\",
    \"password\": \"Password123\",
    \"confirmPassword\": \"DifferentPassword123\"
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "4. 测试重复邮箱注册 / Testing duplicate email registration"
echo ""

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Duplicate User\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"confirmPassword\": \"${TEST_PASSWORD}\"
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "=========================================="
echo "测试完成 / Testing Complete"
echo "=========================================="
