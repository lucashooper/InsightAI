# 📘 Phase 2 - PlaybookScreen Upgrade Plan

## Current Status
✅ HomeScreen emoji icons updated (🔥 and 🏆)
🔄 Starting PlaybookScreen upgrade

## PlaybookScreen Requirements (from Image 5)

### 1. Today's Progress Section (Top)
- Progress bar showing completion (e.g., "0/1 protocols completed")
- Percentage display
- Purple gradient background
- Positioned above all content

### 2. Dual Tab Structure
- **Tab 1:** Daily Protocols
- **Tab 2:** Strategies
- Active tab highlighted with purple
- Smooth tab switching

### 3. Protocol/Strategy Cards
Each card should have:
- **Emoji icon** (large, prominent)
- **Title** (bold, white)
- **Description** (gray text)
- **Category pill** (colored badge)
- **Difficulty badge** (e.g., "Moderate")
- **Streak indicators:**
  - 🔥 Current streak
  - 🏆 Best streak
- **Completion percentage** (for protocols)
- **Gradient border** (subtle purple glow)
- **Delete button** (trash icon)

### 4. Create Button
- Large, prominent
- Purple gradient
- Icon + text
- Positioned at top

### 5. Visual Enhancements
- Gradient header
- Better card shadows
- Consistent spacing (20px)
- Premium feel matching desktop

## Implementation Approach

### Step 1: Add Tab State
```typescript
const [activeTab, setActiveTab] = useState<'protocols' | 'strategies'>('protocols');
```

### Step 2: Add Progress Tracking
```typescript
const [protocolProgress, setProtocolProgress] = useState({
  completed: 0,
  total: 1,
  percentage: 0
});
```

### Step 3: Redesign UI Structure
```
<ScrollView>
  <Header />
  <ProgressCard />
  <TabBar />
  {activeTab === 'protocols' ? <ProtocolsList /> : <StrategiesList />}
  <CreateButton />
</ScrollView>
```

### Step 4: Premium Card Component
```typescript
<LinearGradient colors={[...]}>
  <View style={styles.cardHeader}>
    <Text style={styles.emoji}>{item.emoji}</Text>
    <View style={styles.cardInfo}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
    <TouchableOpacity onPress={delete}>
      <Ionicons name="trash" />
    </TouchableOpacity>
  </View>
  <View style={styles.cardFooter}>
    <CategoryPill />
    <DifficultyBadge />
    <StreakBadges />
  </View>
</LinearGradient>
```

## Design Tokens for Playbook

### Colors
```typescript
const playbookColors = {
  protocols: {
    bg: '#8b5cf620',
    border: '#8b5cf640',
  },
  strategies: {
    bg: '#10b98120',
    border: '#10b98140',
  },
  categories: {
    coping: '#10b981',
    exercise: '#f59e0b',
    social: '#ec4899',
    mindfulness: '#8b5cf6',
    sleep: '#6366f1',
    nutrition: '#14b8a6',
    general: '#8b5cf6',
  },
};
```

### Card Structure
- **Padding:** 20px
- **Margin:** 16px bottom
- **Border Radius:** 16px
- **Shadow:** Elevated with purple glow
- **Gradient:** Subtle dark gradients

## Files to Modify

1. **`mobile/screens/PlaybookScreen.tsx`**
   - Add tab state
   - Add progress tracking
   - Redesign render method
   - Update all styles
   - Add LinearGradient imports

## Next Steps

1. ✅ Update HomeScreen emojis (DONE)
2. 🔄 Implement PlaybookScreen dual tabs
3. 🔄 Add progress section
4. 🔄 Redesign protocol/strategy cards
5. 🔄 Add streak indicators
6. 🔄 Update styles with premium design

## Estimated Changes
- ~200 lines of code changes
- New tab component
- New progress component
- Enhanced card styling
- Better visual hierarchy

---

**This will bring the Playbook to desktop-level quality!**
