# InsightAI - Onboarding Redesign Plan

## 🎯 OBJECTIVE
Transform onboarding to match Pushscroll's premium feel with better typography, improved selection highlights, Pushscroll-style welcome screen, and new slider question.

---

## ✅ CHANGES TO IMPLEMENT

### **1. LoginScreen - Vibrant Theme Background** ✅ DONE
- **Changed:** Black background → Vibrant theme gradient
- **Colors:** `['#1a0b2e', '#2d1b4e', '#16213e', '#0f3460']`
- **Result:** Matches app's main theme

### **2. WelcomeScreen - Pushscroll-Style Layout** ✅ DONE
- **Changed:** Large centered logo → Big phone mockup at top
- **Phone Image:** Using `InsightAI-Onboarding-MAIN.png` from assets
- **Layout:**
  - Top: Large phone mockup (75% width, 50% height)
  - Middle: Smaller branding (logo + "InsightAI" horizontal, tagline below)
  - Bottom: CTA button + disclaimer
- **Result:** Premium, modern feel like Pushscroll

### **3. OnboardingQuestionScreen - Typography & Layout** 🔄 IN PROGRESS

#### **A) Typography Improvements**
- **Question titles:** Change from bold 800 → softer 600
  - Current: `fontSize: 32, fontWeight: '800'`
  - New: `fontSize: 28, fontWeight: '600'`
- **Info page titles:** Change from 700 → softer 500
  - "Research has shown..." currently 400 (good)
  - "AI reveals patterns..." currently 700 → change to 500
- **Consistency:** Use weight 500-600 throughout (not 700-800)

#### **B) Selection Highlight Improvements**
- **Current problem:** Green border, text color changes
- **Pushscroll style:** Bright blue/cyan fill, no text color change
- **New design:**
  - Selected: Bright gradient fill `['#06b6d4', '#0891b2']` (cyan)
  - Unselected: Dark transparent background
  - Text color: Always white (no change on selection)
  - Border: Subtle on unselected, none on selected

#### **C) Back Arrow Position**
- **Current:** Separate row above progress bar
- **New:** Same row as progress bar, to the left
- **Layout:**
  ```
  [← Back Arrow] [Progress Bar =========>]
  ```

### **4. New Slider Question Screen** 🆕 TO CREATE

**Screen:** `OnboardingSliderScreen.tsx`

**Question:** "How do you feel day-to-day?"

**Design (Pushscroll-style):**
- Context text: "Now let's understand your wellbeing a bit more."
- Main question: "How do you feel day-to-day?"
- Large number display (e.g., "7/10")
- Horizontal slider with gradient thumb
- Labels: "Poor" (left) → "Excellent" (right)
- Continue button at bottom

**Values:**
- Scale: 1-10
- Default: 5
- Store as: `wellbeingBaseline`

**Insert Position:** After "How long have you been journaling?" (before patterns info)

### **5. Consistent Typography Across All Screens**

**Font Weight Standards:**
- **Question titles:** 600 (semi-bold, not 800)
- **Info page titles:** 500 (medium, not 700)
- **Body text:** 400-500
- **Buttons:** 600-700
- **Subtitles:** 500

**Apply to:**
- OnboardingQuestionScreen
- OnboardingSummaryScreen
- AnalyzingScreen
- AnalysisCompleteScreen

---

## 📂 FILES TO MODIFY

1. ✅ **`mobile/screens/LoginScreen.tsx`**
   - Background gradient updated

2. ✅ **`mobile/screens/onboarding/WelcomeScreen.tsx`**
   - Layout redesigned with phone mockup

3. 🔄 **`mobile/screens/onboarding/OnboardingQuestionScreen.tsx`**
   - Typography: Soften font weights
   - Selection highlight: Pushscroll-style cyan gradient
   - Back arrow: Move to progress bar row
   - Update STEPS array to include new slider question

4. 🆕 **`mobile/screens/onboarding/OnboardingSliderScreen.tsx`** (NEW)
   - Create new slider question screen
   - Pushscroll-style design
   - Wellbeing baseline question

5. 🔄 **`mobile/components/onboarding/PillOption.tsx`**
   - Update selection styles
   - Cyan gradient fill when selected
   - No text color change

6. 🔄 **`mobile/navigation/AppNavigator.tsx`**
   - Register new OnboardingSliderScreen

---

## 🎨 DESIGN SPECIFICATIONS

### **Selection Highlight (Pushscroll-style)**

**Unselected:**
```tsx
backgroundColor: 'rgba(255, 255, 255, 0.05)'
borderWidth: 1.5
borderColor: 'rgba(255, 255, 255, 0.2)'
```

**Selected:**
```tsx
<LinearGradient
  colors={['#06b6d4', '#0891b2']}  // Cyan gradient
  style={{
    borderRadius: 16,
    borderWidth: 0,  // No border when selected
  }}
/>
```

