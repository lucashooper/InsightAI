import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  InteractionManager,
  Platform,
  StyleSheet,
  View,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { FullWindowOverlay } from 'react-native-screens';
import type { AiPersonality } from '../../utils/aiPersonalities';
import OrbView from './OrbView';
import {
  findSlotForPoolItem,
  isValidSlotRect,
  ORB_POOL,
  type PoolItem,
  type SlotRect,
} from './orbPool';
import { markOrbPending } from '../../utils/orbWarmupRegistry';
import CloudMascot from './CloudMascot';

/**
 * The companion is now the SVG CloudMascot. The WebGL pool below is kept for
 * reference/rollback but no pooled WebViews are mounted while this is true.
 */
const USE_CLOUD_MASCOT = true;

type OrbOverlayContextValue = {
  registerSlot: (id: string, rect: Omit<SlotRect, 'id' | 'updatedAt'>) => void;
  unregisterSlot: (id: string) => void;
};

type OrbPoolControlValue = {
  requestWarmup: (poolIds: readonly string[]) => void;
  releaseWarmup: (poolIds: readonly string[]) => void;
  suppressOverlay: () => void;
  releaseOverlay: () => void;
};

const OrbOverlayContext = createContext<OrbOverlayContextValue | null>(null);
const OrbPoolControlContext = createContext<OrbPoolControlValue | null>(null);

export function useOrbPoolControl(): OrbPoolControlValue {
  const ctx = useContext(OrbPoolControlContext);
  if (!ctx) {
    throw new Error('useOrbPoolControl must be used within OrbOverlayProvider');
  }
  return ctx;
}

type OrbSlotProps = {
  size: number;
  personality?: AiPersonality;
  isRoast?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Wait before registering — avoids orb flashing mid-transition on modal screens. */
  deferRegistrationMs?: number;
};

type OrbSlotInnerProps = OrbSlotProps & {
  registerSlot: (id: string, rect: Omit<SlotRect, 'id' | 'updatedAt'>) => void;
  unregisterSlot: (id: string) => void;
};

function OrbSlotInner({
  size,
  personality = 'default',
  isRoast = false,
  style,
  deferRegistrationMs = 0,
  registerSlot,
  unregisterSlot,
}: OrbSlotInnerProps) {
  const isFocused = useIsFocused();
  const [registrationReady, setRegistrationReady] = useState(false);
  const idRef = useRef(`slot-${Math.random().toString(36).slice(2)}`);
  const viewRef = useRef<View>(null);

  const clearSlot = useCallback(() => {
    unregisterSlot(idRef.current);
  }, [unregisterSlot]);

  useEffect(() => {
    if (!isFocused) {
      setRegistrationReady(false);
      clearSlot();
      return;
    }

    if (deferRegistrationMs <= 0) {
      setRegistrationReady(true);
      return;
    }

    const timer = setTimeout(() => setRegistrationReady(true), deferRegistrationMs);
    return () => {
      clearTimeout(timer);
      setRegistrationReady(false);
    };
  }, [isFocused, deferRegistrationMs, clearSlot]);

  const report = useCallback(() => {
    if (!isFocused || !registrationReady) return;
    viewRef.current?.measureInWindow((x, y, width, height) => {
      if (!isValidSlotRect({ x, y, width, height })) return;
      registerSlot(idRef.current, {
        size,
        personality,
        isRoast,
        x,
        y,
        width,
        height,
      });
    });
  }, [isFocused, registrationReady, registerSlot, size, personality, isRoast]);

  useEffect(() => {
    if (!isFocused || !registrationReady) {
      if (!registrationReady) clearSlot();
      return;
    }

    // Measure now, next frame, then re-measure as the screen settles. A slot
    // measured mid-transition (slide-in, keyboard, stagger entrance) would
    // otherwise park the pooled WebView at a stale position for good.
    report();
    const frame = requestAnimationFrame(report);
    const timers = [120, 400, 900, 1600].map((ms) => setTimeout(report, ms));
    const afterInteractions = InteractionManager.runAfterInteractions(report);

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      afterInteractions.cancel();
      clearSlot();
    };
  }, [isFocused, registrationReady, report, clearSlot]);

  return (
    <View
      ref={viewRef}
      onLayout={report}
      style={[{ width: size, height: size }, style]}
      pointerEvents="none"
    />
  );
}

