# 🎨 InsightAI Mobile - Styling Guide

## Overview
This guide explains where all CSS/styling is located in the InsightAI mobile app and how to modify it for that hand-crafted, premium feel.

---

## 📁 File Structure

### Main Screens (Each has its own StyleSheet at the bottom)
```
/screens/
├── HomeScreen.tsx              # Journal entries list
├── DashboardScreen.tsx         # Analytics & monthly story
├── DashboardScreenNew.tsx      # New dashboard design
├── EntryDetailScreen.tsx       # Individual entry view with AI insights
├── CreateEntryScreen.tsx       # Journal entry creation
├── PlaybookScreen.tsx          # Daily protocols/playbook
├── SettingsScreen.tsx          # App settings
├── MeditationScreen.tsx        # Meditation feature
└── GratitudeScreen.tsx         # Gratitude journal
```

### Shared Components
```
/components/shared/
├── StandardContainer.tsx       # Reusable container with consistent padding
├── PageHeader.tsx             # Reusable page header component
├── ImmersiveAnalysisOverlay.tsx  # "New Insights" full-screen overlay
└── DailyMoodCheckIn.tsx       # Daily mood check-in modal
```

### Navigation
```
/navigation/
└── AppNavigator.tsx           # Tab bar styling, navigation structure
```

### Theme System
```
/contexts/
└── ThemeContext.tsx           # Global theme colors and dark mode
```

---

## 🎨 How Styling Works in React Native

### StyleSheet API
All styles use React Native's `StyleSheet.create()` at the bottom of each file:

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  // ... more styles
});
```

### Key Differences from Web CSS
- **No pixels**: Use numbers directly (e.g., `fontSize: 16` not `16px`)
- **camelCase**: Use `backgroundColor` not `background-color`
- **Flexbox by default**: Everything uses flexbox layout
- **No cascading**: Styles don't cascade like web CSS

---

## 📍 Where to Find Specific Styles

### 1. **Journal Entries (HomeScreen.tsx)**
**Location**: `/screens/HomeScreen.tsx` (lines ~1150-1340)

**Key Style Sections**:
- `entryCard` - Main entry card container
- `entryHeader` - Date and analyzed badge
- `entryTitle` - Entry title text
- `entryContent` - Entry preview text
- `viewInsightsButton` - Purple gradient button
- `moodIndicatorBar` - Colored mood indicator
- `insightBadge` - "Analyzed" badge

**Common Tweaks**:
```typescript
// Make cards more rounded
entryCard: {
  borderRadius: 18, // Increase from 16
}

// Adjust card spacing
entryCard: {
  marginBottom: 16, // Increase gap between cards
}

// Change button colors
viewInsightsButton: {
  // Uses LinearGradient component in JSX
  // Search for: <LinearGradient colors={['#8b5cf6', '#7c3aed']}
}
```

---

### 2. **Dashboard/Analytics (DashboardScreen.tsx)**
**Location**: `/screens/DashboardScreen.tsx` (lines ~2400-3200)

**Key Style Sections**:

#### Monthly Story Modal (Premium Design)
- `modalContainer` - Full-screen modal background
- `modalBackgroundGradient` - Dramatic purple gradient
- `starscapeContainer` - Twinkling stars overlay
- `modalTitle` - "Your February Story" title (with gradient)
- `premiumCard` - Glassmorphic cards for highlights/stats
- `statCompactCard` - 2-column stat cards
- `statValue` - Large numbers (28px)
- `statLabel` - Stat descriptions

#### Dashboard Cards
- `progressCard` - Main progress card
- `progressStoryTitle` - Story card title
- `aggregateCard` - Summary stats card
- `patternsCard` - Pattern recognition card

**Common Tweaks**:
```typescript
// Make modal gradient more dramatic
// Edit line ~1422-1428 in JSX:
colors={[
  '#1a0f2e',  // Top color
  '#050208'   // Bottom color
]}

