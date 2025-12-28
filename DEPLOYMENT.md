# 📦 DEPLOYMENT GUIDE - Stock Opname Turbo

## 🌐 Deployment Options

### Option 1: Netlify (Recommended - Free Tier Available)

**Pros:** Free, automatic CI/CD, easy deployment
**Cons:** Serverless functions may have latency

#### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/stock-opname.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repo
   - Set build settings:
     - Build command: `pnpm build`
     - Publish directory: `dist`

3. **Add Environment Variables**
   - In Netlify dashboard: Settings → Environment
   - Add:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_KEY=your-anon-public-key
     ```

4. **Deploy**
   - Netlify auto-deploys on push to main
   - Check deployment status in Netlify dashboard

---

### Option 2: Vercel (Alternative)

**Pros:** Excellent performance, free tier
**Cons:** Similar to Netlify

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login & Deploy**
   ```bash
   vercel login
   vercel
   ```

3. **Configure Environment**
   - Follow Vercel CLI prompts
   - Add env vars in Vercel dashboard

---

### Option 3: Traditional Server (VPS/Dedicated)

**Pros:** Full control, no limits
**Cons:** Requires server management

#### Steps:

1. **Build Production**
   ```bash
   pnpm build
   ```

2. **Copy `dist/` to Server**
   ```bash
   scp -r dist/ user@server:/var/www/stock-opname/
   ```

3. **Setup Web Server** (Nginx example)
   ```nginx
   server {
       listen 80;
       server_name stock-opname.example.com;
       
       root /var/www/stock-opname/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Enable gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript;
   }
   ```

4. **Setup HTTPS** (Let's Encrypt)
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d stock-opname.example.com
   ```

---

### Option 4: Docker (Container Deployment)

#### Dockerfile

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN pnpm build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Deploy with Docker

```bash
# Build image
docker build -t stock-opname:latest .

# Run container
docker run -d -p 80:80 --name stock-opname stock-opname:latest
```

---

## 🔒 Security Checklist

### Before Production

- [ ] **Environment Variables**
  - [ ] Use `.env.production` for secrets
  - [ ] Never commit `.env` files
  - [ ] Rotate Supabase keys regularly

- [ ] **Supabase Security**
  - [ ] Enable RLS (Row Level Security) policies
  - [ ] Restrict API key permissions
  - [ ] Enable Postgres security features
  - [ ] Regular backups enabled

- [ ] **Frontend Security**
  - [ ] No sensitive data in localStorage (except token)
  - [ ] Validate all user inputs
  - [ ] Use Content Security Policy (CSP) headers
  - [ ] Enable HSTS

- [ ] **CORS & HTTPS**
  - [ ] Use HTTPS only
  - [ ] Configure proper CORS headers
  - [ ] Validate origin on API calls

### Security Headers (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

---

## 📊 Monitoring & Logging

### Application Monitoring

```js
// Add to App.vue or main.js
if (window.location.hostname !== 'localhost') {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    // Send to error tracking service
  })
}
```

### Log to Service (Sentry Example)

```bash
pnpm add @sentry/vue @sentry/tracing
```

```js
// main.js
import * as Sentry from "@sentry/vue"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
})
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 📈 Performance Optimization

### Build Optimization

```bash
# Check bundle size
pnpm build --report

# Analyze dependencies
npm ls --depth=0
```

### Code Splitting

Already configured in Vite. Components are lazy-loaded:

```js
// Automatic in Vite
import DashboardView from './views/DashboardView.vue'
```

### Caching Strategy

```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Don't cache HTML
location = /index.html {
    add_header Cache-Control "public, max-age=0";
}
```

---

## 📱 Mobile Optimization

The app is fully responsive with Tailwind CSS.

### Mobile Performance Tips

1. **Reduce images**: Use WebP format
2. **Minify assets**: Automatic in `pnpm build`
3. **Lazy load**: Already implemented for views
4. **PWA (Optional)**: Add service worker for offline support

---

## 🆘 Troubleshooting Production

### App shows blank page
- Check browser console for errors
- Verify `.env.production` variables
- Check network tab for failed requests

### Search is slow
- Clear browser cache
- Check Supabase connection
- Verify products are loaded in Pinia store

### CORS errors
- Add domain to Supabase CORS settings
- Check Authorization headers

### Database connection timeout
- Check Supabase status page
- Verify network firewall rules
- Test with Supabase dashboard directly

---

## 📞 Support & Rollback

### Rollback to Previous Version

```bash
# If using Netlify
netlify deploy --prod --dir=dist

# If using Git
git revert <commit-hash>
git push origin main
```

### Emergency Debug

Create `debug.html` in root:

```html
<!DOCTYPE html>
<html>
<head><title>Debug</title></head>
<body>
  <h1>Stock Opname - Debug Info</h1>
  <pre id="debug"></pre>
  <script>
    const debug = {
      userAgent: navigator.userAgent,
      localStorage: JSON.stringify(localStorage),
      location: window.location.href,
      timestamp: new Date().toISOString()
    }
    document.getElementById('debug').textContent = JSON.stringify(debug, null, 2)
  </script>
</body>
</html>
```

---

## 📋 Deployment Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database schema verified
- [ ] Sample data loaded
- [ ] Performance tested (<0.1s search)
- [ ] Mobile responsiveness tested
- [ ] Error handling verified
- [ ] HTTPS/SSL enabled
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

**🎉 Ready to deploy! Good luck!**
