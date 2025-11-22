<div align="center">
    <h1><b>Docmost</b></h1>
    <p>
        开源协作式 Wiki 和文档管理平台
        <br />
        <a href="https://github.com/onlinedear/wiki"><strong>GitHub</strong></a> | 
        <a href="https://docmost.com/docs"><strong>文档</strong></a> |
        <a href="https://github.com/onlinedear/wiki/discussions"><strong>讨论区</strong></a>
    </p>
    <p>
        <img src="https://img.shields.io/github/v/release/onlinedear/wiki?style=flat-square" alt="版本">
        <img src="https://img.shields.io/github/license/onlinedear/wiki?style=flat-square" alt="许可证">
        <img src="https://img.shields.io/github/stars/onlinedear/wiki?style=flat-square" alt="Stars">
    </p>
</div>

<br />

## 📖 关于 Docmost

Docmost 是一个强大的开源协作式 Wiki 和文档管理平台，专为现代团队打造。它结合了实时协作、富文本编辑和灵活的组织结构，帮助团队创建、共享和维护知识库。

### ✨ 核心亮点

- **实时协作** - 多人同时编辑文档，实时显示光标位置和更新内容
- **富文本编辑器** - 基于 Tiptap 构建，支持 Markdown、表格、代码块等丰富内容
- **灵活组织** - 使用文档库（Spaces）和嵌套页面组织内容
- **高级权限管理** - 基于用户组和角色的细粒度访问控制
- **企业级功能** - SSO 单点登录、MFA 多因素认证、API 密钥、审计日志（企业版）
- **私有部署** - 完全掌控数据，支持 Docker 一键部署
- **多语言支持** - 支持 10+ 种语言，活跃的社区翻译

## 🚀 快速开始

### 使用 Docker 部署（推荐）

```bash
# 下载 docker-compose.yml
curl -O https://raw.githubusercontent.com/onlinedear/wiki/main/docker-compose.yml

# 生成安全密钥
openssl rand -hex 32

# 编辑 docker-compose.yml 配置文件
# - 设置 APP_URL 为你的域名
# - 设置 APP_SECRET 为生成的密钥
# - 设置强密码保护数据库

# 启动 Docmost
docker-compose up -d

# 访问 http://localhost:3000
```

### 手动安装

查看我们的[完整部署指南](./docs/Docmost完整部署指南.md)，了解详细说明：
- Ubuntu/Debian/CentOS 手动部署
- 云平台部署（AWS、GCP、Azure）
- Kubernetes 部署
- 生产环境配置和优化

## 📚 功能特性

### 核心功能

- **📝 实时协作编辑** - 多人同时编辑，实时更新和光标跟踪
- **🎨 富文本编辑器** - 支持 Markdown、表格、代码块、任务列表等
- **📊 图表支持** - 集成 Draw.io、Excalidraw 和 Mermaid 图表工具
- **📁 文档库（Spaces）** - 使用独立的工作空间组织文档，支持自定义权限
- **🔍 全文搜索** - 快速准确地搜索所有内容和附件
- **💬 评论系统** - 支持嵌套评论、@提及、表情反馈和通知
- **📎 文件附件** - 上传和嵌入文件、图片和文档
- **🔗 内容嵌入** - 嵌入 Airtable、Loom、Miro、YouTube 等平台内容
- **📜 页面历史** - 跟踪变更记录并恢复历史版本
- **👥 用户和用户组管理** - 将用户组织成组，实现基于角色的访问控制
- **🔐 权限管理** - 基于 CASL 的细粒度访问控制
- **🌍 国际化** - 支持 10+ 种语言
- **🔗 分享功能** - 生成公开链接供外部访问
- **📥 Confluence 导入** - 支持从 Confluence 在线导入内容

### 企业版功能

- **� 单点l登录（SSO）** - 支持 SAML 2.0 和 OAuth 2.0 集成
- **� A多因素认证（MFA）** - 基于 TOTP 的双因素认证，增强安全性
- **� APIi 密钥** - 支持程序化访问，细粒度权限控制
- **📊 审计日志** - 跟踪所有用户活动和变更记录
- **🏢 LDAP 集成** - 连接 Active Directory 和 LDAP 服务器
- **💳 账单管理** - 订阅和许可证管理

## 🏗️ 技术架构