**Text:**
```tsx
color: '#ffffff'  // Always white, no change
fontWeight: '600'
fontSize: 16
```

### **Typography Scale**

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Question Title | 28px | 600 | "What is your main goal?" |
| Info Title | 26px | 500 | "Research has shown..." |
| Subtitle | 15px | 500 | Context text |
| Option Text | 16px | 600 | Pill labels |
| Button Text | 18px | 700 | CTA buttons |

### **Back Arrow + Progress Bar Layout**

```tsx
<View style={styles.topRow}>
  <TouchableOpacity style={styles.backArrow}>
    <Ionicons name="arrow-back" size={24} color="#9ca3af" />
  </TouchableOpacity>
  <View style={styles.progressBarContainer}>
    <ProgressBarNeon currentStep={currentIndex + 1} totalSteps={totalSteps} />
  </View>
</View>
```

**Styles:**
```tsx
topRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingTop: 60,
  gap: 16,
}
backArrow: {
  width: 40,
  height: 40,
  alignItems: 'center',
  justifyContent: 'center',
}
progressBarContainer: {
  flex: 1,
}
```

---

## 🔄 UPDATED ONBOARDING FLOW

1. **WelcomeScreen** (Pushscroll-style with phone mockup)
2. **Question:** What is your main goal?
3. **Info:** Research has shown... (journaling benefits)
4. **Question:** How often do you want to reflect?
5. **Question:** How long have you been journaling?
6. **🆕 Slider:** How do you feel day-to-day? (1-10 wellbeing)
7. **Info:** AI reveals patterns... (AI benefits)
8. **Question:** How do you identify? (optional)
9. **OnboardingSummaryScreen**
10. **AnalyzingScreen**
11. **AnalysisCompleteScreen**
12. **PaywallScreen** (optional)

---

## 🧪 VERIFICATION CHECKLIST

### **LoginScreen**
- [ ] Background uses vibrant theme gradient (not black)
- [ ] Gradient colors: purple/blue tones

### **WelcomeScreen**
- [ ] Phone mockup displays at top (large)
- [ ] Branding is smaller, below phone
- [ ] Logo + "InsightAI" in horizontal row
- [ ] Tagline below branding
- [ ] Premium feel maintained

### **OnboardingQuestionScreen**
- [ ] Question titles use font weight 600 (not 800)
- [ ] Info titles use font weight 500 (not 700)
- [ ] Selection highlight is cyan gradient (Pushscroll-style)
- [ ] Text color stays white when selected (no change)
- [ ] Back arrow is in same row as progress bar (left side)
- [ ] Typography feels softer and more premium

### **OnboardingSliderScreen** (NEW)
- [ ] Question: "How do you feel day-to-day?"
- [ ] Large number display (e.g., "7/10")
- [ ] Horizontal slider with gradient thumb
- [ ] Labels: "Poor" → "Excellent"
- [ ] Pushscroll-style design
- [ ] Saves wellbeingBaseline value

### **Overall**
- [ ] Consistent typography across all onboarding screens
- [ ] No font weight above 700 (except buttons)
- [ ] All selection highlights use Pushscroll-style
- [ ] Premium, calm feel throughout
- [ ] No jarring transitions or inconsistencies

---

## 📊 IMPLEMENTATION STATUS

| Task | Status | File |
|------|--------|------|
| LoginScreen background | ✅ Done | LoginScreen.tsx |
| WelcomeScreen redesign | ✅ Done | WelcomeScreen.tsx |
| Question typography | 🔄 In Progress | OnboardingQuestionScreen.tsx |
| Selection highlights | 🔄 In Progress | PillOption.tsx |
| Back arrow position | 🔄 In Progress | OnboardingQuestionScreen.tsx |
| New slider screen | ⏳ Pending | OnboardingSliderScreen.tsx (new) |
| Typography consistency | ⏳ Pending | All onboarding screens |
| Navigation registration | ⏳ Pending | AppNavigator.tsx |

---

## 🚀 NEXT STEPS

1. **Complete OnboardingQuestionScreen updates:**
   - Soften typography (600 instead of 800)
   - Move back arrow to progress bar row
   - Update selection highlight styles

2. **Update PillOption component:**
   - Implement Pushscroll-style cyan gradient
   - Remove text color change on selection

3. **Create OnboardingSliderScreen:**
   - New file with wellbeing slider
   - Pushscroll-style design
   - Insert into onboarding flow

4. **Apply typography consistency:**
   - Review all onboarding screens
   - Ensure font weights 500-600 (not 700-800)
   - Update any remaining bold titles

5. **Test complete flow:**
   - Run through entire onboarding
   - Verify premium feel
   - Check all interactions work

---

**Implementation Date:** January 19, 2026  
**Status:** Phase 1 Complete (LoginScreen, WelcomeScreen) ✅  
**Next:** Phase 2 (Question screen improvements, slider, typography)
