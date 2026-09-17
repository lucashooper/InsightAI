import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { INK, SURFACE, TYPO } from '../../constants/typography';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  /** primary = charcoal pill · secondary = soft light fill · ghost = text only */
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  /** Stretch to the container width. */
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * The app's one button. Restrained by design: colour lives in cards and
 * gradients, so CTAs stay charcoal or quiet light fills.
 */
export default function PillButton({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight,
  block = false,
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
}: Props) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const color = isPrimary ? INK.inverse : isGhost ? INK.secondary : INK.primary;
  const iconSize = size === 'lg' ? 18 : 16;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        isPrimary && styles.primary,
        variant === 'secondary' && styles.secondary,
        isGhost && styles.ghost,
        block && styles.block,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={iconSize} color={color} /> : null}
          <Text style={[size === 'lg' ? TYPO.button : TYPO.buttonSm, { color }]} numberOfLines={1}>
            {label}
          </Text>
          {iconRight ? <Ionicons name={iconRight} size={iconSize} color={color} /> : null}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
  },
  lg: {
    minHeight: 56,
    paddingHorizontal: 28,
  },
  md: {
    minHeight: 44,
    paddingHorizontal: 20,
  },
  block: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: SURFACE.charcoal,
    shadowColor: SURFACE.charcoal,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  secondary: {
    backgroundColor: SURFACE.light,
    borderWidth: 1,
    borderColor: SURFACE.lightBorder,
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
