# Root Structure Refactoring Plan

## Current Issues
- Mixed concerns at root level (scripts, web files, configs, docs)
- Multiple dashboard HTML files at root
- Deployment scripts mixed with core functionality
- Documentation scattered

## Proposed New Structure

```
master-todo/
├── .github/            # GitHub specific files
│   └── workflows/      # CI/CD workflows
├── docs/              # All documentation
│   ├── DEPLOYMENT.md
│   ├── DOMAIN_SETUP.md
│   └── CLAUDE.md
├── scripts/           # All bash scripts (already exists)
│   ├── todo-scanner.sh
│   ├── todo-functions.sh
│   └── setup/         # Setup and deployment scripts
│       ├── setup.sh
│       ├── setup-cloud.sh
│       └── deploy-manual.sh
├── web/               # Web application (already exists)
│   ├── src/
│   ├── dist/
│   └── package.json
├── netlify/           # Netlify functions (already exists)
│   └── functions/
├── dashboard/         # Standalone dashboard files
│   └── index.html
├── config/           # Configuration files
│   ├── supabase-schema.sql
│   └── netlify.toml
├── tests/            # Test files
│   ├── test-scanner.sh
│   └── test-todos.js
├── .env.example      # Example environment variables
├── .gitignore
├── README.md         # Main documentation
├── MASTER_TODO.md    # Active TODO list
└── package.json      # Root package.json for scripts
```

## Benefits
1. **Clear separation of concerns**
2. **Easier navigation**
3. **Better for collaboration**
4. **Cleaner root directory**
5. **Logical grouping of related files**

## Implementation Steps
1. Create new directories
2. Move files to appropriate locations
3. Update import paths and references
4. Update scripts to reference new paths
5. Test everything still works
6. Update documentation