/** Invisible placeholder — a persistent pool WebView is positioned over this rect. */
export function OrbSlot({
  size,
  personality = 'default',
  isRoast = false,
  style,
  deferRegistrationMs,
}: OrbSlotProps) {
  const ctx = useContext(OrbOverlayContext);

  if (USE_CLOUD_MASCOT) {
    return (
      <View style={[{ width: size, height: size }, style]} pointerEvents="none">
        <CloudMascot size={size} personality={personality} isRoast={isRoast} shadow={false} glow={false} />
      </View>
    );
  }

  // No provider, or a size the pool doesn't carry (e.g. iPad-scaled sizes):
  // render inline instead of registering a slot nothing will ever fill.
  const pooled = ORB_POOL.some((item) => item.size === size);
  if (!ctx || !pooled) {
    return (
      <View style={[{ width: size, height: size }, style]} pointerEvents="none">
        <OrbView size={size} personality={personality} isRoast={isRoast} />
      </View>
    );
  }

  return (
    <OrbSlotInner
      size={size}
      personality={personality}
      isRoast={isRoast}
      style={style}
      deferRegistrationMs={deferRegistrationMs}
      registerSlot={ctx.registerSlot}
      unregisterSlot={ctx.unregisterSlot}
    />
  );
}

function getMountedPoolItems(
  slots: Map<string, SlotRect>,
  warmupIds: Set<string>,
): PoolItem[] {
  const mounted = new Set<string>();

  for (const id of warmupIds) {
    mounted.add(id);
  }

  for (const item of ORB_POOL) {
    const slot = findSlotForPoolItem(slots, item);
    if (slot && isValidSlotRect(slot)) {
      mounted.add(item.id);
    }
  }

  return ORB_POOL.filter((item) => mounted.has(item.id));
}

function LazyOrbPoolItem({ item, slot }: { item: PoolItem; slot: SlotRect | null }) {
  useEffect(() => {
    markOrbPending(item.size, item.personality, item.isRoast);
  }, [item]);

  const visible = slot != null && isValidSlotRect(slot);
  const hostStyle = visible
    ? {
        position: 'absolute' as const,
        left: slot!.x,
        top: slot!.y,
        width: item.size,
        height: item.size,
        zIndex: 9998,
      }
    : {
        position: 'absolute' as const,
        top: -10000,
        left: 0,
        width: item.size,
        height: item.size,
        opacity: 0,
      };

  return (
    <View style={hostStyle} pointerEvents="none" collapsable={false}>
      <OrbView
        size={item.size}
        personality={item.personality}
        isRoast={item.isRoast}
        poolMode
      />
    </View>
  );
}

function OrbPoolHost({
  slots,
  warmupIds,
}: {
  slots: Map<string, SlotRect>;
  warmupIds: Set<string>;
}) {
  const mountedItems = useMemo(
    () => getMountedPoolItems(slots, warmupIds),
    [slots, warmupIds],
  );

  if (USE_CLOUD_MASCOT || mountedItems.length === 0) return null;

  return (
    <>
      {mountedItems.map((item) => (
        <LazyOrbPoolItem
          key={item.id}
          item={item}
          slot={findSlotForPoolItem(slots, item)}
        />
      ))}
    </>
  );
}

/**
 * Layer the pooled orb WebViews above the navigator. On iOS the native stack
 * (react-native-screens) paints above ordinary absolute siblings regardless of
 * zIndex, so a plain overlay View ends up hidden behind every screen. A
 * FullWindowOverlay is a real UIWindow above the stack; touches fall through
 * where no child is hit and the orbs are pointerEvents="none" anyway.
 */
