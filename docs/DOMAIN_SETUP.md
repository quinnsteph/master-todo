# Custom Domain Setup for Master TODO

## Option 1: Use Netlify Subdomain (Free)
Your app is already available at: https://master-todo-app-2025.netlify.app

To change the subdomain:
1. Go to https://app.netlify.com/projects/master-todo-app-2025/settings/domain
2. Click "Options" → "Edit site name"
3. Choose a new name (e.g., `my-todos`, `stephens-todos`, etc.)
4. Your app will be available at: https://[your-name].netlify.app

## Option 2: Use Your Own Domain

### If you already own a domain:

#### Method A: Full DNS Delegation (Recommended)
1. Go to https://app.netlify.com/projects/master-todo-app-2025/settings/domain
2. Click "Add custom domain"
3. Enter your domain (e.g., `todos.yourdomain.com` or `yourdomain.com`)
4. Netlify will provide nameservers
5. Update your domain registrar to use Netlify's nameservers:
   - ns1.netlify.com
   - ns2.netlify.com
   - ns3.netlify.com
   - ns4.netlify.com

#### Method B: CNAME/A Record (Keep existing DNS)
1. Go to https://app.netlify.com/projects/master-todo-app-2025/settings/domain
2. Click "Add custom domain"
3. Enter your domain
4. Add these records at your DNS provider:

For apex domain (yourdomain.com):
```
Type: A
Name: @
Value: 75.2.60.5
```

For subdomain (todos.yourdomain.com):
```
Type: CNAME
Name: todos
Value: master-todo-app-2025.netlify.app
```

### If you need a new domain:

#### Free Options:
1. **Freenom** (free .tk, .ml, .ga domains)
   - Visit: https://www.freenom.com
   - Search for available domain
   - Register for free (up to 12 months)

2. **Duck DNS** (free subdomain)
   - Visit: https://www.duckdns.org
   - Create subdomain like: yourname.duckdns.org

#### Paid Options (Recommended):
1. **Namecheap**: ~$8-12/year for .com
2. **Google Domains**: ~$12/year for .com
3. **Cloudflare**: ~$8-9/year for .com (at cost)

## Option 3: Quick Rename (Easiest)

Run this command to rename your Netlify subdomain:
```bash
netlify sites:update --name your-preferred-name
```

Example:
```bash
netlify sites:update --name stephens-todos
# Your app will be at: https://stephens-todos.netlify.app
```

## SSL/HTTPS
✅ Netlify automatically provides free SSL certificates for all custom domains!

## After Domain Setup

Update your environment variables if needed:
1. Update any OAuth redirect URLs in Supabase
2. Update CORS settings if applicable
3. Update your local `.todo-cloud-config` with new URL:
   ```bash
   export API_BASE="https://your-new-domain.com"
   ```

## Current Domain Status
- **Current URL**: https://master-todo-app-2025.netlify.app
- **Status**: Active and deployed
- **SSL**: Enabled
- **Functions**: Working at /api/*

## Need Help?
- Netlify Domains Docs: https://docs.netlify.com/domains-https/custom-domains/
- DNS Propagation Check: https://www.whatsmydns.net/