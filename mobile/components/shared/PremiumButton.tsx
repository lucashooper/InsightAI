import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  large?: boolean;
};

export default function PremiumButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  fullWidth = true,
  large = false,
}: Props) {
  const { theme } = useTheme();
  const isDark = isDarkTheme(theme.name);

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[fullWidth && styles.fullWidth, style, (disabled || loading) && styles.disabled]}
      >
        <LinearGradient
          colors={
            isDark
              ? ['rgba(255,255,255,0.96)', 'rgba(245,245,248,0.92)']
              : ['rgba(17,24,39,0.94)', 'rgba(31,41,55,0.90)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.primaryGradient, large && styles.primaryGradientLarge]}
        >
          {loading ? (
            <ActivityIndicator color={isDark ? '#111827' : '#ffffff'} />
          ) : (
            <Text style={[styles.primaryText, large && styles.primaryTextLarge, { color: isDark ? '#111827' : '#ffffff' }]}>{label}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[
          styles.secondary,
          {
            borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)',
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          },
          fullWidth && styles.fullWidth,
          style,
          (disabled || loading) && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.primaryText} />
        ) : (
          <Text style={[styles.secondaryText, { color: theme.colors.primaryText }]}>{label}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[styles.ghost, fullWidth && styles.fullWidth, style]}
    >
      <Text style={[styles.ghostText, { color: theme.colors.secondaryText }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  primaryGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryGradientLarge: {
    paddingVertical: 18,
    borderRadius: 18,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primaryTextLarge: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondary: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  ghost: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
