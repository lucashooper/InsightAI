# Netlify Build Settings for InsightAI

## 🚀 Build Configuration

Based on your Netlify deployment screen, use the following settings:

### **Build Command:**
```
npm run build
```

### **Publish Directory:**
```
dist
```

### **Base Directory:**
Leave empty (or use `/` if required)

### **Functions Directory:**
```
netlify/functions
```
(Only if you add serverless functions later)

---

## 📋 Complete Settings

Here's what each field should contain:

| Setting | Value |
|---------|-------|
| **Branch to deploy** | `master` |
| **Base directory** | (leave empty) |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |
| **Functions directory** | `netlify/functions` (optional) |

---

## 🔐 Environment Variables

You'll need to add your environment variables in Netlify:

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add the following:

### Required Variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### How to get these values:

**Supabase:**
- Go to your Supabase project
- Click **Settings** → **API**
- Copy the **Project URL** (for `VITE_SUPABASE_URL`)
- Copy the **anon/public key** (for `VITE_SUPABASE_ANON_KEY`)

**OpenAI:**
- Go to https://platform.openai.com/api-keys
- Create a new API key
- Copy it to `VITE_OPENAI_API_KEY`

---

## ⚙️ Additional Netlify Settings

### Redirects (if needed)

Create a `netlify.toml` file in your project root:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This ensures your React routes work properly (SPA redirect).

### Build Time

Expect build time: **2-4 minutes**

---

## 🎯 Deployment Checklist

Before deploying, verify:

- [ ] `package.json` has correct build script: `"build": "vite build"`
- [ ] All environment variables are set in Netlify
- [ ] `.gitignore` includes `.env` (don't commit secrets!)
- [ ] Supabase URL redirect is configured:
  - In Supabase dashboard → **Authentication** → **URL Configuration**
  - Add your Netlify URL: `https://your-app.netlify.app`
- [ ] Test build locally: `npm run build`
- [ ] Test preview locally: `npm run preview`

---

## 🐛 Troubleshooting

### Build Fails: "vite: not found"
**Solution:** Add to `package.json` under `devDependencies`:
```json
"vite": "^5.0.0"
```

### Build Fails: Module not found
**Solution:** Clear cache and rebuild
```bash
npm ci
npm run build
```

### 404 on page refresh
**Solution:** Add the `netlify.toml` redirect rule (see above)

### Environment variables not working
**Solution:** 
- Make sure they start with `VITE_` prefix
- Redeploy after adding variables
- Variables should be in **Netlify dashboard**, not `.env`

### Auth redirect failing
**Solution:**
- Add Netlify URL to Supabase Auth settings
- Update `VITE_SUPABASE_URL` environment variable
- Clear browser cache and cookies

---

## 📊 Post-Deployment

After successful deployment:

1. **Custom Domain** (optional):
   - Site settings → Domain management → Add custom domain

2. **HTTPS:**
   - Automatically enabled by Netlify

3. **Performance:**
   - Check Lighthouse scores
   - Enable **Asset Optimization** in Netlify settings

4. **Analytics** (optional):
   - Enable Netlify Analytics for traffic insights

---

## 🎉 Quick Deploy

**Summary of what to paste in Netlify:**

```
Build command: npm run build
Publish directory: dist
```

**That's it!** Click "Deploy site" and you're done.

---

## 📝 Your Current Values

Based on your screenshot, I can see:

✅ **Team:** coffeeappofficial's team  
✅ **Repository:** InsightAI  
✅ **Branch:** master  
✅ **Project name:** insightaiapp  

You're all set! Just add the build command and publish directory, configure environment variables, and deploy.

---

## 🔗 Useful Netlify Commands

```bash
# Install Netlify CLI (optional for local testing)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Test build locally with Netlify environment
netlify build

# Deploy from CLI
netlify deploy --prod
```

---

## ⚡ Pro Tips

1. **Enable Deploy Previews** for every PR
2. **Set up Branch Deploys** for staging
3. **Use Netlify Forms** if you add a contact form later
4. **Enable Split Testing** for A/B testing
5. **Monitor Bandwidth** to avoid overages

---

Good luck with your deployment! 🚀
