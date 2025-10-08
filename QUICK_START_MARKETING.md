# 🚀 Quick Start - InsightAI Marketing Site

## ⚡ Fastest Way to Run

### Option 1: Double-click the batch file (Windows)
```
Double-click: run-marketing.bat
```
This will:
1. Install dependencies (if needed)
2. Start the dev server
3. Open http://localhost:3001

### Option 2: Manual commands
```bash
cd marketing
npm install
npm run dev
```

## 📸 Add Your Dashboard Screenshot

1. Take a screenshot of your dashboard
2. Save it as: `screenshots/dashboard-view.png`
3. Recommended size: 1600px wide or larger

## 🎨 Customize Content

### Change the Tagline
File: `marketing/components/HeroSection.tsx`
Line 12:
```tsx
<p className="hero-tagline">
  Your new tagline here
</p>
```

### Update Features
File: `marketing/components/FeaturesSection.tsx`
Lines 4-34: Edit the `features` array

### Change Colors
File: `marketing/styles.css`
Lines 4-12: Edit CSS variables

## 🌐 Deploy

### Build for production
```bash
cd marketing
npm run build
```

The `dist/` folder is ready to deploy to any static host:
- Vercel
- Netlify  
- GitHub Pages
- Cloudflare Pages

## 📁 Project Structure

```
marketing/
├── components/        # React components
├── App.tsx           # Main app
├── styles.css        # All styles
├── index.html        # Entry HTML
└── package.json      # Dependencies
```

## 🔗 Ports

- **Main App**: http://localhost:5173
- **Marketing**: http://localhost:3001

Both can run simultaneously!

## ✅ Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Add dashboard screenshot
- [ ] Customize tagline
- [ ] Update feature descriptions
- [ ] Test on mobile
- [ ] Build for production
- [ ] Deploy to hosting

## 💡 Tips

- The marketing site is **completely separate** from your main app
- It uses its own `package.json` and dependencies
- You can deploy it to a different domain if needed
- All styling is in `styles.css` - easy to customize
- Mobile responsive out of the box

## 🎉 That's It!

You now have a professional marketing site for InsightAI.

**Questions?** Check `MARKETING_SITE.md` for the complete guide.
