# 📦 InsightAI Shared Code

This folder contains code shared between the **web** and **mobile** apps.

## 📁 Structure

```
shared/
├── config/          # Configuration (Supabase, etc.)
├── services/        # Business logic & API calls
├── types/           # TypeScript interfaces
├── utils/           # Helper functions
└── hooks/           # Shared React hooks
```

## 🎯 What's Shared

### ✅ Services
- `feedbackService.ts` - User feedback
- `userProfileService.ts` - User profiles
- `usageTrackingService.ts` - Usage limits
- `notesService.ts` - Diary entries
- `aiService.ts` - AI analysis

### ✅ Types
- User profiles
- Diary entries
- Feedback
- AI insights

### ✅ Config
- Supabase client (works for both web & mobile)

## 🚀 Usage

### In Web App:
```typescript
import { supabase } from '../shared/config/supabase';
import { feedbackService } from '../shared/services/feedbackService';
import type { UserProfile } from '../shared/types';
```

### In Mobile App:
```typescript
import { supabase } from '../shared/config/supabase';
import { feedbackService } from '../shared/services/feedbackService';
import type { UserProfile } from '../shared/types';
```

## 📝 Notes

- All services use the shared Supabase client
- Types are platform-agnostic
- UI components are NOT shared (different for web vs mobile)
- Navigation logic is NOT shared
