import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageStyle,
  Modal,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { sf } from '../../utils/responsive';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { wellbeingTierFromScore } from './WellbeingIllustrations';
import { WELLBEING_HERO_ART } from '../../constants/wellbeingAssets';
import EmotionPills from './EmotionPills';
import OnboardingButton from '../onboarding/OnboardingButton';
import {
  wellbeingBadgeBg,
  wellbeingBadgeBorder,
  wellbeingBadgeLabel,
  wellbeingBadgeTextColor,
  wellbeingRingColor,
  wellbeingToDisplay,
} from '../../utils/wellbeingDisplay';
import GlassCard from '../ui/GlassCard';
import { PREMIUM } from '../../constants/premiumUI';

const RING_SIZE = 96;
const MODAL_RING_SIZE = 64;
const CARD_MIN_HEIGHT = 110;
const RING_STROKE = 7;
const MODAL_RING_STROKE = 5;
const ART_RESERVE = 80;
const ILLUSTRATION_SIZE = 160;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

type Props = {
  emotion?: string | null;
  wellbeingScore?: number;
  adjustLabel?: string;
  onWellbeingChange?: (score: number) => void;
  summarySnippet?: string;
  emotions?: string[];
};

type ScoreRingProps = {
  size: number;
  stroke: number;
  score100: number;
  ringColor: string;
  ringTrack: string;
  secondaryColor: string;
  scoreFontSize: number;
  maxFontSize: number;
};

function ScoreRing({
  size,
  stroke,
  score100,
  ringColor,
  ringTrack,
  secondaryColor,
  scoreFontSize,
  maxFontSize,
}: ScoreRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score100 / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringTrack}
          strokeWidth={stroke}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.ringInner}>
        <Text style={[styles.scoreText, { color: ringColor, fontSize: scoreFontSize, lineHeight: scoreFontSize + 2 }]}>
          {score100}
        </Text>
        <Text style={[styles.scoreMax, { color: secondaryColor, fontSize: maxFontSize }]}>/100</Text>
      </View>
    </View>
  );
}

