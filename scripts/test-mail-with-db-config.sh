#!/bin/bash

echo "=== 测试邮件服务（数据库配置优先） ==="
echo ""

# 获取认证 token
echo "1. 登录获取 token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }')

echo "登录响应: $LOGIN_RESPONSE"
echo ""

# 测试邀请用户（会发送邮件）
echo "2. 测试邀请用户（应该使用数据库配置发送邮件）..."
INVITE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/workspace/invites/create \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=test" \
  -d '{
    "emails": ["test@example.com"],
    "role": "member"
  }')

echo "邀请响应: $INVITE_RESPONSE"
echo ""

echo "3. 检查后端日志，应该看到："
echo "   - 'Using mail config from database for workspace ...'"
echo "   - 邮件发送成功的日志"
echo ""
echo "完成！请检查后端日志确认邮件配置来源。"
