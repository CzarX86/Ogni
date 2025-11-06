#!/bin/bash

# Firebase Project Cleanup Script
# This script will delete all Firebase projects EXCEPT Ogni and Vespery

echo "🔥 FIREBASE PROJECT CLEANUP SCRIPT"
echo "=================================="
echo ""
echo "⚠️  WARNING: This will PERMANENTLY DELETE the following projects:"
echo ""

# Projects to delete
PROJECTS_TO_DELETE=(
    "alertcrm-1fb24"
    "alfa-adhd-limitless-flow-ai"
    "colih-cloud"
    "colihcloud"
    "colihclouddev"
    "shrt-6a0d4"
    "social-ape-ccd2e"
    "todo-4f1d9"
    "vespery-sandbox-test"
)

# Projects to keep
echo "📋 Projects to DELETE:"
for project in "${PROJECTS_TO_DELETE[@]}"; do
    echo "  ❌ $project"
done

echo ""
echo "✅ Projects to KEEP:"
echo "  ✅ ogni-41040 (Ogni)"
echo "  ✅ vespery-405df (Vespery)"

echo ""
echo "⚠️  This action CANNOT be undone!"
echo "⚠️  All data, databases, hosting sites, and configurations will be lost!"
echo ""

read -p "Are you absolutely sure you want to continue? Type 'YES' to proceed: " confirm

if [ "$confirm" != "YES" ]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo ""
echo "🗑️  Starting deletion process..."

for project in "${PROJECTS_TO_DELETE[@]}"; do
    echo "Deleting project: $project"
    firebase projects:delete "$project"
    if [ $? -eq 0 ]; then
        echo "✅ Successfully deleted: $project"
    else
        echo "❌ Failed to delete: $project"
    fi
    echo ""
done

echo "🎉 Cleanup complete!"
echo "📋 Remaining projects:"
echo "  ✅ ogni-41040 (Ogni)"
echo "  ✅ vespery-405df (Vespery)"