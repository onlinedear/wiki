#!/bin/bash

# Verify Confluence unified configuration implementation
# This script checks that Confluence import requires saved configuration

echo "=== Verifying Confluence Unified Configuration ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

check_file() {
  local file=$1
  local description=$2
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $description"
    ((PASS++))
    return 0
  else
    echo -e "${RED}✗${NC} $description"
    ((FAIL++))
    return 1
  fi
}

check_content() {
  local file=$1
  local pattern=$2
  local description=$3
  
  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $description"
    ((PASS++))
    return 0
  else
    echo -e "${RED}✗${NC} $description"
    ((FAIL++))
    return 1
  fi
}

check_not_content() {
  local file=$1
  local pattern=$2
  local description=$3
  
  if ! grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $description"
    ((PASS++))
    return 0
  else
    echo -e "${RED}✗${NC} $description"
    ((FAIL++))
    return 1
  fi
}

echo -e "${BLUE}1. Checking Frontend Files${NC}"
echo "-----------------------------------"

# Check modal component
check_file "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" \
  "Confluence import modal exists"

check_not_content "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" \
  "confluenceUrl.*form.getInputProps" \
  "Modal does not have URL input field"

check_not_content "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" \
  "accessToken.*form.getInputProps" \
  "Modal does not have access token input field"

check_content "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" \
  "checkConfig" \
  "Modal checks for saved configuration"

check_content "apps/client/src/features/confluence/components/confluence-online-import-modal.tsx" \
  "Go to Settings" \
  "Modal shows settings link when no config"

# Check config page
check_file "apps/client/src/pages/settings/account/confluence-config.tsx" \
  "Confluence config page exists"

check_content "apps/client/src/pages/settings/account/confluence-config.tsx" \
  "saveConfluenceConfig" \
  "Config page can save configuration"

check_content "apps/client/src/pages/settings/account/confluence-config.tsx" \
  "getConfluenceConfig" \
  "Config page can load configuration"

# Check account settings integration
check_file "apps/client/src/pages/settings/account/account-settings.tsx" \
  "Account settings page exists"

check_content "apps/client/src/pages/settings/account/account-settings.tsx" \
  "ConfluenceConfig" \
  "Confluence config integrated in account settings"

echo ""
echo -e "${BLUE}2. Checking Backend Files${NC}"
echo "-----------------------------------"

# Check controller
check_file "apps/server/src/ee/confluence-import/confluence-import.controller.ts" \
  "Confluence import controller exists"

check_content "apps/server/src/ee/confluence-import/confluence-import.controller.ts" \
  "getUserConfluenceConfig" \
  "Controller uses saved configuration"

check_content "apps/server/src/ee/confluence-import/confluence-import.controller.ts" \
  "configuration not found.*configure.*Account Settings" \
  "Controller returns error when no config"

check_content "apps/server/src/ee/confluence-import/confluence-import.controller.ts" \
  "savedConfig.confluenceUrl" \
  "Controller uses saved URL from config"

check_content "apps/server/src/ee/confluence-import/confluence-import.controller.ts" \
  "savedConfig.accessToken" \
  "Controller uses saved token from config"

# Check DTO
check_file "apps/server/src/ee/confluence-import/dto/confluence-online-import.dto.ts" \
  "Import DTO exists"

check_content "apps/server/src/ee/confluence-import/dto/confluence-online-import.dto.ts" \
  "export class ConfluenceOnlineImportDto" \
  "ConfluenceOnlineImportDto exists"

check_content "apps/server/src/ee/confluence-import/dto/confluence-online-import.dto.ts" \
  "export class SaveConfluenceConfigDto" \
  "SaveConfluenceConfigDto exists (for config endpoints)"

check_content "apps/server/src/ee/confluence-import/dto/confluence-online-import.dto.ts" \
  "pageId.*:" \
  "DTO has pageId field"

check_content "apps/server/src/ee/confluence-import/dto/confluence-online-import.dto.ts" \
  "spaceId.*:" \
  "DTO has spaceId field"

# Check service
check_file "apps/server/src/ee/confluence-import/confluence-import.service.ts" \
  "Confluence import service exists"

check_content "apps/server/src/ee/confluence-import/confluence-import.service.ts" \
  "saveUserConfluenceConfig" \
  "Service can save user config"

check_content "apps/server/src/ee/confluence-import/confluence-import.service.ts" \
  "getUserConfluenceConfig" \
  "Service can get user config"

check_content "apps/server/src/ee/confluence-import/confluence-import.service.ts" \
  "deleteUserConfluenceConfig" \
  "Service can delete user config"

echo ""
echo -e "${BLUE}3. Checking Service Implementation${NC}"
echo "-----------------------------------"

# Check frontend service
check_file "apps/client/src/features/confluence/services/confluence-service.ts" \
  "Frontend Confluence service exists"

check_content "apps/client/src/features/confluence/services/confluence-service.ts" \
  "saveConfluenceConfig" \
  "Frontend service has save config method"

check_content "apps/client/src/features/confluence/services/confluence-service.ts" \
  "getConfluenceConfig" \
  "Frontend service has get config method"

check_content "apps/client/src/features/confluence/services/confluence-service.ts" \
  "deleteConfluenceConfig" \
  "Frontend service has delete config method"

check_content "apps/client/src/features/confluence/services/confluence-service.ts" \
  "importConfluenceOnline" \
  "Frontend service has import method"

echo ""
echo -e "${BLUE}4. Summary${NC}"
echo "-----------------------------------"
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "1. Restart your development server (pnpm dev)"
  echo "2. Go to Settings → My Profile"
  echo "3. Configure your Confluence URL and access token"
  echo "4. Save the configuration"
  echo "5. Try importing a Confluence page"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Some checks failed${NC}"
  echo ""
  exit 1
fi
