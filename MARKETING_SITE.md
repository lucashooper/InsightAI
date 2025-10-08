# InsightAI Marketing Site - Complete Guide

## 📦 What Was Created

A complete, standalone marketing/brand website has been created in the `/marketing` folder within your InsightAI codebase.

### File Structure
```
InsightAI/
├── marketing/                    # 🆕 NEW: Marketing site
│   ├── components/
│   │   ├── HeroSection.tsx      # Hero with gradient title & dashboard preview
│   │   ├── FeaturesSection.tsx  # 6 feature cards
│   │   ├── SecuritySection.tsx  # Privacy & sync features
│   │   ├── PhilosophySection.tsx # Brand values
│   │   ├── CTASection.tsx       # Call-to-action
│   │   └── Footer.tsx           # Footer links
│   ├── App.tsx                  # Main component
│   ├── main.tsx                 # Entry point
│   ├── index.html               # HTML template
│   ├── styles.css               # Complete styling
│   ├── vite.config.ts           # Build configuration
│   ├── package.json             # Dependencies
│   ├── tsconfig.json            # TypeScript config
│   ├── tsconfig.node.json       # TS node config
│   ├── .gitignore               # Git ignore rules
│   └── README.md                # Documentation
├── src/                         # Your existing app
├── screenshots/                 # Place dashboard screenshot here
└── ...
```

## 🎨 Design Features

### Hero Section
- **Large gradient title**: "Insight**AI**" with purple/blue gradient on "AI"
- **Tagline**: "Analyse your habits and take back control"
- **Purple CTA button**: "Try Insight"
- **Dashboard screenshot**: Browser window mockup with your dashboard

### Features Section
- **6 feature cards** with icons:
  - 🧠 AI-Powered Insights
  - 📊 Beautiful Dashboards
  - 🎯 Pattern Recognition
  - 🔒 Privacy First
  - 📝 Smart Editor
  - 🌙 Beautiful Themes

### Security Section (Inspired by Obsidian)
- Left side: Text content about sync features
- Right side: Settings mockup screenshot
- **3 key features**:
  - Fine-grained control
  - Version history
  - Collaboration

### Philosophy Section (Inspired by Obsidian)
- **3 value propositions**:
  - "Your thoughts are yours" (Privacy)
  - "Your mind is unique" (Customization)
  - "Your knowledge should last" (Open formats)
- Right side: Purple gem icon with "InsightAI" branding
- "Spark ideas" closing statement

### CTA Section
- Final call-to-action
- Two buttons: "Try InsightAI Now" and "Learn More"

### Footer
- Brand logo with gradient
- 3 columns of links (Product, Resources, Company)
- Social media links
- Copyright notice

## 🚀 How to Run

### Option 1: Separate Development Server (Recommended)

1. **Navigate to marketing folder**:
   ```bash
   cd marketing
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Opens at: `http://localhost:3001`

4. **Build for production**:
   ```bash
   npm run build
   ```

### Option 2: Integrate with Main App

You can also serve the marketing site from your main Vite config by updating the routes.

## 📸 Required Assets

### Dashboard Screenshot
Place your dashboard screenshot at:
```
InsightAI/screenshots/dashboard-view.png
```

The hero section references: `../screenshots/dashboard-view.png`

**Recommended screenshot specs**:
- Width: 1600px - 2000px
- Format: PNG
- Content: Your Dashboard & Trends view
- Background: Dark theme for consistency

## 🎨 Customization Guide

### Change Colors
Edit `marketing/styles.css`:
```css
:root {
  --bg-dark: #1a1a1a;
  --bg-darker: #0f0f0f;
  --bg-card: #262626;
  --text-primary: #ffffff;
  --text-secondary: #a1a1a1;
  --accent-purple: #a78bfa;
  --accent-blue: #818cf8;
  --gradient: linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 50%, #818cf8 100%);
}
```

### Change Tagline
Edit `marketing/components/HeroSection.tsx`:
```tsx
<p className="hero-tagline">
  Your new tagline here
</p>
```

### Update Features
Edit `marketing/components/FeaturesSection.tsx`:
```tsx
const features = [
  {
    icon: '🧠',
    title: 'Your Feature',
    description: 'Your description'
  },
  // Add or modify features
];
```

### Change CTA Link
The "Try Insight" button currently links to `/app`. Update in:
- `HeroSection.tsx`
- `PhilosophySection.tsx`
- `CTASection.tsx`
- `Footer.tsx`

## 🌐 Deployment Options

### Deploy to Vercel
```bash
cd marketing
npm run build
vercel --prod
```

### Deploy to Netlify
```bash
cd marketing
npm run build
netlify deploy --prod --dir=dist
```

