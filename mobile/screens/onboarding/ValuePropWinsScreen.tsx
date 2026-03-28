import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';

const WINS = [
  { emoji: '🏋️', text: 'Going to the gym consistently' },
  { emoji: '📚', text: 'Reading every day this week' },
  { emoji: '🤝', text: 'Opening up to people more' },
  { emoji: '🧠', text: 'Staying calm under pressure' },
  { emoji: '🌅', text: 'Maintaining a morning routine' },
  { emoji: '💪', text: 'Pushing through difficult moments' },
];

export default function ValuePropWinsScreen({ navigation }: any) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);

  const pillAnims = useRef(WINS.map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(16),
  }))).current;
  const footerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    WINS.forEach((_, i) => {
      Animated.sequence([
        Animated.delay(120 + i * 140),
        Animated.parallel([
          Animated.timing(pillAnims[i].opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(pillAnims[i].translateY, { toValue: 0, duration: 320, useNativeDriver: true }),
        ]),
      ]).start();
    });

    Animated.sequence([
      Animated.delay(160 + WINS.length * 140 + 80),
      Animated.timing(footerFade, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      {dark ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
      ) : (
        <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={[styles.backArrowCircle, { backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          <Ionicons name="arrow-back" size={20} color={dark ? '#fff' : '#1a1a2e'} />
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <View>
          <Text style={[styles.eyebrow, { color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }]}> 
            Celebrate growth
          </Text>
          <Text style={[styles.title, { color: dark ? '#ffffff' : '#1a1a2e' }]}> 
            Celebrate your{'\n'}wins too
          </Text>
          <Text style={[styles.subtitle, { color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}> 
            Insight also spots what's going well so you can build on your strengths.
          </Text>
        </View>

        <View style={styles.pillsContainer}>
          {WINS.map((item, i) => (
            <Animated.View
              key={i}
              style={[
                styles.pill,
                {
                  backgroundColor: dark ? 'rgba(52,211,153,0.08)' : 'rgba(52,211,153,0.10)',
                  borderColor: dark ? 'rgba(52,211,153,0.18)' : 'rgba(52,211,153,0.25)',
                  opacity: pillAnims[i].opacity,
                  transform: [{ translateY: pillAnims[i].translateY }],
                },
              ]}
            >
              <Text style={styles.pillEmoji}>{item.emoji}</Text>
              <Text style={[styles.pillText, { color: dark ? 'rgba(255,255,255,0.85)' : '#1a1a2e' }]}>
                {item.text}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View style={[styles.footer, {
        opacity: footerFade,
        transform: [{
          translateY: footerFade.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0],
          }),
        }],
      }, iPadContentStyle as any]}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('NotificationsOnboarding');
          }}
        >
          <View style={styles.buttonInner}>
            <Text style={styles.buttonText}>Continue</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  backArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: isTablet ? 48 : 28,
    paddingTop: isTablet ? 120 : 110,
    paddingBottom: 20,
  },
  eyebrow: {
    fontSize: sf(13),
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    letterSpacing: -0.6,
    lineHeight: sf(40),
    marginBottom: 14,
  },
  subtitle: {
    fontSize: sf(16),
    lineHeight: sf(23),
    marginBottom: isTablet ? 48 : 36,
  },
  pillsContainer: {
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  pillEmoji: {
    fontSize: 22,
  },
  pillText: {
    fontSize: sf(15),
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: isTablet ? 48 : 28,
    paddingBottom: isTablet ? 70 : 50,
  },
  button: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    borderRadius: 28,
  },
  buttonText: {
    fontSize: sf(17),
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.2,
  },
});
