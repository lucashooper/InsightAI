import React from 'react';
import { TouchableOpacity, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { ONBOARDING_SURFACE, ONBOARDING_TEXT } from '../../constants/onboardingTheme';

type Props = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  /** When true, omits absolute positioning — for header rows (e.g. question flow). */
  inline?: boolean;
};

/** Frosted white circle back control — use on every onboarding screen. */
export default function OnboardingBackButton({ onPress, style, inline }: Props) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);

  return (
    <TouchableOpacity
      style={[inline ? styles.inlineWrap : styles.backButton, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <View
        style={[
          styles.circle,
          dark
            ? {
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderColor: 'rgba(255,255,255,0.18)',
              }
            : {
                backgroundColor: ONBOARDING_SURFACE.fillElevated,
                borderColor: ONBOARDING_SURFACE.border,
              },
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color={dark ? '#ffffff' : ONBOARDING_TEXT.primary}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  inlineWrap: {
    padding: 4,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
