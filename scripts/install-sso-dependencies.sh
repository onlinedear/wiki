#!/bin/bash

# SSO 依赖包安装脚本

echo "📦 安装 SSO 功能所需的依赖包..."
echo ""

# 安装 SAML 支持
echo "🔐 安装 SAML 2.0 支持..."
pnpm add @node-saml/node-saml

# 安装 OIDC 支持
echo "🔑 安装 OIDC 支持..."
pnpm add openid-client

# 安装 Google OAuth 支持
echo "🔵 安装 Google OAuth 2.0 支持..."
pnpm add passport-google-oauth20
pnpm add -D @types/passport-google-oauth20

echo ""
echo "✅ SSO 依赖包安装完成！"
echo ""
echo "📋 已安装的包:"
echo "  • @node-saml/node-saml - SAML 2.0 认证"
echo "  • openid-client - OIDC 认证"
echo "  • passport-google-oauth20 - Google OAuth 2.0"
echo "  • @types/passport-google-oauth20 - TypeScript 类型定义"
echo ""
echo "🚀 下一步:"
echo "  1. 重启开发服务器: pnpm dev"
echo "  2. 访问 SSO 配置页面: http://localhost:5173/settings/security"
echo ""
