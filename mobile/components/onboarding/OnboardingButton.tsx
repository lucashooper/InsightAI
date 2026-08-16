import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { ONBOARDING_CTA, ONBOARDING_TEXT } from '../../constants/onboardingTheme';
import { sf } from '../../utils/responsive';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function OnboardingButton({
  label,
  onPress,
  disabled,
  loading,
  style,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, (disabled || loading) && styles.disabled, style]}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={ONBOARDING_CTA.text} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    borderRadius: ONBOARDING_CTA.borderRadius,
    backgroundColor: ONBOARDING_CTA.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(123, 94, 167, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  disabled: {
    opacity: 0.65,
  },
  label: {
    color: ONBOARDING_CTA.text,
    fontSize: sf(17),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
