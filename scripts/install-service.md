# Installing Right-Click TODO Service

## Method 1: Automator Quick Action (Recommended)

1. Open Automator (Spotlight search: "Automator")
2. Choose "Quick Action" (or "Service" on older macOS)
3. Set "Workflow receives current: text" in "any application"
4. Add action: "Run Shell Script"
5. Set Shell: /bin/bash
6. Set "Pass input: as arguments"
7. Paste this script:

```bash
#!/bin/bash
SELECTED_TEXT="$*"
TODO_FILE="$HOME/Documents/master-todo/MASTER_TODO.md"
APP_NAME=$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true')
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

# Add TODO with context
echo "- [ ] $SELECTED_TEXT | via:$APP_NAME | $TIMESTAMP" >> "$TODO_FILE"

# Show notification
osascript -e "display notification \"Added: $SELECTED_TEXT\" with title \"TODO Captured\" sound name \"Glass\""
```

8. Save as: "Add TODO"
9. It will appear in Services menu when you right-click selected text!

## Method 2: Keyboard Shortcut

After creating the service:
1. System Preferences → Keyboard → Shortcuts → Services
2. Find "Add TODO" under Text section
3. Add shortcut: ⌘⇧T (or your preference)
4. Now you can select text and press ⌘⇧T to add TODO!

