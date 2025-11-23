# SSO (单点登录) 实现完成报告

## 概述

已成功为 NoteDoc 实现完整的 SSO (Single Sign-On) 功能，支持 SAML 2.0、OAuth 2.0 (Google) 和 OIDC 协议。

## 实现内容

### 1. 后端实现

#### 数据访问层 (Repository)

**Auth Provider Repository** (`apps/server/src/database/repos/auth-provider/auth-provider.repo.ts`)
- 管理 SSO 提供商配置的 CRUD 操作
- 支持按类型、工作空间查询
- 软删除支持

**Auth Account Repository** (`apps/server/src/database/repos/auth-account/auth-account.repo.ts`)
- 管理用户与外部 SSO 账户的关联
- 支持按提供商和用户 ID 查询
- 记录最后登录时间

#### Passport 策略

**SAML 策略** (`apps/server/src/ee/sso/strategies/saml.strategy.ts`)
- 使用 `@node-saml/passport-saml` 实现
- 动态配置支持（从数据库读取配置）
- 支持 Azure AD、Okta、OneLogin 等企业 IdP

**Google OAuth 策略** (`apps/server/src/ee/sso/strategies/google.strategy.ts`)
- 使用 `passport-google-oauth20` 实现
- 动态客户端 ID 和密钥配置
- 标准 OAuth 2.0 授权码流程

**OIDC 策略** (`apps/server/src/ee/sso/strategies/oidc.strategy.ts`)
- 使用 `openid-client` 实现
- 支持任何符合 OIDC 标准的提供商
- 自动发现端点配置
- 客户端缓存优化

#### 业务逻辑层

**SSO Service** (`apps/server/src/ee/sso/sso.service.ts`)
- 提供商管理（创建、更新、删除、查询）
- SSO 回调处理
- 用户自动配置（JIT Provisioning）
- 账户关联逻辑
- JWT 令牌生成

**SSO Controller** (`apps/server/src/ee/sso/sso.controller.ts`)
- RESTful API 端点
- SSO 登录和回调路由
- Cookie 管理
- 错误处理和重定向

**SSO Module** (`apps/server/src/ee/sso/sso.module.ts`)
- 集成所有 SSO 组件
- 依赖注入配置
- 导出服务供其他模块使用

#### DTO (数据传输对象)

- `CreateAuthProviderDto`: 创建提供商的验证规则
- `UpdateAuthProviderDto`: 更新提供商的验证规则

### 2. 模块集成

- ✅ SSO 模块已集成到 EE 模块 (`apps/server/src/ee/ee.module.ts`)
- ✅ Repository 已注册到数据库模块 (`apps/server/src/database/database.module.ts`)
- ✅ 所有依赖包已安装（`@node-saml/passport-saml`, `passport-google-oauth20`, `openid-client`）

### 3. 前端集成

前端已有完整的 UI 实现：
- ✅ SSO 提供商列表和管理界面
- ✅ SAML 配置表单
- ✅ OIDC 配置表单
- ✅ Google OAuth 配置表单
- ✅ API 服务已更新为 RESTful 风格

### 4. 数据库支持

数据库迁移已存在：
- ✅ `auth_providers` 表（存储 SSO 提供商配置）
- ✅ `auth_accounts` 表（关联用户与外部账户）
- ✅ 支持的类型：saml, oidc, google, ldap

## API 端点

### 提供商管理（需要认证）

```
POST   /api/sso/providers              - 创建 SSO 提供商
GET    /api/sso/providers              - 列出所有提供商
GET    /api/sso/providers/:providerId  - 获取提供商详情
PUT    /api/sso/providers              - 更新提供商
DELETE /api/sso/providers/:providerId  - 删除提供商
```

### SAML 认证

```
GET    /api/sso/saml/:providerId/login    - 发起 SAML 登录
POST   /api/sso/saml/:providerId/callback - SAML 回调（ACS URL）
```

### Google OAuth 认证

```
GET    /api/sso/google/:providerId/login    - 发起 Google 登录
GET    /api/sso/google/:providerId/callback - Google 回调
```

### OIDC 认证

```
GET    /api/sso/oidc/:providerId/login    - 发起 OIDC 登录
GET    /api/sso/oidc/:providerId/callback - OIDC 回调
```

## 功能特性

### 核心功能

✅ **多协议支持**
- SAML 2.0（企业级 SSO）
- OAuth 2.0（Google）
- OIDC（通用 OpenID Connect）

✅ **用户自动配置**
- 首次 SSO 登录自动创建用户
- 可配置是否允许自动注册
- 支持账户关联（已有用户通过邮箱匹配）

✅ **多提供商支持**
- 每个工作空间可配置多个 SSO 提供商
- 独立启用/禁用控制
- 提供商级别的配置隔离

✅ **安全性**
- 证书验证（SAML）
- CSRF 保护（OIDC state 参数）
- 工作空间隔离
- HttpOnly 安全 Cookie
- 密码哈希存储

### 配置选项

每个 SSO 提供商支持：
- `name`: 显示名称
- `type`: 协议类型（saml/oidc/google）
- `isEnabled`: 启用状态
- `allowSignup`: 是否允许新用户注册
- `groupSync`: 组同步（预留功能）

