#!/bin/bash
# Automated TODO Scanner - Run via cron to collect TODOs from all projects

TODO_MASTER_FILE="$HOME/Documents/master-todo/MASTER_TODO.md"
SCAN_DIRS=(
  "$HOME/Code"
  "$HOME/Projects"
  "$HOME/Documents"
)

echo "🔍 Starting automated TODO scan at $(date)" >> /tmp/todo-scanner.log

# Add timestamp header
echo -e "\n## 🤖 Auto-Scan: $(date +"%Y-%m-%d %H:%M")\n" >> "$TODO_MASTER_FILE"

# Scan each directory
for DIR in "${SCAN_DIRS[@]}"; do
  if [[ -d "$DIR" ]]; then
    echo "Scanning $DIR..." >> /tmp/todo-scanner.log
    
    # Find all code files and scan for TODOs
    find "$DIR" -type f \( \
      -name "*.md" -o \
      -name "*.tsx" -o \
      -name "*.jsx" -o \
      -name "*.js" -o \
      -name "*.ts" -o \
      -name "*.py" -o \
      -name "*.go" -o \
      -name "*.rs" -o \
      -name "*.java" -o \
      -name "*.css" -o \
      -name "*.scss" \
    \) -mtime -7 2>/dev/null | while read file; do
      # Only process files modified in last 7 days
      grep -Hn "\[\[Todo:.*\]\]" "$file" 2>/dev/null | while IFS=: read filepath line content; do
        # Extract and clean TODO text - macOS compatible
        TODO_TEXT=$(echo "$content" | sed 's/.*\[\[Todo: *//' | sed 's/\]\].*//' | sed 's/^ *//' | sed 's/ *$//')
        
        if [[ -n "$TODO_TEXT" ]]; then
          # Check if this TODO already exists (simple deduplication)
          if ! grep -q "$TODO_TEXT.*$filepath:$line" "$TODO_MASTER_FILE" 2>/dev/null; then
            PROJECT_NAME=$(basename $(dirname $(dirname "$filepath")))
            echo "- [ ] $TODO_TEXT | file:$filepath:$line | project:$PROJECT_NAME | auto-scan" >> "$TODO_MASTER_FILE"
          fi
        fi
      done
    done
  fi
done

echo "✅ Scan completed at $(date)" >> /tmp/todo-scanner.log