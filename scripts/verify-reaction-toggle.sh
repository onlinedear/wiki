#!/bin/bash

# Quick verification script for comment reaction toggle fix
# This script checks if the necessary code changes are in place

echo "Verifying Comment Reaction Toggle Fix"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

# Check 1: Server-side duplicate check
echo "Check 1: Server-side duplicate check in addReaction..."
if grep -q "Check if reaction already exists" apps/server/src/database/repos/comment/comment-reaction.repo.ts; then
  echo -e "${GREEN}✓ Duplicate check logic found${NC}"
  ((PASS++))
else
  echo -e "${RED}✗ Duplicate check logic not found${NC}"
  ((FAIL++))
fi

# Check 2: Client-side pending state check
echo "Check 2: Client-side pending state check..."
if grep -q "isPending" apps/client/src/features/comment/components/comment-reactions.tsx; then
  echo -e "${GREEN}✓ Pending state check found${NC}"
  ((PASS++))
else
  echo -e "${RED}✗ Pending state check not found${NC}"
  ((FAIL++))
fi

# Check 3: Remove reaction mutation exists
echo "Check 3: Remove reaction mutation..."
if grep -q "useRemoveReactionMutation" apps/client/src/features/comment/queries/comment-query.ts; then
  echo -e "${GREEN}✓ Remove reaction mutation found${NC}"
  ((PASS++))
else
  echo -e "${RED}✗ Remove reaction mutation not found${NC}"
  ((FAIL++))
fi

# Check 4: Remove reaction API endpoint
echo "Check 4: Remove reaction API endpoint..."
if grep -q "reactions/remove" apps/server/src/core/comment/comment.controller.ts; then
  echo -e "${GREEN}✓ Remove reaction endpoint found${NC}"
  ((PASS++))
else
  echo -e "${RED}✗ Remove reaction endpoint not found${NC}"
  ((FAIL++))
fi

# Check 5: Database table exists
echo "Check 5: Database migration for comment_reactions..."
if grep -q "comment_reactions" apps/server/src/database/migrations/20251118T100000-enhance-comments.ts; then
  echo -e "${GREEN}✓ Database migration found${NC}"
  ((PASS++))
else
  echo -e "${RED}✗ Database migration not found${NC}"
  ((FAIL++))
fi

echo ""
echo "======================================"
echo "Results: ${GREEN}${PASS} passed${NC}, ${RED}${FAIL} failed${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}All checks passed! ✓${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Restart the development server if it's running"
  echo "2. Open http://localhost:5174/s/store/p/1117-bMgW0emznk"
  echo "3. Test the reaction toggle functionality"
  echo ""
  echo "Expected behavior:"
  echo "- Click a reaction icon → it lights up"
  echo "- Click again → it dims"
  echo "- Repeat multiple times → works consistently"
  exit 0
else
  echo -e "${RED}Some checks failed. Please review the changes.${NC}"
  exit 1
fi