### SAML 特定配置

- `samlUrl`: IdP 登录 URL
- `samlCertificate`: IdP 证书
- Entity ID 和 ACS URL 自动生成

### OAuth/OIDC 特定配置

- `oidcIssuer`: OIDC 发现端点
- `oidcClientId`: 客户端 ID
- `oidcClientSecret`: 客户端密钥

## 用户流程

1. **登录发起**: 用户点击 SSO 按钮 → 重定向到 `/api/sso/{type}/{providerId}/login`
2. **提供商认证**: 用户在外部 IdP 进行身份验证
3. **回调处理**: IdP 重定向到 `/api/sso/{type}/{providerId}/callback`
4. **用户配置**:
   - 如果 auth account 存在 → 登录现有用户
   - 如果用户存在（通过邮箱） → 关联到 SSO 提供商
   - 如果是新用户且 `allowSignup=true` → 创建新用户
   - 否则 → 拒绝并返回错误
5. **会话创建**: 设置认证 Cookie 并重定向到仪表板

## 配置示例

### SAML 2.0 (Azure AD)

```json
{
  "name": "Azure AD",
  "type": "saml",
  "samlUrl": "https://login.microsoftonline.com/{tenant-id}/saml2",
  "samlCertificate": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
  "isEnabled": true,
  "allowSignup": true
}
```

**IdP 配置要求：**
- Entity ID: `https://your-domain.com/api/sso/saml/{providerId}/login`
- ACS URL: `https://your-domain.com/api/sso/saml/{providerId}/callback`

### Google OAuth 2.0

```json
{
  "name": "Google",
  "type": "google",
  "oidcClientId": "your-client-id.apps.googleusercontent.com",
  "oidcClientSecret": "your-client-secret",
  "isEnabled": true,
  "allowSignup": true
}
```

**设置步骤：**
1. 在 Google Cloud Console 创建 OAuth 2.0 凭据
2. 添加授权重定向 URI: `https://your-domain.com/api/sso/google/{providerId}/callback`

### OIDC (通用)

```json
{
  "name": "Keycloak",
  "type": "oidc",
  "oidcIssuer": "https://keycloak.example.com/realms/master",
  "oidcClientId": "notedoc",
  "oidcClientSecret": "your-client-secret",
  "isEnabled": true,
  "allowSignup": true
}
```

## 测试建议

### SAML 测试

使用以下工具：
- [SAML-tracer](https://addons.mozilla.org/en-US/firefox/addon/saml-tracer/) 浏览器扩展
- [SAMLtest.id](https://samltest.id/) 测试 SAML 流程

### OIDC 测试

使用公共 OIDC 提供商：
- Google
- Auth0
- Keycloak（自托管）

## 下一步操作

1. **运行数据库迁移**
   ```bash
   pnpm --filter server migration:up
   ```

2. **配置 SSO 提供商**
   - 登录 NoteDoc 管理员账户
   - 进入 Settings → Security & SSO
   - 创建并配置 SSO 提供商

3. **测试 SSO 登录**
   - 访问 `/api/sso/{type}/{providerId}/login`
   - 完成外部认证
   - 验证自动登录和用户创建

4. **生产部署检查清单**
   - [ ] 确保 HTTPS 已启用
   - [ ] 配置正确的域名和回调 URL
   - [ ] 验证 IdP 证书有效性
   - [ ] 测试用户自动配置流程
   - [ ] 配置 SSO 强制执行（如需要）
   - [ ] 设置允许的域名白名单

## 技术栈

- **后端框架**: NestJS 11 + Fastify
- **认证库**: Passport.js
- **SAML**: @node-saml/passport-saml v5.1.0
- **OAuth**: passport-google-oauth20 v2.0.0
- **OIDC**: openid-client v5.7.1
- **数据库**: PostgreSQL + Kysely
- **前端**: React 18 + Mantine 8

## 文件清单

### 后端文件

```
apps/server/src/
├── database/repos/
│   ├── auth-provider/
│   │   └── auth-provider.repo.ts
│   └── auth-account/
│       └── auth-account.repo.ts
├── ee/sso/
│   ├── strategies/
│   │   ├── saml.strategy.ts
│   │   ├── google.strategy.ts
│   │   └── oidc.strategy.ts
│   ├── dto/
│   │   ├── create-auth-provider.dto.ts
│   │   └── update-auth-provider.dto.ts
│   ├── sso.service.ts
│   ├── sso.controller.ts
│   ├── sso.module.ts
│   └── README.md
```

### 前端文件（已存在）

```
apps/client/src/ee/security/
├── components/
│   ├── sso-saml-form.tsx
│   ├── sso-oidc-form.tsx
│   └── sso-provider-list.tsx
├── services/
│   └── security-service.ts
├── queries/
│   └── security-query.ts
└── pages/
    └── security.tsx
```

## 许可证

企业版功能 - 参见 `packages/ee/LICENSE`

## 总结

SSO 功能已完全实现并集成到 NoteDoc 中。所有核心组件（策略、服务、控制器、Repository）都已创建并通过语法检查。前端 UI 已存在，后端 API 已更新为 RESTful 风格。数据库架构已就绪。

现在可以运行迁移并开始配置 SSO 提供商进行测试。
