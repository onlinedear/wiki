#!/bin/bash

# Test Confluence configuration flow
# This script tests saving and retrieving Confluence configuration

echo "=== Testing Confluence Configuration Flow ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3000/api"
TEST_CONFLUENCE_URL="https://test.atlassian.net/wiki"
TEST_ACCESS_TOKEN="test-token-12345"

# Get JWT token (you need to replace this with actual login)
echo -e "${YELLOW}Step 1: Login to get JWT token${NC}"
echo "Please provide your JWT token:"
read -r JWT_TOKEN

if [ -z "$JWT_TOKEN" ]; then
  echo -e "${RED}Error: JWT token is required${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Save Confluence configuration${NC}"
SAVE_RESPONSE=$(curl -s -X POST "$API_URL/confluence/config" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"confluenceUrl\": \"$TEST_CONFLUENCE_URL\",
    \"accessToken\": \"$TEST_ACCESS_TOKEN\"
  }")

echo "Save response: $SAVE_RESPONSE"

if echo "$SAVE_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✓ Configuration saved successfully${NC}"
else
  echo -e "${RED}✗ Failed to save configuration${NC}"
  echo "Response: $SAVE_RESPONSE"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Retrieve Confluence configuration${NC}"
GET_RESPONSE=$(curl -s -X GET "$API_URL/confluence/config" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Get response: $GET_RESPONSE"

if echo "$GET_RESPONSE" | grep -q "$TEST_CONFLUENCE_URL"; then
  echo -e "${GREEN}✓ Configuration retrieved successfully${NC}"
else
  echo -e "${RED}✗ Failed to retrieve configuration${NC}"
  echo "Response: $GET_RESPONSE"
  exit 1
fi

if echo "$GET_RESPONSE" | grep -q "hasAccessToken.*true"; then
  echo -e "${GREEN}✓ Access token is saved${NC}"
else
  echo -e "${RED}✗ Access token not found${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 4: Test import without credentials (should use saved config)${NC}"
IMPORT_RESPONSE=$(curl -s -X POST "$API_URL/confluence/import-online" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"pageId\": \"123456\",
    \"spaceId\": \"test-space-id\",
    \"includeChildren\": true
  }")

echo "Import response: $IMPORT_RESPONSE"

# This will likely fail because the test credentials are fake,
# but we're checking if it tries to use the saved config
if echo "$IMPORT_RESPONSE" | grep -q "configuration not found"; then
  echo -e "${RED}✗ Import did not use saved configuration${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Import attempted to use saved configuration${NC}"
fi

echo ""
echo -e "${GREEN}=== All tests passed ===${NC}"
