#!/bin/bash
# Install global git hook that works for ALL projects

echo "🚀 Setting up global git hooks..."

# 1. Create global hooks directory
GLOBAL_HOOKS_DIR="$HOME/.git-hooks"
mkdir -p "$GLOBAL_HOOKS_DIR"

# 2. Copy our hook to global location
cp "$HOME/Documents/master-todo/scripts/git-todo-hook.sh" "$GLOBAL_HOOKS_DIR/post-commit"
chmod +x "$GLOBAL_HOOKS_DIR/post-commit"

# 3. Configure git to use global hooks
git config --global core.hooksPath "$GLOBAL_HOOKS_DIR"

echo "✅ Global git hooks installed!"
echo ""
echo "📝 How it works:"
echo "  - ALL your git projects will now auto-capture TODOs"
echo "  - No need to install in each project"
echo "  - Use TODO:, [[TODO]], or [[TD:]] markers"
echo ""
echo "🔧 To disable for a specific project:"
echo "  cd /path/to/project"
echo "  git config --local core.hooksPath .git/hooks"
echo ""
echo "🔙 To uninstall global hooks:"
echo "  git config --global --unset core.hooksPath"