#!/bin/bash
# One-time setup script for TODO system

echo "🚀 Setting up TODO System..."

# Make scripts executable
chmod +x ~/Documents/master-todo/scripts/*.sh

# Setup cron jobs for automation
echo "📅 Setting up automated scanning..."

# Check if crontab exists
crontab -l > /tmp/current_cron 2>/dev/null || touch /tmp/current_cron

# Add hourly scanner (runs every hour at :15)
if ! grep -q "todo-scanner.sh" /tmp/current_cron; then
  echo "15 * * * * $HOME/Documents/master-todo/scripts/todo-scanner.sh >/dev/null 2>&1" >> /tmp/current_cron
  echo "✅ Added hourly TODO scanner"
fi

# Add weekly cleanup (runs Sunday at 2am)
if ! grep -q "todo-cleanup.sh" /tmp/current_cron; then
  echo "0 2 * * 0 $HOME/Documents/master-todo/scripts/todo-cleanup.sh >/dev/null 2>&1" >> /tmp/current_cron
  echo "✅ Added weekly cleanup"
fi

# Install new crontab
crontab /tmp/current_cron
rm /tmp/current_cron

echo "✅ Cron jobs installed"

# Create git hook template
cat > ~/Documents/master-todo/scripts/post-commit-hook << 'EOF'
#!/bin/bash
# Git post-commit hook - add to .git/hooks/post-commit in your projects

# Capture TODOs from commit message
COMMIT_MSG=$(git log -1 --pretty=%B)
if echo "$COMMIT_MSG" | grep -qi "todo\|fixme\|hack"; then
  echo "- [ ] [COMMIT] $COMMIT_MSG | project:$(basename $(pwd)) | $(date +"%Y-%m-%d %H:%M")" >> ~/Documents/master-todo/MASTER_TODO.md
fi

# Scan changed files for new TODOs
git diff HEAD~1 --name-only | while read file; do
  grep -Hn "TODO:\|FIXME:" "$file" 2>/dev/null | while IFS=: read filepath line content; do
    TODO_TEXT=$(echo "$content" | sed 's/.*TODO: *//' | sed 's/ *-->.*//')
    echo "- [ ] $TODO_TEXT | file:$filepath:$line | commit:$(git rev-parse --short HEAD)" >> ~/Documents/master-todo/MASTER_TODO.md
  done
done
EOF

chmod +x ~/Documents/master-todo/scripts/git-todo-hook.sh

echo "
✅ TODO System Setup Complete!

📝 Quick Start Guide:
─────────────────────

1. Reload your terminal:
   source ~/.zshrc

2. Terminal commands:
   t 'Quick todo'                - Quick capture
   tf file.txt 'Add to file'     - Add to file + master
   tclip                         - Add from clipboard
   ts 'keyword'                  - Search todos

3. Git Hook (for auto-capture):
   In any git project:
   cp ~/Documents/master-todo/scripts/git-todo-hook.sh .git/hooks/post-commit

   Then use markers in commits or code:
   TODO: Your task here
   [[TODO]] Another task
   [[TD:Quick note]]

4. Your master TODO file:
   ~/Documents/master-todo/MASTER_TODO.md

📊 Automation:
- On commit: Git hook captures TODOs
- Hourly: Scans for TODO comments
- Weekly: Cleanup and archive

See README.md for details! 🎉
"