#!/bin/bash

# Vercel 部署验证脚本
# 用于检查 Vercel 部署所需的环境变量和配置

set -e

echo "🔍 Vercel 部署验证检查"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
PASSED=0
FAILED=0
WARNINGS=0

# 检查函数
check_env_var() {
    local var_name=$1
    local var_value=${!var_name}
    local is_required=$2
    
    if [ -z "$var_value" ]; then
        if [ "$is_required" = "required" ]; then
            echo -e "${RED}✗${NC} $var_name: 未设置 (必需)"
            ((FAILED++))
        else
            echo -e "${YELLOW}⚠${NC} $var_name: 未设置 (可选)"
            ((WARNINGS++))
        fi
        return 1
    else
        echo -e "${GREEN}✓${NC} $var_name: 已设置"
        ((PASSED++))
        return 0
    fi
}

echo "📋 检查必需的环境变量"
echo "--------------------------------"

# 必需的环境变量
check_env_var "APP_URL" "required"
check_env_var "APP_SECRET" "required"
check_env_var "DATABASE_URL" "required"
check_env_var "REDIS_URL" "required"
check_env_var "STORAGE_DRIVER" "required"

echo ""
echo "📋 检查存储配置"
echo "--------------------------------"

if [ "$STORAGE_DRIVER" = "s3" ]; then
    check_env_var "AWS_S3_ACCESS_KEY_ID" "required"
    check_env_var "AWS_S3_SECRET_ACCESS_KEY" "required"
    check_env_var "AWS_S3_REGION" "required"
    check_env_var "AWS_S3_BUCKET" "required"
    check_env_var "AWS_S3_ENDPOINT" "required"
else
    echo -e "${YELLOW}⚠${NC} STORAGE_DRIVER 不是 s3，Vercel 部署必须使用 S3 存储"
    ((WARNINGS++))
fi

echo ""
echo "📋 检查可选的环境变量"
echo "--------------------------------"

check_env_var "MAIL_DRIVER" "optional"
check_env_var "MAIL_FROM_ADDRESS" "optional"
check_env_var "SMTP_HOST" "optional"
check_env_var "FILE_UPLOAD_SIZE_LIMIT" "optional"

echo ""
echo "📋 检查 APP_SECRET 强度"
echo "--------------------------------"

if [ -n "$APP_SECRET" ]; then
    SECRET_LENGTH=${#APP_SECRET}
    if [ $SECRET_LENGTH -lt 32 ]; then
        echo -e "${RED}✗${NC} APP_SECRET 长度不足 (当前: $SECRET_LENGTH, 需要: 32+)"
        ((FAILED++))
    else
        echo -e "${GREEN}✓${NC} APP_SECRET 长度符合要求 ($SECRET_LENGTH 字符)"
        ((PASSED++))
    fi
fi

echo ""
echo "📋 检查 URL 配置"
echo "--------------------------------"

if [ -n "$APP_URL" ]; then
    if [[ $APP_URL == https://* ]]; then
        echo -e "${GREEN}✓${NC} APP_URL 使用 HTTPS"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} APP_URL 未使用 HTTPS，生产环境建议使用 HTTPS"
        ((WARNINGS++))
    fi
fi

echo ""
echo "📋 检查文件"
echo "--------------------------------"

# 检查必需的文件
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓${NC} vercel.json 存在"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} vercel.json 不存在"
    ((FAILED++))
fi

if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json 存在"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} package.json 不存在"
    ((FAILED++))
fi

if [ -f "pnpm-lock.yaml" ]; then
    echo -e "${GREEN}✓${NC} pnpm-lock.yaml 存在"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} pnpm-lock.yaml 不存在"
    ((WARNINGS++))
fi

echo ""
echo "📋 检查 Node.js 版本"
echo "--------------------------------"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js 版本: $NODE_VERSION"
    ((PASSED++))
    
    # 检查是否为 Node 22.x
    if [[ $NODE_VERSION == v22.* ]]; then
        echo -e "${GREEN}✓${NC} Node.js 版本符合要求 (22.x)"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Node.js 版本不是 22.x，可能导致兼容性问题"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗${NC} Node.js 未安装"
    ((FAILED++))
fi

echo ""
echo "📋 检查 pnpm"
echo "--------------------------------"

if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓${NC} pnpm 版本: $PNPM_VERSION"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} pnpm 未安装"
    ((FAILED++))
fi

echo ""
echo "================================"
echo "📊 检查结果汇总"
echo "================================"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${YELLOW}警告: $WARNINGS${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ 所有必需检查已通过！${NC}"
    echo ""
    echo "🚀 下一步："
    echo "1. 访问 https://vercel.com/new"
    echo "2. 导入你的 GitHub 仓库"
    echo "3. 配置环境变量"
    echo "4. 点击部署"
    echo ""
    echo "📚 详细指南: docs/快速部署到Vercel.md"
    exit 0
else
    echo -e "${RED}✗ 发现 $FAILED 个必需项未通过${NC}"
    echo ""
    echo "请修复上述问题后再进行部署"
    echo "📚 查看文档: docs/Vercel部署指南.md"
    exit 1
fi
