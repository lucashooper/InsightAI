import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  interpolateColor,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import CloudMascot from '../components/companion/CloudMascot';
import PillButton from '../components/ui/PillButton';
import PressableScale from '../components/ui/PressableScale';
import StaggerIn, { staggerDelay } from '../components/shared/StaggerIn';
import { INK, SURFACE, TYPO } from '../constants/typography';
import { isTablet, screenPadding } from '../utils/responsive';
import { safeGoBack } from '../utils/navigationSafety';
import {
  JOURNEY_UNITS,
  isUnitComplete,
  isUnitUnlocked,
  loadJourneyProgress,
  nextLessonIndex,
  unitCompletedCount,
  type JourneyProgress,
  type JourneyUnit,
} from '../data/journeyUnits';

const { width: SCREEN_W } = Dimensions.get('window');
const RAIL_W = 44;
const CARD_H = isTablet ? 280 : 236;
const REPORT_H = 76;
const UNIT_GAP = 28;
/** Height of one unit block (card + report + gaps) — drives the mascot tint interpolation. */
const UNIT_BLOCK = CARD_H + 12 + REPORT_H + UNIT_GAP;
const INTRO_H = 96;

/**
 * Journey — a vertical, step-based timeline of learning units. Each unit card
 * carries its own generated illustration and gradient; the mascot in the
 * header recolours continuously as the user scrolls from one unit's palette
 * into the next.
 */