Docmost 采用现代化的 Monorepo 架构，前后端分离：

### 技术栈

**前端**
- React 18 + TypeScript
- Vite 构建工具，快速开发和构建
- Mantine UI 组件库
- TanStack Query 数据获取
- Jotai 状态管理
- Tiptap 编辑器 + Yjs 实时协作

**后端**
- NestJS 框架 + TypeScript
- PostgreSQL 16+ 数据库
- Kysely 类型安全的 SQL 查询构建器
- Redis 缓存和发布订阅
- Hocuspocus 实时协作服务器
- S3 兼容对象存储

**实时协作**
- Yjs CRDT 无冲突编辑
- Hocuspocus WebSocket 服务器
- Redis 适配器支持横向扩展

### 项目结构

```
docmost/
├── apps/
│   ├── client/          # React 前端应用
│   └── server/          # NestJS 后端应用
├── packages/
│   ├── editor-ext/      # 共享的 Tiptap 编辑器扩展
│   └── ee/              # 企业版许可证标记
├── docs/                # 文档和指南
├── scripts/             # 实用工具和验证脚本
├── examples/            # 使用示例和模板
└── data/                # 本地开发数据
```

详细的结构信息，请查看[项目结构文档](./.kiro/steering/structure.md)。

## 📖 文档

### 快速入门
- [快速开始指南](./docs/START_HERE.md) - 快速上手
- [完整部署指南](./docs/Docmost完整部署指南.md) - 详细的部署说明
- [API 密钥使用指南](./docs/API密钥使用完整指南.md) - API 认证和使用

### 功能文档
- [MFA/SSO 实现说明](./docs/MFA_SSO_实现说明.md) - 多因素认证和单点登录
- [SSO 快速开始](./docs/SSO_快速开始.md) - SSO 配置和使用
- [评论管理功能](./docs/评论管理功能说明.md) - 评论、反馈和通知系统
- [API 密钥管理](./docs/个人API密钥功能说明.md) - API 密钥功能和管理
- [Confluence 导入](./docs/Confluence在线导入功能说明.md) - 从 Confluence 导入内容
- [附件搜索功能](./docs/附件搜索功能说明.md) - 附件全文搜索

### 开发文档
- [技术栈说明](./.kiro/steering/tech.md) - 技术栈详细说明
- [项目结构](./.kiro/steering/structure.md) - 项目结构详解

完整的文档列表，请查看 [docs 目录](./docs/README.md)。

## 🛠️ 开发

### 环境要求

- Node.js 22.x
- pnpm 10.4.0
- PostgreSQL 16+
- Redis 7.2+

### 开发环境配置

```bash
# 克隆仓库
git clone https://github.com/onlinedear/wiki.git
cd wiki

# 安装依赖
pnpm install

# 复制环境变量文件
cp .env.example .env

# 配置 .env 文件，设置数据库和 Redis 连接信息

# 运行数据库迁移
cd apps/server
pnpm migration:up
cd ../..

# 启动开发服务器
pnpm dev
```

应用将在以下地址可用：
- 前端：http://localhost:5173
- 后端：http://localhost:3000

### 可用脚本

```bash
# 开发
pnpm dev              # 同时启动前端和后端开发服务器
pnpm client:dev       # 仅启动前端
pnpm server:dev       # 仅启动后端
pnpm collab:dev       # 启动协作服务器

# 构建
pnpm build            # 构建所有应用
pnpm client:build     # 构建前端
pnpm server:build     # 构建后端
pnpm editor-ext:build # 构建编辑器扩展

# 生产环境
pnpm start            # 启动生产服务器

# 数据库
cd apps/server
pnpm migration:up       # 运行迁移
pnpm migration:down     # 回滚迁移
pnpm migration:create   # 创建新迁移
pnpm migration:codegen  # 从数据库生成类型定义

# 代码质量
pnpm lint             # 代码检查
pnpm format           # 代码格式化（Prettier）
pnpm test             # 运行测试
```

## 🔒 安全



### 安全特性

- 使用 bcrypt 进行 SHA-256 密码哈希
- 基于 JWT 的身份认证
- CSRF 保护
- 请求频率限制
- 通过参数化查询防止 SQL 注入
- 内容清理防止 XSS 攻击
- 安全的文件上传验证
- 支持多因素认证（MFA）
- 支持单点登录（SSO）


---



