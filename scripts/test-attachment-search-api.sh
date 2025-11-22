#!/bin/bash
###
 # @creator: "${author}"
 # @created: "${createTime}"
 # @last_modified_by: "${author}"
 # @last_modified: "${updateTime}"
 # @version: "v1.0"
 # @visibility: "internal"
### 

echo "==================================="
echo "测试附件搜索 API"
echo "==================================="
echo ""

# 检查后端服务是否运行
echo "1. 检查后端服务状态..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✓ 后端服务正在运行"
else
    echo "✗ 后端服务未运行，请先启动后端服务"
    echo "  运行: npm run server:dev"
    exit 1
fi
echo ""

# 检查数据库中是否有附件
echo "2. 检查数据库附件表..."
echo "请确保数据库中有附件数据用于测试"
echo ""

# 测试附件搜索 API（需要认证）
echo "3. 测试附件搜索 API..."
echo "注意：此 API 需要 JWT 认证"
echo ""
echo "手动测试步骤："
echo "1. 在浏览器中登录系统"
echo "2. 打开开发者工具 (F12)"
echo "3. 在 Console 中运行以下代码："
echo ""
echo "fetch('/api/search/search-attachments', {"
echo "  method: 'POST',"
echo "  headers: { 'Content-Type': 'application/json' },"
echo "  body: JSON.stringify({ query: 'test' })"
echo "})"
echo ".then(r => r.json())"
echo ".then(d => console.log('结果:', d))"
echo ".catch(e => console.error('错误:', e))"
echo ""

echo "==================================="
echo "检查后端日志"
echo "==================================="
echo ""
echo "如果遇到 500 错误，请检查后端日志："
echo "1. 查看终端中运行 server:dev 的窗口"
echo "2. 查找错误堆栈信息"
echo "3. 常见问题："
echo "   - attachments.tsv 字段为 NULL"
echo "   - 数据库触发器未正确创建"
echo "   - SQL 语法错误"
echo ""
