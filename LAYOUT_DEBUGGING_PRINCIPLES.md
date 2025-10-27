# Layout Debugging Principles

## Problem: Content Width Shrinking on Re-render

### Symptoms
- Content displays at full width initially
- When user interacts (clicks, focuses), entire layout shrinks
- Multiple nested containers all shrink to the same narrow width simultaneously
- Debug borders on all levels (root, flex container, content) show identical narrow width

### Root Cause Analysis

When **all containers at different nesting levels shrink together**, the constraint is at the **root level**, not in nested components.

### Debugging Approach

1. **Add colored debug borders** at each container level:
   - Cyan: App root container
   - Purple: Main flex container
   - Yellow: Main content area
   - Red: Component root
   - Blue: Toolbar/header
   - Green: Content area (textarea, etc.)

2. **Observe which borders shrink**:
   - If only the innermost border (green) shrinks → Issue is in the component
   - If only some borders shrink → Issue is at that specific container level
   - If **ALL borders shrink together** → Issue is at the root level (html/body/#root)

3. **Check for re-render triggers**:
   - Console log component renders
   - Check if window dimensions change
   - Verify if props are changing unnecessarily

### Solution Pattern

For root-level width constraints during re-renders:

```css
/* Force full viewport width at all root levels */
html, body, #root, .app-container {
  width: 100vw !important;
  max-width: 100vw !important;
  min-width: 100vw !important;
  overflow-x: hidden !important;
}
```

### Why This Works

- React re-renders can cause the browser to recalculate layout
- Without explicit width constraints, flex containers may temporarily collapse
- Forcing `100vw` at the root prevents any width recalculation from propagating down
- `overflow-x: hidden` prevents horizontal scrollbar from appearing

### Prevention

1. **Always set explicit widths** on root containers
2. **Use `box-sizing: border-box`** everywhere
3. **Avoid inline arrow functions** in component props (use `useCallback`)
4. **Wrap components in `React.memo`** when appropriate
5. **Disable transitions temporarily** when debugging layout issues

### Common Pitfalls

- ❌ Assuming the issue is in the component when it's actually at the root
- ❌ Adding width constraints only to nested elements
- ❌ Not checking if all containers shrink together
- ❌ Trying to fix with flex properties instead of explicit widths

### Testing Approach

1. Add debug borders at all levels
2. Disable all CSS transitions/animations
3. Check console for re-render logs
4. Verify window dimensions aren't changing
5. Work from the outside in (root → nested)

---

**Date Fixed:** October 26, 2025  
**Issue:** Content width shrinking on textarea click  
**Solution:** Force 100vw width on html, body, #root, .app-container
