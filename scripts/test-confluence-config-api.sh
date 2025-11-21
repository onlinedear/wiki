#!/bin/bash

# 测试 Confluence 配置 API

echo "测试 Confluence 配置保存和读取..."
echo ""

# 获取 JWT token (需要先登录)
echo "1. 测试保存配置 (需要有效的 JWT token)"
echo "   POST /api/confluence/config"
echo ""

# 测试读取配置
echo "2. 测试读取配置"
echo "   GET /api/confluence/config"
echo ""

# 检查后端日志
echo "3. 检查后端日志中是否有相关错误"
echo ""

# 检查模块是否正确加载
echo "4. 检查 Confluence 模块是否在 EE 模块中正确注册"
grep -r "ConfluenceImportModule" apps/server/src/ee/ee.module.ts

echo ""
echo "5. 检查路由是否正确注册"
grep -r "@Controller('confluence')" apps/server/src/ee/confluence-import/

echo ""
echo "请在浏览器开发者工具的 Network 标签中检查："
echo "- 请求是否发送到 /api/confluence/config"
echo "- 响应状态码是什么"
echo "- 响应内容是什么"
echo "- 是否有 CORS 或认证错误"
