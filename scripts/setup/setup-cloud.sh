#!/bin/bash
# Cloud Setup Script for TODO System with Supabase + Netlify

set -e  # Exit on error

echo "🚀 Setting up TODO System Cloud Integration"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "\n${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v netlify &> /dev/null; then
    echo "⚠️  Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Step 2: Install dependencies
echo -e "\n${BLUE}📦 Installing dependencies...${NC}"
npm install
cd web && npm install && cd ..

# Step 3: Supabase Setup
echo -e "\n${GREEN}🗄️  SUPABASE SETUP${NC}"
echo "================================"
echo "1. Go to: https://supabase.com/dashboard/projects"
echo "2. Click 'New Project'"
echo "3. Fill in:"
echo "   - Project name: todo-app"
echo "   - Database Password: (save this!)"
echo "   - Region: (choose closest)"
echo ""
read -p "Press ENTER when you've created the project..."

echo -e "\n${YELLOW}Please enter your Supabase details:${NC}"
read -p "Supabase URL (https://xxxxx.supabase.co): " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "Supabase Service Role Key: " SUPABASE_SERVICE_KEY

# Save to .env files
echo "VITE_SUPABASE_URL=$SUPABASE_URL" > web/.env
echo "VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> web/.env

# Step 4: Database Setup
echo -e "\n${BLUE}🏗️  Setting up database...${NC}"
echo "================================"
echo "Go to your Supabase Dashboard → SQL Editor"
echo "Run the contents of: config/supabase-schema.sql"
echo ""
echo "Or copy and paste this:"
cat ../../config/supabase-schema.sql
echo ""
read -p "Press ENTER when you've run the SQL..."

# Step 5: Get User ID
echo -e "\n${BLUE}👤 Setting up authentication...${NC}"
echo "================================"
echo "1. Go to Supabase Dashboard → Authentication → Users"
echo "2. Click 'Add User' → 'Create New User'"
echo "3. Enter your email and password"
echo "4. Copy the User UID that appears"
echo ""
read -p "Enter your User UID: " USER_ID

# Generate a secure ingestion secret
INGEST_SECRET=$(openssl rand -hex 32)
echo -e "${GREEN}✅ Generated secure ingestion secret${NC}"

# Step 6: Deploy to Netlify
echo -e "\n${BLUE}🚀 Deploying to Netlify...${NC}"
echo "================================"

# Check if already linked to Netlify
if [ ! -f "../../.netlify/state.json" ]; then
    echo "Initializing Netlify site..."
    netlify init
else
    echo "Site already linked to Netlify"
fi

# Set environment variables
echo -e "\n${BLUE}🔐 Setting environment variables...${NC}"
netlify env:set SUPABASE_URL "$SUPABASE_URL"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_KEY"
netlify env:set INGEST_SECRET "$INGEST_SECRET"
netlify env:set INGEST_USER_ID "$USER_ID"

# Deploy
echo -e "\n${BLUE}🌍 Deploying site...${NC}"
netlify deploy --build --prod

# Get the site URL
SITE_URL=$(netlify status --json | grep -o '"url":"[^"]*' | grep -o 'https://[^"]*' | head -1)

# Step 7: Configure local scanner for cloud sync
echo -e "\n${BLUE}⚙️  Configuring local scanner...${NC}"
echo "================================"

# Create scanner config
cat > ~/.todo-cloud-config << EOF
# TODO Cloud Sync Configuration
export API_BASE="$SITE_URL"
export INGEST_SECRET="$INGEST_SECRET"
EOF

echo -e "${GREEN}✅ Cloud config saved to ~/.todo-cloud-config${NC}"

# Add to shell config if not already there
if ! grep -q "todo-cloud-config" ~/.zshrc 2>/dev/null; then
    echo "" >> ~/.zshrc
    echo "# TODO Cloud Sync" >> ~/.zshrc
    echo "[ -f ~/.todo-cloud-config ] && source ~/.todo-cloud-config" >> ~/.zshrc
    echo -e "${GREEN}✅ Added to ~/.zshrc${NC}"
fi

# Step 8: OAuth Setup (Optional)
echo -e "\n${YELLOW}🔑 OAuth Setup (Optional)${NC}"
echo "================================"
echo "To enable Google login:"
echo "1. Go to Supabase → Authentication → Providers → Google"
echo "2. Enable Google provider"
echo "3. Add redirect URL: $SITE_URL"
echo ""

# Step 9: Summary
echo -e "\n${GREEN}🎉 SETUP COMPLETE!${NC}"
echo "================================"
echo -e "📱 Web App: ${BLUE}$SITE_URL${NC}"
echo -e "📊 Dashboard: ${BLUE}$SITE_URL/dashboard.html${NC}"
echo -e "🔐 Ingestion Secret: ${YELLOW}$INGEST_SECRET${NC}"
echo ""
echo "Test commands:"
echo "  # Test local web app"
echo "  cd web && npm run dev"
echo ""
echo "  # Test cloud ingestion"
echo "  curl -X POST \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -H \"x-ingest-secret: $INGEST_SECRET\" \\"
echo "    -d '[{\"text\":\"Test TODO from CLI\",\"source\":\"test\"}]' \\"
echo "    $SITE_URL/api/ingest"
echo ""
echo "  # Run scanner with cloud sync"
echo "  source ~/.todo-cloud-config"
echo "  todo-scan"
echo ""
echo -e "${GREEN}Your TODOs now sync to the cloud! 🚀${NC}"