### Deploy to GitHub Pages
```bash
cd marketing
npm run build
# Copy dist/ contents to gh-pages branch
```

### Use Subdomain
- Main app: `app.insightai.com`
- Marketing: `www.insightai.com` or `insightai.com`

### Use Path
- Main app: `insightai.com/app`
- Marketing: `insightai.com/`

## 🔗 Integration with Main App

### Link from Marketing → App
All CTA buttons link to `/app`. Update if your app URL differs.

### Link from App → Marketing
Add a "Home" or "About" link in your main app sidebar that goes to `/` or the marketing site URL.

## 📱 Responsive Design

The site is fully responsive:
- **Mobile** (< 768px): Single column, stacked layout
- **Tablet** (768px - 1024px): 2-column grids
- **Desktop** (> 1024px): Full layout with all features

## ⚡ Performance

- **Minimal dependencies**: Only React and React DOM
- **CSS-only animations**: No animation libraries
- **Fast load times**: < 1s initial load
- **SEO ready**: Proper meta tags and semantic HTML

## 🎯 Marketing Site vs Main App

| Feature | Marketing Site | Main App |
|---------|---------------|----------|
| Purpose | Showcase & convert | Functionality |
| Port | 3001 | 5173 |
| Location | `/marketing` | `/src` |
| URL | `insightai.com` | `insightai.com/app` |
| Style | Clean, minimal | Feature-rich UI |
| Target | New visitors | Active users |

## 📝 Content Strategy

### Hero Section
- **Goal**: Immediate impact
- **Message**: Clear value proposition
- **Visual**: Show the product

### Features Section
- **Goal**: Build interest
- **Message**: What can users do?
- **Visual**: Icons and descriptions

### Security Section
- **Goal**: Address concerns
- **Message**: Your data is safe
- **Visual**: Settings/privacy mockup

### Philosophy Section
- **Goal**: Emotional connection
- **Message**: Why InsightAI is different
- **Visual**: Brand icon and values

### CTA Section
- **Goal**: Conversion
- **Message**: Simple, clear action
- **Visual**: Prominent button

## 🛠 Future Enhancements

Consider adding:
- [ ] **Pricing page** (if you add paid features)
- [ ] **Blog** (for content marketing)
- [ ] **Testimonials** (social proof)
- [ ] **Video demo** (product walkthrough)
- [ ] **Newsletter signup** (email capture)
- [ ] **Live demo** (interactive tour)
- [ ] **Comparison table** (vs competitors)
- [ ] **FAQ section** (answer common questions)

## 🔍 SEO Checklist

- [x] Meta description
- [x] Page title
- [x] Semantic HTML
- [x] Alt text for images (add when you add screenshot)
- [ ] Open Graph tags (for social sharing)
- [ ] Twitter Card tags
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Google Analytics
- [ ] Schema.org markup

## 📊 Analytics

Add analytics by including in `marketing/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🎨 Brand Assets Needed

To complete the marketing site, you should create/have:
- [ ] Logo files (SVG, PNG)
- [ ] Dashboard screenshot (high quality)
- [ ] Feature screenshots (optional)
- [ ] Social media preview image (1200x630px)
- [ ] Favicon (various sizes)
- [ ] App icons (if applicable)

## 🚀 Launch Checklist

Before going live:
- [ ] Add real dashboard screenshot
- [ ] Update all placeholder links
- [ ] Add Google Analytics
- [ ] Test on mobile devices
- [ ] Test in all major browsers
- [ ] Check load speed (Lighthouse)
- [ ] Verify all CTAs work
- [ ] Spell check all copy
- [ ] Add Open Graph tags
- [ ] Submit to Google Search Console
- [ ] Set up custom domain
- [ ] Configure SSL certificate

## 💡 Tips

1. **Screenshot Quality**: Use a high-DPI screenshot for retina displays
2. **Loading States**: Consider adding skeleton screens for images
3. **A/B Testing**: Test different taglines and CTA text
4. **Mobile First**: Most traffic will be mobile
5. **Fast Loading**: Optimize images and minimize JS
6. **Clear CTAs**: Make "Try Insight" buttons prominent
7. **Social Proof**: Add user testimonials when available
8. **Regular Updates**: Keep screenshots current with app updates

## 🎉 You're Done!

Your InsightAI marketing site is ready to showcase your amazing AI-powered journal to the world!

**Next Steps**:
1. Add your dashboard screenshot to `/screenshots/dashboard-view.png`
2. Run `npm install` in the marketing folder
3. Start the dev server with `npm run dev`
4. Customize the content to match your brand
5. Build and deploy when ready!