function OverlayHost({ children, hidden }: { children: React.ReactNode; hidden: boolean }) {
  // Do NOT use absoluteFill here. A full-window opaque layer (especially inside
  // FullWindowOverlay) is what made the home screen look empty while the header
  // and tab bar — which live outside that overlay — stayed visible.
  const layer = (
    <View
      style={hidden ? styles.overlayHidden : undefined}
      pointerEvents="none"
      collapsable={false}
    >
      {children}
    </View>
  );
  if (Platform.OS === 'ios') {
    return <FullWindowOverlay>{layer}</FullWindowOverlay>;
  }
  return layer;
}

/**
 * Hide the orb layer while `active` — for full-screen covers that live inside
 * the navigator tree (PIN lock, in-app splash). Reference counted, so several
 * callers can overlap safely.
 */
export function useSuppressOrbOverlay(active: boolean): void {
  const ctx = useContext(OrbPoolControlContext);
  const suppress = ctx?.suppressOverlay;
  const release = ctx?.releaseOverlay;

  useEffect(() => {
    if (!active || !suppress || !release) return;
    suppress();
    return release;
  }, [active, suppress, release]);
}

type OrbOverlayProviderProps = {
  children: React.ReactNode;
  /** Hide the orb layer from outside the tree (e.g. while the startup splash is up). */
  hidden?: boolean;
};

export default function OrbOverlayProvider({ children, hidden = false }: OrbOverlayProviderProps) {
  const [slots, setSlots] = useState<Map<string, SlotRect>>(new Map());
  const [warmupTick, setWarmupTick] = useState(0);
  const [suppressCount, setSuppressCount] = useState(0);
  const warmupCountsRef = useRef<Map<string, number>>(new Map());

  const suppressOverlay = useCallback(() => setSuppressCount((n) => n + 1), []);
  const releaseOverlay = useCallback(() => setSuppressCount((n) => Math.max(0, n - 1)), []);

  const warmupIds = useMemo(() => {
    void warmupTick;
    const ids = new Set<string>();
    for (const [id, count] of warmupCountsRef.current.entries()) {
      if (count > 0) ids.add(id);
    }
    return ids;
  }, [warmupTick, slots]);

  const bumpWarmup = useCallback(() => setWarmupTick((n) => n + 1), []);

  const requestWarmup = useCallback(
    (poolIds: readonly string[]) => {
      const counts = warmupCountsRef.current;
      for (const id of poolIds) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      bumpWarmup();
    },
    [bumpWarmup],
  );

  const releaseWarmup = useCallback(
    (poolIds: readonly string[]) => {
      const counts = warmupCountsRef.current;
      for (const id of poolIds) {
        const next = (counts.get(id) ?? 0) - 1;
        if (next <= 0) counts.delete(id);
        else counts.set(id, next);
      }
      bumpWarmup();
    },
    [bumpWarmup],
  );

  const registerSlot = useCallback((id: string, rect: Omit<SlotRect, 'id' | 'updatedAt'>) => {
    setSlots((prev) => {
      const next = new Map(prev);
      next.set(id, { ...rect, id, updatedAt: Date.now() });
      return next;
    });
  }, []);

  const unregisterSlot = useCallback((id: string) => {
    setSlots((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const overlayValue = useMemo(
    () => ({ registerSlot, unregisterSlot }),
    [registerSlot, unregisterSlot],
  );

  const poolControlValue = useMemo(
    () => ({ requestWarmup, releaseWarmup, suppressOverlay, releaseOverlay }),
    [requestWarmup, releaseWarmup, suppressOverlay, releaseOverlay],
  );

  return (
    <OrbPoolControlContext.Provider value={poolControlValue}>
      <OrbOverlayContext.Provider value={overlayValue}>
        {children}
        <OverlayHost hidden={hidden || suppressCount > 0}>
          <OrbPoolHost slots={slots} warmupIds={warmupIds} />
        </OverlayHost>
      </OrbOverlayContext.Provider>
    </OrbPoolControlContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlayHidden: {
    opacity: 0,
  },
});
