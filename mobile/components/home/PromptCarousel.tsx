import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import CloudMascot from '../companion/CloudMascot';
import PillButton from '../ui/PillButton';
import PressableScale from '../ui/PressableScale';
import { INK, TYPO } from '../../constants/typography';
import { isTablet, screenPadding } from '../../utils/responsive';

export type PromptCardItem = {
  key: string;
  /** Card gradient, top → bottom. Keep the bottom stop near-white. */
  colors: readonly [string, string, ...string[]];
  /** Mascot tint while this card is centred. */
  mascotTint: string;
  /** Mascot expression while this card is centred (0–1). */
  mascotValence?: number;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta: string;
  onPress: () => void;
  /** Muted styling for completed items. */
  done?: boolean;
};

type Props = {
  items: PromptCardItem[];
  /** Height of the cards. */
  height?: number;
  style?: object;
};

const { width: SCREEN_W } = Dimensions.get('window');
const GAP = 12;
const CARD_W = SCREEN_W - screenPadding * 2;
const SNAP = CARD_W + GAP;
const MASCOT = isTablet ? 148 : 124;

/**
 * Horizontal pager of large gradient prompt cards. The mascot overlaps the
 * top-right corner and its tint / expression follow the scroll position via
 * `interpolateColor`, so swiping between palettes recolours it continuously.
 */
export default function PromptCarousel({ items, height = isTablet ? 360 : 312, style }: Props) {
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const inputRange = items.map((_, i) => i * SNAP);
  const tints = items.map((it) => it.mascotTint);
  const valences = items.map((it) => it.mascotValence ?? 0.85);

  const mascotTint = useDerivedValue(() =>
    items.length > 1 ? interpolateColor(scrollX.value, inputRange, tints) : tints[0] ?? '#CDBBFF',
  );
  const mascotValence = useDerivedValue(() =>
    items.length > 1 ? interpolate(scrollX.value, inputRange, valences, 'clamp') : valences[0] ?? 0.85,
  );

  // A little parallax so the mascot "rides" the cards.
  const mascotStyle = useAnimatedStyle(() => {
    const frac = (Math.abs(scrollX.value) % SNAP) / SNAP;
    return {
      transform: [
        { translateX: interpolate(frac, [0, 0.5, 1], [0, -8, 0]) },
        { rotate: `${interpolate(frac, [0, 0.5, 1], [0, -3, 0])}deg` },
      ],
    };
  });

  return (
    <View style={[styles.root, { height: height + 28 }, style]}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP}
        snapToAlignment="start"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: screenPadding, paddingTop: 22, gap: GAP }}
        style={{ overflow: 'visible' }}
      >
        {items.map((item, index) => (
          <PromptCard key={item.key} item={item} index={index} total={items.length} height={height} />
        ))}
      </Animated.ScrollView>

      <Animated.View pointerEvents="none" style={[styles.mascotAnchor, mascotStyle]}>
        <CloudMascot size={MASCOT} animatedTint={mascotTint} animatedValence={mascotValence} shadow={false} />
      </Animated.View>

      {items.length > 1 ? <Dots count={items.length} scrollX={scrollX} /> : null}
    </View>
  );
}

function PromptCard({ item, index, total, height }: { item: PromptCardItem; index: number; total: number; height: number }) {
  return (
    <PressableScale onPress={item.onPress} scaleTo={0.975} style={[styles.card, { width: CARD_W, height }]} accessibilityRole="button">
      <LinearGradient colors={item.colors as [string, string, ...string[]]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.cardBody}>
        <Text style={styles.eyebrow}>{item.eyebrow ?? `${index + 1} of ${total}`}</Text>
        <Text style={[styles.title, item.done && styles.titleDone]} numberOfLines={5}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.cardFooter}>
        <PillButton label={item.cta} onPress={item.onPress} size="md" variant={item.done ? 'secondary' : 'primary'} />
      </View>
    </PressableScale>
  );
}

function Dots({ count, scrollX }: { count: number; scrollX: SharedValue<number> }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={i} index={i} scrollX={scrollX} />
      ))}
    </View>
  );
}

function Dot({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(scrollX.value / SNAP - index);
    return {
      width: interpolate(d, [0, 1], [18, 6], 'clamp'),
      opacity: interpolate(d, [0, 1], [1, 0.35], 'clamp'),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  root: {
    marginHorizontal: -screenPadding,
  },
  card: {
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardBody: {
    paddingTop: 30,
    paddingHorizontal: 24,
    paddingRight: MASCOT * 0.55,
  },
  eyebrow: {
    ...TYPO.caption,
    color: INK.tertiary,
    marginBottom: 10,
  },
  title: {
    ...TYPO.subheading,
    color: INK.primary,
  },
  titleDone: {
    color: INK.secondary,
  },
  subtitle: {
    ...TYPO.body,
    color: INK.muted,
    marginTop: 10,
  },
  cardFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotAnchor: {
    position: 'absolute',
    top: 0,
    right: screenPadding - 10,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: INK.primary,
  },
});
