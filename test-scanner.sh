#!/bin/bash
# Test script for TODO scanner

echo "🧪 Testing TODO Scanner with [[Todo:...]] pattern"
echo "================================================"

# Source the functions
source ~/Documents/master-todo/scripts/todo-functions.sh

# Create a backup of current MASTER_TODO.md
if [[ -f "$TODO_MASTER_FILE" ]]; then
  cp "$TODO_MASTER_FILE" "$TODO_MASTER_FILE.backup"
  echo "✅ Backed up existing MASTER_TODO.md"
fi

echo ""
echo "📝 Test file contents (test-todos.js):"
echo "--------------------------------------"
grep -n "\[\[Todo:" test-todos.js

echo ""
echo "🔍 Running todo-scan on current directory..."
echo "--------------------------------------"
todo-scan .

echo ""
echo "📋 New TODOs added to MASTER_TODO.md:"
echo "--------------------------------------"
# Show the last few lines that were just added
tail -10 "$TODO_MASTER_FILE" | grep "\[\["

echo ""
echo "✅ Test complete! Check MASTER_TODO.md for results."
echo ""
echo "💡 You can also run:"
echo "  - 'tl' to see recent todos"
echo "  - 'ts authentication' to search for specific todos"
echo "  - 'todo-stats' to see statistics"