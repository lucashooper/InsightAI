import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  View,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PREMIUM, TYPE } from '../../constants/premiumUI';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /** Slightly larger tap target for reveal actions */
  large?: boolean;
  /** Full-width CTA (check-in flows) */
  block?: boolean;
};

/**
 * Only three button types: Primary · Secondary Glass · Ghost
 */
export default function PremiumButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  style,
  disabled,
  large = false,
  block = false,
}: Props) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  const iconColor = isPrimary
    ? '#fff'
    : isGhost
      ? (dark ? PREMIUM.text.secondary : 'rgba(26,26,26,0.55)')
      : (dark ? '#c4b5fd' : '#6d28d9');

  return (
    <TouchableOpacity
      onPress={() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.8}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.base,
        large && styles.large,
        block && styles.block,
        isPrimary && styles.primary,
        isSecondary && (dark ? styles.secondaryDark : styles.secondaryLight),
        isGhost && styles.ghost,
        disabled && styles.disabled,
        style,
      ]}
    >
      {isSecondary && Platform.OS === 'ios' && dark ? (
        <BlurView intensity={PREMIUM.glass.blur} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={styles.row}>
        {icon ? (
          <Ionicons name={icon} size={large ? 16 : 15} color={iconColor} />
        ) : null}
        <Text
          style={[
            styles.label,
            large && styles.labelLarge,
            isPrimary && styles.labelPrimary,
            isSecondary && (dark ? styles.labelSecondaryDark : styles.labelSecondaryLight),
            isGhost && (dark ? styles.labelGhostDark : styles.labelGhostLight),
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: PREMIUM.radius.button,
    paddingHorizontal: 16,
    paddingVertical: 11,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  large: {
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: PREMIUM.radius.button,
  },
  block: {
    alignSelf: 'stretch',
    width: '100%',
  },
  primary: {
    backgroundColor: PREMIUM.accent,
  },
  secondaryDark: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PREMIUM.glass.border,
    backgroundColor: PREMIUM.glass.fill,
  },
  secondaryLight: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(122, 86, 160, 0.18)',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  disabled: { opacity: 0.4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  label: {
    ...TYPE.caption,
    fontWeight: '600',
  },
  labelLarge: {
    fontSize: TYPE.caption.fontSize + 1,
  },
  labelPrimary: { color: '#fff' },
  labelSecondaryDark: { color: 'rgba(255,255,255,0.88)' },
  labelSecondaryLight: { color: '#5b21b6' },
  labelGhostDark: { color: PREMIUM.text.secondary },
  labelGhostLight: { color: 'rgba(26,26,26,0.55)' },
});
