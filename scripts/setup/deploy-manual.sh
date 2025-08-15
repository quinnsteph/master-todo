#!/bin/bash
# Manual Netlify deployment script

set -e

echo "🚀 Manual Netlify Deployment"
echo "============================"

# Build the web app
echo "📦 Building web app..."
cd web
npm run build
cd ..

# Deploy using Netlify CLI with drag and drop
echo ""
echo "📌 MANUAL DEPLOYMENT STEPS:"
echo "============================"
echo ""
echo "1. Open your browser and go to: https://app.netlify.com/drop"
echo ""
echo "2. Drag this folder to the browser:"
echo "   📁 /Users/stephenquinn/Documents/master-todo/web/dist"
echo ""
echo "3. After deployment, go to Site Settings → Environment Variables"
echo ""
echo "4. Add these environment variables:"
echo "   SUPABASE_URL = https://hovzsjrjjmuhvcugvvxt.supabase.co"
echo "   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdnpzanJqam11aHZjdWd2dnh0Iiwicm9sZSI6InNlcnZpY2Utcm9sZSIsImlhdCI6MTc1NTI3ODA5MCwiZXhwIjoyMDcwODU0MDkwfQ.2OGsDN9V5eVThtEMQOKW-3ij-c1foyLBn0zxHt4Wnho"
echo "   INGEST_USER_ID = fd8286df-7f47-43d5-80c9-d7e9dd3c3d6e"
echo "   INGEST_SECRET = (generate a secure random string)"
echo ""
echo "5. To generate a secure INGEST_SECRET, run:"
echo "   openssl rand -hex 32"
echo ""
echo "6. Save the site URL for future reference"
echo ""
echo "============================"
echo ""

# Generate a secure token for reference
INGEST_SECRET=$(openssl rand -hex 32)
echo "📝 Generated INGEST_SECRET (copy this): $INGEST_SECRET"
echo ""

# Also create the SQL to run
echo "📊 Don't forget to run the SQL schema in Supabase!"
echo "   Go to: https://supabase.com/dashboard/project/hovzsjrjjmuhvcugvvxt/sql/new"
echo "   And run the contents of: supabase-schema.sql"
echo ""

# Open the browser to the drop page
echo "Opening Netlify Drop page..."
open https://app.netlify.com/drop 2>/dev/null || echo "Please manually open: https://app.netlify.com/drop"