// Adjust stat card size
statValue: {
  fontSize: 32, // Make numbers bigger/smaller
}

// Change card background opacity
premiumCard: {
  backgroundColor: 'rgba(88, 50, 150, 0.4)', // Adjust last number (0-1)
}
```

---

### 3. **Entry Details & AI Insights (EntryDetailScreen.tsx)**
**Location**: `/screens/EntryDetailScreen.tsx` (lines ~700-917)

**Key Style Sections**:
- `insightCard` - Individual insight cards
- `strengthCard` / `awarenessCard` / `growthCard` - Color-coded cards
- `playbookButton` - "Add to Playbook" button
- `wellbeingCircle` - Circular wellbeing score
- `emotionChip` - Emotion tags

**Common Tweaks**:
```typescript
// Adjust insight card colors
strengthCard: {
  backgroundColor: 'rgba(34, 197, 94, 0.15)', // Green tint
  borderColor: 'rgba(34, 197, 94, 0.3)',
}

// Make wellbeing circle bigger
wellbeingCircle: {
  width: 80,  // Increase from 70
  height: 80,
}
```

---

### 4. **New Insights Overlay (ImmersiveAnalysisOverlay.tsx)**
**Location**: `/components/shared/ImmersiveAnalysisOverlay.tsx` (lines ~800-1100)

**Key Style Sections**:
- `overlayContainer` - Full-screen overlay
- `resultsCard` - Main results card
- `scoreCircle` - Wellbeing score circle
- `accordionHeader` / `accordionContent` - Expandable sections
- `themeChip` - Theme tags

**Common Tweaks**:
```typescript
// Adjust overlay background
overlayContainer: {
  backgroundColor: 'rgba(0, 0, 0, 0.98)', // More/less transparent
}

// Make score circle more prominent
scoreCircle: {
  width: 80,
  height: 80,
  borderWidth: 3, // Thicker border
}
```

---

### 5. **Tab Bar Navigation (AppNavigator.tsx)**
**Location**: `/navigation/AppNavigator.tsx` (lines ~180-276)

**Key Style Sections**:
- `centerFabButton` - Center "+" button
- `centerFabGradient` - Gradient on FAB
- Tab bar styling in `<Tab.Navigator>` options

**Common Tweaks**:
```typescript
// Change tab bar colors (line ~180)
<Tab.Navigator
  screenOptions={{
    tabBarStyle: {
      backgroundColor: '#0a0a0a', // Tab bar background
      borderTopColor: '#1a1a1a',  // Top border
    },
    tabBarActiveTintColor: '#8b5cf6',   // Active tab color
    tabBarInactiveTintColor: '#666666', // Inactive tab color
  }}
>

// Adjust FAB button size
centerFabGradient: {
  width: 60,  // Increase from 56
  height: 60,
}
```

---

### 6. **Create Entry Screen (CreateEntryScreen.tsx)**
**Location**: `/screens/CreateEntryScreen.tsx`

**Key Style Sections**:
- `textInput` - Main journal input
- `saveButton` - Save entry button
- `characterCount` - Character counter

---

### 7. **Playbook Screen (PlaybookScreen.tsx)**
**Location**: `/screens/PlaybookScreen.tsx`

**Key Style Sections**:
- `protocolCard` - Individual protocol cards
- `protocolTitle` - Protocol titles
- `protocolDescription` - Protocol descriptions

---

## 🎨 Global Theme Colors

### Theme Context
**Location**: `/contexts/ThemeContext.tsx`

```typescript
// Dark theme colors (default)
colors: {
  background: '#000000',      // Main background
  card: '#0a0a0a',           // Card background
  text: '#ffffff',           // Primary text
  secondaryText: '#a0a0a0',  // Secondary text
  tertiaryText: '#666666',   // Tertiary text
  border: '#1a1a1a',         // Borders
  primary: '#8b5cf6',        // Purple accent
  success: '#22c55e',        // Green
  warning: '#f59e0b',        // Orange
  error: '#ef4444',          // Red
}
```

**To change globally**: Edit `ThemeContext.tsx` and all components using `theme.colors.X` will update.

---

## 🔧 Common Styling Patterns

### 1. **Gradient Backgrounds**
```typescript
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={['#8b5cf6', '#7c3aed']}  // Start and end colors
  start={{ x: 0, y: 0 }}           // Top-left
  end={{ x: 1, y: 1 }}             // Bottom-right
  style={styles.gradientButton}
