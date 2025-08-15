# Master TODO System

## Quick Start

### 1. Terminal Commands (Always Available)
```bash
t "Quick todo"                      # Quick capture
tf file.md "TODO for specific file" # Add to file + master
tclip                               # Add from clipboard
ts "search"                         # Search todos
```

### 2. Git Hook Auto-Capture

#### Already Installed Globally! ✅
The git hook is **already active** in ALL your git projects!

No installation needed - just start using the markers below.

#### Use Special Markers
In your **commit messages** or **code comments**, use:

- `TODO: Fix authentication bug`
- `[[TODO]] Research caching options`
- `[[TD:Quick note about this]]`

These get **automatically captured** to MASTER_TODO.md when you commit!

#### Examples:

**In commit message:**
```bash
git commit -m "Fix login issue TODO: Add rate limiting"
```

**In code:**
```javascript
// TODO: Optimize this function
// [[TD:Add error handling here]]
function processData() {
  // code
}
```

**In markdown:**
```markdown
## Setup Guide
[[TODO]] Add installation video
[[TD:Need examples here]]
```

## Your Master File
All TODOs are collected in: `~/Documents/master-todo/MASTER_TODO.md`

## Automation
- **Hourly**: Scans for TODO comments
- **On commit**: Git hook captures new TODOs
- **Weekly**: Cleanup and archive


[[TODO]this is a test in my read.me file [[TODO]