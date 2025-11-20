#!/bin/bash

echo "🚀 Running Comment Enhancements Migration..."
echo "============================================"

cd "$(dirname "$0")/.."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Run the migration
echo "📦 Running database migration..."
cd apps/server
npm run migration:run

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "New features added:"
    echo "  ✓ Comment reactions (like, love, laugh, etc.)"
    echo "  ✓ Comment mentions (@user)"
    echo "  ✓ Comment notifications"
    echo "  ✓ Comment search and filtering"
    echo ""
    echo "Database tables created:"
    echo "  - comment_reactions"
    echo "  - comment_mentions"
    echo "  - comment_notifications"
else
    echo "❌ Migration failed!"
    exit 1
fi
