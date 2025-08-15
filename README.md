# Master TODO System

A comprehensive TODO management system with cloud sync, web interface, and automated collection from code.

## 🚀 Features

- **Cloud Sync**: Supabase backend with real-time sync
- **Web Interface**: Modern React app with dark/light modes
- **Auto-Collection**: Git hooks and cron jobs capture TODOs from code
- **Dashboard**: Beautiful visualization of all TODOs
- **CLI Tools**: Quick terminal commands for TODO management

## 📁 Project Structure

```
master-todo/
├── docs/              # Documentation
├── scripts/           # Core functionality
│   ├── setup/        # Setup and deployment
│   └── *.sh          # Scanner and functions
├── web/              # React web application
├── netlify/          # Serverless functions
├── dashboard/        # Standalone dashboard
├── config/           # Configuration files
├── tests/            # Test files
└── MASTER_TODO.md    # Active TODO list
```

## 🔧 Quick Start

### 1. Terminal Commands (Always Available)
```bash
t "Quick todo"                      # Quick capture
tf file.md "TODO for specific file" # Add to file + master
tclip                               # Add from clipboard
ts "search"                         # Search todos
todo-scan                           # Scan for TODOs in code
```

### 2. Web Interface
Visit: https://master-todo-app-2025.netlify.app

### 3. Git Hook Auto-Capture

The git hook is **already active** in ALL your git projects!

#### Use Special Markers
In your **commit messages** or **code comments**, use:

- `TODO: Fix authentication bug`
- `[[Todo: Research caching options]]`
- `FIXME: Critical issue here`
- `HACK: Temporary solution`

These get **automatically captured** to MASTER_TODO.md when you commit!

#### Examples:

**In commit message:**
```bash
git commit -m "Fix login issue TODO: Add rate limiting"
```

**In code:**
```javascript
// [[Todo: Optimize this function]]
// TODO: Add error handling here
function processData() {
  // code
}
```

**In markdown:**
```markdown
## Setup Guide
[[Todo: Add installation video]]
TODO: Need examples here
```

## 📂 Your Master File
All TODOs are collected in: `~/Documents/master-todo/MASTER_TODO.md`

## ⚙️ Setup

### Quick Setup
```bash
cd scripts/setup
./setup.sh           # Local setup
./setup-cloud.sh     # Cloud integration
```

### Manual Deployment
```bash
cd scripts/setup
./deploy-manual.sh   # Manual Netlify deployment
```

## 🔄 Automation
- **Hourly**: Scans for TODO comments in code
- **On commit**: Git hook captures new TODOs
- **Weekly**: Cleanup and archive completed items

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Domain Setup](docs/DOMAIN_SETUP.md)
- [Architecture](docs/CLAUDE.md)
- [Refactoring Plan](docs/REFACTOR_PLAN.md)

## 🛠️ Technologies

- **Frontend**: React, Vite
- **Backend**: Netlify Functions, Supabase
- **Automation**: Bash scripts, Git hooks
- **Database**: PostgreSQL (Supabase)

## 📝 License

MIT