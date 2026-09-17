/**
 * Navigation safety helpers.
 *
 * React Navigation logs `The action 'GO_BACK' was not handled by any navigator`
 * when goBack() is dispatched on a navigator with an empty history — e.g. a
 * screen that was reached via `reset`, or an onboarding step the user resumed
 * into directly. Every back control should go through `safeGoBack` so it can
 * pop when possible and fall back gracefully otherwise.
 */

type AnyNavigation = {
  canGoBack?: () => boolean;
  goBack: () => void;
  navigate?: (...args: any[]) => void;
  getParent?: () => AnyNavigation | undefined;
};

/**
 * Pop the current screen if there is anywhere to go; otherwise try the parent
 * navigator, then an optional fallback route. Never throws.
 *
 * @returns true if some navigation action was dispatched.
 */
export function safeGoBack(
  navigation: AnyNavigation | null | undefined,
  fallbackRoute?: string,
  fallbackParams?: Record<string, unknown>,
): boolean {
  if (!navigation) return false;

  try {
    if (typeof navigation.canGoBack === 'function' ? navigation.canGoBack() : false) {
      navigation.goBack();
      return true;
    }

    const parent = navigation.getParent?.();
    if (parent && typeof parent.canGoBack === 'function' && parent.canGoBack()) {
      parent.goBack();
      return true;
    }

    if (fallbackRoute && typeof navigation.navigate === 'function') {
      navigation.navigate(fallbackRoute as never, fallbackParams as never);
      return true;
    }
  } catch (error) {
    console.warn('[NAV] safeGoBack failed:', error);
  }

  return false;
}

/** True when the navigator (or one of its parents) has somewhere to go back to. */
export function canNavigateBack(navigation: AnyNavigation | null | undefined): boolean {
  if (!navigation) return false;
  try {
    if (navigation.canGoBack?.()) return true;
    const parent = navigation.getParent?.();
    return Boolean(parent?.canGoBack?.());
  } catch {
    return false;
  }
}
