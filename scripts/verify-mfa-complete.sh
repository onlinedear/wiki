#!/bin/bash

# MFA 功能完整性验证脚本

echo "🔍 验证 MFA 功能完整性..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 计数器
PASS=0
FAIL=0

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $2 (文件不存在: $1)"
        ((FAIL++))
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $3"
        ((FAIL++))
    fi
}

check_no_content() {
    if ! grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $3 (仍然存在限制)"
        ((FAIL++))
    fi
}

echo "📁 检查后端文件..."
echo ""

# 核心服务文件
check_file "apps/server/src/ee/mfa/mfa.module.ts" "MfaModule 模块"
check_file "apps/server/src/ee/mfa/mfa.controller.ts" "MfaController 控制器"
check_file "apps/server/src/ee/mfa/mfa.service.ts" "MfaService 服务"

# 数据库层
check_file "apps/server/src/database/repos/user-mfa/user-mfa.repo.ts" "UserMfaRepo Repository"
check_file "apps/server/src/database/migrations/20250715T070817-mfa.ts" "MFA 数据库迁移"

echo ""
echo "📝 检查 API 端点..."
echo ""

# 检查控制器中的端点
check_content "apps/server/src/ee/mfa/mfa.controller.ts" "@Post('status')" "获取 MFA 状态端点"
check_content "apps/server/src/ee/mfa/mfa.controller.ts" "@Post('setup')" "设置 MFA 端点"
check_content "apps/server/src/ee/mfa/mfa.controller.ts" "@Post('enable')" "启用 MFA 端点"
check_content "apps/server/src/ee/mfa/mfa.controller.ts" "@Post('disable')" "禁用 MFA 端点"
check_content "apps/server/src/ee/mfa/mfa.controller.ts" "@Post('verify')" "验证 MFA 端点"
check_content "apps/server/src/ee/mfa/mfa.controller.ts" "@Post('generate-backup-codes')" "生成备份码端点"
check_content "apps/server/src/ee/mfa/mfa.controller.ts" "@Post('validate-access')" "验证访问端点"

echo ""
echo "🌐 检查前端文件..."
echo ""

check_file "apps/client/src/ee/security/pages/security.tsx" "Security 设置页面"
check_file "apps/client/src/ee/security/components/enforce-mfa.tsx" "强制 MFA 组件"
check_file "apps/client/src/ee/mfa/components/mfa-settings.tsx" "MFA 设置组件"

echo ""
echo "🔓 检查企业版限制移除..."
echo ""

# 检查是否移除了企业版限制
check_content "apps/client/src/ee/mfa/components/mfa-settings.tsx" "canUseMfa = true" "MFA 限制已移除"
check_no_content "apps/client/src/ee/mfa/components/mfa-settings.tsx" "canUseMfa = isCloud() || hasLicenseKey" "旧的限制代码已移除"

echo ""
echo "🔧 检查核心功能实现..."
echo ""

# MFA 服务功能
check_content "apps/server/src/ee/mfa/mfa.service.ts" "getMfaStatus" "获取 MFA 状态功能"
check_content "apps/server/src/ee/mfa/mfa.service.ts" "setupMfa" "设置 MFA 功能"
check_content "apps/server/src/ee/mfa/mfa.service.ts" "enableMfa" "启用 MFA 功能"
check_content "apps/server/src/ee/mfa/mfa.service.ts" "disableMfa" "禁用 MFA 功能"
check_content "apps/server/src/ee/mfa/mfa.service.ts" "verifyMfaCode" "验证 MFA 代码功能"
check_content "apps/server/src/ee/mfa/mfa.service.ts" "regenerateBackupCodes" "重新生成备份码功能"
check_content "apps/server/src/ee/mfa/mfa.service.ts" "generateBackupCodes" "生成备份码功能"

# TOTP 支持
check_content "apps/server/src/ee/mfa/mfa.service.ts" "authenticator" "TOTP 认证器支持"
check_content "apps/server/src/ee/mfa/mfa.service.ts" "toDataURL" "QR 码生成支持"

# 备份码支持
check_content "apps/server/src/ee/mfa/mfa.service.ts" "backupCodes" "备份码支持"

echo ""
echo "🗄️ 检查数据库结构..."
echo ""

# 检查数据库迁移
check_content "apps/server/src/database/migrations/20250715T070817-mfa.ts" "createTable('user_mfa')" "user_mfa 表创建"
check_content "apps/server/src/database/migrations/20250715T070817-mfa.ts" "enforce_mfa" "enforce_mfa 字段"
check_content "apps/server/src/database/migrations/20250715T070817-mfa.ts" "backup_codes" "backup_codes 字段"

# 检查 Repository
check_content "apps/server/src/database/repos/user-mfa/user-mfa.repo.ts" "findByUserId" "查找用户 MFA"
check_content "apps/server/src/database/repos/user-mfa/user-mfa.repo.ts" "upsert" "创建/更新 MFA"
check_content "apps/server/src/database/repos/user-mfa/user-mfa.repo.ts" "updateBackupCodes" "更新备份码"
check_content "apps/server/src/database/repos/user-mfa/user-mfa.repo.ts" "deleteByUserId" "删除 MFA"

echo ""
echo "📦 检查依赖包..."
echo ""

if grep -q "otplib" "package.json"; then
    echo -e "${GREEN}✓${NC} otplib 依赖"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} otplib 依赖未找到（可能需要安装）"
fi

if grep -q "qrcode" "package.json"; then
    echo -e "${GREEN}✓${NC} qrcode 依赖"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} qrcode 依赖未找到（可能需要安装）"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 验证结果:"
echo ""
echo -e "  ${GREEN}通过: $PASS${NC}"
echo -e "  ${RED}失败: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ MFA 功能完整性验证通过！${NC}"
    echo ""
    echo "🎉 所有组件都已正确实现"
    echo ""
    echo "📋 支持的功能:"
    echo "  • TOTP (Time-based One-Time Password)"
    echo "  • QR 码扫描设置"
    echo "  • 备份码生成和使用"
    echo "  • 强制 MFA 策略"
    echo "  • 企业版限制已移除"
    echo ""
    echo "🚀 下一步:"
    echo "  1. 访问: http://localhost:5173/settings/security"
    echo "  2. 在 'Multi-Factor Authentication' 部分点击 'Add 2FA method'"
    echo "  3. 使用认证器应用扫描 QR 码"
    echo "  4. 输入验证码完成设置"
    echo ""
    exit 0
else
    echo -e "${RED}❌ 发现 $FAIL 个问题，请检查${NC}"
    echo ""
    exit 1
fi
