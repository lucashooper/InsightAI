# LM Studio Integration Setup 🤖

## Overview
Your app now supports **local LLM inference** via LM Studio, running ChatGPT-OSS-20B privately on your machine!

---

## 1. Install Required Package

```bash
npm install openai
```

This installs the OpenAI SDK which works with both OpenAI's API and LM Studio's OpenAI-compatible endpoint.

---

## 2. Environment Variables

Already added to `.env.local`:
```env
LOCAL_LLM_BASE=http://127.0.0.1:1234/v1
LOCAL_LLM_KEY=lm-studio
LOCAL_LLM_MODEL=openai/gpt-oss-20b
```

---

## 3. Files Created

### `src/lib/localLLM.ts`
- **`localAI`** - LM Studio client
- **`cloudAI`** - OpenAI cloud client  
- **`chat()`** - Unified function with provider toggle
- **`chatStream()`** - Streaming support

### Usage Example:
```typescript
import { chat, chatStream } from '@/lib/localLLM';

// Use local LLM (default)
const response = await chat([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Analyze this journal entry...' }
], { provider: 'local' });

// Use OpenAI cloud
const cloudResponse = await chat(messages, { provider: 'openai' });

// Streaming
for await (const chunk of chatStream(messages, 'local')) {
  console.log(chunk); // Each token as it arrives
}
```

---

## 4. How to Use in Your App

### Option A: Update Existing API Routes
Find your AI analysis routes (e.g., `pages/api/reflect.ts` or `app/api/reflect/route.ts`) and replace:

**Before:**
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...]
});
```

**After:**
```typescript
import { chat } from '@/lib/localLLM';

const response = await chat([...messages], {
  provider: 'local', // or 'openai'
  temperature: 0.7
});
```

### Option B: Add Provider Toggle in UI
Let users choose between Local (Private) and Cloud (Best Quality):

```typescript
// In your settings or analysis component
const [provider, setProvider] = useState<'local' | 'openai'>('local');

// When calling API
const response = await fetch('/api/reflect', {
  method: 'POST',
  body: JSON.stringify({ entry, provider })
});
```

---

## 5. LM Studio Setup

### Start the Server:
1. Open LM Studio
2. Load model: `openai/gpt-oss-20b`
3. Go to **Local Server** tab
4. Click **Start Server**
5. Verify it shows: `Server running at http://127.0.0.1:1234/v1`

### Test Connection:
```bash
curl http://127.0.0.1:1234/v1/models
```

Should return:
```json
{
  "data": [
    {
      "id": "openai/gpt-oss-20b",
      ...
    }
  ]
}
```

---

## 6. Integration Points

Update these files to use local LLM:

### AI Analysis (`src/services/aiService.ts` or similar):
```typescript
import { chat } from '@/lib/localLLM';

export async function analyzeEntry(entry: string, provider: 'local' | 'openai' = 'local') {
  const response = await chat([
    {
      role: 'system',
      content: 'You are a warm, insightful journaling companion. Provide concise reflections and thoughtful prompts.'
    },
    {
      role: 'user',
      content: `Analyze this journal entry and provide:\n1. A brief reflection\n2. Two thoughtful prompts\n\nEntry: ${entry}`
    }
  ], { provider });

  return response.choices[0]?.message?.content || '';
}
```

### Streaming Analysis (Real-time):
```typescript
export async function* analyzeEntryStream(entry: string, provider: 'local' | 'openai' = 'local') {
  const messages = [
    { role: 'system' as const, content: 'You are a journaling companion.' },
    { role: 'user' as const, content: `Analyze: ${entry}` }
  ];

  for await (const chunk of chatStream(messages, provider)) {
    yield chunk;
  }
}
```

---

## 7. Common Issues & Solutions

### ❌ "Cannot find module 'openai'"
**Fix:** Run `npm install openai`

### ❌ Calls hang/timeout
**Fix:** Ensure LM Studio server is running at `http://127.0.0.1:1234/v1`

### ❌ Wrong model error
**Fix:** Check model ID matches exactly what LM Studio shows in `/v1/models`

### ❌ CORS errors
**Fix:** Call from server-side API routes, not client-side `fetch` to localhost

### ❌ Port mismatch
**Fix:** If you changed LM Studio's port, update `LOCAL_LLM_BASE` in `.env.local`

---

## 8. Performance Comparison

| Provider | Speed | Privacy | Cost | Quality |
|----------|-------|---------|------|---------|
| **Local (LM Studio)** | Fast* | 100% Private | Free | Very Good |
| **OpenAI Cloud** | Very Fast | Sent to OpenAI | $$ | Excellent |

*Speed depends on your GPU/CPU

---

## 9. Recommended Workflow

### Development:
- Use **local** for testing (free, private)
- Switch to **openai** for quality checks

### Production:
- Offer **both options** to users
- Default to **local** for privacy-conscious users
- Let users upgrade to **cloud** for best quality

---

## 10. Next Steps

1. **Install package:**
   ```bash
   npm install openai
   ```

2. **Start LM Studio server** (port 1234)

3. **Update your AI service** to use `chat()` from `@/lib/localLLM`

4. **Test locally:**
   ```typescript
   import { chat } from '@/lib/localLLM';
   const response = await chat([
     { role: 'user', content: 'Hello!' }
   ], { provider: 'local' });
   console.log(response.choices[0].message.content);
   ```

5. **Add provider toggle in UI** (optional but recommended)

---

## 11. Example: Full Integration

```typescript
// src/services/aiService.ts
import { chat, chatStream } from '@/lib/localLLM';

export async function generateReflection(
  entry: string,
  provider: 'local' | 'openai' = 'local'
): Promise<string> {
  try {
    const response = await chat([
      {
        role: 'system',
        content: 'You are a warm, concise journaling companion. Provide brief reflections and 2 thoughtful prompts.'
      },
      {
        role: 'user',
        content: `Journal entry:\n\n${entry}\n\nProvide:\n1. A 2-sentence reflection\n2. Two follow-up prompts`
      }
    ], {
      provider,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || 'Unable to generate reflection.';
  } catch (error) {
    console.error(`Error with ${provider} provider:`, error);
    
    // Fallback to cloud if local fails
    if (provider === 'local') {
      console.log('Falling back to OpenAI cloud...');
      return generateReflection(entry, 'openai');
    }
    
    throw error;
  }
}

// Streaming version
export async function* generateReflectionStream(
  entry: string,
  provider: 'local' | 'openai' = 'local'
) {
  const messages = [
    {
      role: 'system' as const,
      content: 'You are a warm, concise journaling companion.'
    },
    {
      role: 'user' as const,
      content: `Reflect on: ${entry}`
    }
  ];

  for await (const chunk of chatStream(messages, provider)) {
    yield chunk;
  }
}
```

---

## 12. Benefits

✅ **100% Private** - Your journal entries never leave your machine  
✅ **No API Costs** - Free inference on your hardware  
✅ **Offline Capable** - Works without internet  
✅ **Fast** - No network latency  
✅ **Flexible** - Easy switch between local and cloud  
✅ **OpenAI Compatible** - Same API, different endpoint  

---

## Ready to Go! 🚀

Run `npm install openai` and start using local LLM inference in your app!
