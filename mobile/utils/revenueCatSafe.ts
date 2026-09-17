import Purchases from 'react-native-purchases';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * True when RevenueCat is running in "Browser Mode" (Expo Go / web).
 * Several native-only methods throw there, and `react-native-purchases`
 * fires `invalidateCustomerInfoCache` without awaiting it, so the rejection
 * escapes every caller's try/catch as "Uncaught (in promise)".
 */
export function isRevenueCatBrowserMode(): boolean {
  const g = globalThis as typeof globalThis & { expo?: { modules?: { ExpoGo?: unknown } } };
  if (g.expo?.modules?.ExpoGo) return true;
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return true;
  if (Constants.executionEnvironment === ExecutionEnvironment.Bare) return false;
  return false;
}

/** Call once at startup so SDK-internal fire-and-forget calls cannot crash Expo Go. */
export function patchRevenueCatBrowserStubs(): void {
  if (!isRevenueCatBrowserMode()) return;
  const noop = async () => undefined;
  try {
    (Purchases as unknown as { invalidateCustomerInfoCache: () => Promise<void> })
      .invalidateCustomerInfoCache = noop;
  } catch {
    // ignore
  }
}

/** Invalidate the RevenueCat cache only where the native SDK supports it. */
export async function safeInvalidateCustomerInfoCache(): Promise<void> {
  if (isRevenueCatBrowserMode()) return;
  try {
    await Purchases.invalidateCustomerInfoCache();
  } catch {
    // Not fatal — a stale cache only delays entitlement refresh.
  }
}

export async function safePurchasesLogOut(): Promise<void> {
  if (isRevenueCatBrowserMode()) return;
  try {
    await Purchases.logOut();
  } catch {
    // Native SDK throws if already anonymous — logout can still proceed.
  }
}

