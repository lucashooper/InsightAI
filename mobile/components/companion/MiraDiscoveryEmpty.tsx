import React, { useMemo } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { BlurView } from 'expo-blur';

import * as Haptics from 'expo-haptics';

import { getDailyDiscoveryPrompts } from '../../constants/miraReveal';

import OrbView from './OrbView';

import { PREMIUM, TYPE } from '../../constants/premiumUI';

import { ROAST_PALETTE } from '../../utils/companionTheme';

import { sf } from '../../utils/responsive';

import type { AiPersonality } from '../../utils/aiPersonalities';

const ORB_SIZE = 130;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LIGHT = {
  title: '#1a1a2e',
  subtitle: '#6b6b8a',
  pillBg: 'rgba(255, 255, 255, 0.92)',
  pillBorder: 'rgba(200, 185, 255, 0.35)',
  pillText: '#1a1a2e',
  chevron: '#7B5EA7',
};

const DARK = {
  title: '#FFFFFF',
  subtitle: 'rgba(255, 255, 255, 0.6)',
  pillBg: 'rgba(255, 255, 255, 0.08)',
  pillBorder: 'rgba(255, 255, 255, 0.12)',
  pillText: '#FFFFFF',
  chevron: 'rgba(255, 255, 255, 0.7)',
};

type Props = {
  isDark: boolean;
  isRoast?: boolean;
  personality?: AiPersonality;
  title: string;
  subtitle: string;
  roastPrompts?: string[];
  hidden?: boolean;
  onSelectPrompt: (text: string) => void;
};

function MiraDiscoveryEmpty({
  isDark,
  isRoast = false,
  personality = 'default',
  title,
  subtitle,
  roastPrompts,
  hidden = false,
  onSelectPrompt,
}: Props) {
  const insets = useSafeAreaInsets();
  const dailyPrompts = useMemo(() => getDailyDiscoveryPrompts(), []);
  const palette = isRoast ? null : isDark ? DARK : LIGHT;

  const featured: { key: string; label: string; text: string }[] =
    isRoast && roastPrompts?.length
      ? roastPrompts.slice(0, 3).map((text, i) => ({
          key: `roast-${i}`,
          label: text,
          text,
        }))
      : dailyPrompts.map((p) => ({
          key: p.id,
          label: p.label,
          text: p.text,
        }));

  const titleColor = isRoast ? ROAST_PALETTE.textPrimary : palette!.title;

  const subColor = isRoast ? ROAST_PALETTE.textSecondary : palette!.subtitle;

  if (hidden) return null;

  const renderCard = (item: { key: string; label: string; text: string }) => {
    const pillStyle = isRoast
      ? styles.promptPillRoast
      : [
          styles.promptPill,
          {
            backgroundColor: palette!.pillBg,
            borderColor: palette!.pillBorder,
          },
        ];

    const pillInner = (
      <View style={pillStyle}>
        <Text
          style={[
            styles.pillText,
            {
              color: isRoast ? ROAST_PALETTE.textPrimary : palette!.pillText,
            },
          ]}
          numberOfLines={2}
        >
          {item.label}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isRoast ? ROAST_PALETTE.accent : palette!.chevron}
        />
      </View>
    );

    return (
      <TouchableOpacity
        key={item.key}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        activeOpacity={0.85}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelectPrompt(item.text);
        }}
        style={styles.pillWrap}
      >
        {isDark && !isRoast && Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint="dark" style={styles.pillBlur}>
            {pillInner}
          </BlurView>
        ) : (
          pillInner
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { minHeight: SCREEN_HEIGHT - insets.top - 200 }]}>
      <View style={styles.orbSection}>
        <View style={styles.orb}>
          <OrbView size={ORB_SIZE} personality={personality} isRoast={isRoast} />
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text
          style={[styles.title, { color: titleColor }]}
          accessibilityRole="header"
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.78}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text style={[styles.subtitle, { color: subColor }]}>{subtitle}</Text>
        ) : (
          <View style={styles.subtitleSpacer} />
        )}

        <View style={styles.list}>{featured.map((item) => renderCard(item))}</View>
      </View>
    </View>
  );
}

export default React.memo(MiraDiscoveryEmpty);

const styles = StyleSheet.create({
  root: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 0,
    paddingBottom: PREMIUM.space[2],
  },
  orbSection: {
    minHeight: SCREEN_HEIGHT * 0.26,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  contentSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 4,
  },
  title: {
    fontSize: sf(22),
    lineHeight: sf(28),
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 10,
    maxWidth: '100%',
    paddingHorizontal: 28,
  },
  subtitle: {
    ...TYPE.secondary,
    fontSize: sf(15),
    textAlign: 'center',
    marginBottom: 36,
    maxWidth: 300,
    paddingHorizontal: 28,
    lineHeight: sf(22),
  },
  subtitleSpacer: {
    height: 36,
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
    gap: 12,
    paddingTop: 4,
  },
  pillWrap: {
    marginHorizontal: 20,
  },
  pillBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  promptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  promptPillRoast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.22)',
  },
  pillText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
