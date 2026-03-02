# Insight AI — Mobile UI Design System

## Core Principle
**One text color family, one accent approach.** Use `theme.colors.primaryText` for all text. Use lighter variants (`secondaryText`, `tertiaryText`) for hierarchy. Never use colored text (purple, green, orange) for labels, badges, or buttons. When emphasis is needed, use the **container/background** to stand out (e.g. gradient button), not the text color.

---

## Typography Tokens

| Role | Token | Dark Example | Usage |
|------|-------|-------------|-------|
| **Heading** | `theme.colors.primaryText` | `#ffffff` | Titles, section headers, button labels |
| **Body** | `theme.colors.secondaryText` | `#e5e7eb` | Descriptions, summaries, card body text |
| **Caption** | `theme.colors.tertiaryText` | `#9ca3af` | Dates, subtitles, helper text, badge counts |

### Font Sizes (via `sf()` helper)
- **Page title**: `sf(28)` bold
- **Section title**: `sf(20)` bold
- **Card title**: `sf(17)` bold
- **Body**: `sf(15)` regular
- **Caption/Label**: `sf(13)` medium
- **Badge text**: `sf(11)` bold, uppercase, `letterSpacing: 0.8`
- **Primary action label**: `sf(14)` bold (e.g. Write, Speak, Scan)

---

## Container Tokens

| Role | Background | Border |
|------|-----------|--------|
| **Standard card** | `theme.colors.cardBackground` | `theme.colors.border` |
| **Surface/pill** | `theme.colors.surface` | `theme.colors.border` |
| **Elevated surface** | `theme.colors.surfaceElevated` | `theme.colors.border` |
| **Page background** | `theme.colors.backgroundGradient` (LinearGradient) | — |

### Glassmorphic Card Recipe
```
backgroundColor: theme.colors.cardBackground
borderWidth: 1
borderColor: theme.colors.border
borderRadius: 16–20
```

---

## Buttons

### Primary Action Button (gradient)
```
<LinearGradient colors={theme.colors.primaryGradient} />
Text color: #ffffff (always white on gradient)
borderRadius: 999 (pill)
paddingVertical: 14–18
```

### Secondary/Outline Button
```
backgroundColor: theme.colors.surface
borderWidth: 1
borderColor: theme.colors.border
Text color: theme.colors.primaryText
borderRadius: 12
```

### Ghost/Text Button
```
No background, no border
Text color: theme.colors.secondaryText
```

---

## Badges & Pills

### Standard Badge (e.g. "STRENGTH", "GROWTH", category labels)
```
backgroundColor: theme.colors.surface
paddingHorizontal: 10, paddingVertical: 4
borderRadius: 6
Text color: theme.colors.secondaryText
fontSize: sf(11), fontWeight: '700', uppercase
```

### Priority Badges (exception — use semantic background only)
- HIGH: `bg: rgba(239, 68, 68, 0.15)` — text: `theme.colors.primaryText`
- MEDIUM: `bg: rgba(251, 191, 36, 0.15)` — text: `theme.colors.primaryText`
- LOW: `bg: rgba(96, 165, 250, 0.15)` — text: `theme.colors.primaryText`

---

## Accordion Headers
```
backgroundColor: theme.colors.cardBackground
borderColor: theme.colors.border
borderRadius: 12–16
Icon color: theme.colors.secondaryText
Title color: theme.colors.primaryText
Chevron color: theme.colors.tertiaryText
Badge: theme.colors.surface bg, tertiaryText text
```

---

## Icons
- Use `Ionicons` consistently
- Icon color: `theme.colors.secondaryText` (default) or `theme.colors.primaryText` (emphasis)
- Never use colored icons (green, orange, purple) for section headers or accordions

---

## Insight Cards (EntryDetail, Overlay)
All insight cards use the **same glassmorphic style**:
```
backgroundColor: theme.colors.cardBackground
borderWidth: 1
borderColor: theme.colors.border
borderRadius: 12–16
```
- Left accent border: `theme.colors.primary` (4px, subtle)
- Badge: `theme.colors.surface` bg, `theme.colors.secondaryText` text
- Body text: `theme.colors.secondaryText`
- "Add to Playbook" button: secondary/outline style, white text

---

## Splash/Loading Screen
Must adapt to the user's active theme:
- Dark themes: use `theme.colors.backgroundGradient`
- Light themes: use `<SunoGradient />` or `theme.colors.backgroundGradient`
- Logo text color: `theme.colors.primaryText`

---

## Anti-Patterns (DO NOT)
- ❌ Colored text for labels: `color: '#10b981'`, `color: '#f59e0b'`, `color: '#8b5cf6'`
- ❌ Colored icon tints for section headers
- ❌ Different card styles on the same screen (purple boxes vs glassmorphic)
- ❌ Hardcoded dark backgrounds (`#0d0d1a`, `rgba(30, 30, 45, 0.75)`)
- ❌ Yellow/gold accent color (`#D4AF37`)
