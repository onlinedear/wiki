# SSO 快速开始指南

## 前提条件

- Docmost 已安装并运行
- 管理员账户访问权限
- 外部身份提供商（IdP）账户（Azure AD、Google、Okta 等）

## 步骤 1: 确认数据库迁移

SSO 功能需要的数据库表已经存在（`auth_providers` 和 `auth_accounts`）。如果是新安装，迁移会自动运行。

验证迁移状态：
```bash
npx pnpm --filter server migration:up
```

## 步骤 2: 配置 SSO 提供商

### 选项 A: SAML 2.0 (推荐用于企业)

1. **登录 Docmost**
   - 使用管理员账户登录
   - 进入 Settings → Security & SSO

2. **创建 SAML 提供商**
   - 点击 "Add Provider" → 选择 "SAML"
   - 填写显示名称（如 "Azure AD"）

3. **获取 Docmost 信息**
   - Entity ID: `https://your-domain.com/api/sso/saml/{providerId}/login`
   - ACS URL (Callback): `https://your-domain.com/api/sso/saml/{providerId}/callback`

4. **在 IdP 中配置**
   
   **Azure AD 示例：**
   - 进入 Azure Portal → Enterprise Applications
   - 创建新应用 → Non-gallery application
   - 配置 SAML：
     - Identifier (Entity ID): 使用上面的 Entity ID
     - Reply URL (ACS): 使用上面的 ACS URL
     - 下载证书（Base64）

5. **在 Docmost 中完成配置**
   - IDP Login URL: 从 Azure AD 复制 "Login URL"
   - IDP Certificate: 粘贴下载的证书内容
   - 启用 "Allow signup"（如果允许新用户注册）
   - 启用 "Enabled"
   - 保存

### 选项 B: Google OAuth 2.0

1. **创建 Google OAuth 凭据**
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 创建或选择项目
   - 启用 Google+ API
   - 创建 OAuth 2.0 客户端 ID：
     - 应用类型: Web application
     - 授权重定向 URI: `https://your-domain.com/api/sso/google/{providerId}/callback`
   - 保存 Client ID 和 Client Secret

2. **在 Docmost 中配置**
   - Settings → Security & SSO
   - Add Provider → Google
   - 填写：
     - Display name: "Google"
     - Client ID: 从 Google Console 复制
     - Client Secret: 从 Google Console 复制
   - 启用 "Allow signup"
   - 启用 "Enabled"
   - 保存

### 选项 C: OIDC (通用)

1. **获取 OIDC 提供商信息**
   - Issuer URL（如 `https://accounts.google.com` 或 Keycloak realm URL）
   - Client ID
   - Client Secret

2. **在 Docmost 中配置**
   - Settings → Security & SSO
   - Add Provider → OIDC
   - 填写：
     - Display name: 提供商名称
     - Issuer URL: OIDC 发现端点
     - Client ID: 客户端 ID
     - Client Secret: 客户端密钥
   - 配置回调 URL: `https://your-domain.com/api/sso/oidc/{providerId}/callback`
   - 启用 "Allow signup"
   - 启用 "Enabled"
   - 保存

## 步骤 3: 测试 SSO 登录

1. **获取登录 URL**
   - SAML: `https://your-domain.com/api/sso/saml/{providerId}/login`
   - Google: `https://your-domain.com/api/sso/google/{providerId}/login`
   - OIDC: `https://your-domain.com/api/sso/oidc/{providerId}/login`

2. **测试流程**
   - 在新的隐私浏览窗口中访问登录 URL
   - 应该重定向到外部 IdP
   - 使用 IdP 凭据登录
   - 成功后应重定向回 Docmost 并自动登录

3. **验证用户创建**
   - 检查 Settings → Users
   - 新的 SSO 用户应该已创建（如果启用了 allow signup）

## 步骤 4: 配置前端登录按钮（可选）

前端已有 SSO 登录组件，可以在登录页面显示 SSO 按钮。

检查 `apps/client/src/ee/components/sso-login.tsx` 是否已集成到登录页面。

## 常见问题

### SAML 错误

**问题**: "Invalid SAML response"
- 检查证书格式是否正确（包含 BEGIN/END 标记）
- 验证 Entity ID 和 ACS URL 是否匹配
- 使用 SAML-tracer 调试 SAML 请求/响应

**问题**: "User not found"
- 确保 IdP 返回 email 属性
- 检查 "Allow signup" 是否启用

### Google OAuth 错误

**问题**: "redirect_uri_mismatch"
- 确保 Google Console 中的重定向 URI 完全匹配
- 检查 HTTPS 配置

**问题**: "Access denied"
- 验证 Client ID 和 Secret 是否正确
- 确保 Google+ API 已启用

### OIDC 错误

**问题**: "Discovery failed"
- 验证 Issuer URL 是否可访问
- 检查 `/.well-known/openid-configuration` 端点

**问题**: "Invalid client"
- 验证 Client ID 和 Secret
- 检查 OIDC 提供商中的回调 URL 配置

## 安全建议

1. **使用 HTTPS**: SSO 必须在 HTTPS 环境下运行
2. **证书验证**: 定期更新 SAML 证书
3. **限制域名**: 配置允许的邮箱域名白名单
4. **强制 SSO**: 在 workspace 设置中启用 SSO 强制执行
5. **审计日志**: 监控 SSO 登录活动

## 高级配置

### 强制 SSO

在 workspace 设置中启用 "Enforce SSO" 后，用户只能通过 SSO 登录，禁用密码登录。

### 域名白名单

配置允许的邮箱域名，限制只有特定域名的用户可以通过 SSO 注册。

### 组同步（即将推出）

未来版本将支持从 IdP 同步用户组和角色。

## 获取帮助

- 查看详细文档: `apps/server/src/ee/sso/README.md`
- 查看实现报告: `docs/SSO_实现完成报告.md`
- 检查日志: 查看 Docmost 服务器日志获取详细错误信息

## 下一步

- 配置多个 SSO 提供商
- 设置 MFA（多因素认证）
- 配置 API Keys 用于程序化访问
- 启用审计日志
