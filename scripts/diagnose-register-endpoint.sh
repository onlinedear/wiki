#!/bin/bash

echo "=========================================="
echo "诊断注册端点 / Diagnosing Register Endpoint"
echo "=========================================="
echo ""

echo "1. 检查后端文件是否存在 / Checking backend files"
echo "----------------------------------------"

if [ -f "apps/server/src/core/auth/dto/register.dto.ts" ]; then
  echo "✓ register.dto.ts 存在"
else
  echo "✗ register.dto.ts 不存在"
  exit 1
fi

if grep -q "@Post('register')" apps/server/src/core/auth/auth.controller.ts; then
  echo "✓ 注册端点代码存在"
else
  echo "✗ 注册端点代码不存在"
  exit 1
fi

echo ""
echo "2. 检查后端服务器是否运行 / Checking if backend is running"
echo "----------------------------------------"

if curl -s http://localhost:3000/api/auth/login > /dev/null 2>&1; then
  echo "✓ 后端服务器正在运行 (端口 3000)"
else
  echo "✗ 后端服务器未运行或不在端口 3000"
  echo ""
  echo "请启动后端服务器："
  echo "  pnpm dev"
  echo "或"
  echo "  pnpm server:dev"
  exit 1
fi

echo ""
echo "3. 测试注册端点 / Testing register endpoint"
echo "----------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"12345678","confirmPassword":"12345678"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP 状态码: $HTTP_CODE"
echo "响应内容: $BODY"
echo ""

if [ "$HTTP_CODE" = "404" ]; then
  echo "❌ 端点返回 404 - 后端服务器需要重启"
  echo ""
  echo "解决方案："
  echo "1. 停止当前服务器 (Ctrl+C)"
  echo "2. 运行: pnpm dev"
  echo "3. 等待服务器完全启动"
  echo "4. 再次运行此脚本验证"
  exit 1
elif [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 端点正常工作！"
  echo ""
  echo "如果浏览器仍然显示 404，请："
  echo "1. 硬刷新浏览器 (Cmd+Shift+R 或 Ctrl+Shift+R)"
  echo "2. 清除浏览器缓存"
  echo "3. 使用无痕模式"
  exit 0
else
  echo "⚠️  端点返回意外状态码: $HTTP_CODE"
  echo "请检查后端日志获取更多信息"
  exit 1
fi
