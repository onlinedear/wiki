#!/bin/bash

# SSO Implementation Verification Script
# This script verifies that all SSO components are properly implemented

set -e

echo "🔍 Verifying SSO Implementation..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2 - File not found: $1"
        ((FAILED++))
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2 - Directory not found: $1"
        ((FAILED++))
    fi
}

# Function to check if string exists in file
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $3 - Not found in $1"
        ((FAILED++))
    fi
}

echo "📁 Checking Backend Structure..."
echo ""

# Check repositories
check_file "apps/server/src/database/repos/auth-provider/auth-provider.repo.ts" "Auth Provider Repository"
check_file "apps/server/src/database/repos/auth-account/auth-account.repo.ts" "Auth Account Repository"

# Check strategies
check_file "apps/server/src/ee/sso/strategies/saml.strategy.ts" "SAML Strategy"
check_file "apps/server/src/ee/sso/strategies/google.strategy.ts" "Google OAuth Strategy"
check_file "apps/server/src/ee/sso/strategies/oidc.strategy.ts" "OIDC Strategy"

# Check DTOs
check_file "apps/server/src/ee/sso/dto/create-auth-provider.dto.ts" "Create Auth Provider DTO"
check_file "apps/server/src/ee/sso/dto/update-auth-provider.dto.ts" "Update Auth Provider DTO"

# Check service and controller
check_file "apps/server/src/ee/sso/sso.service.ts" "SSO Service"
check_file "apps/server/src/ee/sso/sso.controller.ts" "SSO Controller"
check_file "apps/server/src/ee/sso/sso.module.ts" "SSO Module"

# Check documentation
check_file "apps/server/src/ee/sso/README.md" "SSO Documentation"

echo ""
echo "🔗 Checking Module Integration..."
echo ""

# Check if SSO module is imported in EE module
check_content "apps/server/src/ee/ee.module.ts" "SsoModule" "SSO Module imported in EE Module"

# Check if repositories are registered in database module
check_content "apps/server/src/database/database.module.ts" "AuthProviderRepo" "Auth Provider Repo registered"
check_content "apps/server/src/database/database.module.ts" "AuthAccountRepo" "Auth Account Repo registered"

echo ""
echo "📦 Checking Dependencies..."
echo ""

# Check if required packages are in package.json
check_content "apps/server/package.json" "@node-saml/passport-saml" "SAML package installed"
check_content "apps/server/package.json" "passport-google-oauth20" "Google OAuth package installed"
check_content "apps/server/package.json" "openid-client" "OIDC client package installed"

echo ""
echo "🎨 Checking Frontend Integration..."
echo ""

# Check frontend files
check_file "apps/client/src/ee/security/services/security-service.ts" "Security Service"
check_file "apps/client/src/ee/security/queries/security-query.ts" "Security Queries"
check_file "apps/client/src/ee/security/components/sso-saml-form.tsx" "SAML Form Component"
check_file "apps/client/src/ee/security/pages/security.tsx" "Security Settings Page"

echo ""
echo "🗄️ Checking Database Schema..."
echo ""

# Check if migrations exist
check_file "apps/server/src/database/migrations/20250118T194658-sso-auth.ts" "SSO Auth Migration"
check_content "apps/server/src/database/types/db.d.ts" "AuthProviders" "Auth Providers table type"
check_content "apps/server/src/database/types/db.d.ts" "AuthAccounts" "Auth Accounts table type"

echo ""
echo "📊 Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All SSO components are properly implemented!${NC}"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Run database migrations: pnpm --filter server migration:up"
    echo "2. Configure SSO providers in the Security settings"
    echo "3. Test SSO login flows with your identity provider"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some SSO components are missing or not properly configured${NC}"
    echo ""
    exit 1
fi
