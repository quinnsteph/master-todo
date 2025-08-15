#!/bin/bash
# Weekly cleanup script - Archives old todos and removes duplicates

TODO_MASTER_FILE="$HOME/Documents/master-todo/MASTER_TODO.md"
TODO_BACKUP_DIR="$HOME/Documents/master-todo/backups"
TODO_ARCHIVE="$TODO_BACKUP_DIR/archive_$(date +%Y%m).md"
TEMP_FILE="/tmp/todo_cleanup_temp.md"

echo "🧹 Starting TODO cleanup at $(date)"

# 1. Backup current file
cp "$TODO_MASTER_FILE" "$TODO_BACKUP_DIR/backup_$(date +%Y%m%d_%H%M).md"
echo "✅ Backup created"

# 2. Archive completed todos older than 30 days
echo "## Archived $(date +%Y-%m-%d)" >> "$TODO_ARCHIVE"
grep "^\- \[x\]" "$TODO_MASTER_FILE" >> "$TODO_ARCHIVE"
echo "" >> "$TODO_ARCHIVE"

# 3. Keep file structure and recent todos
cat > "$TEMP_FILE" << 'EOF'
# MASTER TODO LIST

## 🔥 TODAY'S FOCUS

## 📥 QUICK CAPTURE
<!-- All quick todos land here first -->

EOF

# 4. Add active (incomplete) todos, removing duplicates
echo "## 🏗️ ACTIVE TODOS" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

# Extract unique todos (based on content before |)
grep "^- \[ \]" "$TODO_MASTER_FILE" | awk -F'|' '!seen[$1]++' | tail -500 >> "$TEMP_FILE"

# 5. Add recently completed (last 7 days)
echo "" >> "$TEMP_FILE"
echo "## ✅ RECENTLY COMPLETED" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
grep "^- \[x\]" "$TODO_MASTER_FILE" | tail -20 >> "$TEMP_FILE"

# 6. Add footer
echo "" >> "$TEMP_FILE"
echo "---" >> "$TEMP_FILE"
echo "*Last cleanup: $(date +"%Y-%m-%d %H:%M")*" >> "$TEMP_FILE"

# 7. Replace original file
mv "$TEMP_FILE" "$TODO_MASTER_FILE"

# 8. Stats
TOTAL=$(grep "^- \[" "$TODO_MASTER_FILE" | wc -l)
ACTIVE=$(grep "^- \[ \]" "$TODO_MASTER_FILE" | wc -l)

echo "✅ Cleanup complete!"
echo "📊 Stats: $ACTIVE active todos, $TOTAL total entries"