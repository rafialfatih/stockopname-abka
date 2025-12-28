# Netlify Setup - Step by Step

## Your GitHub Repository
✅ **Already configured:**
- Repository: `https://github.com/rafialfatih/stockopname-abka.git`
- Branch: `main`
- Status: Pushed and ready

## Step 1: Connect to Netlify via GitHub

1. Go to **[netlify.com](https://netlify.com)**
2. Click **"Sign up"** or **"Log in"**
3. Choose **"Continue with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Click **"Add new site"** → **"Import an existing project"**
6. Select **GitHub** as the provider
7. Find and select **`rafialfatih/stockopname-abka`** repository

## Step 2: Configure Build Settings

Netlify will auto-detect most settings from `netlify.toml`. Verify:

- **Build command:** `pnpm build` ✅ (auto-detected from netlify.toml)
- **Publish directory:** `dist` ✅ (auto-detected from netlify.toml)
- **Base directory:** (leave empty)
- **Node version:** Use 18.x or higher

## Step 3: Add Environment Variables

**Critical:** Add these in Netlify Dashboard before deploying

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **"Edit variables"**
3. Add these variables:

```
VITE_SUPABASE_URL = https://YOUR_SUPABASE_URL.supabase.co
VITE_SUPABASE_ANON_KEY = YOUR_ANON_KEY_HERE
```

To find your values:
- Go to [supabase.com](https://supabase.com) → Your project → Settings
- Copy **Project URL** → paste as `VITE_SUPABASE_URL`
- Copy **Anon Key** → paste as `VITE_SUPABASE_ANON_KEY`

## Step 4: Deploy

1. Click **"Deploy site"**
2. Netlify will automatically:
   - Detect your main branch
   - Install dependencies with pnpm
   - Build the project
   - Deploy to a preview URL
   - Show you the deployed site

Wait for the build to complete (usually 1-2 minutes).

## Step 5: Verify Deployment

Once deployed:
1. ✅ Check if site loads without blank page
2. ✅ Try logging in with your team credentials
3. ✅ Test Excel import/export
4. ✅ Verify auto-refresh polling (History tab)
5. ✅ Check responsive design on mobile

## Future Deployments

**Automatic:** Every push to `main` branch triggers a new deployment
```bash
git add .
git commit -m "Your changes"
git push origin main
# Netlify automatically builds and deploys!
```

## Troubleshooting

### Build fails with "pnpm not found"
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Ensure **Node version** is set to 18+
3. Trigger a redeploy

### Environment variables not loading
1. Verify variables are added in Netlify dashboard (not in .env)
2. Check variable names start with `VITE_`
3. Redeploy site after adding variables

### Blank white page after deploy
1. Open browser DevTools (F12) → Console
2. Look for error messages
3. Check Netlify build logs: **Deployments** → Click build → **Build log**

### Database connection errors
1. Verify Supabase credentials are correct
2. Check Supabase project is not paused
3. Ensure RLS policies allow your anon key to read tables

## Custom Domain Setup

Once site is live and stable:
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., inventory.abkamart.com)
4. Follow DNS configuration instructions
5. Netlify provides free HTTPS certificate

---

**Your deployment is ready! Follow the steps above and your site will be live on Netlify in minutes.**
