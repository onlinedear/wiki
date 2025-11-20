#!/bin/bash

# Test script for comment reactions toggle functionality
# This script tests adding and removing reactions

echo "Testing Comment Reactions Toggle Functionality"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
API_URL="http://localhost:5174/api"
COMMENT_ID="test-comment-id"  # Replace with actual comment ID
REACTION_TYPE="like"

echo -e "${YELLOW}Note: You need to be logged in and have a valid session${NC}"
echo ""

# Test 1: Add reaction
echo "Test 1: Adding reaction..."
RESPONSE=$(curl -s -X POST "${API_URL}/comments/reactions/add" \
  -H "Content-Type: application/json" \
  -d "{\"commentId\": \"${COMMENT_ID}\", \"reactionType\": \"${REACTION_TYPE}\"}" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Reaction added successfully${NC}"
  echo "Response: $BODY"
else
  echo -e "${RED}✗ Failed to add reaction (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
fi

echo ""
sleep 1

# Test 2: Try to add same reaction again (should not create duplicate)
echo "Test 2: Adding same reaction again (should not create duplicate)..."
RESPONSE=$(curl -s -X POST "${API_URL}/comments/reactions/add" \
  -H "Content-Type: application/json" \
  -d "{\"commentId\": \"${COMMENT_ID}\", \"reactionType\": \"${REACTION_TYPE}\"}" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Duplicate prevention working${NC}"
  echo "Response: $BODY"
else
  echo -e "${RED}✗ Unexpected response (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
fi

echo ""
sleep 1

# Test 3: Remove reaction
echo "Test 3: Removing reaction..."
RESPONSE=$(curl -s -X POST "${API_URL}/comments/reactions/remove" \
  -H "Content-Type: application/json" \
  -d "{\"commentId\": \"${COMMENT_ID}\", \"reactionType\": \"${REACTION_TYPE}\"}" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Reaction removed successfully${NC}"
  echo "Response: $BODY"
else
  echo -e "${RED}✗ Failed to remove reaction (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
fi

echo ""
sleep 1

# Test 4: Try to remove again (should not fail)
echo "Test 4: Removing reaction again (should handle gracefully)..."
RESPONSE=$(curl -s -X POST "${API_URL}/comments/reactions/remove" \
  -H "Content-Type: application/json" \
  -d "{\"commentId\": \"${COMMENT_ID}\", \"reactionType\": \"${REACTION_TYPE}\"}" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Graceful handling of non-existent reaction${NC}"
  echo "Response: $BODY"
else
  echo -e "${RED}✗ Unexpected response (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
fi

echo ""
echo "=============================================="
echo "Testing complete!"
echo ""
echo -e "${YELLOW}Manual Testing Instructions:${NC}"
echo "1. Open http://localhost:5174/s/store/p/1117-bMgW0emznk"
echo "2. Find a comment with reactions"
echo "3. Click on a reaction icon (e.g., Like or Love)"
echo "4. Verify the icon lights up and count increases"
echo "5. Click the same icon again"
echo "6. Verify the icon dims and count decreases"
echo "7. Repeat steps 3-6 multiple times to ensure toggle works consistently"
