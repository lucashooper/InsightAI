# Insight AI - Premium UI Design System

## Core Design Philosophy

Insight AI follows a **premium, minimalist, and cohesive** design language that prioritizes clarity, elegance, and user focus. Every UI element should feel intentional, polished, and part of a unified visual system.

---

## 🎨 Design Principles

### 1. **Premium Glassmorphism**
Use subtle transparency and blur effects for depth without overwhelming the interface.

**Implementation:**
```css
background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 12px;
```

**Usage:**
- Dashboard cards
- Prism's response area
- Summary sections
- Modal overlays

---

### 2. **Consistent Button Styling**

**Primary Buttons** (Standard actions like Download, Refresh, Voice Input):
```tsx
style={{
  padding: '0.5rem 1rem',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: '500',
  transition: 'all 0.2s ease'
}}
onMouseEnter={(e) => {
  e.currentTarget.style.background = 'var(--bg-tertiary)';
  e.currentTarget.style.color = 'var(--text-primary)';
  e.currentTarget.style.borderColor = 'var(--accent-primary)';
}}
```

**Special Buttons** (CTAs like "View Insights", "Analyze Entry"):
- Use gradient backgrounds for emphasis
- Slightly larger size
- More prominent visual treatment

**Rules:**
- ✅ Use consistent styling for buttons with similar importance
- ✅ Always include icons with text for clarity
- ✅ Provide smooth hover transitions
- ❌ Never mix different button styles randomly
- ❌ Avoid inline styles for simple actions

---

### 3. **Professional Icon System**

**Always use `PremiumIcons` from `/components/icons/PremiumIcons.tsx`**

**❌ NEVER USE:**
- System emoji icons (📊, ✨, 🌱, etc.)
- Random Unicode symbols
- Inconsistent icon libraries

**✅ AVAILABLE ICONS:**
- Navigation: `Dashboard`, `Notes`, `Alerts`, `Settings`
- Actions: `Plus`, `Edit`, `Delete`, `Save`, `Copy`
- Status: `Fire`, `Brain`, `TrendingUp`, `Calendar`, `Sparkles`, `Sprout`
- Data: `Download`, `Upload`, `Database`, `BarChart`, `FileText`
- Utility: `Check`, `X`, `ChevronRight`, `ChevronDown`, `Mic`, `Refresh`, `Search`, `Filter`, `Target`, `AlertTriangle`, `Trophy`

**Usage:**
```tsx
import { PremiumIcons } from '../icons/PremiumIcons';

<PremiumIcons.Sparkles size={16} color="#22c55e" />
```

---

### 4. **Spacing & Breathing Room**

**Golden Rules:**
- Minimum gap between interactive elements: `0.5rem`
- Card padding: `1.5rem` for content areas
- Button gaps: `0.5rem` between icon and text
- Section spacing: `2rem` between major sections
- Tab button spacing: `0.5rem` minimum between tabs

**Scrollbar Spacing:**
```css
::-webkit-scrollbar {
  width: 12px;
}
::-webkit-scrollbar-thumb {
  border: 3px solid var(--bg-secondary); /* Creates breathing room */
}
```

---

### 5. **Color System**

**True Black Theme (OLED Optimized):**
```css
--bg-primary: #000000;        /* Pure black background */
--bg-secondary: #0a0a0a;      /* Slightly lifted surface */
--bg-tertiary: #141414;       /* Hover states */
--text-primary: #ffffff;      /* Primary text */
--text-secondary: #a0a0a0;    /* Secondary text */
--border-color: #2a2a2a;      /* Subtle borders */
```

**Semantic Colors:**
- Positive/Success: `#22c55e` (green)
- Growth/Warning: `#f59e0b` (amber)
- Accent/Primary: `#58a6ff` (blue)
- Danger/Error: `#f85149` (red)

**Usage:**
- ✅ Use semantic colors consistently for their meaning
- ✅ Maintain color contrast for accessibility
- ❌ Don't use bright colors for large areas
- ❌ Avoid color overload - stick to 2-3 accent colors per view

---

