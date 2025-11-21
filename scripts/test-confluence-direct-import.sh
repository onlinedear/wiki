#!/bin/bash
###
 # @creator: "${author}"
 # @created: "${createTime}"
 # @last_modified_by: "${author}"
 # @last_modified: "${updateTime}"
 # @version: "v1.0"
 # @visibility: "internal"
### 

# Confluence 直接导入功能测试脚本

echo "=========================================="
echo "Confluence 直接导入功能测试"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}测试说明：${NC}"
echo "1. 确保开发服务器正在运行 (pnpm dev)"
echo "2. 确保已登录到 Docmost"
echo "3. 准备好 Confluence URL 和 Personal Access Token"
echo "4. 准备好要导入的 Confluence 页面 URL"
echo ""

echo -e "${YELLOW}测试步骤：${NC}"
echo ""
echo "步骤 1: 打开浏览器访问 Docmost"
echo "步骤 2: 进入任意文档库"
echo "步骤 3: 点击导入按钮"
echo "步骤 4: 选择 'Import from Confluence Online'"
echo "步骤 5: 填写以下信息："
echo "   - Confluence URL (例如: https://your-domain.atlassian.net/wiki)"
echo "   - Personal Access Token"
echo "   - Confluence Page URL"
echo "   - 选择是否包含子页面"
echo "步骤 6: 点击 'Import from Confluence'"
echo ""

echo -e "${YELLOW}预期结果：${NC}"
echo "✓ 表单验证正常工作"
echo "✓ 导入开始后显示成功通知"
echo "✓ 页面内容成功导入到文档库"
echo "✓ 附件下载失败不会导致整个导入失败"
echo "✓ 服务器日志显示详细的导入信息"
echo ""

echo -e "${YELLOW}检查服务器日志：${NC}"
echo "查看以下日志信息："
echo "1. 'Starting online Confluence import for page XXX'"
echo "2. 'Import params - workspaceId: XXX, spaceId: XXX, userId: XXX'"
echo "3. 'Found X pages to import'"
echo "4. 'Processed X out of Y attachments' (如果有附件)"
echo "5. 'Successfully imported X Confluence pages online'"
echo ""

echo -e "${YELLOW}常见问题排查：${NC}"
echo ""
echo "问题 1: 500 错误 - workspace_id is null"
echo "解决: 检查服务器日志中的 'Import params' 行，确认参数正确传递"
echo ""
echo "问题 2: 附件下载失败"
echo "解决: 这是正常的，某些附件可能因权限问题无法下载"
echo "      导入会继续进行，只是跳过失败的附件"
echo ""
echo "问题 3: 连接 Confluence 失败"
echo "解决: 检查 Confluence URL 格式和 Token 是否正确"
echo "      确保 Token 有读取权限"
echo ""

echo -e "${GREEN}开始测试...${NC}"
echo ""
echo "请按照上述步骤在浏览器中进行测试"
echo "测试完成后，检查服务器日志确认功能正常"
echo ""
