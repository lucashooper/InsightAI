import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { ONBOARDING_TEXT, ONBOARDING_TYPE } from '../../constants/onboardingTheme';

type Props = {
  label: string;
  onPress: () => void;
};

export default function OnboardingSkipLink({ label, onPress }: Props) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);

  return (
    <TouchableOpacity onPress={onPress} style={styles.wrap} activeOpacity={0.7}>
      <Text
        style={[
          ONBOARDING_TYPE.skip,
          { color: dark ? 'rgba(255,255,255,0.55)' : ONBOARDING_TEXT.tertiary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
