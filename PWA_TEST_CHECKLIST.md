# PWA Testing Checklist ✅

Your icons are now properly configured in the `public/pwa-icons/` folder!

## 🎯 Quick Test (Local Development)

### 1. Build and Preview
```bash
npm run build
npm run preview
```

### 2. Open DevTools (F12)
- Go to **Application** tab
- Check **Manifest** section:
  - ✅ Name: "InsightAI - AI Journal & Diary"
  - ✅ Short name: "InsightAI"
  - ✅ Icons: Should show `/pwa-icons/icon-192.png` and `/pwa-icons/icon-512.png`
  - ✅ Start URL: "/"
  - ✅ Display: "standalone"

### 3. Check Service Worker
- Go to **Application** → **Service Workers**
- ✅ Should show "activated and running"
- ✅ Status: "activated"
- ✅ Source: `/service-worker.js`

### 4. Check Cache Storage
- Go to **Application** → **Cache Storage**
- ✅ Should see cache named "insightai-v1"
- ✅ Should contain:
  - `/index.html`
  - `/manifest.json`
  - `/pwa-icons/icon-192.png`
  - `/pwa-icons/icon-512.png`
  - `/pwa-icons/favicon.ico`

### 5. Test Install Prompt
- Wait 3 seconds after page load
- ✅ Should see purple/blue gradient install prompt in bottom-right
- ✅ Click "Install" to test native install dialog
- ✅ Click "Not Now" to dismiss

---

## 📱 Mobile Testing

### Android (Chrome):
1. Deploy to production (HTTPS required)
2. Open Chrome on Android
3. Navigate to your app URL
4. Look for install banner or:
   - Tap **⋮** (menu)
   - Tap **"Install app"** or **"Add to Home Screen"**
5. ✅ App should install to home screen
6. ✅ Open installed app (should be full screen, no browser UI)
7. ✅ Test offline: Turn off WiFi/data, app should still work

### iOS (Safari):
1. Deploy to production (HTTPS required)
2. Open Safari on iPhone
3. Navigate to your app URL
4. Tap **Share** button (square with arrow up)
5. Scroll down and tap **"Add to Home Screen"**
6. ✅ Should show your icon and app name
7. ✅ Tap "Add"
8. ✅ Open installed app from home screen
9. ✅ Should be full screen with no Safari UI

---

## 🚀 Deployment Testing

### Before Deploying:
- [x] Icons created in `public/pwa-icons/` folder
- [x] Manifest updated with correct paths
- [x] Service worker updated with correct paths
- [x] HTML updated with correct icon paths
- [ ] Build succeeds: `npm run build`
- [ ] Preview works: `npm run preview`

### After Deploying:
- [ ] HTTPS enabled (automatic on Vercel/Netlify)
- [ ] Manifest accessible: `https://your-app.com/manifest.json`
- [ ] Icons accessible: `https://your-app.com/pwa-icons/icon-192.png`
- [ ] Service worker registered (check DevTools)
- [ ] Install prompt appears
- [ ] Can install on mobile devices

---

## 🔍 Lighthouse Audit

Run Lighthouse to verify PWA score:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit (after deploying)
lighthouse https://your-app-url.com --view
```

### Target Scores:
- ✅ **PWA: 100** (must have)
- ✅ **Performance: 90+** (recommended)
- ✅ **Accessibility: 90+** (recommended)
- ✅ **Best Practices: 90+** (recommended)

### PWA Checklist (Lighthouse):
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Uses HTTPS
- ✅ Redirects HTTP to HTTPS
- ✅ Configured for a custom splash screen
- ✅ Sets a theme color
- ✅ Has a maskable icon
- ✅ Content is sized correctly for viewport

---

## 🐛 Troubleshooting

### Icons Not Showing:
```bash
# Verify icons exist
ls public/pwa-icons/

# Should show:
# - icon-192.png
# - icon-512.png
# - favicon.ico
```

### Service Worker Not Registering:
- Check browser console for errors
- Ensure you're on HTTPS or localhost
- Clear cache: DevTools → Application → Clear storage
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Install Prompt Not Appearing:
- Only shows on HTTPS (or localhost)
- Only shows once per session
- User must meet engagement criteria (varies by browser)
- Check if already installed: `window.matchMedia('(display-mode: standalone)').matches`

### Manifest Errors:
- Check manifest is valid JSON
- Verify all icon paths are correct
- Check browser console for manifest warnings

---

## ✅ Success Criteria

Your PWA is working correctly if:

1. ✅ **DevTools shows:**
   - Service worker activated
   - Manifest loaded with correct data
   - Icons visible in manifest preview
   - Cache populated with files

2. ✅ **On Mobile:**
   - Can install to home screen
   - Opens in standalone mode (no browser UI)
   - Works offline (basic functionality)
   - Shows your app icon on home screen

3. ✅ **Lighthouse:**
   - PWA score: 100
   - All PWA checks passing
   - No manifest or service worker errors

4. ✅ **User Experience:**
   - Fast loading (< 3 seconds)
   - Smooth install process
   - Native app-like feel
   - Update notifications work

---

## 🎉 Next Steps

Once all tests pass:

1. **Deploy to Production**
   ```bash
   npm run build
   # Deploy dist/ folder to Vercel/Netlify
   ```

2. **Test on Real Devices**
   - Test on Android phone
   - Test on iPhone
   - Test on tablet
   - Test offline functionality

3. **Monitor Performance**
   - Use Lighthouse CI for continuous monitoring
   - Track install rates
   - Monitor service worker errors
   - Check cache hit rates

4. **Optional Enhancements**
   - Add push notifications
   - Implement background sync
   - Add splash screens for iOS
   - Create app screenshots for manifest

---

## 📚 Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

Your PWA is ready to test! 🚀

Start with: `npm run build && npm run preview`
