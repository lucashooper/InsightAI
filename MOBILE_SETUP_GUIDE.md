# 📱 InsightAI Mobile App Setup Guide

## ✅ Phase 1: Shared Code (COMPLETED)

I've created a `shared/` folder with:
- ✅ Supabase configuration
- ✅ Core services (feedback, user profiles, usage tracking, notes, AI)
- ✅ TypeScript types
- ✅ Folder structure for utils and hooks

---

## 🚀 Phase 2: Initialize Expo Mobile App

### Step 1: Create Expo App

Run this command in your terminal:

```bash
cd C:\Users\lucas\Desktop\InsightAI
npx create-expo-app@latest mobile --template blank-typescript
```
 
When prompted, press `y` to proceed.

This will create a `mobile/` folder with a basic Expo TypeScript app.

### Step 2: Install Dependencies

```bash
cd mobile
npm install @supabase/supabase-js @react-native-async-storage/async-storage
npm install react-native-url-polyfill
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
```

### Step 3: Setup Environment Variables

Create `mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://ptpqvghlaesyrzlljzkk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 📁 Project Structure (After Setup)

```
InsightAI/
├── src/                    # Web app (existing)
├── shared/                 # ✅ Shared code (DONE)
│   ├── config/
│   │   └── supabase.ts    # ✅ Supabase client
│   ├── services/          # ✅ Business logic
│   │   ├── feedbackService.ts
│   │   ├── userProfileService.ts
│   │   ├── usageTrackingService.ts
│   │   ├── notesService.ts
│   │   └── aiService.ts
│   ├── types/             # ✅ TypeScript types
│   │   ├── user.ts
│   │   ├── diary.ts
│   │   └── feedback.ts
│   ├── utils/             # For shared utilities
│   └── hooks/             # For shared hooks
└── mobile/                # 🔜 React Native app (TO CREATE)
    ├── app/               # Expo Router screens
    ├── components/        # Mobile UI components
    ├── assets/            # Images, fonts
    └── app.json           # Expo config
```

---

## 🎯 Next Steps (After Expo Init)

### 1. Configure Supabase for Mobile

I'll create:
- `mobile/config/supabase.ts` - Mobile-specific Supabase setup
- Link to `../shared/services/` for business logic

### 2. Create Authentication Screens

- Login screen
- Signup screen
- Email confirmation

### 3. Create Main App Screens

- Diary/Journal view
- Entry editor
- Settings

---

## 💡 How Shared Code Works

### Web App (existing):
```typescript
// Before
import { supabase } from './services/supabaseClient';

// After (will update)
import { supabase } from '../shared/config/supabase';
```

### Mobile App (new):
```typescript
import { supabase } from '../shared/config/supabase';
import { feedbackService } from '../shared/services/feedbackService';
```

**Same services, different UI!**

---

## 🔧 What I'll Do Next

Once you run the Expo init command, I'll:

1. ✅ Update mobile app to use shared code
2. ✅ Create Supabase config for React Native
3. ✅ Build authentication screens
4. ✅ Create basic diary view
5. ✅ Setup navigation

---

## 📱 Testing the Mobile App

After setup, you can test with:

```bash
cd mobile
npx expo start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on your phone

---

## ⚠️ Important Notes

1. **Web app still works** - No changes to existing functionality
2. **Shared code** - Changes to services benefit both platforms
3. **Separate UI** - Web uses React components, mobile uses React Native
4. **Same database** - Both use the same Supabase backend

---

## 🎉 What You Get

- ✅ One codebase, two platforms
- ✅ Share 60% of code (services, logic, types)
- ✅ Native mobile experience
- ✅ Same Supabase backend
- ✅ Easy to maintain

---

## 🚀 Ready to Continue?

Run the Expo init command above, then let me know when it's done!

I'll then:
1. Configure the mobile app
2. Create authentication screens
3. Build the diary view
4. Setup navigation

**Let's build your mobile app!** 📱✨