>
  <Text>Button Text</Text>
</LinearGradient>
```

### 2. **Glassmorphic Cards**
```typescript
premiumCard: {
  backgroundColor: 'rgba(88, 50, 150, 0.4)', // Semi-transparent
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(139, 92, 246, 0.3)',
  shadowColor: '#8b5cf6',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.4,
  shadowRadius: 32,
  elevation: 8, // Android shadow
}
```

### 3. **Text Shadows/Glow**
```typescript
glowText: {
  textShadowColor: 'rgba(139, 92, 246, 0.5)',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 10,
}
```

### 4. **Responsive Sizing**
```typescript
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

card: {
  width: screenWidth - 40, // Full width minus padding
  maxWidth: 600,           // Max width for tablets
}
```

---

## 📝 Best Practices

### 1. **Keep Styles at Bottom of File**
Always define `StyleSheet.create()` at the bottom of the component file for easy finding.

### 2. **Use Descriptive Names**
```typescript
// Good
modalBackgroundGradient
statCompactCard
premiumHighlightText

// Avoid
container1
box
text2
```

### 3. **Group Related Styles**
Add comments to group related styles:
```typescript
const styles = StyleSheet.create({
  // === Container Styles ===
  container: { ... },
  scrollView: { ... },
  
  // === Card Styles ===
  card: { ... },
  cardHeader: { ... },
  
  // === Text Styles ===
  title: { ... },
  subtitle: { ... },
});
```

### 4. **Use Theme Colors**
```typescript
// Good - uses theme
const { theme } = useTheme();
<Text style={{ color: theme.colors.text }}>

// Avoid - hardcoded
<Text style={{ color: '#ffffff' }}>
```

---

## 🚀 Quick Reference: Common Changes

### Make Everything Bigger
- Increase `fontSize` values by 2-4
- Increase `padding` values by 4-8
- Increase `borderRadius` by 2-4

### Make Everything More Colorful
- Increase gradient color saturation
- Reduce opacity on backgrounds (0.4 → 0.6)
- Add more `shadowColor` and `shadowOpacity`

### Make Everything More Compact
- Reduce `marginBottom` between cards
- Reduce `padding` inside cards
- Reduce `fontSize` values

### Add More Premium Feel
- Add `LinearGradient` to buttons/cards
- Add `textShadow` to important text
- Add multiple `shadowOffset` layers
- Use glassmorphic backgrounds (semi-transparent with blur)

---

## 🐛 Debugging Tips

### Style Not Applying?
1. Check if style name is correct in JSX: `style={styles.myStyle}`
2. Check if `StyleSheet.create()` includes the style
3. Check if parent has `flex: 1` for child to fill space
4. Use React Native Debugger to inspect styles

### Colors Look Different?
- Remember opacity: `rgba(255, 255, 255, 0.5)` is 50% transparent
- Check if parent has `backgroundColor` that's showing through
- Check if `LinearGradient` is overriding solid colors

### Layout Issues?
- Use `flex: 1` to fill available space
- Use `flexDirection: 'row'` for horizontal layout
- Use `justifyContent` and `alignItems` for positioning
- Check if `position: 'absolute'` is causing overlap

---

## 📚 Additional Resources

- [React Native StyleSheet Docs](https://reactnative.dev/docs/stylesheet)
- [Flexbox Guide](https://reactnative.dev/docs/flexbox)
- [Color Formats](https://reactnative.dev/docs/colors)

---

**Happy Styling! 🎨**

For questions or issues, check the inline comments in each screen file.
