# Security & SSO 功能实现说明

## 概述

本次实现完成了 Security & SSO 设置页面的完整功能，主要包括：
1. MFA（多因素认证）服务端 API 实现
2. 将 MFA 设置集成到现有的 Security 页面
3. 添加中文翻译支持

## 实现内容

### 1. 服务端实现

#### 1.1 MFA 模块结构
```
apps/server/src/ee/mfa/
├── mfa.module.ts          # MFA 模块定义
├── mfa.controller.ts      # MFA API 控制器
├── mfa.service.ts         # MFA 业务逻辑
└── dto/
    └── mfa.dto.ts         # 数据传输对象
```

#### 1.2 数据库仓库
```
apps/server/src/database/repos/user-mfa/
└── user-mfa.repo.ts       # MFA 数据访问层
```

#### 1.3 API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/mfa/status` | POST | 获取用户 MFA 状态 |
| `/api/mfa/setup` | POST | 初始化 MFA 设置（生成 QR 码） |
| `/api/mfa/enable` | POST | 启用 MFA（验证并保存） |
| `/api/mfa/disable` | POST | 禁用 MFA |
| `/api/mfa/verify` | POST | 验证 MFA 代码 |
| `/api/mfa/generate-backup-codes` | POST | 重新生成备份代码 |
| `/api/mfa/validate-access` | POST | 验证访问权限 |

#### 1.4 核心功能

**MFA 设置流程：**
1. 用户请求设置 MFA
2. 服务端生成 TOTP 密钥和 QR 码
3. 用户扫描 QR 码添加到身份验证器
4. 用户输入验证码确认
5. 服务端验证并启用 MFA，生成备份代码

**MFA 验证：**
- 支持 TOTP（基于时间的一次性密码）
- 支持备份代码（一次性使用）
- 使用 bcrypt 加密存储备份代码

### 2. 客户端实现

#### 2.1 Security 页面更新

更新了 `apps/client/src/ee/security/pages/security.tsx`：
- 集成了 `MfaSettings` 组件
- 保留了原有的 SSO 配置功能
- 添加了 "Multi-Factor Authentication" 部分

#### 2.2 页面结构

```
Security & SSO 页面
├── Allowed Domains（允许的域名）
├── Multi-Factor Authentication（多因素认证）
│   └── MfaSettings 组件
├── Enforce MFA（强制 MFA）
└── Single Sign-On (SSO)（单点登录）
    ├── Enforce SSO
    ├── Create SSO Provider
    └── SSO Provider List
```

### 3. 依赖包

添加了以下依赖：
- `otplib@^12.0.1` - TOTP 生成和验证
- `qrcode@^1.5.4` - QR 码生成（已存在）

### 4. 翻译支持

在 `apps/client/public/locales/zh-CN/translation.json` 中添加：
- "Security & SSO": "安全与单点登录"
- "Manage security settings and single sign-on configuration": "管理安全设置和单点登录配置"
- "Multi-Factor Authentication": "多因素认证"
- "Single sign-on (SSO)": "单点登录 (SSO)"
- 以及其他相关翻译

## 数据库表结构

MFA 功能使用现有的 `user_mfa` 表（由迁移 `20250715T070817-mfa.ts` 创建）：

```sql
CREATE TABLE user_mfa (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method VARCHAR NOT NULL DEFAULT 'totp',
  secret TEXT,
  is_enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[],
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
```

## 安装和使用

### 1. 安装依赖

```bash
pnpm install
```

这将安装 `otplib` 包。

### 2. 确保数据库迁移已运行

```bash
# 如果需要，运行迁移
pnpm run migration:run
```

### 3. 重启开发服务器

```bash
pnpm run dev
```

### 4. 访问 Security 页面

1. 登录应用
2. 进入设置页面
3. 点击左侧菜单的 "Security & SSO"
4. 现在可以看到 MFA 设置选项

## 功能测试

### MFA 设置流程测试

1. **启用 MFA：**
   - 点击 "Add 2FA method" 按钮
   - 扫描显示的 QR 码或手动输入密钥
   - 在身份验证器应用中添加账户
   - 输入 6 位验证码
   - 保存显示的备份代码

2. **使用 MFA 登录：**
   - 退出登录
   - 使用用户名和密码登录
   - 系统会要求输入 MFA 验证码
   - 输入身份验证器中的 6 位代码

3. **管理备份代码：**
   - 在 Security 页面点击 "Backup codes" 按钮
   - 查看剩余备份代码数量
   - 可以重新生成备份代码

4. **禁用 MFA：**
   - 点击 "Disable" 按钮
   - 输入密码确认
   - MFA 将被禁用

## 安全特性

1. **密钥安全：**
   - TOTP 密钥存储在数据库中
   - 备份代码使用 bcrypt 加密存储

2. **备份代码：**
   - 每个备份代码只能使用一次
   - 使用后自动从数据库中删除
   - 可以重新生成新的备份代码

3. **访问控制：**
   - 所有 MFA API 端点都需要 JWT 认证
   - 禁用 MFA 需要密码确认

## 权限要求

- **MFA 设置：** 所有用户都可以为自己的账户设置 MFA
- **强制 MFA：** 只有管理员可以为整个工作区强制启用 MFA
- **SSO 配置：** 只有管理员可以配置 SSO

## 注意事项

1. **企业版功能：**
   - MFA 功能在企业版或云版本中可用
   - 自托管版本需要有效的许可证密钥

2. **SSO 功能：**
   - SSO 配置界面已存在，但具体的 SSO 提供商集成需要额外配置
   - 当前显示的是 SSO 管理界面

3. **兼容性：**
   - 支持所有标准的 TOTP 身份验证器应用（Google Authenticator、Authy 等）
   - QR 码格式符合 RFC 6238 标准

## 验证脚本

运行验证脚本检查实现：

```bash
./scripts/verify-mfa-implementation.sh
```

## 后续改进建议

1. **邮件 MFA：** 添加基于邮件的 MFA 选项
2. **SMS MFA：** 添加基于短信的 MFA 选项
3. **恢复流程：** 改进用户丢失身份验证器时的账户恢复流程
4. **审计日志：** 记录 MFA 启用/禁用/使用事件
5. **设备管理：** 允许用户管理受信任的设备
6. **SSO 集成：** 完善 Google、GitHub、SAML 等 SSO 提供商的集成

## 相关文件

### 服务端
- `apps/server/src/ee/mfa/` - MFA 模块
- `apps/server/src/ee/ee.module.ts` - EE 模块配置
- `apps/server/src/database/repos/user-mfa/` - MFA 数据仓库
- `apps/server/src/database/database.module.ts` - 数据库模块配置

### 客户端
- `apps/client/src/ee/security/pages/security.tsx` - Security 页面
- `apps/client/src/ee/mfa/components/mfa-settings.tsx` - MFA 设置组件
- `apps/client/src/ee/mfa/services/mfa-service.ts` - MFA 服务
- `apps/client/src/components/settings/settings-sidebar.tsx` - 设置侧边栏

### 配置
- `package.json` - 依赖配置
- `apps/client/public/locales/zh-CN/translation.json` - 中文翻译

## 总结

本次实现完成了 Security & SSO 页面的核心功能，特别是 MFA 的完整服务端支持。用户现在可以：
- 访问 Security & SSO 设置页面（不再是灰色按钮）
- 为自己的账户设置和管理 MFA
- 管理员可以查看和配置工作区的安全策略
- 所有功能都有完整的中文翻译支持

404 错误已解决，MFA API 端点现在可以正常工作。
