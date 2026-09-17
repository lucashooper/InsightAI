import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface Props {
  navigation: any;
  onVibeSelected?: (vibe: 'light') => void;
}

/**
 * Deprecated pass-through — there is no vibe picker any more.
 * Must NOT write a theme: onboarding is always rendered light (see
 * ThemeOverride in AppNavigator) and the in-app default is handled by
 * ThemeContext. Persisting `dark` here made every new user's onboarding
 * flip to dark mid-flow.
 */
export default function ChooseVibeScreen({ navigation, onVibeSelected }: Props) {
  useEffect(() => {
    onVibeSelected?.('light');
    navigation.replace('OnboardingQuestion');
  }, [navigation, onVibeSelected]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#a855f7" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
