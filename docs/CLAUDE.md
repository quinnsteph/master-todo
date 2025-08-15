# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Master TODO System that automatically scans code files for `[[Todo:...]]` markers and centralizes them in `MASTER_TODO.md`. Built for developers with ADHD - minimal setup, clean logic, no overwhelming features.

## Core Workflow

1. **Write TODOs in your code:**
   ```javascript
   // [[Todo: Refactor the dashboard layout]]
   function Dashboard() {
     // [[Todo: Add loading state here]]
   }
   ```

2. **Scanner runs automatically** (hourly via cron) or manually via `todo-scan`

3. **TODOs collected** in `~/Documents/master-todo/MASTER_TODO.md`:
   ```markdown
   - [ ] Refactor the dashboard layout | file:/path/to/file.tsx:42 | project:project-name | auto-scan
   ```

4. **View in dashboard** by opening `todo-dashboard.html` and loading MASTER_TODO.md

## TODO Marker Format

**Primary format:** `[[Todo: Your task description here]]`

Currently scanner looks for `TODO:`, `FIXME:`, `HACK:` - needs updating to support `[[Todo:...]]` pattern.

## Architecture

### Scanner (`scripts/todo-scanner.sh`)
- Scans: `~/Documents`, `~/Code`, `~/Projects`
- Files: Modified in last 7 days
- Types: .md, .tsx, .jsx, .js, .ts, .py, .go, .rs, .java, .css, .scss
- Deduplication: Checks file+line to avoid duplicates
- Output format: `- [ ] text | file:path:line | project:name | auto-scan`

### Dashboard (`todo-dashboard.html`)
- Static HTML/JS (no server needed)
- Loads MASTER_TODO.md via file input
- Parses and displays in clean table format
- Shows: checkbox, text, file, line, project

### Terminal Commands (`scripts/todo-functions.sh`)
```bash
t "Quick todo"                      # Quick capture
tf file.md "TODO for specific file" # Add to file + master
tclip                               # Add from clipboard
ts "search"                         # Search todos
th                                  # Show todos for current directory
tl                                  # List recent todos
td                                  # Mark todo as done
todo-scan                           # Manual scan current directory
todo-stats                          # Show statistics
```

## Setup

```bash
# One-time setup
./setup.sh

# Add to ~/.zshrc
source ~/Documents/master-todo/scripts/todo-functions.sh
```

## Cron Jobs

- **Hourly scan**: Runs at :15 past each hour
- **Weekly cleanup**: Sunday 2am

## Future Enhancements (ADHD-Friendly)

### Priority 1 - Simple & Essential
- [ ] Update scanner to support `[[Todo:...]]` pattern
- [ ] Add project filtering to dashboard
- [ ] Add search bar to dashboard
- [ ] Dark mode toggle

### Priority 2 - Nice to Have
- [ ] Per-project `.todo.md` files
- [ ] Node.js rebuild for better performance
- [ ] Quick stats widget
- [ ] Keyboard shortcuts in dashboard

## Design Principles

1. **Minimal Setup** - No dependencies, no GitHub required
2. **Clean Logic** - Simple, understandable code
3. **ADHD-Friendly** - No overwhelm, clear visual hierarchy
4. **File-Based** - Everything in plain text files
5. **Scannable** - TODOs visible in code where they belong

## File Structure

```
master-todo/
├── MASTER_TODO.md          # Central TODO collection
├── todo-dashboard.html     # Web viewer
├── scripts/
│   ├── todo-scanner.sh     # Main scanner script
│   ├── todo-functions.sh   # Terminal commands
│   └── todo-cleanup.sh     # Weekly maintenance
├── backups/               # Automatic backups
└── setup.sh              # One-time setup
```

## Implementation Notes

- Scanner needs update: Change regex from `TODO:|FIXME:|HACK:` to `\[\[Todo:.*?\]\]`
- Dashboard is standalone - no server, just open HTML file
- All data stays local - privacy first
- Logs at `/tmp/todo-scanner.log` for debugging