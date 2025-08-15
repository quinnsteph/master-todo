# Deployment Instructions

## Current Status
✅ Supabase project created (hovzsjrjjmuhvcugvvxt)
✅ Web app built and ready
✅ User created in Supabase (fd8286df-7f47-43d5-80c9-d7e9dd3c3d6e)
⏳ Netlify deployment pending

## Next Steps

### 1. Run the SQL Schema in Supabase
1. Go to: https://supabase.com/dashboard/project/hovzsjrjjmuhvcugvvxt/sql/new
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to create the todos table with RLS policies

### 2. Deploy to Netlify (Manual Method)
Since automatic linking failed, use the manual deployment:

```bash
./deploy-manual.sh
```

This will:
- Build the web app
- Open Netlify Drop page
- Show you the environment variables to add

### 3. Manual Deployment Steps
1. Drag the `/web/dist` folder to https://app.netlify.com/drop
2. Once deployed, go to Site Settings → Environment Variables
3. Add these variables:
   - `SUPABASE_URL`: `https://hovzsjrjjmuhvcugvvxt.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: (your service role key)
   - `INGEST_USER_ID`: `fd8286df-7f47-43d5-80c9-d7e9dd3c3d6e`
   - `INGEST_SECRET`: (generate with `openssl rand -hex 32`)

### 4. Test the Deployment
Once deployed, test with:
```bash
# Visit your site
open https://your-site.netlify.app

# Test the dashboard
open https://your-site.netlify.app/dashboard.html
```

## Local Development
To run locally:
```bash
cd web
npm run dev
```

## Troubleshooting
- Make sure the SQL schema is run in Supabase
- Verify environment variables are set in Netlify
- Check browser console for any errors
- Ensure you're logged in with the user you created in Supabase