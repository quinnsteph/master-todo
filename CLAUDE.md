# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Master TODO System - A comprehensive TODO management application with:
- Cloud sync via Supabase backend
- React web application with Vite
- Automated TODO collection from code comments  
- Beautiful dashboard visualizations
- CLI tools for quick terminal management
- Git hooks for automatic capture

## Core Commands

### Development
```bash
# Web Application (React + Vite)
cd web
npm install              # Install dependencies
npm run dev             # Start dev server (port 5173)
npm run build           # Build for production
npm run lint            # Run ESLint
npm run preview         # Preview production build

# Deployment
npm run deploy:netlify  # Deploy to Netlify
```

### Testing
```bash
# Run test suite
cd tests
./test-scanner.sh      # Test scanner functionality
node test-todos.js      # Test TODO operations
```

### TODO Management
```bash
# Terminal commands (available globally after setup)
t "Quick todo"                      # Quick capture
tf file.md "TODO for specific file" # Add to file + master
tclip                               # Add from clipboard  
ts "search"                         # Search todos
todo-scan                           # Manual scan current directory
```

## Architecture

### Project Structure
```
master-todo/
├── web/                 # React application (Vite)
│   ├── src/            
│   │   ├── components/  # React components
│   │   └── lib/        # Supabase client
│   └── dist/           # Build output
├── netlify/            
│   └── functions/      # Serverless API endpoints
│       ├── todos.js    # CRUD operations
│       └── ingest.js   # TODO ingestion
├── scripts/            
│   ├── setup/          # Setup and deployment scripts
│   ├── todo-scanner.sh # Scans code for TODO markers
│   └── todo-functions.sh # Terminal command utilities
├── dashboard/          # Standalone HTML dashboards
└── MASTER_TODO.md      # Central TODO collection file
```

### Key Technologies
- **Frontend**: React 19, Vite 7
- **Backend**: Netlify Functions, Supabase (PostgreSQL)
- **Deployment**: Netlify (automatic builds from git)
- **Automation**: Bash scripts, Git hooks, Cron jobs

### TODO Marker Format
The scanner looks for multiple patterns in code:
- `[[Todo: Description]]` - Primary format  
- `TODO: Description` - Standard format
- `FIXME: Description` - For bugs
- `HACK: Description` - For temporary solutions

These are automatically collected to `MASTER_TODO.md` with metadata:
```markdown
- [ ] Task description | file:path:line | project:name | timestamp
```

### Web Application Flow
1. User authentication via Supabase Auth
2. TODOs stored in PostgreSQL database
3. Real-time sync across devices
4. Netlify Functions handle API requests
5. React frontend with local state management

### Scanner Logic
- **Directories scanned**: `~/Code`, `~/Projects`, `~/Documents`
- **File types**: `.md`, `.tsx`, `.jsx`, `.js`, `.ts`, `.py`, `.go`, `.rs`, `.java`, `.css`, `.scss`
- **Scan frequency**: Hourly via cron (`:15` past each hour)
- **Deduplication**: Checks file+line to avoid duplicates
- **Recency filter**: Only files modified in last 7 days

### Netlify Configuration
- **Build command**: `cd web && npm install && npm run build`
- **Publish directory**: `web/dist`
- **Functions directory**: `netlify/functions`
- **API routes**: `/api/*` → `/.netlify/functions/*`

### Environment Variables
Required for Netlify deployment:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - For server-side operations

## Development Notes

### Adding New Features
- React components go in `web/src/components/`
- API endpoints in `netlify/functions/`
- Scanner patterns updated in `scripts/todo-scanner.sh` line 36
- Terminal commands added to `scripts/todo-functions.sh`

### Database Schema
Supabase `todos` table:
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `text` (text)
- `completed` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `metadata` (jsonb) - stores file, project, line info

### Git Hook Integration  
The system installs a global git hook that captures TODOs from commit messages. Located at `~/.git-templates/hooks/post-commit`, it automatically extracts TODO/FIXME/HACK markers.

### Dashboard Options
- `dashboard/dashboard-modern.html` - Glassmorphism UI with floating orbs
- `dashboard/dashboard-optimized.html` - Performance-focused version
- Both dashboards parse MASTER_TODO.md directly (no server needed)