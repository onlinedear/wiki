#!/bin/bash

# 飞书视频 API 测试脚本
# 用于测试不同的视频下载 API 端点

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "飞书视频 API 测试脚本"
echo "========================================="
echo ""

# 检查参数
if [ $# -lt 3 ]; then
    echo "用法: $0 <APP_ID> <APP_SECRET> <VIDEO_TOKEN>"
    echo ""
    echo "示例: $0 cli_xxx xxx VMxxxxxxxx"
    echo ""
    echo "VIDEO_TOKEN 可以从导入日志中获取："
    echo "  grep 'Found video file token' logs/app.log"
    exit 1
fi

APP_ID=$1
APP_SECRET=$2
VIDEO_TOKEN=$3

echo "配置信息："
echo "  APP_ID: $APP_ID"
echo "  APP_SECRET: ${APP_SECRET:0:10}..."
echo "  VIDEO_TOKEN: $VIDEO_TOKEN"
echo ""

# 步骤 1: 获取 tenant_access_token
echo "========================================="
echo "步骤 1: 获取 tenant_access_token"
echo "========================================="

TOKEN_RESPONSE=$(curl -s -X POST 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal' \
  -H 'Content-Type: application/json' \
  -d "{
    \"app_id\": \"$APP_ID\",
    \"app_secret\": \"$APP_SECRET\"
  }")

echo "响应: $TOKEN_RESPONSE"
echo ""

# 提取 token
TENANT_TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"tenant_access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TENANT_TOKEN" ]; then
    echo -e "${RED}❌ 获取 token 失败${NC}"
    echo "请检查 APP_ID 和 APP_SECRET 是否正确"
    exit 1
fi

echo -e "${GREEN}✓ Token 获取成功: ${TENANT_TOKEN:0:20}...${NC}"
echo ""

# 步骤 2: 测试 medias API
echo "========================================="
echo "步骤 2: 测试 /drive/v1/medias/{token}/download"
echo "========================================="

MEDIAS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET \
  "https://open.feishu.cn/open-apis/drive/v1/medias/$VIDEO_TOKEN/download" \
  -H "Authorization: Bearer $TENANT_TOKEN")

HTTP_CODE=$(echo "$MEDIAS_RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$MEDIAS_RESPONSE" | sed '/HTTP_CODE:/d')

echo "HTTP 状态码: $HTTP_CODE"
echo "响应内容: $RESPONSE_BODY"
echo ""

# 检查是否成功
CODE=$(echo $RESPONSE_BODY | grep -o '"code":[0-9]*' | cut -d':' -f2)
if [ "$CODE" = "0" ]; then
    echo -e "${GREEN}✓ medias API 成功！${NC}"
    DOWNLOAD_URL=$(echo $RESPONSE_BODY | grep -o '"tmp_download_url":"[^"]*' | cut -d'"' -f4)
    echo "下载链接: $DOWNLOAD_URL"
    echo ""
    
    # 测试下载
    echo "测试下载视频..."
    curl -s -o /tmp/test_video.mp4 "$DOWNLOAD_URL"
    FILE_SIZE=$(ls -lh /tmp/test_video.mp4 | awk '{print $5}')
    echo -e "${GREEN}✓ 视频下载成功！文件大小: $FILE_SIZE${NC}"
    rm /tmp/test_video.mp4
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}测试成功！medias API 可以正常工作${NC}"
    echo -e "${GREEN}=========================================${NC}"
    exit 0
else
    echo -e "${RED}❌ medias API 失败${NC}"
    MSG=$(echo $RESPONSE_BODY | grep -o '"msg":"[^"]*' | cut -d'"' -f4)
    echo "错误信息: $MSG"
fi
echo ""

# 步骤 3: 测试 files API
echo "========================================="
echo "步骤 3: 测试 /drive/v1/files/{token}/download"
echo "========================================="

FILES_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET \
  "https://open.feishu.cn/open-apis/drive/v1/files/$VIDEO_TOKEN/download" \
  -H "Authorization: Bearer $TENANT_TOKEN")

HTTP_CODE=$(echo "$FILES_RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$FILES_RESPONSE" | sed '/HTTP_CODE:/d')

echo "HTTP 状态码: $HTTP_CODE"
echo "响应内容: $RESPONSE_BODY"
echo ""

