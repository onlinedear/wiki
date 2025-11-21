#!/bin/bash

# 快速测试 Confluence 配置功能

echo "=== 快速测试 Confluence 配置 ==="
echo ""

# 检查后端是否运行
echo "1. 检查后端服务..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "   ✓ 后端服务正在运行"
else
    echo "   ✗ 后端服务未运行"
    echo ""
    echo "请先启动后端服务："
    echo "  pnpm server:dev"
    echo ""
    exit 1
fi

echo ""
echo "2. 检查代码结构..."

# 检查后端文件
if [ -f "apps/server/src/ee/confluence-import/confluence-import.controller.ts" ]; then
    echo "   ✓ 控制器文件存在"
else
    echo "   ✗ 控制器文件不存在"
fi

if [ -f "apps/server/src/ee/confluence-import/confluence-import.service.ts" ]; then
    echo "   ✓ 服务文件存在"
else
    echo "   ✗ 服务文件不存在"
fi

# 检查前端文件
if [ -f "apps/client/src/pages/settings/account/confluence-config.tsx" ]; then
    echo "   ✓ 前端配置页面存在"
else
    echo "   ✗ 前端配置页面不存在"
fi

if [ -f "apps/client/src/features/confluence/services/confluence-service.ts" ]; then
    echo "   ✓ 前端服务文件存在"
else
    echo "   ✗ 前端服务文件不存在"
fi

echo ""
echo "=== 测试说明 ==="
echo ""
echo "现在请按以下步骤测试："
echo ""
echo "1. 打开浏览器，访问 http://localhost:5173"
echo "2. 登录到你的账户"
echo "3. 进入 个人资料 → Confluence Integration"
echo "4. 打开浏览器开发者工具 (F12)"
echo "5. 切换到 Console 标签"
echo "6. 填写 Confluence 配置："
echo "   - Confluence URL: https://your-domain.atlassian.net/wiki"
echo "   - Personal Access Token: 你的 token"
echo "7. 点击 '保存配置' 按钮"
echo ""
echo "在 Console 中查看："
echo "   - 如果看到 'Save config result: { success: true, ... }'，说明保存成功"
echo "   - 如果看到 'Save config error: ...'，说明保存失败"
echo ""
echo "在后端日志中查看："
echo "   - 应该看到 'Saving Confluence config for user ...'"
echo "   - 应该看到 'Confluence connection test passed'"
echo "   - 应该看到 'Confluence configuration saved successfully'"
echo ""
echo "8. 刷新页面，检查配置是否保存"
echo "   - Confluence URL 应该自动填充"
echo "   - Personal Access Token 应该显示为 '••••••••••••••••'"
echo ""
echo "如果配置没有保存，请查看："
echo "   - 浏览器 Console 中的错误信息"
echo "   - 浏览器 Network 标签中的请求详情"
echo "   - 后端日志中的错误信息"
echo ""
echo "详细的排查指南请查看："
echo "   docs/Confluence配置保存问题排查.md"
echo ""