export default function JourneyScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState<JourneyProgress>({});

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadJourneyProgress().then((p) => {
        if (alive) setProgress(p);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const tintRange = useMemo(() => JOURNEY_UNITS.map((_, i) => Math.max(0, i * UNIT_BLOCK - INTRO_H)), []);
  const tintColors = useMemo(() => JOURNEY_UNITS.map((u) => u.mascotTint), []);
  const mascotTint = useDerivedValue(() => interpolateColor(scrollY.value, tintRange, tintColors));

  const openUnit = (unit: JourneyUnit) => {
    navigation.navigate('JourneyLesson', { unitId: unit.id, lessonIndex: nextLessonIndex(unit, progress) });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <PressableScale onPress={() => safeGoBack(navigation, 'MainTabs')} style={styles.iconBtn} accessibilityRole="button">
          <Ionicons name="chevron-back" size={22} color={INK.primary} />
        </PressableScale>
        <Text style={styles.title}>Journey</Text>
        <View style={styles.headerMascot}>
          <CloudMascot size={64} animatedTint={mascotTint} shadow={false} />
        </View>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
      >
        <Text style={styles.intro}>Discover more about yourself and unlock personalized reports along the way.</Text>

        {JOURNEY_UNITS.map((unit, index) => {
          const unlocked = isUnitUnlocked(index, progress);
          const complete = isUnitComplete(unit, progress);
          const doneCount = unitCompletedCount(unit, progress);
          const active = unlocked && !complete;
          const isLast = index === JOURNEY_UNITS.length - 1;

          return (
            <StaggerIn key={unit.id} delay={staggerDelay(index, 90, 60)} style={styles.unitRow}>
              {/* Rail */}
              <View style={styles.rail}>
                <View
                  style={[
                    styles.node,
                    complete && { backgroundColor: INK.primary, borderColor: INK.primary },
                    active && { borderColor: unit.colors[0] },
                  ]}
                >
                  {complete ? <Ionicons name="checkmark" size={14} color="#fff" /> : active ? <View style={[styles.nodeDot, { backgroundColor: unit.colors[0] }]} /> : null}
                </View>
                {!isLast ? <View style={styles.railLine} /> : null}
              </View>

              {/* Unit */}
              <View style={styles.unitCol}>
                <UnitCard
                  unit={unit}
                  index={index}
                  unlocked={unlocked}
                  complete={complete}
                  doneCount={doneCount}
                  onPress={() => unlocked && openUnit(unit)}
                />
                <ReportRow unit={unit} complete={complete} onPress={() => complete && navigation.navigate('Analytics')} />
              </View>
            </StaggerIn>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

function UnitCard({
  unit,
  index,
  unlocked,
  complete,
  doneCount,
  onPress,
}: {
  unit: JourneyUnit;
  index: number;
  unlocked: boolean;
  complete: boolean;
  doneCount: number;
  onPress: () => void;
}) {
  const status = complete ? 'Completed' : unlocked ? (doneCount > 0 ? 'In progress' : 'Ready') : 'Locked';
  const cta = complete ? 'Review' : doneCount > 0 ? 'Continue' : 'Start now';

  return (
    <PressableScale onPress={onPress} disabled={!unlocked} scaleTo={0.98} style={[styles.card, { height: CARD_H }]} accessibilityRole="button">
      <LinearGradient colors={[unit.colors[0], unit.colors[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {unit.art ? (
        <Image
          source={unit.art}
          style={[styles.art, !unlocked && { opacity: 0.55 }]}
          contentFit="cover"
          contentPosition="right center"
          cachePolicy="memory-disk"
          transition={200}
        />
      ) : null}
      {/* Legibility fade — solid unit colour on the left melting into the art */}
      <LinearGradient
        colors={[unit.colors[0], `${unit.colors[0]}CC`, `${unit.colors[0]}00`]}
        locations={[0, 0.42, 0.72]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.cardBody}>
        <Text style={styles.eyebrow}>{`Unit ${index + 1} · ${status}`}</Text>
        <Text style={styles.cardTitle}>{unit.title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {unit.subtitle}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        {unlocked ? (
          <PillButton label={cta} onPress={onPress} size="md" variant="secondary" style={styles.whitePill} />
        ) : (
          <View style={styles.lockRow}>
            <View style={styles.lockChip}>
              <Ionicons name="lock-closed" size={14} color="#fff" />
            </View>
            <Text style={styles.lockText} numberOfLines={2}>
              This unit is locked. Complete the one before it to unlock.
            </Text>
          </View>
        )}
        {unlocked ? (
          <View style={styles.steps}>
            {unit.lessons.map((l, i) => {
              const done = i < doneCount;
              return (
                <View key={l.id} style={[styles.step, done && styles.stepDone]}>
                  <Text style={[styles.stepText, done && { color: unit.ink }]}>{i + 1}</Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

function ReportRow({ unit, complete, onPress }: { unit: JourneyUnit; complete: boolean; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} disabled={!complete} scaleTo={0.985} style={[styles.report, { height: REPORT_H }]} accessibilityRole="button">
      <View style={{ flex: 1 }}>
        <Text style={styles.reportTitle}>{`${unit.title} Report`}</Text>
        <Text style={styles.reportSub}>{complete ? 'Ready to read' : 'Complete lessons to unlock'}</Text>
      </View>
      <View style={[styles.reportBadge, { backgroundColor: `${unit.colors[0]}22` }]}>
        <Ionicons name={complete ? 'document-text' : 'document-text-outline'} size={22} color={unit.ink} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SURFACE.lightSolid,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    paddingBottom: 6,
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SURFACE.light,
  },
  title: {
    ...TYPO.h1,
    color: INK.primary,
    flex: 1,
  },
  headerMascot: {
    width: 64,
    height: 64,
  },
  intro: {
    ...TYPO.body,
    color: INK.secondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: 8,
    marginBottom: 28,
    height: INTRO_H - 36,
  },
  unitRow: {
    flexDirection: 'row',
    paddingRight: screenPadding,
    marginBottom: UNIT_GAP,
  },
  rail: {
    width: RAIL_W,
    alignItems: 'center',
  },
  node: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(28,26,34,0.18)',
    backgroundColor: SURFACE.lightSolid,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  nodeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  railLine: {
    flex: 1,
    width: 2,
    marginTop: 8,
    marginBottom: -UNIT_GAP - 26,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(28,26,34,0.16)',
  },
  unitCol: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  art: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '100%',
  },
  cardBody: {
    padding: 20,
    paddingRight: (SCREEN_W - RAIL_W - screenPadding) * 0.34,
  },
  eyebrow: {
    ...TYPO.caption,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 6,
  },
  cardTitle: {
    ...TYPO.h2,
    color: '#FFFFFF',
  },
  cardSubtitle: {
    ...TYPO.bodySm,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 0,
  },
  whitePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
  },
  steps: {
    flexDirection: 'row',
    gap: 6,
  },
  step: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  stepText: {
    ...TYPO.buttonSm,
    color: '#FFFFFF',
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  lockChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(28,26,34,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockText: {
    ...TYPO.bodySm,
    color: 'rgba(255,255,255,0.95)',
    flex: 1,
  },
  report: {
    marginTop: 12,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 12,
  },
  reportTitle: {
    ...TYPO.title,
    color: INK.primary,
  },
  reportSub: {
    ...TYPO.bodySm,
    color: INK.tertiary,
    marginTop: 2,
  },
  reportBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
