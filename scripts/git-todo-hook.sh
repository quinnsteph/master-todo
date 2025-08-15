#!/bin/bash
# Git post-commit hook - simplified: captures text, absolute path, and date

MASTER_FILE="$HOME/Documents/master-todo/MASTER_TODO.md"
TIMESTAMP=$(date '+%Y-%m-%d')
PROJECT_PATH=$(pwd)

# Check all files in the repository for TODO markers
find . -type f -name "*.md" -o -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.txt" | while read file; do
  # Skip node_modules and other directories
  if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".git"* ]]; then
    continue
  fi
  
  # Look for [[TD:text]] pattern
  grep -n "\[\[TD:.*\]\]" "$file" 2>/dev/null | while IFS=: read line_num content; do
    # Extract just the text between [[TD: and ]]
    TODO_TEXT=$(echo "$content" | sed -E 's/.*\[\[TD:(.*)\]\].*/\1/')
    
    if [[ -n "$TODO_TEXT" ]]; then
      # Get absolute path
      ABSOLUTE_PATH="$PROJECT_PATH/$file"
      ABSOLUTE_PATH=$(echo "$ABSOLUTE_PATH" | sed 's/^\.\///')  # Remove ./ prefix
      
      # Simple format: text | absolute path | date
      echo "- [ ] $TODO_TEXT | $ABSOLUTE_PATH | $TIMESTAMP" >> "$MASTER_FILE"
    fi
  done
  
  # Also look for TODO: pattern
  grep -n "TODO:" "$file" 2>/dev/null | while IFS=: read line_num content; do
    # Extract text after TODO:
    TODO_TEXT=$(echo "$content" | sed -E 's/.*TODO:\s*//' | sed 's/^[[:space:]]*//')
    
    if [[ -n "$TODO_TEXT" ]]; then
      ABSOLUTE_PATH="$PROJECT_PATH/$file"
      ABSOLUTE_PATH=$(echo "$ABSOLUTE_PATH" | sed 's/^\.\///')
      
      echo "- [ ] $TODO_TEXT | $ABSOLUTE_PATH | $TIMESTAMP" >> "$MASTER_FILE"
    fi
  done
done