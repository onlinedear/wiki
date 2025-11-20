#!/bin/bash

# Test script for comment management feature

echo "Testing Comment Management Feature"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Manual Testing Checklist:${NC}"
echo ""

echo "1. Access Control"
echo "   □ Login as admin user"
echo "   □ Navigate to http://localhost:5173/settings/comments"
echo "   □ Verify the page loads successfully"
echo "   □ Verify 'Comment management' appears in left sidebar"
echo ""

echo "2. Comment List Display"
echo "   □ Verify comments are displayed in a table"
echo "   □ Check columns: Author, Content, Page, Space, Created, Actions"
echo "   □ Verify author avatars are displayed"
echo "   □ Verify content is truncated to 2 lines"
echo "   □ Verify relative time display (e.g., '2 hours ago')"
echo ""

echo "3. Search Functionality"
echo "   □ Enter text in search box"
echo "   □ Verify comments are filtered by content"
echo "   □ Clear search and verify all comments return"
echo ""

echo "4. Filter Functionality"
echo "   □ Select 'Inline' from type filter"
echo "   □ Verify only inline comments are shown"
echo "   □ Select 'Page' from type filter"
echo "   □ Verify only page comments are shown"
echo "   □ Clear filter and verify all comments return"
echo ""

echo "5. Single Selection"
echo "   □ Click checkbox on a single comment"
echo "   □ Verify checkbox is checked"
echo "   □ Verify 'Selected: 1' badge appears"
echo "   □ Verify 'Delete (1)' button is enabled"
echo ""

echo "6. Select All"
echo "   □ Click checkbox in table header"
echo "   □ Verify all comments are selected"
echo "   □ Verify 'Selected: N' badge shows correct count"
echo "   □ Click header checkbox again"
echo "   □ Verify all comments are deselected"
echo ""

echo "7. Delete Single Comment"
echo "   □ Click delete icon on a comment row"
echo "   □ Verify confirmation modal appears"
echo "   □ Verify modal shows '1 comment'"
echo "   □ Click 'Delete' button"
echo "   □ Verify success notification appears"
echo "   □ Verify comment is removed from list"
echo "   □ Verify total count decreases"
echo ""

echo "8. Batch Delete"
echo "   □ Select multiple comments (2-3)"
echo "   □ Click 'Delete (N)' button at top"
echo "   □ Verify confirmation modal appears"
echo "   □ Verify modal shows correct count"
echo "   □ Click 'Delete' button"
echo "   □ Verify success notification appears"
echo "   □ Verify all selected comments are removed"
echo "   □ Verify total count decreases"
echo ""

echo "9. Pagination"
echo "   □ If total comments > 20, verify pagination appears"
echo "   □ Click page 2"
echo "   □ Verify different comments are displayed"
echo "   □ Verify page number updates"
echo ""

echo "10. Statistics"
echo "    □ Verify 'Total: N' badge shows correct count"
echo "    □ Select some comments"
echo "    □ Verify 'Selected: N' badge appears and updates"
echo ""

echo "11. Empty States"
echo "    □ Search for non-existent text"
echo "    □ Verify 'No comments found' message appears"
echo ""

echo "12. Permissions"
echo "    □ Logout and login as non-admin user"
echo "    □ Try to access /settings/comments"
echo "    □ Verify access is denied (403 or redirect)"
echo ""

echo "13. Internationalization"
echo "    □ Switch language to Chinese"
echo "    □ Verify all labels are translated"
echo "    □ Verify relative time is in Chinese"
echo ""

echo ""
echo -e "${GREEN}Feature Components:${NC}"
echo "  ✓ Frontend page component"
echo "  ✓ Frontend queries and services"
echo "  ✓ Backend API endpoints"
echo "  ✓ Backend service methods"
echo "  ✓ Database repository methods"
echo "  ✓ Sidebar menu item"
echo "  ✓ Route configuration"
echo "  ✓ Chinese translations"
echo ""

echo -e "${YELLOW}Quick Access:${NC}"
echo "  URL: http://localhost:5173/settings/comments"
echo "  Menu: Settings → Comment management"
echo ""

echo -e "${YELLOW}API Endpoints:${NC}"
echo "  POST /api/comments/workspace/list"
echo "  POST /api/comments/workspace/delete-batch"
echo ""