CODE=$(echo $RESPONSE_BODY | grep -o '"code":[0-9]*' | cut -d':' -f2)
if [ "$CODE" = "0" ]; then
    echo -e "${GREEN}✓ files API 成功！${NC}"
    DOWNLOAD_URL=$(echo $RESPONSE_BODY | grep -o '"tmp_download_url":"[^"]*' | cut -d'"' -f4)
    echo "下载链接: $DOWNLOAD_URL"
    echo ""
    
    # 测试下载
    echo "测试下载视频..."
    curl -s -o /tmp/test_video.mp4 "$DOWNLOAD_URL"
    FILE_SIZE=$(ls -lh /tmp/test_video.mp4 | awk '{print $5}')
    echo -e "${GREEN}✓ 视频下载成功！文件大小: $FILE_SIZE${NC}"
    rm /tmp/test_video.mp4
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}测试成功！files API 可以正常工作${NC}"
    echo -e "${GREEN}=========================================${NC}"
    exit 0
else
    echo -e "${RED}❌ files API 失败${NC}"
    MSG=$(echo $RESPONSE_BODY | grep -o '"msg":"[^"]*' | cut -d'"' -f4)
    echo "错误信息: $MSG"
fi
echo ""

# 步骤 4: 获取视频元数据
echo "========================================="
echo "步骤 4: 获取视频元数据 /drive/v1/medias/{token}"
echo "========================================="

META_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET \
  "https://open.feishu.cn/open-apis/drive/v1/medias/$VIDEO_TOKEN" \
  -H "Authorization: Bearer $TENANT_TOKEN")

HTTP_CODE=$(echo "$META_RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$META_RESPONSE" | sed '/HTTP_CODE:/d')

echo "HTTP 状态码: $HTTP_CODE"
echo "响应内容: $RESPONSE_BODY"
echo ""

CODE=$(echo $RESPONSE_BODY | grep -o '"code":[0-9]*' | cut -d':' -f2)
if [ "$CODE" = "0" ]; then
    echo -e "${GREEN}✓ 获取元数据成功${NC}"
else
    echo -e "${RED}❌ 获取元数据失败${NC}"
fi
echo ""

# 步骤 5: 尝试 batch API
echo "========================================="
echo "步骤 5: 测试批量下载 API"
echo "========================================="

BATCH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET \
  "https://open.feishu.cn/open-apis/drive/v1/medias/batch_get_tmp_download_url?file_tokens=$VIDEO_TOKEN" \
  -H "Authorization: Bearer $TENANT_TOKEN")

HTTP_CODE=$(echo "$BATCH_RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$BATCH_RESPONSE" | sed '/HTTP_CODE:/d')

echo "HTTP 状态码: $HTTP_CODE"
echo "响应内容: $RESPONSE_BODY"
echo ""

CODE=$(echo $RESPONSE_BODY | grep -o '"code":[0-9]*' | cut -d':' -f2)
if [ "$CODE" = "0" ]; then
    echo -e "${GREEN}✓ batch API 成功！${NC}"
    DOWNLOAD_URL=$(echo $RESPONSE_BODY | grep -o '"tmp_download_url":"[^"]*' | cut -d'"' -f4)
    if [ -n "$DOWNLOAD_URL" ]; then
        echo "下载链接: $DOWNLOAD_URL"
        echo ""
        
        # 测试下载
        echo "测试下载视频..."
        curl -s -o /tmp/test_video.mp4 "$DOWNLOAD_URL"
        FILE_SIZE=$(ls -lh /tmp/test_video.mp4 | awk '{print $5}')
        echo -e "${GREEN}✓ 视频下载成功！文件大小: $FILE_SIZE${NC}"
        rm /tmp/test_video.mp4
        echo ""
        echo -e "${GREEN}=========================================${NC}"
        echo -e "${GREEN}测试成功！batch API 可以正常工作${NC}"
        echo -e "${GREEN}=========================================${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ batch API 失败${NC}"
fi
echo ""

# 总结
echo "========================================="
echo "测试总结"
echo "========================================="
echo -e "${RED}❌ 所有 API 端点都失败了${NC}"
echo ""
echo "可能的原因："
echo "1. 权限不足 - 检查飞书应用权限配置"
echo "   需要的权限: drive:drive:readonly 或 drive:drive"
echo ""
echo "2. VIDEO_TOKEN 格式不正确"
echo "   从日志中获取正确的 token:"
echo "   grep 'Found video file token' logs/app.log"
echo ""
echo "3. 视频类型不支持"
echo "   某些视频可能需要特殊的 API 端点"
echo ""
echo "建议："
echo "1. 访问飞书开放平台检查权限:"
echo "   https://open.feishu.cn/app/$APP_ID/auth"
echo ""
echo "2. 查看飞书 API 文档:"
echo "   https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction"
echo ""
echo "3. 联系飞书技术支持获取帮助"
echo ""
