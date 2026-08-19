import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Lock from 'lucide-react-native/dist/esm/icons/lock.mjs';
import EyeOff from 'lucide-react-native/dist/esm/icons/eye-off.mjs';
import ShieldCheck from 'lucide-react-native/dist/esm/icons/shield-check.mjs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OrbView from '../components/companion/OrbView';
import { isTablet, sf, ss, si, screenPadding } from '../utils/responsive';

const ORB_SIZE = isTablet ? 260 : 180;
const LOCK_BADGE_SIZE = isTablet ? 72 : 56;
const LOCK_ICON_SIZE = isTablet ? 34 : 26;
const LOCK_BADGE_LEFT = (ORB_SIZE - LOCK_BADGE_SIZE) / 2;
const SCREEN_BG = '#F5F0E8';

type FeatureRowProps = {
  gradientColors: [string, string];
  shadowColor: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
};

function FeatureRow({ gradientColors, shadowColor, icon, title, subtitle }: FeatureRowProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBoxOuter, { shadowColor }]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          {icon}
        </LinearGradient>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

export default function PrivacyMarketingScreen({ navigation }: { navigation?: { goBack: () => void } }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {navigation ? (
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 8 }]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={si(24)} color="#7B5EA7" />
        </TouchableOpacity>
      ) : null}

      <View style={styles.content}>
        <View style={styles.heroWrap}>
          <View style={styles.orbContainer}>
            <OrbView size={ORB_SIZE} personality="default" />
          </View>
          <View style={styles.lockBadge}>
            <Lock size={LOCK_ICON_SIZE} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </View>

        <View style={styles.cardsWrap}>
          <FeatureRow
            gradientColors={['#A78BFA', '#7B5EA7']}
            shadowColor="rgba(123,94,167,0.4)"
            icon={<Lock size={si(28)} color="#FFFFFF" strokeWidth={2.25} />}
            title="End-to-End Encrypted"
            subtitle="Your entries are encrypted before they ever leave your device."
          />
          <FeatureRow
            gradientColors={['#38BDF8', '#0EA5E9']}
            shadowColor="rgba(14,165,233,0.4)"
            icon={<EyeOff size={si(28)} color="#FFFFFF" strokeWidth={2.25} />}
            title="Completely Private"
            subtitle="Only you can read your entries. Not even we can see them."
          />
          <FeatureRow
            gradientColors={['#4ADE80', '#22C55E']}
            shadowColor="rgba(34,197,94,0.4)"
            icon={<ShieldCheck size={si(28)} color="#FFFFFF" strokeWidth={2.25} />}
            title="Never Sold. Ever."
            subtitle="We will never share, sell, or monetise your personal data."
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BG,
    paddingHorizontal: screenPadding,
  },
  backButton: {
    position: 'absolute',
    left: screenPadding - 8,
    zIndex: 10,
    width: isTablet ? 44 : 36,
    height: isTablet ? 44 : 36,
    borderRadius: isTablet ? 22 : 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SCREEN_BG,
  },
  content: {
    flex: 1,
    paddingTop: isTablet ? 100 : 140,
    paddingBottom: isTablet ? 48 : 32,
    justifyContent: isTablet ? 'space-evenly' : 'flex-start',
  },
  heroWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: isTablet ? 8 : 20,
    marginBottom: isTablet ? ss(32) : 40,
    width: ORB_SIZE,
    height: ORB_SIZE + LOCK_BADGE_SIZE / 3,
    position: 'relative',
  },
  orbContainer: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    overflow: 'visible',
  },
  lockBadge: {
    position: 'absolute',
    bottom: 0,
    left: LOCK_BADGE_LEFT,
    width: LOCK_BADGE_SIZE,
    height: LOCK_BADGE_SIZE,
    borderRadius: LOCK_BADGE_SIZE / 2,
    backgroundColor: '#7B5EA7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#7B5EA7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 2,
  },
  cardsWrap: {
    gap: isTablet ? 20 : 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: isTablet ? 22 : 18,
    paddingHorizontal: isTablet ? ss(22) : 16,
    paddingVertical: isTablet ? ss(24) : 18,
    borderWidth: 1,
    borderColor: 'rgba(200,185,255,0.3)',
    shadowColor: 'rgb(120, 80, 200)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  iconBoxOuter: {
    width: isTablet ? ss(60) : 52,
    height: isTablet ? ss(60) : 52,
    borderRadius: isTablet ? 20 : 16,
    marginRight: isTablet ? 20 : 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: isTablet ? 20 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontWeight: '800',
    fontSize: sf(19),
    color: '#1a1a2e',
    marginBottom: isTablet ? 8 : 4,
  },
  cardSubtitle: {
    fontSize: sf(16),
    color: '#6b6b8a',
    lineHeight: sf(23),
  },
});