### 6. **Typography & Text Hierarchy**

**Heading Styles:**
```tsx
// Page Title (Dashboard, Prism's Analysis)
style={{
  fontSize: '2.5rem',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 50%, #818cf8 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: '700',
  letterSpacing: '-0.02em'
}}

// Section Heading
style={{
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#E5E7EB',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
}}
```

**Rules:**
- ✅ Always pair headings with appropriate icons
- ✅ Use gradient text for major page titles
- ❌ Don't repeat headings unnecessarily
- ❌ Avoid ALL CAPS except for small tags

---

### 7. **Avoid Visual Clutter**

**Reduce Redundancy:**
- ❌ Don't show multiple "Analysis" or "Editor" buttons
- ❌ Avoid repeating section titles
- ❌ Remove unnecessary borders that clash with rounded corners
- ✅ Consolidate similar actions into one clear button
- ✅ Use subtle visual separators

**Container Design:**
- ❌ Visible container edges clashing with content
- ✅ Clean backgrounds with proper border-radius
- ✅ Glassmorphic containers that blend seamlessly

---

## 🏗️ Component Patterns

### Dashboard Cards
```tsx
<div style={{
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: '1.5rem'
}}>
  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <PremiumIcons.BarChart size={20} color="#E5E7EB" />
    Section Title
  </h3>
  {/* Content */}
</div>
```

### Tab Navigation
```tsx
<div style={{ 
  display: 'flex',
  gap: '0.5rem',  // IMPORTANT: Spacing between tabs
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  padding: '0.5rem',
  borderTopLeftRadius: '16px',
  borderTopRightRadius: '16px'
}}>
  <button style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    border: 'none',
    borderRadius: '12px',
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
  }}>
    <PremiumIcons.IconName size={18} />
    <span>Tab Name</span>
  </button>
</div>
```

### Chat Input (Clean Design)
```tsx
// ❌ DON'T: Blue/gray box around input
// ✅ DO: Clean black background with minimal borders
<div style={{
  display: 'flex',
  gap: '0.5rem',
  padding: '1rem',
  background: 'var(--bg-primary)',  // Pure black
  borderTop: '1px solid var(--border-color)'  // Subtle top border only
}}>
  <input style={{
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)'
  }} />
  <button>Send Icon</button>
</div>
```

---

## 📋 Implementation Checklist

When creating or modifying UI components:

- [ ] Using `PremiumIcons` instead of emoji?
- [ ] Consistent button styling applied?
- [ ] Proper spacing (`0.5rem` gaps minimum)?
- [ ] Glassmorphic style for cards?
- [ ] Color semantics correct?
- [ ] No visual clutter or redundancy?
- [ ] Rounded corners without clashing borders?
- [ ] Hover states with smooth transitions?
- [ ] Accessible color contrast?
- [ ] Icons paired with text labels?

---

## 🚫 Common Mistakes to Avoid

1. **Using emoji icons anywhere in the app**
2. **Inconsistent button styles for similar actions**
3. **Tabs/buttons touching each other without spacing**
4. **Visible container borders clashing with rounded content**
5. **Bright colors on large surface areas**
6. **Redundant headings or navigation elements**
7. **Missing hover states on interactive elements**
8. **Overusing borders - embrace glassmorphism**

---

## 🎯 Quick Reference

| Element | Background | Border | Padding | Gap |
|---------|-----------|--------|---------|-----|
| Dashboard Card | `rgba(255,255,255,0.03)` | `1px rgba(255,255,255,0.08)` | `1.5rem` | - |
| Button | `var(--bg-secondary)` | `1px var(--border-color)` | `0.5rem 1rem` | `0.5rem` |
| Tab Navigation | `rgba(255,255,255,0.03)` | none | `0.5rem` | `0.5rem` |
| Chat Input | `var(--bg-primary)` | `1px top only` | `1rem` | `0.5rem` |
| Section Spacing | - | - | - | `2rem` |

---

**Last Updated:** October 2025  
**Version:** 1.0

This design system ensures Insight AI maintains a **premium, cohesive, and professional** user experience across all features.
