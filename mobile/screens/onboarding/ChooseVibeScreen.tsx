import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemeName, useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import SunoGradient from '../../components/onboarding/SunoGradient';
import ProgressBarNeon from '../../components/onboarding/ProgressBarNeon';
import { isTablet, sf } from '../../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VibeOption {
  name: ThemeName;
  label: string;
  emoji: string;
  orbColors: string[];
  glowColor: string;
}

const vibeOptions: VibeOption[] = [
  {
    name: 'dark',
    label: 'Dark',
    emoji: '🌑',
    orbColors: ['rgba(30, 30, 35, 0.95)', 'rgba(20, 20, 25, 0.9)', 'rgba(15, 15, 20, 0.85)'],
    glowColor: 'rgba(50, 50, 60, 0.4)',
  },
  {
    name: 'light',
    label: 'Light',
    emoji: '☀️',
    orbColors: ['rgba(255, 167, 38, 0.9)', 'rgba(255, 152, 0, 0.8)', 'rgba(251, 140, 0, 0.7)'],
    glowColor: 'rgba(255, 167, 38, 0.4)',
  },
  {
    name: 'sunset',
    label: 'Sunset',
    emoji: '🌅',
    orbColors: ['rgba(255, 107, 74, 0.95)', 'rgba(255, 87, 51, 0.85)', 'rgba(255, 69, 58, 0.75)'],
    glowColor: 'rgba(255, 107, 74, 0.4)',
  },
  {
    name: 'vibrant',
    label: 'Vibrant',
    emoji: '✨',
    orbColors: ['rgba(168, 85, 247, 0.95)', 'rgba(139, 92, 246, 0.85)', 'rgba(124, 58, 237, 0.75)'],
    glowColor: 'rgba(168, 85, 247, 0.4)',
  },
  {
    name: 'ocean',
    label: 'Ocean',
    emoji: '�',
    orbColors: ['rgba(59, 130, 246, 0.95)', 'rgba(37, 99, 235, 0.85)', 'rgba(29, 78, 216, 0.75)'],
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  {
    name: 'midnight',
    label: 'Midnight',
    emoji: '🌙',
    orbColors: ['rgba(99, 102, 241, 0.95)', 'rgba(79, 70, 229, 0.85)', 'rgba(67, 56, 202, 0.75)'],
    glowColor: 'rgba(99, 102, 241, 0.4)',
  },
];

interface Props {
  navigation: any;
  onVibeSelected?: (vibe: ThemeName) => void;
}

export default function ChooseVibeScreen({ navigation, onVibeSelected }: Props) {
  const [selectedVibe, setSelectedVibe] = useState<ThemeName | null>('light');
  const getThemeBackgroundColors = (themeName: ThemeName): string[] => {
    switch (themeName) {
      case 'dark':
        return ['#0a0a0a', '#050505', '#000000', '#050505', '#0a0a0a'];
      case 'light':
        return ['#fef5f8', '#fef0f5', '#f5f0fe', '#f0f9ff', '#fef7f2'];
      case 'sunset':
        return ['#fff5f0', '#ffe8dc', '#ffd4c4', '#ffb399', '#ff8c69'];
      case 'vibrant':
        return ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc'];
      case 'ocean':
        return ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa'];
      case 'midnight':
        return ['#0f0f23', '#1a1a3e', '#252550', '#1a1a3e', '#0f0f23'];
      default:
        return ['#fef5f8', '#fef0f5', '#f5f0fe', '#f0f9ff', '#fef7f2'];
    }
  };
  const [backgroundColors, setBackgroundColors] = useState<string[]>(getThemeBackgroundColors('light'));
  const { setTheme } = useTheme();

  const handleVibeSelect = (vibe: ThemeName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVibe(vibe);
    
    // Apply background colors immediately for instant feedback (no flash)
    const newColors = getThemeBackgroundColors(vibe);
    setBackgroundColors(newColors);
  };

  const handleContinue = async () => {
    if (!selectedVibe) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Save the selected theme BEFORE navigating so the next screen picks it up immediately
    await setTheme(selectedVibe);
    console.log('[ChooseVibe] Theme saved:', selectedVibe);
    
    if (onVibeSelected) {
      onVibeSelected(selectedVibe);
    }
    
    // Navigate to OnboardingQuestion (PersonalityQuizIntro will appear after wellbeing question)
    navigation.navigate('OnboardingQuestion');
  };

  const isDark = isDarkTheme(selectedVibe || 'light');
  const textColor = isDark ? '#ffffff' : '#1a1a2e';

  return (
    <View style={styles.container}>
      {/* StatusBar updates instantly with theme selection */}
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" />
      {/* Use solid background for dark themes, gradient for others */}
      {isDark ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: selectedVibe === 'midnight' ? '#0f0f23' : '#000000' }]} />
      ) : (
        <SunoGradient themeColors={backgroundColors} />
      )}
      
      {/* Top Row: Back Arrow + Progress Bar (matching OnboardingQuestion layout) */}
      <View style={styles.topRow}>
        <TouchableOpacity 
          style={styles.backArrow}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Welcome');
            }
          }}
        >
          <View style={[styles.backArrowCircle, { backgroundColor: isDarkTheme(selectedVibe || 'light') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <Ionicons name="arrow-back" size={20} color={textColor} />
          </View>
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <ProgressBarNeon currentStep={1} totalSteps={9} />
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Choose your vibe</Text>
        </View>

        <View style={styles.orbGrid}>
          {vibeOptions.map((vibe, index) => (
            <OrbOption
              key={vibe.name}
              vibe={vibe}
              isSelected={selectedVibe === vibe.name}
              onPress={() => handleVibeSelect(vibe.name)}
              delay={index * 80}
              selectedTheme={selectedVibe}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            isDark && styles.continueButtonDark,
            !selectedVibe && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedVibe}
          activeOpacity={0.8}
        >
          <View style={[styles.continueGradient, !selectedVibe && { opacity: 0.4 }]}> 
            <Text style={[styles.continueText, isDark && styles.continueTextDark]}>Continue</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface OrbOptionProps {
  vibe: VibeOption;
  isSelected: boolean;
  onPress: () => void;
  delay: number;
  selectedTheme: ThemeName | null;
}

function OrbOption({ vibe, isSelected, onPress, delay, selectedTheme }: OrbOptionProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const selectionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Removed pulsing animation - user found it annoying
  }, []);

  useEffect(() => {
    Animated.spring(selectionAnim, {
      toValue: isSelected ? 1 : 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  const orbScale = scaleAnim; // Removed pulse animation
  const selectionScale = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <TouchableOpacity
      style={styles.orbContainer}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.orbWrapper,
          {
            transform: [
              { scale: Animated.multiply(orbScale, selectionScale) },
            ],
          },
        ]}
      >
        {isSelected && (
          <Animated.View
            style={[
              styles.selectionRing,
              {
                borderColor: vibe.glowColor,
                opacity: selectionAnim,
              },
            ]}
          />
        )}
        
        <View style={styles.orb}>
          <LinearGradient
            colors={vibe.orbColors as any}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.orbGradient}
          />
          
          {/* Frosted glass overlay */}
          <View style={styles.frostOverlay} />
          
          {/* Subtle highlight */}
          <View style={styles.highlight} />
          
          <View
            style={[
              styles.orbGlow,
              {
                backgroundColor: vibe.glowColor,
                shadowColor: vibe.orbColors[0],
              },
            ]}
          />
        </View>
      </Animated.View>

      <Text style={[styles.label, { color: isDarkTheme(selectedTheme || 'light') ? '#ffffff' : '#1a1a2e' }]}>{vibe.label}</Text>
    </TouchableOpacity>
  );
}

const ORB_SIZE = isTablet ? 140 : 110;
const GLOW_SIZE = isTablet ? 160 : 130;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7f2',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
    gap: 12,
  },
  backArrow: {
    padding: 4,
  },
  progressBarContainer: {
    flex: 1,
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
    paddingTop: isTablet ? 20 : 10,
    paddingHorizontal: isTablet ? 60 : 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: isTablet ? 48 : 40,
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    color: '#1a1a2e',
    letterSpacing: -0.6,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isTablet ? sf(18) : sf(16),
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    fontWeight: '400',
  },
  orbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: isTablet ? 32 : 24,
    marginBottom: isTablet ? 48 : 40,
  },
  orbContainer: {
    width: (SCREEN_WIDTH - (isTablet ? 120 : 48) - (isTablet ? 32 : 24)) / 2,
    alignItems: 'center',
    marginBottom: isTablet ? 24 : 16,
  },
  orbWrapper: {
    position: 'relative',
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  selectionRing: {
    position: 'absolute',
    width: ORB_SIZE + 16,
    height: ORB_SIZE + 16,
    borderRadius: (ORB_SIZE + 16) / 2,
    borderWidth: 3,
    borderColor: '#8b5cf6',
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    overflow: 'hidden',
    position: 'relative',
  },
  orbGradient: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
  },
  orbGlow: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    top: -(GLOW_SIZE - ORB_SIZE) / 2,
    left: -(GLOW_SIZE - ORB_SIZE) / 2,
    opacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  frostOverlay: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  highlight: {
    position: 'absolute',
    top: ORB_SIZE * 0.18,
    left: ORB_SIZE * 0.25,
    width: ORB_SIZE * 0.25,
    height: ORB_SIZE * 0.15,
    borderRadius: ORB_SIZE * 0.15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ rotate: '-20deg' }],
  },
  label: {
    fontSize: isTablet ? sf(18) : sf(16),
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
    marginTop: 4,
  },
  continueButton: {
    marginTop: 'auto',
    marginBottom: isTablet ? 40 : 30,
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDark: {
    backgroundColor: '#ffffff',
    shadowOpacity: 0.14,
  },
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueGradient: {
    paddingVertical: 22,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontSize: sf(17),
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  continueTextDark: {
    color: '#111111',
  },
});
