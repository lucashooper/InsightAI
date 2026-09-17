import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AnimatedGradientBackdrop from '../components/ui/AnimatedGradientBackdrop';
import PillButton from '../components/ui/PillButton';
import PressableScale from '../components/ui/PressableScale';
import StaggerIn from '../components/shared/StaggerIn';
import { INK, TYPO } from '../constants/typography';
import { screenPadding, isTablet } from '../utils/responsive';
import { safeGoBack } from '../utils/navigationSafety';
import { JOURNEY_UNITS, markLessonComplete } from '../data/journeyUnits';

type Page = 'intro' | 'body' | 'reflect';
const PAGES: Page[] = ['intro', 'body', 'reflect'];

/**
 * A lesson — three pages (intro · content · reflection) on a full-screen
 * gradient in the unit's palette. Completing the reflection marks progress
 * and flows straight into the next lesson.
 */
export default function JourneyLessonScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const unit = useMemo(() => JOURNEY_UNITS.find((u) => u.id === route?.params?.unitId) ?? JOURNEY_UNITS[0], [route?.params?.unitId]);
  const [lessonIndex, setLessonIndex] = useState<number>(Math.min(route?.params?.lessonIndex ?? 0, unit.lessons.length - 1));
  const [page, setPage] = useState<Page>('intro');
  const lesson = unit.lessons[lessonIndex];

  // Progress segments: one per lesson page across the unit.
  const totalSegments = unit.lessons.length * PAGES.length;
  const filled = lessonIndex * PAGES.length + PAGES.indexOf(page) + 1;

  // Shift the backdrop a touch per page so the space feels like it moves.
  const colors = useMemo(() => {
    const [a, b] = unit.colors;
    if (page === 'intro') return [a, b, '#FFFFFF'] as const;
    if (page === 'body') return [a, `${b}`, `${b}`] as const;
    return [b, a, `${a}`] as const;
  }, [unit.colors, page]);

  const close = () => safeGoBack(navigation, 'Journey');

  const next = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (page === 'intro') return setPage('body');
    if (page === 'body') return setPage('reflect');
    await markLessonComplete(unit.id, lesson.id);
    if (lessonIndex < unit.lessons.length - 1) {
      setLessonIndex((i) => i + 1);
      setPage('intro');
    } else {
      close();
    }
  };

  const reflectInJournal = () => {
    navigation.navigate('PromptEntry', { promptText: lesson.reflection });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AnimatedGradientBackdrop colors={colors} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} duration={600} />

      {/* Top bar */}
      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <View style={styles.segments}>
          {Array.from({ length: totalSegments }).map((_, i) => (
            <View key={i} style={[styles.segment, i < filled && styles.segmentOn]} />
          ))}
        </View>
        <PressableScale onPress={close} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={20} color={INK.primary} />
        </PressableScale>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
        {page === 'intro' ? (
          <StaggerIn key="intro" style={styles.centered}>
            <View style={styles.stepRow}>
              {unit.lessons.map((l, i) => (
                <View key={l.id} style={[styles.stepCircle, i === lessonIndex && styles.stepCircleOn]}>
                  <Text style={[styles.stepText, i === lessonIndex && { color: unit.ink }]}>{i + 1}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.heroTitle}>{lesson.title}</Text>
            {lesson.sources?.length ? (
              <View style={styles.sources}>
                <Ionicons name="book-outline" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.sourcesEyebrow}>Based on studies of</Text>
                {lesson.sources.map((s) => (
                  <Text key={s} style={styles.source}>
                    {s}
                  </Text>
                ))}
              </View>
            ) : null}
          </StaggerIn>
        ) : null}

        {page === 'body' ? (
          <StaggerIn key="body">
            <Text style={styles.kicker}>{`${unit.title} · Lesson ${lessonIndex + 1}`}</Text>
            <Text style={styles.bodyTitle}>{lesson.title}</Text>
            {lesson.body.map((para, i) => (
              <Text key={i} style={styles.para}>
                {para}
              </Text>
            ))}
          </StaggerIn>
        ) : null}

        {page === 'reflect' ? (
          <StaggerIn key="reflect" style={styles.centered}>
            <Text style={styles.kicker}>Reflect</Text>
            <Text style={styles.heroTitle}>{lesson.reflection}</Text>
            <PillButton label="Write about it" icon="create-outline" onPress={reflectInJournal} variant="secondary" size="md" style={styles.whitePill} />
          </StaggerIn>
        ) : null}
      </ScrollView>

      {/* CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <PillButton
          label={page === 'intro' ? 'Start' : page === 'body' ? 'Next' : lessonIndex < unit.lessons.length - 1 ? 'Complete · next lesson' : 'Complete unit'}
          onPress={next}
          block
          variant="secondary"
          style={styles.ctaPill}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EEE',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: screenPadding,
  },
  segments: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  segmentOn: {
    backgroundColor: '#FFFFFF',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: isTablet ? 64 : 28,
    paddingVertical: 32,
  },
  centered: {
    alignItems: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleOn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  stepText: {
    ...TYPO.buttonSm,
    color: 'rgba(255,255,255,0.9)',
  },
  heroTitle: {
    ...TYPO.h1,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 28,
  },
  sources: {
    alignItems: 'center',
    gap: 4,
    marginTop: 24,
  },
  sourcesEyebrow: {
    ...TYPO.eyebrow,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  source: {
    ...TYPO.bodySm,
    color: 'rgba(255,255,255,0.95)',
  },
  kicker: {
    ...TYPO.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  bodyTitle: {
    ...TYPO.h2,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  para: {
    ...TYPO.body,
    color: 'rgba(255,255,255,0.96)',
    marginBottom: 16,
  },
  whitePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
  },
  footer: {
    paddingHorizontal: screenPadding,
    paddingTop: 8,
  },
  ctaPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
});
