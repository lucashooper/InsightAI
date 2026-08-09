# Insight Design System

Single source of truth for Insight UI tokens. All content cards MUST use `components/ui/GlassCard` — do not hardcode card backgrounds.

## 1. Global Containers (Glassmorphism)

### Light Theme Glass Card
- **Background:** `rgba(255, 255, 255, 0.45)`
- **Backdrop Filter:** `blur(24px) saturate(180%)` → iOS `BlurView` intensity `48`, tint `light`
- **Border:** `1px solid rgba(255, 255, 255, 0.65)`
- **Corner Radius:** `28px`
- **Box Shadow:** `0 16px 32px -8px rgba(0, 0, 0, 0.04)`

### Dark Theme Glass Card
- **Background:** `rgba(255, 255, 255, 0.05)`
- **Backdrop Filter:** `blur(24px) saturate(180%)` → iOS `BlurView` intensity `48`, tint `dark`
- **Border:** `1px solid rgba(255, 255, 255, 0.12)`
- **Corner Radius:** `28px`
- **Box Shadow:** `0 16px 32px -8px rgba(0, 0, 0, 0.35)`

Implementation: `mobile/components/ui/GlassCard.tsx` (canonical)  
Legacy aliases: `GlassSurface`, `StandardContainer`

## 2. Typography

| Role | Size | Weight | Notes |
|------|------|--------|-------|
| Greeting / Title Large | 30px | Semi-bold (600) | `tracking-tight` (−0.8 letter-spacing) |
| Section Headings | 14px | Semi-bold (600) | uppercase, 80% opacity, `margin-bottom: 12px` |
| Body / Card Text | 15px | Medium (500) | |
| Subtitle / Muted | 13px | Regular (400) | 60% opacity |

Tokens: `mobile/constants/premiumUI.ts` → `TYPE`

## 3. Spacing & Layout

| Token | Value |
|-------|-------|
| Page horizontal padding | `20px` |
| Home hero → first card gap | `32px` minimum |
| Vertical section spacing | `28px` between stacked card sections |

Tokens: `PREMIUM.layout.screenPadH`, `PREMIUM.layout.sectionGap`, `PREMIUM.layout.heroToCardGap`

## 4. Theme Exception Overrides

### Paywall Screen
Always renders with **dark space aesthetics**, regardless of global theme:
- Background: `OnboardingAmbientBackground` (dark)
- Primary text: `#FFFFFF`
- Secondary / muted text: `rgba(255, 255, 255, 0.70)`
- Status bar: `light-content`

## 5. Motion

### Home entrance stagger
- Trigger only when app lock is **not** active, or after PIN unlock (`!isLockEnabled || !isLocked`)
- Slide Y: −16 → 0, scale 0.98 → 1, opacity 0 → 1
- Duration: 600ms, easing `cubic-bezier(0.16, 1, 0.3, 1)`
- Stagger: 60ms between sections (header → greeting → main card → prompt → suggested)

Component: `mobile/components/shared/HomeStagger.tsx`
