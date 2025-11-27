#!/bin/bash

# NoteDoc 生产环境部署脚本
# 用途：快速部署 NoteDoc 到生产服务器

set -e

echo "========================================="
echo "  NoteDoc 生产环境部署向导"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}建议使用 sudo 运行此脚本${NC}"
    echo "继续执行可能需要输入密码..."
    echo ""
fi

# 检查 Docker
echo -n "检查 Docker... "
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} 已安装"
else
    echo -e "${YELLOW}!${NC} 未安装，开始安装..."
    curl -fsSL https://get.docker.com | bash
    echo -e "${GREEN}✓${NC} 安装完成"
fi

# 检查 Docker Compose
echo -n "检查 Docker Compose... "
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC} 已安装"
else
    echo -e "${YELLOW}!${NC} 未安装，开始安装..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓${NC} 安装完成"
fi

echo ""
echo "========================================="
echo "  配置向导"
echo "========================================="
echo ""

# 生成密钥
echo "生成安全密钥..."
APP_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)

echo -e "${GREEN}✓${NC} APP_SECRET: $APP_SECRET"
echo -e "${GREEN}✓${NC} DB_PASSWORD: $DB_PASSWORD"
echo ""

# 询问域名
read -p "请输入你的域名（例如：notedoc.example.com）: " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN="localhost"
    APP_URL="http://localhost:3000"
else
    APP_URL="https://$DOMAIN"
fi

echo ""
echo "========================================="
echo "  创建部署目录"
echo "========================================="
echo ""

DEPLOY_DIR="/opt/notedoc"
sudo mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# 创建 docker-compose.yml
echo "创建 docker-compose.yml..."
cat > docker-compose.yml <<EOF
services:
  notedoc:
    image: notedoc/notedoc:latest
    depends_on:
      - db
      - redis
    environment:
      APP_URL: '$APP_URL'
      APP_SECRET: '$APP_SECRET'
      DATABASE_URL: 'postgresql://notedoc:$DB_PASSWORD@db:5432/notedoc?schema=public'
      REDIS_URL: 'redis://redis:6379'
      JWT_TOKEN_EXPIRES_IN: '30d'
      STORAGE_DRIVER: 'local'
      DISABLE_TELEMETRY: 'true'
    ports:
      - "3000:3000"
    restart: unless-stopped
    volumes:
      - notedoc_data:/app/data/storage
    networks:
      - notedoc_network

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: notedoc
      POSTGRES_USER: notedoc
      POSTGRES_PASSWORD: '$DB_PASSWORD'
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - notedoc_network

  redis:
    image: redis:7.2-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    networks:
      - notedoc_network

volumes:
  notedoc_data:
  postgres_data:
  redis_data:

networks:
  notedoc_network:
    driver: bridge
EOF

echo -e "${GREEN}✓${NC} docker-compose.yml 创建完成"
echo ""

echo "========================================="
echo "  启动服务"
echo "========================================="
echo ""

docker-compose pull
docker-compose up -d

echo ""
echo "等待服务启动..."
sleep 10

# 检查服务状态
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓${NC} 服务启动成功"
else
    echo -e "${RED}✗${NC} 服务启动失败，请查看日志："
    echo "docker-compose logs"
    exit 1
fi

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo -e "访问地址: ${BLUE}$APP_URL${NC}"
echo -e "健康检查: ${BLUE}http://localhost:3000/api/health${NC}"
echo ""
echo "重要信息（请妥善保存）："
echo "- APP_SECRET: $APP_SECRET"
echo "- DB_PASSWORD: $DB_PASSWORD"
echo ""
echo "常用命令："
echo "  查看日志: docker-compose logs -f"
echo "  重启服务: docker-compose restart"
echo "  停止服务: docker-compose down"
echo "  更新应用: docker-compose pull && docker-compose up -d"
echo ""
echo "下一步："
if [ "$DOMAIN" != "localhost" ]; then
    echo "1. 配置 DNS 将 $DOMAIN 指向此服务器"
    echo "2. 配置 Nginx 反向代理和 SSL 证书"
    echo "   参考文档: docs/生产环境部署指南.md"
fi
echo "3. 访问 $APP_URL 注册管理员账号"
echo ""
