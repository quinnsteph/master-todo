#!/bin/bash
# TODO System Functions - Source this in .zshrc

# Configuration
export TODO_MASTER_FILE="$HOME/Documents/master-todo/MASTER_TODO.md"
export TODO_BACKUP_DIR="$HOME/Documents/master-todo/backups"

# 1. Quick capture - just type: t Your todo text
function t() {
  echo "- [ ] $* | pwd:$(pwd) | $(date +"%Y-%m-%d %H:%M")" >> "$TODO_MASTER_FILE"
  echo "✅ Added: $*"
}

# 2. Capture with file context - usage: tf filename.tsx "TODO text"
function tf() {
  local FILE="$1"
  shift
  local TODO_TEXT="$*"
  
  if [[ ! -f "$FILE" ]]; then
    echo "❌ File not found: $FILE"
    return 1
  fi
  
  # Add to master file with full path
  echo "- [ ] $TODO_TEXT | file:$(pwd)/$FILE | $(date +"%Y-%m-%d %H:%M")" >> "$TODO_MASTER_FILE"
  
  # Add TODO comment to the file based on extension
  local EXT="${FILE##*.}"
  case "$EXT" in
    md)
      echo -e "\n<!-- TODO: $TODO_TEXT -->" >> "$FILE"
      ;;
    tsx|jsx|ts|js)
      echo -e "\n// TODO: $TODO_TEXT" >> "$FILE"
      ;;
    py)
      echo -e "\n# TODO: $TODO_TEXT" >> "$FILE"
      ;;
    css|scss)
      echo -e "\n/* TODO: $TODO_TEXT */" >> "$FILE"
      ;;
    *)
      echo -e "\n// TODO: $TODO_TEXT" >> "$FILE"
      ;;
  esac
  
  echo "✅ Added to $FILE and master list"
}

# 3. Search todos - usage: ts keyword
function ts() {
  echo "🔍 Searching for: $1"
  echo "─────────────────────"
  grep -i "$1" "$TODO_MASTER_FILE" | head -20
}

# 4. Show todos for current directory
function th() {  # todo-here
  local CURRENT_DIR=$(pwd)
  echo "📋 TODOs for $CURRENT_DIR:"
  echo "─────────────────────"
  grep "$CURRENT_DIR" "$TODO_MASTER_FILE" | head -20
}

# 5. Scan directory for TODO comments
function todo-scan() {
  local SCAN_DIR="${1:-.}"
  local PROJECT_NAME=$(basename $(pwd))
  
  echo "🔍 Scanning $SCAN_DIR for TODO comments..."
  
  # Add section header
  echo -e "\n## 📂 Scanned: $PROJECT_NAME [$(date +"%Y-%m-%d %H:%M")]\n" >> "$TODO_MASTER_FILE"
  
  # Find all TODO comments
  find "$SCAN_DIR" -type f \( \
    -name "*.md" -o \
    -name "*.tsx" -o \
    -name "*.jsx" -o \
    -name "*.js" -o \
    -name "*.ts" -o \
    -name "*.py" -o \
    -name "*.css" -o \
    -name "*.scss" \
  \) 2>/dev/null | while read file; do
    grep -Hn "\[\[Todo:.*\]\]" "$file" 2>/dev/null | while IFS=: read filepath line content; do
      # Extract text between [[Todo: and ]] - macOS compatible
      local TODO_TEXT=$(echo "$content" | sed 's/.*\[\[Todo: *//' | sed 's/\]\].*//' | sed 's/^ *//' | sed 's/ *$//')
      
      if [[ -n "$TODO_TEXT" ]]; then
        echo "- [ ] $TODO_TEXT | file:$filepath:$line | scanned:$(date +"%Y-%m-%d %H:%M")" >> "$TODO_MASTER_FILE"
      fi
    done
  done
  
  echo "✅ TODO comments collected to master list"
}

# 6. Show recent todos
function tl() {  # todo-list
  echo "📋 Recent TODOs:"
  echo "─────────────────────"
  tail -30 "$TODO_MASTER_FILE" | grep "^- \["
}

# 7. Mark todo as done (interactive)
function td() {  # todo-done
  echo "📋 Recent incomplete TODOs:"
  grep -n "^- \[ \]" "$TODO_MASTER_FILE" | tail -10
  echo "─────────────────────"
  read "?Enter line number to mark as done: " LINE_NUM
  
  if [[ -n "$LINE_NUM" ]]; then
    sed -i '' "${LINE_NUM}s/\[ \]/[x]/" "$TODO_MASTER_FILE"
    echo "✅ Marked as complete!"
  fi
}

# 8. Quick stats
function todo-stats() {
  local TOTAL=$(grep "^- \[" "$TODO_MASTER_FILE" | wc -l)
  local DONE=$(grep "^- \[x\]" "$TODO_MASTER_FILE" | wc -l)
  local PENDING=$(grep "^- \[ \]" "$TODO_MASTER_FILE" | wc -l)
  
  echo "📊 TODO Stats:"
  echo "  Total: $TOTAL"
  echo "  ✅ Done: $DONE"
  echo "  ⏳ Pending: $PENDING"
}

echo "💡 TODO System Loaded! Commands available:"
echo "  t 'text'        - Quick capture"
echo "  tf file 'text'  - Add to file + master"
echo "  ts 'keyword'    - Search todos"
echo "  th              - Show todos for current directory"
echo "  tl              - List recent todos"
echo "  td              - Mark todo as done"
echo "  todo-scan       - Scan directory for TODO comments"
echo "  todo-stats      - Show statistics"
echo "  tclip           - Add TODO from clipboard (with pwd context)"
echo "  tfile file.md   - Add TODO with specific file path"

# 9. Add TODO from clipboard (for right-click → copy → tclip workflow)
function tclip() {
  local CLIPBOARD_TEXT=$(pbpaste)
  local TODO_FILE="$HOME/Documents/master-todo/MASTER_TODO.md"
  
  # Get current directory and try to guess project
  local CURRENT_DIR=$(pwd)
  local PROJECT_NAME=$(basename "$CURRENT_DIR")
  
  # Build context with current location
  local CONTEXT="pwd:$CURRENT_DIR | project:$PROJECT_NAME"
  
  echo "- [ ] $CLIPBOARD_TEXT | $CONTEXT | $(date +"%Y-%m-%d %H:%M")" >> "$TODO_FILE"
  echo "✅ Added: $CLIPBOARD_TEXT"
  echo "📁 Context: $CURRENT_DIR"
}

# 10. Add TODO with specific file context
function tfile() {
  local FILE="$1"
  shift
  local TODO_TEXT="$*"
  local TODO_FILE="$HOME/Documents/master-todo/MASTER_TODO.md"
  
  if [[ -f "$FILE" ]]; then
    local FULL_PATH="$(pwd)/$FILE"
    echo "- [ ] $TODO_TEXT | file:$FULL_PATH | project:$(basename $(pwd)) | $(date +"%Y-%m-%d %H:%M")" >> "$TODO_FILE"
    echo "✅ Added: $TODO_TEXT"
    echo "📁 File: $FULL_PATH"
  else
    echo "❌ File not found: $FILE"
  fi
}