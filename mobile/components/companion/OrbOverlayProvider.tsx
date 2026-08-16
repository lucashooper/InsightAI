import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { AiPersonality } from '../../utils/aiPersonalities';
import OrbView from './OrbView';
import {
  findSlotForPoolItem,
  initOrbPoolPending,
  isValidSlotRect,
  ORB_POOL,
  type SlotRect,
} from './orbPool';

type OrbOverlayContextValue = {
  registerSlot: (id: string, rect: Omit<SlotRect, 'id' | 'updatedAt'>) => void;
  unregisterSlot: (id: string) => void;
};

const OrbOverlayContext = createContext<OrbOverlayContextValue | null>(null);

type OrbSlotProps = {
  size: number;
  personality?: AiPersonality;
  isRoast?: boolean;
  style?: StyleProp<ViewStyle>;
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
  registerSlot,
  unregisterSlot,
}: OrbSlotInnerProps) {
  const isFocused = useIsFocused();
  const idRef = useRef(`slot-${Math.random().toString(36).slice(2)}`);
  const viewRef = useRef<View>(null);

  const clearSlot = useCallback(() => {
    unregisterSlot(idRef.current);
  }, [unregisterSlot]);

  const report = useCallback(() => {
    if (!isFocused) return;
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
  }, [isFocused, registerSlot, size, personality, isRoast]);

  useEffect(() => {
    if (!isFocused) {
      clearSlot();
      return;
    }

    report();
    const frame = requestAnimationFrame(report);
    const delayed = setTimeout(report, 120);
    const interval = setInterval(report, 600);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(delayed);
      clearInterval(interval);
      clearSlot();
    };
  }, [isFocused, report, clearSlot]);

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
}: OrbSlotProps) {
  const ctx = useContext(OrbOverlayContext);

  if (!ctx) {
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
      registerSlot={ctx.registerSlot}
      unregisterSlot={ctx.unregisterSlot}
    />
  );
}

function OrbPoolHost({ slots }: { slots: Map<string, SlotRect> }) {
  return (
    <>
      {ORB_POOL.map((item) => {
        const slot = findSlotForPoolItem(slots, item);
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
          <View key={item.id} style={hostStyle} pointerEvents="none" collapsable={false}>
            <OrbView
              size={item.size}
              personality={item.personality}
              isRoast={item.isRoast}
              poolMode
            />
          </View>
        );
      })}
    </>
  );
}

export default function OrbOverlayProvider({ children }: { children: React.ReactNode }) {
  const [slots, setSlots] = useState<Map<string, SlotRect>>(new Map());

  useEffect(() => {
    initOrbPoolPending();
  }, []);

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

  const value = useMemo(
    () => ({ registerSlot, unregisterSlot }),
    [registerSlot, unregisterSlot],
  );

  return (
    <OrbOverlayContext.Provider value={value}>
      {children}
      <View style={styles.overlay} pointerEvents="none">
        <OrbPoolHost slots={slots} />
      </View>
    </OrbOverlayContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
  },
});
