import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// Breathing phase configuration (Headspace-inspired)
const BREATH_PHASES = {
  INHALE: { duration: 4000, label: 'Breathe in', type: 'inhale' as const },
  HOLD_IN: { duration: 2000, label: 'Hold', type: 'hold' as const },
  EXHALE: { duration: 6000, label: 'Breathe out', type: 'exhale' as const },
  HOLD_OUT: { duration: 2000, label: 'Hold', type: 'hold' as const },
};

const TOTAL_CYCLE_DURATION = Object.values(BREATH_PHASES).reduce((sum, phase) => sum + phase.duration, 0);

const CALMING_PHRASES = [
  'Let your thoughts drift like clouds',
  'You are exactly where you need to be',
  'This moment is enough',
  'Peace begins within',
  'Release what no longer serves you',
  'Be gentle with yourself',
];

type BreathPhase = 'inhale' | 'hold_in' | 'exhale' | 'hold_out';

export default function MeditationScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [phaseLabel, setPhaseLabel] = useState('Breathe in');
  const [breathCount, setBreathCount] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [showPhrase, setShowPhrase] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [meditationTheme, setMeditationTheme] = useState<'sky' | 'sunset'>('sky');
  const phaseStartTime = useRef(Date.now());
  
  const breathProgress = useRef(new Animated.Value(0)).current;
  const phraseOpacity = useRef(new Animated.Value(0)).current;
  const cloud1Y = useRef(new Animated.Value(0)).current;
  const cloud2Y = useRef(new Animated.Value(0)).current;

  // 4-phase breathing animation cycle with logging
  useEffect(() => {
    const logPhaseTransition = (phase: BreathPhase, label: string, duration: number) => {
      console.log('[MeditationPhase]:', phase);
      console.log('[PhaseStartTimestamp]:', Date.now());
      console.log('[DurationMs]:', duration);
      phaseStartTime.current = Date.now();
      setBreathPhase(phase);
      setPhaseLabel(label);
    };

    const breathCycle = Animated.loop(
      Animated.sequence([
        // Phase 1: Inhale (0 -> 1)
        Animated.timing(breathProgress, {
          toValue: 1,
          duration: BREATH_PHASES.INHALE.duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        // Phase 2: Hold at max (stays at 1)
        Animated.timing(breathProgress, {
          toValue: 1,
          duration: BREATH_PHASES.HOLD_IN.duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        // Phase 3: Exhale (1 -> 0)
        Animated.timing(breathProgress, {
          toValue: 0,
          duration: BREATH_PHASES.EXHALE.duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        // Phase 4: Hold at min (stays at 0)
        Animated.timing(breathProgress, {
          toValue: 0,
          duration: BREATH_PHASES.HOLD_OUT.duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    );
    breathCycle.start();

    // Track phase changes for UI updates
    const phaseInterval = setInterval(() => {
      const elapsed = (Date.now() - phaseStartTime.current) % TOTAL_CYCLE_DURATION;
      
      if (elapsed < BREATH_PHASES.INHALE.duration) {
        if (breathPhase !== 'inhale') {
          logPhaseTransition('inhale', BREATH_PHASES.INHALE.label, BREATH_PHASES.INHALE.duration);
        }
      } else if (elapsed < BREATH_PHASES.INHALE.duration + BREATH_PHASES.HOLD_IN.duration) {
        if (breathPhase !== 'hold_in') {
          logPhaseTransition('hold_in', BREATH_PHASES.HOLD_IN.label, BREATH_PHASES.HOLD_IN.duration);
        }
      } else if (elapsed < BREATH_PHASES.INHALE.duration + BREATH_PHASES.HOLD_IN.duration + BREATH_PHASES.EXHALE.duration) {
        if (breathPhase !== 'exhale') {
          logPhaseTransition('exhale', BREATH_PHASES.EXHALE.label, BREATH_PHASES.EXHALE.duration);
        }
      } else {
        if (breathPhase !== 'hold_out') {
          logPhaseTransition('hold_out', BREATH_PHASES.HOLD_OUT.label, BREATH_PHASES.HOLD_OUT.duration);
          setBreathCount(prev => prev + 1);
        }
      }
    }, 100);

    return () => {
      breathCycle.stop();
      clearInterval(phaseInterval);
    };
  }, [breathPhase]);


  // Clouds are static (no animation)
  // useEffect(() => {
  //   Animated.loop(
  //     Animated.timing(cloud1Y, {
  //       toValue: 30,
  //       duration: 20000,
  //       easing: Easing.inOut(Easing.ease),
  //       useNativeDriver: true,
  //     })
  //   ).start();
  //   
  //   Animated.loop(
  //     Animated.timing(cloud2Y, {
  //       toValue: -20,
  //       duration: 15000,
  //       easing: Easing.inOut(Easing.ease),
  //       useNativeDriver: true,
  //     })
  //   ).start();
  // }, []);

  // Show calming phrase every 30 seconds
  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setShowPhrase(true);
      Animated.sequence([
        Animated.timing(phraseOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.delay(5000),
        Animated.timing(phraseOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowPhrase(false);
        setCurrentPhrase((prev) => (prev + 1) % CALMING_PHRASES.length);
      });
    }, 30000);
    return () => clearInterval(phraseInterval);
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(300);
  };

  // Single smooth progress bar (left to right, full width)
  const progressBarWidth = breathProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Richer, calmer colors (less washed out)
  const skyColors = ['#3d5a80', '#5b7a9f', '#7a9abf']; // Deeper, richer sky blue
  const sunsetColors = ['#d4633c', '#e8885d', '#f4a261']; // Warmer, richer sunset

  return (
    <View style={styles.container}>
      {/* Sky/Sunset gradient background */}
      <LinearGradient
        colors={meditationTheme === 'sky' ? skyColors : sunsetColors}
        style={styles.backgroundGradient}
      />

      {/* Static clouds */}
      <View style={[styles.cloud, styles.cloud1]} />
      <View style={[styles.cloud, styles.cloud2]} />
      <View style={[styles.cloud, styles.cloud3]} />

      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="rgba(255, 255, 255, 0.9)" />
      </TouchableOpacity>

      {/* Theme toggle button */}
      <TouchableOpacity 
        onPress={() => setMeditationTheme(prev => prev === 'sky' ? 'sunset' : 'sky')} 
        style={styles.themeToggle}
      >
        <Ionicons 
          name={meditationTheme === 'sky' ? 'sunny' : 'moon'} 
          size={24} 
          color="rgba(255, 255, 255, 0.9)" 
        />
      </TouchableOpacity>

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Breath instruction - Premium typography */}
        <Text style={styles.breathText}>{phaseLabel}</Text>

        {/* Single smooth progress bar - full width */}
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBarFill, { width: progressBarWidth }]} />
        </View>

        {/* Breath counter */}
        <Text style={styles.breathCountText}>{breathCount} {breathCount === 1 ? 'breath' : 'breaths'}</Text>
        
        {/* Debug info (temporary) */}
        {__DEV__ && (
          <View style={styles.debugOverlay}>
            <Text style={styles.debugText}>Phase: {breathPhase}</Text>
            <Text style={styles.debugText}>Progress: {Math.round(breathProgress._value * 100)}%</Text>
          </View>
        )}
      </View>

      {/* Calming phrase (appears occasionally) */}
      {showPhrase && (
        <Animated.View style={[styles.phraseContainer, { opacity: phraseOpacity }]}>
          <Text style={styles.phraseText}>{CALMING_PHRASES[currentPhrase]}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 250, 245, 0.65)', // Warmer off-white with subtle shading
    borderRadius: 100,
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cloud1: {
    width: 180,
    height: 80,
    top: 100,
    left: -40,
  },
  cloud2: {
    width: 220,
    height: 90,
    top: 200,
    right: -50,
  },
  cloud3: {
    width: 160,
    height: 70,
    bottom: 150,
    left: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  themeToggle: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathText: {
    fontSize: 32,
    fontWeight: '600',
    color: 'rgba(255, 252, 248, 0.98)', // Warm off-white for better readability
    marginBottom: 48,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: width * 0.8,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 252, 248, 0.95)',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  breathCountText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 252, 248, 0.75)',
    marginTop: 20,
    letterSpacing: 0.5,
  },
  debugOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'monospace',
  },
  phraseContainer: {
    position: 'absolute',
    top: '25%',
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  phraseText: {
    fontSize: 18,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 28,
  },
});
