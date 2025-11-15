# 🚀 Netlify Deployment Settings for InsightAI Marketing Site

## Build Settings

### Build Command
```bash
npm run build
```

### Publish Directory
```
dist
```

### Base Directory
```
marketing
```

## Environment Variables
No environment variables needed for the marketing site (it's static).

## Build Configuration (netlify.toml)

Create a `netlify.toml` file in the **marketing** folder:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Deployment Steps

1. **Connect Repository**
   - Go to Netlify Dashboard
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Base directory: `marketing`
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add custom domain (e.g., `insightai.com`)
3. Configure DNS records as instructed by Netlify

## Continuous Deployment

- Netlify automatically deploys when you push to your main branch
- Preview deployments for pull requests
- Instant rollback if needed

## Performance Optimizations

Netlify automatically provides:
- ✅ CDN distribution
- ✅ HTTPS/SSL
- ✅ Asset optimization
- ✅ Gzip compression
- ✅ HTTP/2

## Troubleshooting

### Build Fails
- Check that `npm run build` works locally
- Verify Node version (use Node 18+)
- Check build logs in Netlify dashboard

### 404 Errors
- Ensure the `[[redirects]]` rule is in `netlify.toml`
- This enables client-side routing

### Slow Build Times
- Build time should be ~30-60 seconds
- If slower, check for large dependencies
