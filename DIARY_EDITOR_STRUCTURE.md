# DiaryEditor Component Structure

## Overview
The DiaryEditor component has been restructured with a **responsive 3-section layout** that maintains proper spacing at all viewport sizes.

## Layout Structure

```
┌─────────────────────────────────────────┐
│         HEADER SECTION (fixed)          │
│  - Title Input ("27th")                 │
│  - Timestamp                            │
│  - Action Buttons (Download, Voice,     │
│    Fullscreen, Analyze Entry)           │
├─────────────────────────────────────────┤
│       CONTENT SECTION (flexible)        │
│  - Main textarea OR                     │
│  - Highlighted text view                │
│  - Probe Deeper button                  │
│  - Co-Writer chat                       │
├─────────────────────────────────────────┤
│         FOOTER SECTION (fixed)          │
│  - Save status                          │
│  - Word count                           │
│  - Manual save button                   │
└─────────────────────────────────────────┘
```

## Key Changes Made

### 1. **Removed Negative Margins**
- **Before**: `marginTop: '-19.5rem'` caused buttons to overlap when viewport height changed
- **After**: Proper flex layout with `flexShrink: 0` for fixed sections

### 2. **Three-Section Layout**

#### **Header Section** (`flexShrink: 0`)
- **Location**: Lines 466-808
- **Purpose**: Contains title, metadata, and action buttons
- **Styling**: 
  - Fixed height (doesn't shrink)
  - Border bottom for visual separation
  - Padding: `1.5rem 1.5rem 0 1.5rem`

#### **Content Section** (`flex: 1`)
- **Location**: Lines 810-932
- **Purpose**: Main editing area
- **Styling**:
  - Grows to fill available space
  - `minHeight: 0` prevents flex overflow issues
  - Padding: `1rem 1.5rem`
  - Contains textarea OR highlighted text view

#### **Footer Section** (`flexShrink: 0`)
- **Location**: Lines 934-end
- **Purpose**: Save status and controls
- **Styling**:
  - Fixed height (doesn't shrink)
  - Border top for visual separation
  - Padding: `0.75rem 1.5rem`

### 3. **Responsive Behavior**
- **Height changes**: Content section shrinks/grows, header and footer stay fixed
- **Width changes**: All sections adapt with proper text wrapping
- **No overlapping**: Elements maintain their positions

## Section Comments in Code

Each major section now has clear comments:

```tsx
{/* ==================== HEADER SECTION ==================== */}
{/* Contains: Title input, timestamp, and action buttons */}

{/* ==================== CONTENT SECTION ==================== */}
{/* Contains: Main text editor or highlighted text view */}

{/* ==================== FOOTER SECTION ==================== */}
{/* Contains: Save status, word count, and manual save button */}
```

## File Organization

### Current Structure
```
src/components/diary/
├── DiaryEditor.tsx          # Main editor component (restructured)
├── HighlightedText.tsx      # Pattern highlighting
└── CoWriterChat.tsx         # AI co-writing assistant
```

### Component Responsibilities

**DiaryEditor.tsx**:
- Title input and editing
- Content textarea
- Action buttons (Download, Voice, Fullscreen, Analyze)
- Auto-save functionality
- Voice recording
- Layout management

**HighlightedText.tsx**:
- Pattern detection visualization
- Tooltip display for patterns

**CoWriterChat.tsx**:
- AI writing assistance
- Contextual suggestions

## CSS Classes Used

- `.diary-title-input` - Title input styling
- `.diary-textarea` - Main content textarea styling

## Testing Checklist

- [ ] Resize viewport height - buttons should stay in header
- [ ] Resize viewport width - text should wrap properly
- [ ] Type long content - textarea should scroll, not overflow
- [ ] Check on mobile viewport (< 768px)
- [ ] Check on tablet viewport (768px - 1024px)
- [ ] Check on desktop viewport (> 1024px)

## Future Improvements

1. **Extract button components**: Create reusable `ActionButton` component
2. **Separate toolbar**: Move action buttons to `DiaryToolbar.tsx`
3. **Mobile optimization**: Add responsive padding/font sizes
4. **Accessibility**: Add ARIA labels and keyboard shortcuts documentation
