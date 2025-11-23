# NoteDoc 完整部署指南

> 本指南将详细介绍如何在各种环境中部署 NoteDoc，包括 Docker、云服务器、Kubernetes 等多种方式，帮助您快速搭建生产级的文档协作平台。

## 📋 目录

- [部署前准备](#部署前准备)
- [快速开始](#快速开始)
- [Docker 部署](#docker-部署)
- [手动部署](#手动部署)
- [云平台部署](#云平台部署)
- [Kubernetes 部署](#kubernetes-部署)
- [反向代理配置](#反向代理配置)
- [SSL/HTTPS 配置](#sslhttps-配置)
- [数据库配置](#数据库配置)
- [存储配置](#存储配置)
- [邮件配置](#邮件配置)
- [性能优化](#性能优化)
- [备份与恢复](#备份与恢复)
- [监控与日志](#监控与日志)
- [故障排查](#故障排查)
- [升级指南](#升级指南)

---

## 部署前准备

### 系统要求

**最低配置**：
- CPU: 2 核心
- 内存: 4GB RAM
- 存储: 20GB 可用空间
- 操作系统: Linux (Ubuntu 20.04+, CentOS 8+, Debian 11+)

**推荐配置**：
- CPU: 4 核心
- 内存: 8GB RAM
- 存储: 50GB+ SSD
- 操作系统: Ubuntu 22.04 LTS

**支持的数据库**：
- PostgreSQL 14+ (推荐 16)

**支持的缓存**：
- Redis 7.0+


### 必需的软件

根据部署方式，您需要安装：

**Docker 部署**：
- Docker 20.10+
- Docker Compose 2.0+

**手动部署**：
- Node.js 22.x
- pnpm 10.4.0
- PostgreSQL 16
- Redis 7.2
- Nginx (可选，用于反向代理)

### 域名和 SSL 证书

**生产环境建议**：
- 准备一个域名（如 `docs.example.com`）
- 配置 DNS A 记录指向服务器 IP
- 准备 SSL 证书（推荐使用 Let's Encrypt）

### 端口要求

确保以下端口可用：
- `3000` - NoteDoc 应用端口
- `5432` - PostgreSQL 数据库端口（如果外部访问）
- `6379` - Redis 端口（如果外部访问）
- `80` - HTTP（用于 Let's Encrypt 验证）
- `443` - HTTPS

---

## 快速开始

### 5 分钟快速部署

使用 Docker Compose 是最快的部署方式：

```bash
# 1. 创建项目目录
mkdir notedoc && cd notedoc

# 2. 下载 docker-compose.yml
curl -O https://raw.githubusercontent.com/notedoc/notedoc/main/docker-compose.yml

# 3. 生成安全密钥
openssl rand -hex 32

# 4. 编辑配置文件
nano docker-compose.yml
# 修改以下内容：
# - APP_URL: 改为你的域名
# - APP_SECRET: 粘贴刚才生成的密钥
# - POSTGRES_PASSWORD: 设置强密码

# 5. 启动服务
docker-compose up -d

# 6. 查看日志
docker-compose logs -f notedoc

# 7. 访问应用
# 打开浏览器访问 http://localhost:3000
```

**首次访问**：
1. 创建管理员账户
2. 设置工作空间名称
3. 开始使用！

---

## Docker 部署

### 标准 Docker Compose 部署

#### 步骤 1: 准备配置文件

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  notedoc:
    image: notedoc/notedoc:latest
    container_name: notedoc
    depends_on:
      - db
      - redis
    environment:
      # 应用配置
      APP_URL: 'https://docs.example.com'
      APP_SECRET: '你的32位以上随机字符串'
      
      # 数据库配置
      DATABASE_URL: 'postgresql://notedoc:强密码@db:5432/notedoc?schema=public'
      
      # Redis 配置
      REDIS_URL: 'redis://redis:6379'
      
      # 邮件配置（可选）
      MAIL_DRIVER: 'smtp'
      MAIL_FROM_ADDRESS: 'noreply@example.com'
      MAIL_FROM_NAME: 'NoteDoc'
      SMTP_HOST: 'smtp.gmail.com'
      SMTP_PORT: '587'
      SMTP_USERNAME: 'your-email@gmail.com'
      SMTP_PASSWORD: 'your-app-password'
      SMTP_SECURE: 'false'
      
      # 存储配置（可选）
      STORAGE_DRIVER: 'local'
      FILE_UPLOAD_SIZE_LIMIT: '50mb'
      
      # 其他配置
      DISABLE_TELEMETRY: 'false'
      
    ports:
      - "3000:3000"
    restart: unless-stopped
    volumes:
      - notedoc_data:/app/data/storage
    networks:
      - notedoc_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    image: postgres:16-alpine
    container_name: notedoc_db
    environment:
      POSTGRES_DB: notedoc
      POSTGRES_USER: notedoc
      POSTGRES_PASSWORD: 强密码
      POSTGRES_INITDB_ARGS: '-E UTF8 --locale=C'
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - notedoc_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U notedoc"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7.2-alpine
    container_name: notedoc_redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - notedoc_network
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  notedoc_data:
    driver: local
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  notedoc_network:
    driver: bridge
```

#### 步骤 2: 生成安全密钥

```bash
# 生成 APP_SECRET
openssl rand -hex 32

# 或使用 Python
python3 -c "import secrets; print(secrets.token_hex(32))"

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 步骤 3: 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 只查看 notedoc 日志
docker-compose logs -f notedoc
```

#### 步骤 4: 验证部署

```bash
# 检查容器健康状态
docker-compose ps

# 应该看到类似输出：
# NAME              STATUS                    PORTS
# notedoc           Up (healthy)              0.0.0.0:3000->3000/tcp
# notedoc_db        Up (healthy)              5432/tcp
# notedoc_redis     Up (healthy)              6379/tcp

# 测试应用响应
curl http://localhost:3000/health

# 应该返回: {"status":"ok"}
```


### Docker 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose stop

# 重启服务
docker-compose restart

# 停止并删除容器
docker-compose down

# 停止并删除容器和数据卷（⚠️ 会删除所有数据）
docker-compose down -v

# 查看日志
docker-compose logs -f [service_name]

# 进入容器
docker-compose exec notedoc sh

# 查看资源使用
docker stats

# 更新镜像
docker-compose pull
docker-compose up -d

# 备份数据卷
docker run --rm -v notedoc_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

### 使用环境变量文件

创建 `.env` 文件：

```bash
# .env
APP_URL=https://docs.example.com
APP_SECRET=你的32位以上随机字符串
DATABASE_URL=postgresql://notedoc:强密码@db:5432/notedoc?schema=public
REDIS_URL=redis://redis:6379

# 邮件配置
MAIL_DRIVER=smtp
MAIL_FROM_ADDRESS=noreply@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

修改 `docker-compose.yml`：

```yaml
services:
  notedoc:
    image: notedoc/notedoc:latest
    env_file:
      - .env
    # ... 其他配置
```

---

## 手动部署

### 适用场景

- 需要完全控制部署环境
- 已有 PostgreSQL 和 Redis 服务
- 需要自定义构建
- 开发和测试环境

### 步骤 1: 安装依赖

#### Ubuntu/Debian

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 pnpm
npm install -g pnpm@10.4.0

# 安装 PostgreSQL 16
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16

# 安装 Redis
sudo apt install -y redis-server

# 验证安装
node --version    # 应该显示 v22.x.x
pnpm --version    # 应该显示 10.4.0
psql --version    # 应该显示 16.x
redis-cli --version
```

#### CentOS/RHEL

```bash
# 安装 Node.js 22
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo yum install -y nodejs

# 安装 pnpm
npm install -g pnpm@10.4.0

# 安装 PostgreSQL 16
sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo yum install -y postgresql16-server
sudo /usr/pgsql-16/bin/postgresql-16-setup initdb
sudo systemctl enable postgresql-16
sudo systemctl start postgresql-16

# 安装 Redis
sudo yum install -y redis
sudo systemctl enable redis
sudo systemctl start redis
```

### 步骤 2: 配置数据库

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 在 PostgreSQL 中执行：
CREATE DATABASE notedoc;
CREATE USER notedoc WITH ENCRYPTED PASSWORD '强密码';
GRANT ALL PRIVILEGES ON DATABASE notedoc TO notedoc;

# 退出
\q
```

配置 PostgreSQL 允许本地连接：

```bash
# 编辑 pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf

# 添加或修改以下行：
# local   all             notedoc                                 md5
# host    all             notedoc         127.0.0.1/32            md5

# 重启 PostgreSQL
sudo systemctl restart postgresql
```

### 步骤 3: 克隆和构建项目

```bash
# 创建应用目录
sudo mkdir -p /opt/notedoc
sudo chown $USER:$USER /opt/notedoc
cd /opt/notedoc

# 克隆仓库
git clone https://github.com/notedoc/notedoc.git .

# 或下载特定版本
# wget https://github.com/notedoc/notedoc/archive/refs/tags/v0.23.2.tar.gz
# tar -xzf v0.23.2.tar.gz
# cd notedoc-0.23.2

# 安装依赖
pnpm install --frozen-lockfile

# 构建项目
pnpm build
```

### 步骤 4: 配置环境变量

```bash
# 创建 .env 文件
cp .env.example .env
nano .env
```

编辑 `.env` 文件：

```bash
# 应用配置
APP_URL=https://docs.example.com
PORT=3000
APP_SECRET=你的32位以上随机字符串
JWT_TOKEN_EXPIRES_IN=30d

# 数据库配置
DATABASE_URL="postgresql://notedoc:强密码@localhost:5432/notedoc?schema=public"

# Redis 配置
REDIS_URL=redis://127.0.0.1:6379

# 存储配置
STORAGE_DRIVER=local
FILE_UPLOAD_SIZE_LIMIT=50mb

# 邮件配置
MAIL_DRIVER=smtp
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME=NoteDoc
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=false

# 其他配置
DISABLE_TELEMETRY=false
DEBUG_MODE=false
```

### 步骤 5: 运行数据库迁移

```bash
# 进入 server 目录
cd apps/server

# 运行迁移
pnpm migration:up

# 返回根目录
cd ../..
```

### 步骤 6: 启动应用

```bash
# 生产模式启动
pnpm start

# 或使用 PM2 管理进程（推荐）
npm install -g pm2

# 创建 PM2 配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'notedoc',
      script: 'pnpm',
      args: 'start',
      cwd: '/opt/notedoc',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/notedoc/error.log',
      out_file: '/var/log/notedoc/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOF

# 创建日志目录
sudo mkdir -p /var/log/notedoc
sudo chown $USER:$USER /var/log/notedoc

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs notedoc
```


### 创建系统服务

如果不使用 PM2，可以创建 systemd 服务：

```bash
# 创建服务文件
sudo nano /etc/systemd/system/notedoc.service
```

添加以下内容：

```ini
[Unit]
Description=NoteDoc Documentation Platform
After=network.target postgresql.service redis.service
Wants=postgresql.service redis.service

[Service]
Type=simple
User=notedoc
Group=notedoc
WorkingDirectory=/opt/notedoc
Environment="NODE_ENV=production"
EnvironmentFile=/opt/notedoc/.env
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=notedoc

# 安全设置
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/notedoc/data

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
# 创建 notedoc 用户
sudo useradd -r -s /bin/false notedoc
sudo chown -R notedoc:notedoc /opt/notedoc

# 重载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start notedoc

# 设置开机自启
sudo systemctl enable notedoc

# 查看状态
sudo systemctl status notedoc

# 查看日志
sudo journalctl -u notedoc -f
```

---

## 云平台部署

### AWS 部署

#### 使用 EC2 + RDS + ElastiCache

**步骤 1: 创建 RDS PostgreSQL 实例**

```bash
# 使用 AWS CLI 创建
aws rds create-db-instance \
  --db-instance-identifier notedoc-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 16.1 \
  --master-username notedoc \
  --master-user-password 强密码 \
  --allocated-storage 20 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name my-subnet-group \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00"
```

**步骤 2: 创建 ElastiCache Redis**

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id notedoc-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name my-subnet-group \
  --security-group-ids sg-xxxxx
```

**步骤 3: 启动 EC2 实例**

```bash
# 使用 Ubuntu 22.04 AMI
aws ec2 run-instances \
  --image-id ami-xxxxx \
  --instance-type t3.medium \
  --key-name my-key \
  --security-group-ids sg-xxxxx \
  --subnet-id subnet-xxxxx \
  --user-data file://user-data.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=NoteDoc}]'
```

**user-data.sh** 内容：

```bash
#!/bin/bash
set -e

# 更新系统
apt update && apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 创建应用目录
mkdir -p /opt/notedoc
cd /opt/notedoc

# 创建 docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  notedoc:
    image: notedoc/notedoc:latest
    environment:
      APP_URL: 'https://docs.example.com'
      APP_SECRET: '${APP_SECRET}'
      DATABASE_URL: '${DATABASE_URL}'
      REDIS_URL: '${REDIS_URL}'
      STORAGE_DRIVER: 's3'
      AWS_S3_REGION: 'us-east-1'
      AWS_S3_BUCKET: 'notedoc-storage'
    ports:
      - "3000:3000"
    restart: unless-stopped
EOF

# 创建 .env 文件
cat > .env << 'EOF'
APP_SECRET=你的密钥
DATABASE_URL=postgresql://notedoc:密码@rds-endpoint:5432/notedoc
REDIS_URL=redis://elasticache-endpoint:6379
EOF

# 启动服务
docker-compose up -d

# 配置日志轮转
cat > /etc/logrotate.d/notedoc << 'EOF'
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  missingok
  delaycompress
  copytruncate
}
EOF
```

**步骤 4: 配置 S3 存储**

```bash
# 创建 S3 存储桶
aws s3 mb s3://notedoc-storage --region us-east-1

# 配置 CORS
cat > cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://docs.example.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors \
  --bucket notedoc-storage \
  --cors-configuration file://cors.json

# 创建 IAM 策略
cat > s3-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::notedoc-storage",
        "arn:aws:s3:::notedoc-storage/*"
      ]
    }
  ]
}
EOF

aws iam create-policy \
  --policy-name NoteDocS3Access \
  --policy-document file://s3-policy.json
```

### Google Cloud Platform 部署

#### 使用 Cloud Run + Cloud SQL + Memorystore

**步骤 1: 创建 Cloud SQL 实例**

```bash
gcloud sql instances create notedoc-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=强密码

# 创建数据库
gcloud sql databases create notedoc --instance=notedoc-db

# 创建用户
gcloud sql users create notedoc \
  --instance=notedoc-db \
  --password=强密码
```

**步骤 2: 创建 Memorystore Redis**

```bash
gcloud redis instances create notedoc-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0
```

**步骤 3: 构建并推送镜像**

```bash
# 启用 API
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# 构建镜像
gcloud builds submit --tag gcr.io/PROJECT_ID/notedoc

# 或使用 Artifact Registry
gcloud builds submit --tag us-central1-docker.pkg.dev/PROJECT_ID/notedoc/app
```

**步骤 4: 部署到 Cloud Run**

```bash
gcloud run deploy notedoc \
  --image gcr.io/PROJECT_ID/notedoc \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "APP_URL=https://docs.example.com" \
  --set-env-vars "APP_SECRET=你的密钥" \
  --set-env-vars "DATABASE_URL=postgresql://notedoc:密码@/notedoc?host=/cloudsql/PROJECT_ID:us-central1:notedoc-db" \
  --set-env-vars "REDIS_URL=redis://REDIS_IP:6379" \
  --add-cloudsql-instances PROJECT_ID:us-central1:notedoc-db \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 10
```


### Azure 部署

#### 使用 App Service + Azure Database for PostgreSQL

**步骤 1: 创建资源组**

```bash
az group create \
  --name notedoc-rg \
  --location eastus
```

**步骤 2: 创建 PostgreSQL 数据库**

```bash
az postgres flexible-server create \
  --resource-group notedoc-rg \
  --name notedoc-db \
  --location eastus \
  --admin-user notedoc \
  --admin-password 强密码 \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --storage-size 32

# 创建数据库
az postgres flexible-server db create \
  --resource-group notedoc-rg \
  --server-name notedoc-db \
  --database-name notedoc
```

**步骤 3: 创建 Redis Cache**

```bash
az redis create \
  --resource-group notedoc-rg \
  --name notedoc-redis \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

**步骤 4: 创建 App Service**

```bash
# 创建 App Service Plan
az appservice plan create \
  --name notedoc-plan \
  --resource-group notedoc-rg \
  --is-linux \
  --sku B2

# 创建 Web App
az webapp create \
  --resource-group notedoc-rg \
  --plan notedoc-plan \
  --name notedoc-app \
  --deployment-container-image-name notedoc/notedoc:latest

# 配置环境变量
az webapp config appsettings set \
  --resource-group notedoc-rg \
  --name notedoc-app \
  --settings \
    APP_URL="https://notedoc-app.azurewebsites.net" \
    APP_SECRET="你的密钥" \
    DATABASE_URL="postgresql://notedoc:密码@notedoc-db.postgres.database.azure.com:5432/notedoc" \
    REDIS_URL="redis://notedoc-redis.redis.cache.windows.net:6379"
```

---

## Kubernetes 部署

### 使用 Helm Chart

**步骤 1: 创建命名空间**

```bash
kubectl create namespace notedoc
```

**步骤 2: 创建 Secrets**

```bash
# 创建数据库密码
kubectl create secret generic notedoc-db-secret \
  --from-literal=password=强密码 \
  -n notedoc

# 创建应用密钥
kubectl create secret generic notedoc-app-secret \
  --from-literal=app-secret=$(openssl rand -hex 32) \
  -n notedoc
```

**步骤 3: 创建 ConfigMap**

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: notedoc-config
  namespace: notedoc
data:
  APP_URL: "https://docs.example.com"
  DATABASE_URL: "postgresql://notedoc:PASSWORD@notedoc-postgresql:5432/notedoc"
  REDIS_URL: "redis://notedoc-redis:6379"
  STORAGE_DRIVER: "local"
  MAIL_DRIVER: "smtp"
  MAIL_FROM_ADDRESS: "noreply@example.com"
```

```bash
kubectl apply -f configmap.yaml
```

**步骤 4: 部署 PostgreSQL**

```yaml
# postgresql.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: notedoc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notedoc-postgresql
  namespace: notedoc
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgresql
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
      - name: postgresql
        image: postgres:16-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: notedoc
        - name: POSTGRES_USER
          value: notedoc
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: notedoc-db-secret
              key: password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: notedoc-postgresql
  namespace: notedoc
spec:
  selector:
    app: postgresql
  ports:
  - port: 5432
    targetPort: 5432
```

```bash
kubectl apply -f postgresql.yaml
```

**步骤 5: 部署 Redis**

```yaml
# redis.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notedoc-redis
  namespace: notedoc
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7.2-alpine
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: notedoc-redis
  namespace: notedoc
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
```

```bash
kubectl apply -f redis.yaml
```

**步骤 6: 部署 NoteDoc**

```yaml
# notedoc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: notedoc-storage-pvc
  namespace: notedoc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notedoc
  namespace: notedoc
spec:
  replicas: 2
  selector:
    matchLabels:
      app: notedoc
  template:
    metadata:
      labels:
        app: notedoc
    spec:
      containers:
      - name: notedoc
        image: notedoc/notedoc:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: notedoc-config
        env:
        - name: APP_SECRET
          valueFrom:
            secretKeyRef:
              name: notedoc-app-secret
              key: app-secret
        - name: DATABASE_URL
          value: "postgresql://notedoc:$(DB_PASSWORD)@notedoc-postgresql:5432/notedoc"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: notedoc-db-secret
              key: password
        volumeMounts:
        - name: storage
          mountPath: /app/data/storage
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
      volumes:
      - name: storage
        persistentVolumeClaim:
          claimName: notedoc-storage-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: notedoc
  namespace: notedoc
spec:
  selector:
    app: notedoc
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

```bash
kubectl apply -f notedoc.yaml
```

**步骤 7: 配置 Ingress**

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: notedoc-ingress
  namespace: notedoc
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - docs.example.com
    secretName: notedoc-tls
  rules:
  - host: docs.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: notedoc
            port:
              number: 80
```

```bash
kubectl apply -f ingress.yaml
```

**步骤 8: 验证部署**

```bash
# 查看所有资源
kubectl get all -n notedoc

# 查看 Pod 状态
kubectl get pods -n notedoc

# 查看日志
kubectl logs -f deployment/notedoc -n notedoc

# 查看服务
kubectl get svc -n notedoc

# 获取外部 IP
kubectl get ingress -n notedoc
```


---

## 反向代理配置

### Nginx 配置

#### 基础配置

```nginx
# /etc/nginx/sites-available/notedoc
server {
    listen 80;
    server_name docs.example.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name docs.example.com;
    
    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/docs.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/docs.example.com/privkey.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 文件上传大小限制
    client_max_body_size 50M;
    
    # 代理配置
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲设置
        proxy_buffering off;
        proxy_request_buffering off;
    }
    
    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 健康检查
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

启用配置：

```bash
# 测试配置
sudo nginx -t

# 创建软链接
sudo ln -s /etc/nginx/sites-available/notedoc /etc/nginx/sites-enabled/

# 重载 Nginx
sudo systemctl reload nginx
```

#### 负载均衡配置

```nginx
# /etc/nginx/conf.d/notedoc-upstream.conf
upstream notedoc_backend {
    least_conn;
    
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3002 max_fails=3 fail_timeout=30s;
    
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name docs.example.com;
    
    # ... SSL 配置 ...
    
    location / {
        proxy_pass http://notedoc_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # ... 其他代理配置 ...
    }
}
```

### Caddy 配置

```caddyfile
# Caddyfile
docs.example.com {
    # 自动 HTTPS
    
    # 反向代理
    reverse_proxy localhost:3000 {
        # 健康检查
        health_uri /health
        health_interval 10s
        health_timeout 5s
        
        # 头部设置
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
    
    # 文件上传大小
    request_body {
        max_size 50MB
    }
    
    # 日志
    log {
        output file /var/log/caddy/notedoc.log
        format json
    }
}
```

启动 Caddy：

```bash
# 安装 Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# 启动服务
sudo systemctl enable caddy
sudo systemctl start caddy
```

### Traefik 配置

```yaml
# docker-compose.yml with Traefik
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=admin@example.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
    networks:
      - notedoc_network

  notedoc:
    image: notedoc/notedoc:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.notedoc.rule=Host(`docs.example.com`)"
      - "traefik.http.routers.notedoc.entrypoints=websecure"
      - "traefik.http.routers.notedoc.tls.certresolver=myresolver"
      - "traefik.http.services.notedoc.loadbalancer.server.port=3000"
    # ... 其他配置 ...
```

---

## SSL/HTTPS 配置

### 使用 Let's Encrypt

#### Certbot 自动配置

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书（Nginx）
sudo certbot --nginx -d docs.example.com

# 或手动获取证书
sudo certbot certonly --standalone -d docs.example.com

# 自动续期
sudo certbot renew --dry-run

# 设置自动续期定时任务
sudo crontab -e
# 添加：
# 0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

#### 手动配置 SSL

```bash
# 生成证书
sudo certbot certonly --standalone \
  -d docs.example.com \
  --email admin@example.com \
  --agree-tos \
  --no-eff-email

# 证书位置：
# /etc/letsencrypt/live/docs.example.com/fullchain.pem
# /etc/letsencrypt/live/docs.example.com/privkey.pem
```

### 使用自签名证书（仅用于测试）

```bash
# 生成自签名证书
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/notedoc-selfsigned.key \
  -out /etc/ssl/certs/notedoc-selfsigned.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=docs.example.com"

# 在 Nginx 中使用
ssl_certificate /etc/ssl/certs/notedoc-selfsigned.crt;
ssl_certificate_key /etc/ssl/private/notedoc-selfsigned.key;
```


---

## 数据库配置

### PostgreSQL 优化

#### 性能调优

编辑 `/etc/postgresql/16/main/postgresql.conf`：

```ini
# 内存设置（根据服务器内存调整）
shared_buffers = 256MB              # 25% of RAM
effective_cache_size = 1GB          # 50-75% of RAM
maintenance_work_mem = 64MB
work_mem = 16MB

# 连接设置
max_connections = 100
superuser_reserved_connections = 3

# WAL 设置
wal_buffers = 16MB
checkpoint_completion_target = 0.9
max_wal_size = 1GB
min_wal_size = 80MB

# 查询优化
random_page_cost = 1.1              # SSD 使用 1.1，HDD 使用 4.0
effective_io_concurrency = 200      # SSD 使用 200，HDD 使用 2

# 日志设置
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_timezone = 'UTC'

# 自动清理
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 1min
```

重启 PostgreSQL：

```bash
sudo systemctl restart postgresql
```

#### 备份配置

**自动备份脚本**：

```bash
#!/bin/bash
# /opt/scripts/backup-postgres.sh

BACKUP_DIR="/backup/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="notedoc"
DB_USER="notedoc"
RETENTION_DAYS=7

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/notedoc_$DATE.sql.gz

# 删除旧备份
find $BACKUP_DIR -name "notedoc_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# 记录日志
echo "$(date): Backup completed - notedoc_$DATE.sql.gz" >> $BACKUP_DIR/backup.log
```

设置定时任务：

```bash
# 添加到 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /opt/scripts/backup-postgres.sh
```

#### 主从复制

**主服务器配置**：

```ini
# postgresql.conf
wal_level = replica
max_wal_senders = 3
wal_keep_size = 64MB
```

```bash
# pg_hba.conf
host    replication     replicator      从服务器IP/32      md5
```

```bash
# 创建复制用户
sudo -u postgres psql
CREATE USER replicator REPLICATION LOGIN ENCRYPTED PASSWORD '密码';
```

**从服务器配置**：

```bash
# 停止从服务器
sudo systemctl stop postgresql

# 清空数据目录
sudo rm -rf /var/lib/postgresql/16/main/*

# 从主服务器复制数据
sudo -u postgres pg_basebackup -h 主服务器IP -D /var/lib/postgresql/16/main -U replicator -P -v -R

# 启动从服务器
sudo systemctl start postgresql
```

### Redis 优化

#### 配置文件优化

编辑 `/etc/redis/redis.conf`：

```ini
# 内存设置
maxmemory 256mb
maxmemory-policy allkeys-lru

# 持久化
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

# 网络
timeout 300
tcp-keepalive 60

# 日志
loglevel notice
logfile /var/log/redis/redis-server.log

# 安全
requirepass 强密码
```

重启 Redis：

```bash
sudo systemctl restart redis
```

#### Redis 集群（高可用）

**使用 Redis Sentinel**：

```bash
# sentinel.conf
port 26379
sentinel monitor notedoc-redis 127.0.0.1 6379 2
sentinel auth-pass notedoc-redis 强密码
sentinel down-after-milliseconds notedoc-redis 5000
sentinel parallel-syncs notedoc-redis 1
sentinel failover-timeout notedoc-redis 10000
```

启动 Sentinel：

```bash
redis-sentinel /etc/redis/sentinel.conf
```

---

## 存储配置

### 本地存储

默认配置，文件存储在 `/app/data/storage`：

```bash
# .env
STORAGE_DRIVER=local
```

**挂载外部存储**：

```yaml
# docker-compose.yml
volumes:
  - /mnt/storage:/app/data/storage
```

### S3 兼容存储

#### AWS S3

```bash
# .env
STORAGE_DRIVER=s3
AWS_S3_ACCESS_KEY_ID=你的访问密钥
AWS_S3_SECRET_ACCESS_KEY=你的密钥
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=notedoc-storage
```

#### MinIO

```bash
# 部署 MinIO
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=强密码" \
  -v /mnt/minio/data:/data \
  minio/minio server /data --console-address ":9001"

# NoteDoc 配置
STORAGE_DRIVER=s3
AWS_S3_ACCESS_KEY_ID=admin
AWS_S3_SECRET_ACCESS_KEY=强密码
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=notedoc
AWS_S3_ENDPOINT=http://minio:9000
AWS_S3_FORCE_PATH_STYLE=true
```

#### 阿里云 OSS

```bash
STORAGE_DRIVER=s3
AWS_S3_ACCESS_KEY_ID=你的AccessKeyId
AWS_S3_SECRET_ACCESS_KEY=你的AccessKeySecret
AWS_S3_REGION=oss-cn-hangzhou
AWS_S3_BUCKET=notedoc-storage
AWS_S3_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
```

#### 腾讯云 COS

```bash
STORAGE_DRIVER=s3
AWS_S3_ACCESS_KEY_ID=你的SecretId
AWS_S3_SECRET_ACCESS_KEY=你的SecretKey
AWS_S3_REGION=ap-guangzhou
AWS_S3_BUCKET=notedoc-1234567890
AWS_S3_ENDPOINT=https://cos.ap-guangzhou.myqcloud.com
```

---

## 邮件配置

### SMTP 配置

#### Gmail

```bash
# .env
MAIL_DRIVER=smtp
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME=NoteDoc
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=你的应用专用密码
SMTP_SECURE=false
```

**获取 Gmail 应用专用密码**：
1. 访问 https://myaccount.google.com/security
2. 启用两步验证
3. 生成应用专用密码

#### Outlook/Office 365

```bash
MAIL_DRIVER=smtp
MAIL_FROM_ADDRESS=your-email@outlook.com
MAIL_FROM_NAME=NoteDoc
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=你的密码
SMTP_SECURE=false
```

#### 自建邮件服务器

```bash
MAIL_DRIVER=smtp
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME=NoteDoc
SMTP_HOST=mail.example.com
SMTP_PORT=587
SMTP_USERNAME=noreply@example.com
SMTP_PASSWORD=密码
SMTP_SECURE=false
SMTP_IGNORETLS=false
```

### Postmark

```bash
MAIL_DRIVER=postmark
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME=NoteDoc
POSTMARK_TOKEN=你的Postmark令牌
```

### SendGrid

虽然不直接支持，但可以通过 SMTP 使用：

```bash
MAIL_DRIVER=smtp
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME=NoteDoc
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=你的SendGrid_API密钥
SMTP_SECURE=false
```

### 测试邮件配置

```bash
# 进入容器
docker-compose exec notedoc sh

# 或在服务器上
cd /opt/notedoc

# 测试邮件发送（需要实现测试脚本）
# 注册新用户会触发欢迎邮件
```


---

## 性能优化

### 应用层优化

#### 环境变量优化

```bash
# .env
# Node.js 性能
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=2048"

# 启用生产模式优化
DEBUG_MODE=false
```

#### PM2 集群模式

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'notedoc',
    script: 'pnpm',
    args: 'start',
    instances: 'max',  // 使用所有 CPU 核心
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### 数据库优化

#### 索引优化

```sql
-- 检查缺失的索引
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;

-- 创建常用查询的索引
CREATE INDEX CONCURRENTLY idx_pages_workspace_id ON pages(workspace_id);
CREATE INDEX CONCURRENTLY idx_pages_created_at ON pages(created_at DESC);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- 分析表统计信息
ANALYZE pages;
ANALYZE users;
ANALYZE workspaces;
```

#### 连接池配置

```bash
# .env
DATABASE_URL="postgresql://notedoc:密码@localhost:5432/notedoc?schema=public&connection_limit=20&pool_timeout=10"
```

#### 查询性能监控

```sql
-- 启用慢查询日志
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- 记录超过 1 秒的查询
SELECT pg_reload_conf();

-- 查看慢查询
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Redis 优化

#### 内存优化

```bash
# redis.conf
# 使用 LRU 策略
maxmemory-policy allkeys-lru

# 启用内存压缩
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
set-max-intset-entries 512
```

#### 持久化优化

```bash
# 根据需求选择持久化策略

# 方案 1: 高性能，可能丢失少量数据
save ""
appendonly no

# 方案 2: 平衡性能和数据安全
save 900 1
save 300 10
appendonly yes
appendfsync everysec

# 方案 3: 最大数据安全，性能较低
save 60 1
appendonly yes
appendfsync always
```

### Nginx 优化

```nginx
# nginx.conf
user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # 基础优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # 缓冲区设置
    client_body_buffer_size 128k;
    client_max_body_size 50m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 16k;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
    
    # 缓存设置
    open_file_cache max=10000 inactive=30s;
    open_file_cache_valid 60s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
    
    # 日志优化
    access_log /var/log/nginx/access.log combined buffer=32k flush=5s;
    error_log /var/log/nginx/error.log warn;
}
```

### CDN 配置

#### Cloudflare

1. 添加域名到 Cloudflare
2. 更新 DNS 记录
3. 启用以下功能：
   - Auto Minify (JS, CSS, HTML)
   - Brotli 压缩
   - HTTP/2
   - HTTP/3 (QUIC)

**Page Rules**：

```
docs.example.com/*
- Cache Level: Standard
- Browser Cache TTL: 4 hours
- Edge Cache TTL: 1 day
```

#### 自建 CDN（使用 Nginx）

```nginx
# CDN 节点配置
server {
    listen 80;
    server_name cdn.example.com;
    
    location / {
        proxy_pass https://docs.example.com;
        proxy_cache my_cache;
        proxy_cache_valid 200 1d;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_lock on;
        
        add_header X-Cache-Status $upstream_cache_status;
    }
}

# 缓存配置
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g 
                 inactive=60m use_temp_path=off;
```

---

## 备份与恢复

### 自动备份脚本

```bash
#!/bin/bash
# /opt/scripts/backup-notedoc.sh

set -e

# 配置
BACKUP_DIR="/backup/notedoc"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# 数据库配置
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="notedoc"
DB_USER="notedoc"
DB_PASSWORD="密码"

# 创建备份目录
mkdir -p $BACKUP_DIR/{database,storage}

echo "$(date): Starting backup..."

# 1. 备份数据库
echo "Backing up database..."
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME | \
    gzip > $BACKUP_DIR/database/notedoc_db_$DATE.sql.gz

# 2. 备份文件存储
echo "Backing up storage..."
if [ -d "/app/data/storage" ]; then
    tar czf $BACKUP_DIR/storage/notedoc_storage_$DATE.tar.gz -C /app/data storage/
elif [ -d "/opt/notedoc/data/storage" ]; then
    tar czf $BACKUP_DIR/storage/notedoc_storage_$DATE.tar.gz -C /opt/notedoc/data storage/
fi

# 3. 备份配置文件
echo "Backing up configuration..."
mkdir -p $BACKUP_DIR/config
cp /opt/notedoc/.env $BACKUP_DIR/config/.env_$DATE 2>/dev/null || true
cp /opt/notedoc/docker-compose.yml $BACKUP_DIR/config/docker-compose_$DATE.yml 2>/dev/null || true

# 4. 创建备份清单
cat > $BACKUP_DIR/backup_$DATE.txt << EOF
Backup Date: $(date)
Database: notedoc_db_$DATE.sql.gz
Storage: notedoc_storage_$DATE.tar.gz
Config: .env_$DATE, docker-compose_$DATE.yml
EOF

# 5. 删除旧备份
echo "Cleaning old backups..."
find $BACKUP_DIR/database -name "notedoc_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR/storage -name "notedoc_storage_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR/config -name "*_*" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "backup_*.txt" -mtime +$RETENTION_DAYS -delete

# 6. 上传到远程存储（可选）
# aws s3 sync $BACKUP_DIR s3://my-backup-bucket/notedoc/

echo "$(date): Backup completed successfully!"
echo "Backup location: $BACKUP_DIR"
```

设置定时任务：

```bash
# 添加执行权限
chmod +x /opt/scripts/backup-notedoc.sh

# 添加到 crontab
crontab -e

# 每天凌晨 2 点执行备份
0 2 * * * /opt/scripts/backup-notedoc.sh >> /var/log/notedoc-backup.log 2>&1
```

### 恢复数据

#### 恢复数据库

```bash
#!/bin/bash
# restore-database.sh

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    exit 1
fi

# 停止应用
docker-compose stop notedoc

# 恢复数据库
gunzip < $BACKUP_FILE | docker-compose exec -T db psql -U notedoc -d notedoc

# 或手动恢复
# gunzip < $BACKUP_FILE | psql -U notedoc -d notedoc

# 启动应用
docker-compose start notedoc

echo "Database restored successfully!"
```

#### 恢复文件存储

```bash
#!/bin/bash
# restore-storage.sh

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    exit 1
fi

# 停止应用
docker-compose stop notedoc

# 备份当前数据
mv /app/data/storage /app/data/storage.old

# 恢复文件
tar xzf $BACKUP_FILE -C /app/data/

# 设置权限
chown -R node:node /app/data/storage

# 启动应用
docker-compose start notedoc

echo "Storage restored successfully!"
```

### 灾难恢复计划

**完整恢复步骤**：

```bash
#!/bin/bash
# disaster-recovery.sh

# 1. 安装必要软件
apt update
apt install -y docker.io docker-compose postgresql-client

# 2. 恢复配置文件
mkdir -p /opt/notedoc
cd /opt/notedoc
# 从备份恢复 docker-compose.yml 和 .env

# 3. 启动数据库和 Redis
docker-compose up -d db redis
sleep 10

# 4. 恢复数据库
gunzip < /backup/notedoc_db_latest.sql.gz | \
    docker-compose exec -T db psql -U notedoc -d notedoc

# 5. 恢复文件存储
tar xzf /backup/notedoc_storage_latest.tar.gz -C /

# 6. 启动应用
docker-compose up -d notedoc

# 7. 验证
sleep 5
curl http://localhost:3000/health

echo "Disaster recovery completed!"
```


---

## 监控与日志

### 应用监控

#### 使用 Prometheus + Grafana

**docker-compose.yml 添加监控服务**：

```yaml
services:
  # ... 现有服务 ...
  
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    ports:
      - "9090:9090"
    networks:
      - notedoc_network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - "3001:3000"
    networks:
      - notedoc_network
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    command:
      - '--path.rootfs=/host'
    pid: host
    restart: unless-stopped
    volumes:
      - '/:/host:ro,rslave'
    networks:
      - notedoc_network

  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: postgres-exporter
    environment:
      DATA_SOURCE_NAME: "postgresql://notedoc:密码@db:5432/notedoc?sslmode=disable"
    ports:
      - "9187:9187"
    networks:
      - notedoc_network
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
```

**prometheus.yml**：

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'notedoc'
    static_configs:
      - targets: ['notedoc:3000']
    metrics_path: '/metrics'
```

#### 健康检查脚本

```bash
#!/bin/bash
# /opt/scripts/health-check.sh

# 配置
APP_URL="http://localhost:3000"
ALERT_EMAIL="admin@example.com"
LOG_FILE="/var/log/notedoc-health.log"

# 检查应用
check_app() {
    response=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL/health)
    if [ "$response" != "200" ]; then
        echo "$(date): Application health check failed (HTTP $response)" >> $LOG_FILE
        send_alert "NoteDoc application is down!"
        return 1
    fi
    return 0
}

# 检查数据库
check_database() {
    if ! docker-compose exec -T db pg_isready -U notedoc > /dev/null 2>&1; then
        echo "$(date): Database health check failed" >> $LOG_FILE
        send_alert "NoteDoc database is down!"
        return 1
    fi
    return 0
}

# 检查 Redis
check_redis() {
    if ! docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo "$(date): Redis health check failed" >> $LOG_FILE
        send_alert "NoteDoc Redis is down!"
        return 1
    fi
    return 0
}

# 检查磁盘空间
check_disk() {
    usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$usage" -gt 80 ]; then
        echo "$(date): Disk usage is high: ${usage}%" >> $LOG_FILE
        send_alert "Disk usage is ${usage}%"
        return 1
    fi
    return 0
}

# 发送告警
send_alert() {
    message="$1"
    echo "$message" | mail -s "NoteDoc Alert" $ALERT_EMAIL
}

# 执行检查
check_app
check_database
check_redis
check_disk

echo "$(date): Health check completed" >> $LOG_FILE
```

设置定时检查：

```bash
# 每 5 分钟检查一次
*/5 * * * * /opt/scripts/health-check.sh
```

### 日志管理

#### 集中式日志（ELK Stack）

**docker-compose.yml 添加 ELK**：

```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - notedoc_network

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: logstash
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
    networks:
      - notedoc_network
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    networks:
      - notedoc_network
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

**logstash.conf**：

```
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  if [type] == "notedoc" {
    json {
      source => "message"
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "notedoc-%{+YYYY.MM.dd}"
  }
}
```

#### 日志轮转

```bash
# /etc/logrotate.d/notedoc
/var/log/notedoc/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 notedoc notedoc
    sharedscripts
    postrotate
        docker-compose -f /opt/notedoc/docker-compose.yml restart notedoc > /dev/null 2>&1 || true
    endscript
}
```

#### 查看日志

```bash
# Docker 日志
docker-compose logs -f notedoc
docker-compose logs -f --tail=100 notedoc

# 系统日志
journalctl -u notedoc -f
journalctl -u notedoc --since "1 hour ago"

# 应用日志
tail -f /var/log/notedoc/app.log
tail -f /var/log/notedoc/error.log

# 搜索错误
grep -i error /var/log/notedoc/*.log
grep -i "database" /var/log/notedoc/*.log | tail -20
```

---

## 故障排查

### 常见问题

#### 1. 应用无法启动

**症状**：容器启动后立即退出

**排查步骤**：

```bash
# 查看容器日志
docker-compose logs notedoc

# 检查配置
docker-compose config

# 验证环境变量
docker-compose exec notedoc env | grep -E "APP_|DATABASE_|REDIS_"

# 检查端口占用
netstat -tulpn | grep 3000
```

**常见原因**：
- 数据库连接失败
- Redis 连接失败
- APP_SECRET 未设置
- 端口被占用

**解决方案**：

```bash
# 检查数据库连接
docker-compose exec db psql -U notedoc -d notedoc -c "SELECT 1;"

# 检查 Redis 连接
docker-compose exec redis redis-cli ping

# 重新生成 APP_SECRET
openssl rand -hex 32

# 更改端口
# 在 docker-compose.yml 中修改 ports: "3001:3000"
```

#### 2. 数据库连接错误

**错误信息**：`FATAL: password authentication failed`

**解决方案**：

```bash
# 检查密码
docker-compose exec db psql -U notedoc -d notedoc

# 重置密码
docker-compose exec db psql -U postgres
ALTER USER notedoc WITH PASSWORD '新密码';

# 更新 .env 文件中的 DATABASE_URL
```

#### 3. 文件上传失败

**错误信息**：`413 Request Entity Too Large`

**解决方案**：

```bash
# 增加 Nginx 上传限制
# /etc/nginx/sites-available/notedoc
client_max_body_size 100M;

# 重载 Nginx
sudo nginx -t && sudo systemctl reload nginx

# 增加应用限制
# .env
FILE_UPLOAD_SIZE_LIMIT=100mb
```

#### 4. 内存不足

**症状**：应用频繁重启，OOM 错误

**解决方案**：

```bash
# 增加 Docker 内存限制
# docker-compose.yml
services:
  notedoc:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

# 增加 Node.js 内存
environment:
  NODE_OPTIONS: "--max-old-space-size=2048"

# 启用 swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 5. 性能问题

**症状**：响应缓慢，超时

**排查步骤**：

```bash
# 检查资源使用
docker stats

# 检查数据库性能
docker-compose exec db psql -U notedoc -d notedoc
SELECT * FROM pg_stat_activity WHERE state = 'active';

# 检查慢查询
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

# 检查 Redis 性能
docker-compose exec redis redis-cli info stats
docker-compose exec redis redis-cli slowlog get 10
```

**优化方案**：
- 增加数据库连接池
- 启用 Redis 缓存
- 优化数据库索引
- 使用 CDN
- 启用 Gzip 压缩


#### 6. SSL 证书问题

**错误信息**：`NET::ERR_CERT_AUTHORITY_INVALID`

**解决方案**：

```bash
# 检查证书有效期
openssl x509 -in /etc/letsencrypt/live/docs.example.com/fullchain.pem -noout -dates

# 手动续期
sudo certbot renew

# 强制续期
sudo certbot renew --force-renewal

# 检查 Nginx 配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

#### 7. WebSocket 连接失败

**症状**：实时协作功能不工作

**解决方案**：

```nginx
# Nginx 配置
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

#### 8. 邮件发送失败

**排查步骤**：

```bash
# 检查邮件配置
docker-compose exec notedoc env | grep MAIL

# 测试 SMTP 连接
telnet smtp.gmail.com 587

# 查看日志
docker-compose logs notedoc | grep -i mail
```

**常见问题**：
- SMTP 密码错误
- 端口被防火墙阻止
- 需要启用"不够安全的应用"访问

### 调试模式

启用详细日志：

```bash
# .env
DEBUG_MODE=true
LOG_LEVEL=debug

# 重启应用
docker-compose restart notedoc

# 查看详细日志
docker-compose logs -f notedoc
```

### 数据库调试

```sql
-- 查看活动连接
SELECT pid, usename, application_name, client_addr, state, query
FROM pg_stat_activity
WHERE datname = 'notedoc';

-- 终止长时间运行的查询
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';

-- 查看表大小
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 重建索引
REINDEX DATABASE notedoc;

-- 清理和分析
VACUUM ANALYZE;
```

---

## 升级指南

### 升级前准备

**1. 备份数据**

```bash
# 完整备份
/opt/scripts/backup-notedoc.sh

# 验证备份
ls -lh /backup/notedoc/
```

**2. 查看更新日志**

```bash
# 查看最新版本
curl -s https://api.github.com/repos/notedoc/notedoc/releases/latest | grep tag_name

# 阅读 CHANGELOG
curl -s https://raw.githubusercontent.com/notedoc/notedoc/main/CHANGELOG.md
```

**3. 测试环境验证**

在测试环境先进行升级测试。

### Docker 升级

#### 标准升级流程

```bash
# 1. 进入项目目录
cd /opt/notedoc

# 2. 备份当前配置
cp docker-compose.yml docker-compose.yml.backup
cp .env .env.backup

# 3. 停止服务
docker-compose down

# 4. 拉取最新镜像
docker-compose pull

# 5. 启动服务
docker-compose up -d

# 6. 查看日志
docker-compose logs -f notedoc

# 7. 验证升级
curl http://localhost:3000/health
```

#### 升级到特定版本

```bash
# 修改 docker-compose.yml
services:
  notedoc:
    image: notedoc/notedoc:v0.23.2  # 指定版本

# 拉取并启动
docker-compose pull
docker-compose up -d
```

#### 回滚

```bash
# 停止服务
docker-compose down

# 恢复配置
cp docker-compose.yml.backup docker-compose.yml

# 使用旧版本镜像
docker-compose up -d

# 如需恢复数据
gunzip < /backup/notedoc/database/notedoc_db_latest.sql.gz | \
    docker-compose exec -T db psql -U notedoc -d notedoc
```

### 手动部署升级

```bash
# 1. 备份
/opt/scripts/backup-notedoc.sh

# 2. 停止应用
pm2 stop notedoc
# 或
sudo systemctl stop notedoc

# 3. 拉取最新代码
cd /opt/notedoc
git fetch --all
git checkout v0.23.2  # 或 main

# 4. 安装依赖
pnpm install --frozen-lockfile

# 5. 构建
pnpm build

# 6. 运行数据库迁移
cd apps/server
pnpm migration:up
cd ../..

# 7. 启动应用
pm2 start notedoc
# 或
sudo systemctl start notedoc

# 8. 验证
curl http://localhost:3000/health
pm2 logs notedoc
```

### 数据库迁移

#### 手动运行迁移

```bash
# Docker 环境
docker-compose exec notedoc sh
cd apps/server
pnpm migration:up

# 手动部署
cd /opt/notedoc/apps/server
pnpm migration:up
```

#### 查看迁移状态

```bash
# 查看已执行的迁移
docker-compose exec db psql -U notedoc -d notedoc -c "SELECT * FROM migrations ORDER BY executed_at DESC;"
```

#### 回滚迁移

```bash
# 回滚最后一次迁移
cd apps/server
pnpm migration:down

# 回滚到特定版本
pnpm migration:down --to=20250101000000
```

### 零停机升级

使用蓝绿部署：

```bash
#!/bin/bash
# blue-green-deploy.sh

# 1. 启动新版本（绿色环境）
docker-compose -f docker-compose.green.yml up -d

# 2. 等待健康检查
sleep 10
until curl -f http://localhost:3001/health; do
    echo "Waiting for green environment..."
    sleep 5
done

# 3. 切换 Nginx 配置
sudo cp nginx-green.conf /etc/nginx/sites-available/notedoc
sudo nginx -t && sudo systemctl reload nginx

# 4. 停止旧版本（蓝色环境）
docker-compose -f docker-compose.blue.yml down

echo "Deployment completed!"
```

### 升级检查清单

- [ ] 阅读版本更新日志
- [ ] 备份数据库和文件
- [ ] 在测试环境验证
- [ ] 通知用户维护时间
- [ ] 执行升级
- [ ] 运行数据库迁移
- [ ] 验证功能正常
- [ ] 监控错误日志
- [ ] 性能测试
- [ ] 准备回滚方案

---

## 安全加固

### 系统安全

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 配置防火墙
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 3. 禁用 root 登录
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
sudo systemctl restart sshd

# 4. 安装 fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 5. 配置自动安全更新
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 应用安全

```bash
# 1. 使用强密码
APP_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -base64 32)

# 2. 限制数据库访问
# pg_hba.conf
host    notedoc    notedoc    127.0.0.1/32    md5

# 3. 启用 Redis 密码
# redis.conf
requirepass $(openssl rand -base64 32)

# 4. 配置 CORS
# .env
CORS_ORIGIN=https://docs.example.com

# 5. 启用 HTTPS
# 强制使用 HTTPS，禁用 HTTP
```

### Docker 安全

```yaml
# docker-compose.yml
services:
  notedoc:
    # 使用非 root 用户
    user: "1000:1000"
    
    # 只读根文件系统
    read_only: true
    
    # 临时文件系统
    tmpfs:
      - /tmp
    
    # 限制能力
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    
    # 安全选项
    security_opt:
      - no-new-privileges:true
```

### 定期安全审计

```bash
#!/bin/bash
# security-audit.sh

echo "=== Security Audit Report ==="
echo "Date: $(date)"
echo ""

# 检查开放端口
echo "Open Ports:"
netstat -tulpn | grep LISTEN

# 检查失败的登录尝试
echo -e "\nFailed Login Attempts:"
grep "Failed password" /var/log/auth.log | tail -10

# 检查 Docker 容器
echo -e "\nDocker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 检查磁盘使用
echo -e "\nDisk Usage:"
df -h

# 检查内存使用
echo -e "\nMemory Usage:"
free -h

# 检查 SSL 证书过期时间
echo -e "\nSSL Certificate:"
openssl x509 -in /etc/letsencrypt/live/docs.example.com/fullchain.pem -noout -dates

echo -e "\n=== End of Report ==="
```

---

## 总结

### 部署检查清单

**部署前**：
- [ ] 准备服务器（满足最低配置要求）
- [ ] 安装必要软件（Docker/Node.js/PostgreSQL/Redis）
- [ ] 配置域名和 DNS
- [ ] 准备 SSL 证书
- [ ] 规划备份策略

**部署中**：
- [ ] 配置环境变量
- [ ] 设置强密码和密钥
- [ ] 配置数据库
- [ ] 配置 Redis
- [ ] 配置存储（本地/S3）
- [ ] 配置邮件服务
- [ ] 配置反向代理
- [ ] 启用 HTTPS

**部署后**：
- [ ] 验证应用可访问
- [ ] 创建管理员账户
- [ ] 配置备份任务
- [ ] 设置监控告警
- [ ] 性能测试
- [ ] 安全加固
- [ ] 文档记录

### 最佳实践

1. **使用 Docker 部署** - 简单、可靠、易于维护
2. **启用 HTTPS** - 保护数据传输安全
3. **定期备份** - 每天自动备份数据库和文件
4. **监控告警** - 及时发现和处理问题
5. **日志管理** - 集中收集和分析日志
6. **性能优化** - 根据负载调整配置
7. **安全加固** - 定期更新和安全审计
8. **文档记录** - 记录配置和操作流程

### 获取帮助

- 📖 官方文档: https://notedoc.com/docs
- 💬 社区论坛: https://github.com/notedoc/notedoc/discussions
- 🐛 问题反馈: https://github.com/notedoc/notedoc/issues
- 📧 邮件支持: support@notedoc.com

---

**文档版本**: 1.0.0  
**最后更新**: 2025-11-20  
**维护者**: NoteDoc 团队

祝您部署顺利！🚀
