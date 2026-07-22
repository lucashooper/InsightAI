import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  navigation: any;
  onVibeSelected?: (vibe: 'light') => void;
}

/** Deprecated screen — onboarding now defaults to light theme without a picker. */
export default function ChooseVibeScreen({ navigation, onVibeSelected }: Props) {
  const { setTheme } = useTheme();

  useEffect(() => {
    const forward = async () => {
      await setTheme('light');
      onVibeSelected?.('light');
      navigation.replace('OnboardingQuestion');
    };
    forward();
  }, [navigation, onVibeSelected, setTheme]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8b5cf6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef7f2',
  },
});
