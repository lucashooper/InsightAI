import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import SunoGradient from '../../components/onboarding/SunoGradient';
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
    orbColors: ['rgba(249, 115, 22, 0.95)', 'rgba(234, 88, 12, 0.85)', 'rgba(194, 65, 12, 0.75)'],
    glowColor: 'rgba(249, 115, 22, 0.4)',
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
        return ['#fff5ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c'];
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bgTransitionAnim = useRef(new Animated.Value(0)).current;
  const { setTheme } = useTheme();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

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
    
    // Navigate to OnboardingQuestion (keep ChooseVibe in stack for back navigation)
    navigation.navigate('OnboardingQuestion');
  };

  const textColor = isDarkTheme(selectedVibe || 'light') ? '#ffffff' : '#1a1a2e';
  
  return (
    <View style={styles.container}>
      {/* Use solid background for dark themes, gradient for others */}
      {isDarkTheme(selectedVibe || 'light') ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: selectedVibe === 'midnight' ? '#0f0f23' : '#000000' }]} />
      ) : (
        <SunoGradient themeColors={backgroundColors} />
      )}
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }}
      >
        <Ionicons name="chevron-back" size={28} color={textColor} />
      </TouchableOpacity>
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Choose your vibe</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>Pick a theme that feels like you.</Text>
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
          style={[styles.continueButton, !selectedVibe && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedVibe}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedVibe ? ['#8b5cf6', '#7c3aed'] : ['#4b5563', '#374151']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
  backButton: {
    position: 'absolute',
    top: isTablet ? 60 : 50,
    left: isTablet ? 32 : 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: isTablet ? 80 : 60,
    paddingHorizontal: isTablet ? 60 : 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: isTablet ? 48 : 40,
  },
  title: {
    fontSize: isTablet ? sf(42) : sf(36),
    fontWeight: '600',
    color: '#1a1a2e',
    letterSpacing: -0.5,
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
    borderRadius: 999,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueGradient: {
    paddingVertical: isTablet ? 20 : 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontSize: isTablet ? sf(18) : sf(16),
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});
