# Netlify Deployment Guide - ABKA Mart Inventory Management System

## Quick Setup (Recommended)

### 1. Push to GitHub

```bash
cd d:\Program\projec\project-so\stock-opname
git add .
git commit -m "Initial commit: ABKA Mart Inventory Management System

- Vue 3 + Composition API
- Supabase integration for real-time data
- Font Awesome icons
- Professional UI with Tailwind CSS
- Excel import/export functionality
- Auto-refresh polling every 2 seconds
- Pre-loading optimization on login"

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stock-opname.git
git push -u origin main
```

### 2. Deploy to Netlify

#### Option A: Via Netlify UI (Easiest)

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Select GitHub and authorize
4. Choose your `stock-opname` repository
5. Configure build settings:
   - **Build command:** `pnpm build`
   - **Publish directory:** `dist`
6. Set environment variables in **Site settings** → **Build & deploy** → **Environment**:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
7. Click **"Deploy site"**

#### Option B: Via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from project root
cd d:\Program\projec\project-so\stock-opname
netlify deploy --prod

# Follow prompts to connect to GitHub and set environment variables
```

### 3. Configure Environment Variables

In Netlify Dashboard:
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add these variables:
   ```
   VITE_SUPABASE_URL = https://YOUR_SUPABASE_URL.supabase.co
   VITE_SUPABASE_ANON_KEY = YOUR_ANON_KEY_HERE
   ```

## What's Included

- **netlify.toml**: Build configuration with:
  - SPA routing (all routes redirect to index.html)
  - Asset caching (1 year for JS/CSS/images)
  - Security headers (XSS protection, clickjacking prevention)
  - Development server configuration

- **.gitignore**: Updated with Vite and build artifacts

- **Automatic builds**: Every push to `main` branch triggers a new deployment

## Post-Deployment Checklist

- [ ] Verify Supabase connection works
- [ ] Test login functionality
- [ ] Test Excel import/export
- [ ] Verify auto-refresh polling (History tab)
- [ ] Check responsive design on mobile
- [ ] Test product search and stock entry

## Monitoring & Logs

In Netlify Dashboard:
- **Deployments**: See build history and logs
- **Analytics**: View traffic and performance
- **Notifications**: Set up Slack/email alerts for failed builds

## Troubleshooting

### Build fails with "pnpm not found"
- Netlify may default to npm. Set build environment variable:
  - Go to **Environment** and add `NPM_FLAGS=--version`
  - Or switch to npm in your package.json scripts

### Environment variables not loading
- Ensure variables are set in Netlify dashboard (not .env file)
- Prefix must be `VITE_` for Vite to expose them
- Redeploy after adding variables

### Blank page after deployment
- Check browser console for errors
- Verify Supabase credentials are correct
- Check Netlify deploy logs for build errors

## Redeployment

Push to main branch to trigger automatic redeploy:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Netlify will:
1. Detect the push
2. Run `pnpm build`
3. Deploy the `dist/` folder
4. Assign a preview URL
5. Deploy to production domain

## Custom Domain

1. In Netlify dashboard, go to **Domain settings**
2. Click **Add custom domain**
3. Follow DNS setup instructions
4. Enable HTTPS (automatic)

## Notes

- Build output is in the `dist/` folder
- Node version used: Latest available on Netlify (usually 18+)
- Builds typically complete in 1-2 minutes
- Each deployment gets a unique preview URL before going live