export default function InsightsHeroCard({
  emotion,
  wellbeingScore,
  adjustLabel = 'Adjust',
  onWellbeingChange,
  summarySnippet,
  emotions = [],
}: Props) {
  const { theme } = useTheme();
  const isDark = isDarkTheme(theme.name);
  const [showAdjust, setShowAdjust] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const showWellbeing = wellbeingScore != null;
  const score10 = wellbeingScore ?? 0;
  const score100 = wellbeingToDisplay(score10);
  const ringColor = wellbeingRingColor(score100);
  const tier = wellbeingTierFromScore(score100);
  const badgeLabel = wellbeingBadgeLabel(score100);
  const badgeBg = wellbeingBadgeBg(score100, isDark);
  const badgeBorder = wellbeingBadgeBorder(score100, isDark);
  const badgeColor = wellbeingBadgeTextColor(score100);

  const ringTrack = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(200,190,220,0.3)';

  const illustrationSource = WELLBEING_HERO_ART[tier];
  const fadeColors = isDark
    ? ['rgba(16,16,22,0.98)', 'rgba(16,16,22,0.7)', 'rgba(16,16,22,0)']
    : ['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0)'];

  const textPrimary = theme.colors.primaryText;
  const textSecondary = theme.colors.secondaryText;

  const pillEmotions = emotions.length > 0 ? emotions : emotion ? [emotion] : [];
  const displayEmotion = emotion
    ? emotion.charAt(0).toUpperCase() + emotion.slice(1)
    : null;
  const canAdjust = Boolean(onWellbeingChange);
  const canOpenDetail = Boolean(summarySnippet?.trim());

  const openDetail = useCallback(() => {
    if (!canOpenDetail) return;
    setDetailVisible(true);
  }, [canOpenDetail]);

  const closeDetail = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setDetailVisible(false));
  }, [slideAnim]);

  useEffect(() => {
    if (!detailVisible) return;
    slideAnim.setValue(300);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [detailVisible, slideAnim]);

  const renderBadge = () => (
    <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
      <Text style={[styles.badgeStar, { color: badgeColor }]}>★</Text>
      <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={canOpenDetail ? 0.97 : 1}
        onPress={openDetail}
        disabled={!canOpenDetail}
      >
        <GlassCard
          variant={isDark ? 'surface' : 'recap'}
          noPad
          style={styles.cardShell}
          contentStyle={[
            styles.cardContainer,
            !isDark && { backgroundColor: PREMIUM.recapGlass.fill },
          ]}
        >
          <Image
            source={illustrationSource}
            style={styles.illustration as ImageStyle}
            contentFit="cover"
            contentPosition="bottom right"
            transition={200}
          />
          <LinearGradient
            colors={fadeColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.illustrationFade}
            pointerEvents="none"
          />

          <View style={styles.contentRow}>
            {showWellbeing ? (
              <View style={styles.scoreCol}>
                <TouchableOpacity
                  onPress={() => canAdjust && setShowAdjust((v) => !v)}
                  activeOpacity={canAdjust ? 0.85 : 1}
                  disabled={!canAdjust}
                >
                  <ScoreRing
                    size={RING_SIZE}
                    stroke={RING_STROKE}
                    score100={score100}
                    ringColor={ringColor}
                    ringTrack={ringTrack}
                    secondaryColor={textSecondary}
                    scoreFontSize={sf(26)}
                    maxFontSize={sf(11)}
                  />
                </TouchableOpacity>

                {showAdjust && canAdjust ? (
                  <View
                    style={[
                      styles.adjustRow,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => onWellbeingChange!(Math.max(1, score10 - 1))}
                      style={styles.adjustBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.adjustSymbol, { color: textSecondary }]}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.adjustLabel, { color: textSecondary }]}>{adjustLabel}</Text>
                    <TouchableOpacity
                      onPress={() => onWellbeingChange!(Math.min(10, score10 + 1))}
                      style={styles.adjustBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.adjustSymbol, { color: textSecondary }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : null}

            {showWellbeing ? <View style={styles.columnDivider} /> : null}

            <View style={[styles.textBlock, !showWellbeing && styles.textBlockFull]}>
              {showWellbeing ? renderBadge() : null}

              {displayEmotion ? (
                <Text style={[styles.emotionValue, { color: textPrimary }]} numberOfLines={1}>
                  {displayEmotion}
                </Text>
              ) : null}

              {summarySnippet ? (
                <Text
                  style={[styles.description, { color: textSecondary }]}
                  numberOfLines={4}
                >
                  {summarySnippet}
                </Text>
              ) : null}
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>

      {pillEmotions.length > 0 ? (
        <View style={styles.pillsOuter}>
          <EmotionPills emotions={pillEmotions} />
        </View>
      ) : null}

      <Modal visible={detailVisible} transparent animationType="none" onRequestClose={closeDetail}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={closeDetail} />
          <Animated.View
            style={[
              styles.modalSheet,
              { height: SHEET_HEIGHT, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {Platform.OS === 'ios' ? (
              <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
            ) : null}
            <View style={styles.modalSheetFill} />

            <View style={styles.modalHandle} />

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalIllustrationWrap}>
                <Image
                  source={illustrationSource}
                  style={styles.modalIllustration as ImageStyle}
                  contentFit="cover"
                  contentPosition="center"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.9)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.modalIllustrationFade}
                  pointerEvents="none"
                />
              </View>

              {showWellbeing ? (
                <View style={styles.modalScoreRow}>
                  <ScoreRing
                    size={MODAL_RING_SIZE}
                    stroke={MODAL_RING_STROKE}
                    score100={score100}
                    ringColor={ringColor}
                    ringTrack={ringTrack}
                    secondaryColor="#6b6b8a"
                    scoreFontSize={sf(20)}
                    maxFontSize={sf(10)}
                  />
                  {renderBadge()}
                </View>
              ) : null}

              {displayEmotion ? (
                <Text style={styles.modalEmotion}>{displayEmotion}</Text>
              ) : null}

              {summarySnippet ? (
                <Text style={styles.modalDescription}>{summarySnippet}</Text>
              ) : null}
            </ScrollView>

            <View style={styles.modalFooter}>
              <OnboardingButton label="Done" onPress={closeDetail} />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  cardShell: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
  },
  cardContainer: {
    position: 'relative',
    width: '100%',
    minHeight: CARD_MIN_HEIGHT,
    overflow: 'hidden',
    borderRadius: 20,
  },
  illustration: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: ILLUSTRATION_SIZE,
    height: ILLUSTRATION_SIZE,
    zIndex: 1,
  },
  illustrationFade: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: ILLUSTRATION_SIZE,
    height: ILLUSTRATION_SIZE,
    zIndex: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    zIndex: 3,
  },
  scoreCol: {
    alignItems: 'center',
    width: RING_SIZE,
  },
  columnDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 12,
    marginVertical: 8,
  },
  ringInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontWeight: '700',
  },
  scoreMax: {
    fontWeight: '600',
    marginTop: -1,
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
  },
  adjustBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustSymbol: { fontSize: sf(16), fontWeight: '600', lineHeight: sf(18) },
  adjustLabel: { fontSize: sf(10), fontWeight: '600' },
  textBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: ART_RESERVE,
  },
  textBlockFull: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 4,
  },
  badgeStar: { fontSize: sf(11) },
  badgeText: { fontSize: sf(12), fontWeight: '700' },
  emotionValue: {
    fontSize: sf(18),
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: sf(14),
    lineHeight: sf(20),
  },
  pillsOuter: {
    marginTop: 10,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  modalSheetFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.97)',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginBottom: 20,
    zIndex: 1,
  },
  modalScroll: {
    flex: 1,
    zIndex: 1,
  },
  modalScrollContent: {
    paddingBottom: 12,
  },
  modalIllustrationWrap: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  modalIllustration: {
    width: '100%',
    height: 140,
  },
  modalIllustrationFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  modalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  modalEmotion: {
    fontSize: sf(22),
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: sf(15),
    color: '#3d3d5c',
    lineHeight: sf(22),
  },
  modalFooter: {
    marginTop: 20,
    paddingBottom: 8,
    zIndex: 1,
  },
});
