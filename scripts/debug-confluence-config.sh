#!/bin/bash

# 调试 Confluence 配置保存问题

echo "=== Confluence 配置调试工具 ==="
echo ""

# 1. 检查后端服务是否运行
echo "1. 检查后端服务状态..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "   ✓ 后端服务正在运行"
else
    echo "   ✗ 后端服务未运行或无法访问"
    echo "   请运行: pnpm server:dev"
fi
echo ""

# 2. 检查 EE 模块是否正确加载
echo "2. 检查 Confluence 模块注册..."
if grep -q "ConfluenceImportModule" apps/server/src/ee/ee.module.ts; then
    echo "   ✓ ConfluenceImportModule 已在 EE 模块中注册"
else
    echo "   ✗ ConfluenceImportModule 未注册"
fi
echo ""

# 3. 检查控制器路由
echo "3. 检查控制器路由..."
if grep -q "@Controller('confluence')" apps/server/src/ee/confluence-import/confluence-import.controller.ts; then
    echo "   ✓ Confluence 控制器路由已定义"
    echo "   路由: /api/confluence/*"
else
    echo "   ✗ 控制器路由未找到"
fi
echo ""

# 4. 检查数据库 users 表是否有 settings 字段
echo "4. 检查数据库结构..."
if grep -q "settings.*jsonb" apps/server/src/database/migrations/20240324T085600-users.ts; then
    echo "   ✓ users 表有 settings 字段 (jsonb 类型)"
else
    echo "   ✗ users 表缺少 settings 字段"
fi
echo ""

# 5. 检查前端 API 调用
echo "5. 检查前端 API 服务..."
if grep -q "saveConfluenceConfig" apps/client/src/features/confluence/services/confluence-service.ts; then
    echo "   ✓ saveConfluenceConfig 函数已定义"
    echo "   API: POST /confluence/config"
else
    echo "   ✗ saveConfluenceConfig 函数未找到"
fi
echo ""

# 6. 提供调试建议
echo "=== 调试步骤 ==="
echo ""
echo "请按以下步骤调试："
echo ""
echo "1. 打开浏览器开发者工具 (F12)"
echo "2. 切换到 Network (网络) 标签"
echo "3. 在个人资料页面填写 Confluence 配置并点击保存"
echo "4. 查看网络请求："
echo "   - 请求 URL: /api/confluence/config"
echo "   - 请求方法: POST"
echo "   - 状态码: 应该是 200 或 201"
echo "   - 响应内容: { success: true, message: '...' }"
echo ""
echo "5. 切换到 Console (控制台) 标签"
echo "6. 查看是否有错误信息或日志："
echo "   - 'Save config result:' - 应该显示保存结果"
echo "   - 'Save config error:' - 如果有错误会显示"
echo ""
echo "7. 刷新页面后，检查配置是否加载："
echo "   - 查看网络请求: GET /api/confluence/config"
echo "   - 响应应该包含: { confluenceUrl: '...', hasAccessToken: true }"
echo ""
echo "8. 检查后端日志 (运行 pnpm server:dev 的终端)："
echo "   - 查找 'Confluence configuration saved successfully'"
echo "   - 查找任何错误或异常信息"
echo ""

# 7. 创建测试用的 curl 命令模板
echo "=== 手动测试 API (需要替换 JWT_TOKEN) ==="
echo ""
echo "# 获取配置"
echo "curl -X GET http://localhost:3000/api/confluence/config \\"
echo "  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\"
echo "  -H 'Content-Type: application/json'"
echo ""
echo "# 保存配置"
echo "curl -X POST http://localhost:3000/api/confluence/config \\"
echo "  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"confluenceUrl\":\"https://your-domain.atlassian.net/wiki\",\"accessToken\":\"your-token\"}'"
echo ""
echo "提示: 在浏览器开发者工具的 Application > Cookies 中可以找到 JWT token"
echo ""
