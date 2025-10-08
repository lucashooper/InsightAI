# InsightAI Marketing Site

The official marketing and brand website for InsightAI - your AI-powered journal companion.

## 🎨 Design

This marketing site features:
- **Hero Section**: Large gradient title with "InsightAI", tagline, and dashboard screenshot
- **Features Section**: 6 feature cards highlighting key capabilities
- **Security Section**: Emphasis on privacy, encryption, and sync features
- **Philosophy Section**: Brand values and unique selling propositions
- **CTA Section**: Call-to-action for new users
- **Footer**: Links and branding

## 🚀 Development

### Setup
```bash
cd marketing
npm install
```

### Run Development Server
```bash
npm run dev
```
The site will open at `http://localhost:3001`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Structure

```
marketing/
├── components/          # React components
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   ├── SecuritySection.tsx
│   ├── PhilosophySection.tsx
│   ├── CTASection.tsx
│   └── Footer.tsx
├── App.tsx             # Main app component
├── main.tsx            # Entry point
├── styles.css          # Global styles
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies

```

## 🎨 Design System

### Colors
- **Background Dark**: `#1a1a1a`
- **Background Darker**: `#0f0f0f`
- **Card Background**: `#262626`
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#a1a1a1`
- **Gradient**: `linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 50%, #818cf8 100%)`

### Typography
- **Hero Title**: 3rem - 6rem (responsive)
- **Section Titles**: 2rem - 3rem (responsive)
- **Body Text**: 1rem - 1.25rem
- **Font**: System font stack (San Francisco, Segoe UI, Roboto, etc.)

## 📸 Screenshots

The hero section uses a dashboard screenshot from `/screenshots/dashboard-view.png`. Make sure this file exists in the parent directory.

## 🔗 Integration

The marketing site links to the main app at `/app`. Update these links if your routing structure differs:
- Hero CTA button
- Philosophy section CTA
- Footer links

## 📝 Customization

### Update Content
- Edit component files in `/components` folder
- Modify feature descriptions in `FeaturesSection.tsx`
- Change taglines and copy in individual section components

### Update Styles
- Global styles in `styles.css`
- Component-specific styles are inline for this simple site
- Gradient and color variables defined at top of `styles.css`

## 🌐 Deployment

Build the site and deploy the `/dist` folder to your hosting provider:

```bash
npm run build
# Deploy the 'dist' folder
```

Recommended hosts:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

## 📱 Responsive

The site is fully responsive with breakpoints at:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## ⚡ Performance

- Optimized images
- CSS-only animations
- Minimal JavaScript
- Fast page loads

## 📄 License

Same license as the main InsightAI application.
