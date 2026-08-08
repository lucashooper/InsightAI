import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  DISCOVERY_PROMPTS_FEATURED,
  DISCOVERY_PROMPTS_MORE,
  DiscoveryPrompt,
} from '../../constants/miraReveal';
import InsightCompanionMark from './InsightCompanionMark';
import AnimatedMiraOrb from './AnimatedMiraOrb';
import GlassSurface from '../shared/GlassSurface';
import { PREMIUM, TYPE } from '../../constants/premiumUI';
import { ROAST_PALETTE } from '../../utils/companionTheme';
import { sf } from '../../utils/responsive';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  isDark: boolean;
  isRoast?: boolean;
  title: string;
  subtitle: string;
  roastPrompts?: string[];
  onSelectPrompt: (text: string) => void;
};

export default function MiraDiscoveryEmpty({
  isDark,
  isRoast = false,
  title,
  subtitle,
  roastPrompts,
  onSelectPrompt,
}: Props) {
  const [showAll, setShowAll] = useState(false);
  const moreOpacity = useRef(new Animated.Value(0)).current;

  const featured: { key: string; label: string; text: string }[] =
    isRoast && roastPrompts?.length
      ? roastPrompts.slice(0, 3).map((text, i) => ({
          key: `roast-${i}`,
          label: text,
          text,
        }))
      : DISCOVERY_PROMPTS_FEATURED.map((p) => ({
          key: p.id,
          label: p.label,
          text: p.text,
        }));

  const more: { key: string; label: string; text: string }[] =
    isRoast && roastPrompts?.length
      ? roastPrompts.slice(3).map((text, i) => ({
          key: `roast-more-${i}`,
          label: text,
          text,
        }))
      : DISCOVERY_PROMPTS_MORE.map((p: DiscoveryPrompt) => ({
          key: p.id,
          label: p.label,
          text: p.text,
        }));

  const titleColor = isRoast
    ? ROAST_PALETTE.textPrimary
    : isDark
      ? PREMIUM.text.primary
      : '#1a1a1a';
  const subColor = isRoast
    ? ROAST_PALETTE.textSecondary
    : isDark
      ? PREMIUM.text.secondary
      : 'rgba(26,26,26,0.55)';
  const cardLabelColor = isRoast
    ? ROAST_PALETTE.textPrimary
    : isDark
      ? PREMIUM.text.primary
      : '#1a1a1a';
  const seeAllColor = isDark ? PREMIUM.text.secondary : 'rgba(26,26,26,0.5)';
  const arrowColor = isDark ? PREMIUM.text.tertiary : 'rgba(26,26,26,0.35)';

  useEffect(() => {
    if (showAll) {
      moreOpacity.setValue(0);
      Animated.timing(moreOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [showAll, moreOpacity]);

  const toggleSeeAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext({
      duration: 380,
      update: { type: LayoutAnimation.Types.spring, springDamping: 0.82 },
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setShowAll((v) => !v);
  };

  const renderCard = (item: { key: string; label: string; text: string }) => (
    <TouchableOpacity
      key={item.key}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      activeOpacity={0.85}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelectPrompt(item.text);
      }}
    >
      <GlassSurface contentStyle={styles.cardInner}>
        <Text style={[styles.cardText, { color: cardLabelColor }]} numberOfLines={2}>
          {item.label}
        </Text>
        <Ionicons
          name="arrow-forward"
          size={16}
          color={isRoast ? ROAST_PALETTE.accent : arrowColor}
        />
      </GlassSurface>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <View style={styles.orb}>
        <AnimatedMiraOrb size={118} showGlow />
      </View>

      <Text
        style={[styles.title, { color: titleColor }]}
        accessibilityRole="header"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.78}
      >
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: subColor }]}>{subtitle}</Text>

      {isRoast ? (
        <View style={styles.roastBadge}>
          <Text style={styles.roastBadgeText}>Roast Mode</Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {featured.map((item) => renderCard(item))}
        {showAll
          ? more.map((item) => (
              <Animated.View key={item.key} style={{ opacity: moreOpacity }}>
                {renderCard(item)}
              </Animated.View>
            ))
          : null}
      </View>

      {!isRoast && more.length > 0 ? (
        <TouchableOpacity
          style={styles.seeAll}
          onPress={toggleSeeAll}
          accessibilityRole="button"
          accessibilityLabel={showAll ? 'Show less' : 'See all insights'}
          activeOpacity={0.7}
        >
          <Text style={[styles.seeAllText, { color: seeAllColor }]}>
            {showAll ? 'Show less' : 'See all insights'}
          </Text>
          <Ionicons
            name={showAll ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={seeAllColor}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: PREMIUM.space[3],
    paddingBottom: PREMIUM.space[4],
  },
  orb: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: PREMIUM.space[3],
  },
  title: {
    ...TYPE.section,
    fontSize: sf(25),
    lineHeight: sf(28),
    fontWeight: '600',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 14,
    maxWidth: '100%',
    paddingHorizontal: 4,
  },
  subtitle: {
    ...TYPE.secondary,
    textAlign: 'center',
    marginBottom: PREMIUM.space[4],
    maxWidth: 280,
  },
  roastBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: PREMIUM.radius.pill,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(239,68,68,0.28)',
    marginBottom: PREMIUM.space[2],
  },
  roastBadgeText: {
    color: '#fca5a5',
    ...TYPE.caption,
    fontWeight: '600',
  },
  list: {
    width: '100%',
    gap: PREMIUM.layout.cardGap,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 20,
  },
  cardText: {
    flex: 1,
    ...TYPE.cardTitle,
    color: PREMIUM.text.primary,
  },
  seeAll: {
    marginTop: PREMIUM.space[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  seeAllText: {
    ...TYPE.caption,
    color: PREMIUM.text.secondary,
    fontWeight: '500',
  },
});
