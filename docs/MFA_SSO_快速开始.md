# Security & SSO 功能快速开始指南

## 🚀 快速启动

### 1. 安装依赖

```bash
pnpm install
```

这将安装新添加的 `otplib` 包。

### 2. 重启开发服务器

```bash
# 停止当前运行的服务器（如果有）
# 然后重新启动

pnpm run dev
```

### 3. 访问 Security 页面

1. 打开浏览器访问应用
2. 登录到你的账户
3. 点击右上角的用户头像 → "设置"
4. 在左侧菜单中点击 "Security & SSO"

现在你应该能看到完整的 Security & SSO 页面，包括：
- 允许的域名配置
- **多因素认证 (MFA)** ← 新功能
- 强制 MFA 设置
- 单点登录 (SSO) 配置

## 🔐 测试 MFA 功能

### 启用 MFA

1. 在 Security 页面找到 "Multi-Factor Authentication" 部分
2. 点击 "Add 2FA method" 按钮
3. 会弹出一个模态框显示 QR 码
4. 使用身份验证器应用（如 Google Authenticator、Authy）扫描 QR 码
5. 输入身份验证器显示的 6 位验证码
6. 点击 "Setup & Verify"
7. **重要：** 保存显示的备份代码！

### 测试 MFA 登录

1. 退出登录
2. 重新登录（输入用户名和密码）
3. 系统会要求输入 MFA 验证码
4. 打开身份验证器应用，输入 6 位代码
5. 成功登录

### 管理备份代码

1. 在 Security 页面，MFA 已启用后会显示 "Backup codes" 按钮
2. 点击查看剩余的备份代码数量
3. 可以重新生成新的备份代码（旧的会失效）

### 禁用 MFA

1. 在 Security 页面点击 "Disable" 按钮
2. 输入你的账户密码确认
3. MFA 将被禁用

## 🔍 验证实现

运行验证脚本：

```bash
./scripts/verify-mfa-implementation.sh
```

应该看到所有检查项都显示 ✓。

## ⚠️ 常见问题

### Q: 看不到 "Security & SSO" 菜单项？
**A:** 确保你是管理员账户。只有管理员可以访问 Security 设置。

### Q: "Security & SSO" 按钮是灰色的？
**A:** 这个功能需要企业版许可证。如果你在自托管环境，需要添加有效的许可证密钥。

### Q: API 返回 404 错误？
**A:** 确保：
1. 已运行 `pnpm install` 安装依赖
2. 已重启开发服务器
3. 数据库迁移已运行（`user_mfa` 表应该存在）

### Q: 无法扫描 QR 码？
**A:** 可以使用手动输入选项，复制显示的密钥到身份验证器应用。

### Q: 丢失了身份验证器设备？
**A:** 使用保存的备份代码登录，然后重新设置 MFA。

## 📋 API 端点测试

你可以使用以下 curl 命令测试 API（需要先获取 JWT token）：

```bash
# 获取 MFA 状态
curl -X POST http://localhost:3000/api/mfa/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 初始化 MFA 设置
curl -X POST http://localhost:3000/api/mfa/setup \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method": "totp"}'
```

## 🎯 下一步

1. **测试完整流程：** 从设置到登录验证
2. **测试备份代码：** 确保备份代码可以正常使用
3. **测试禁用功能：** 确保可以正常禁用 MFA
4. **检查翻译：** 切换到中文界面，确保所有文本都已翻译

## 📚 更多信息

查看完整的实现说明：`MFA_SSO_实现说明.md`

## ✅ 功能清单

- [x] MFA 服务端 API 实现
- [x] MFA 数据库仓库
- [x] Security 页面集成 MFA 设置
- [x] 中文翻译支持
- [x] 依赖包配置
- [x] 验证脚本
- [x] 文档说明

## 🎉 完成！

现在 Security & SSO 页面已经完全可用，用户可以设置和管理 MFA，管理员可以配置工作区的安全策略。
