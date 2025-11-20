#!/bin/bash

echo "🧪 Testing Comment Enhancements..."
echo "=================================="

# Check TypeScript compilation
echo "📝 Checking TypeScript compilation..."
cd apps/server
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Server TypeScript compilation successful"
else
    echo "❌ Server TypeScript compilation failed"
    exit 1
fi

cd ../client
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Client TypeScript compilation successful"
else
    echo "❌ Client TypeScript compilation failed"
    exit 1
fi

echo ""
echo "✅ All tests passed!"
echo ""
echo "Next steps:"
echo "1. Run the migration: ./scripts/run-comment-enhancements-migration.sh"
echo "2. Start the development server"
echo "3. Test the new features manually"
