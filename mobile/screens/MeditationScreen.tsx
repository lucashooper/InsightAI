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
  HOLD_IN: { duration: 3000, label: 'Hold', type: 'hold' as const },
  EXHALE: { duration: 6000, label: 'Breathe out', type: 'exhale' as const },
  HOLD_OUT: { duration: 3000, label: 'Hold', type: 'hold' as const },
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
  const [hasStartedBreathing, setHasStartedBreathing] = useState(false);
  const cycleStartTimeRef = useRef(Date.now());
  const breathPhaseRef = useRef<BreathPhase>('inhale');
  const cycleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathCycleRef = useRef<Animated.CompositeAnimation | null>(null);
  
  const breathProgress = useRef(new Animated.Value(0)).current;
  const phraseOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    breathPhaseRef.current = breathPhase;
  }, [breathPhase]);

  // 4-phase breathing animation cycle
  useEffect(() => {
    if (!hasStartedBreathing) return;

    cycleStartTimeRef.current = Date.now();
    breathPhaseRef.current = 'inhale';
    setBreathPhase('inhale');
    setPhaseLabel(BREATH_PHASES.INHALE.label);
    setBreathCount(0);
    breathProgress.setValue(0);

    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }

    if (breathCycleRef.current) {
      breathCycleRef.current.stop();
      breathCycleRef.current = null;
    }

    const cycle = Animated.loop(
      Animated.sequence([
        Animated.timing(breathProgress, {
          toValue: 1,
          duration: BREATH_PHASES.INHALE.duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.delay(BREATH_PHASES.HOLD_IN.duration),
        Animated.timing(breathProgress, {
          toValue: 0,
          duration: BREATH_PHASES.EXHALE.duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.delay(BREATH_PHASES.HOLD_OUT.duration),
      ])
    );
    breathCycleRef.current = cycle;
    cycle.start();

    cycleIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - cycleStartTimeRef.current) % TOTAL_CYCLE_DURATION;
      const currentPhase = breathPhaseRef.current;

      if (elapsed < BREATH_PHASES.INHALE.duration) {
        if (currentPhase !== 'inhale') {
          breathPhaseRef.current = 'inhale';
          setBreathPhase('inhale');
          setPhaseLabel(BREATH_PHASES.INHALE.label);
        }
      } else if (elapsed < BREATH_PHASES.INHALE.duration + BREATH_PHASES.HOLD_IN.duration) {
        if (currentPhase !== 'hold_in') {
          breathPhaseRef.current = 'hold_in';
          setBreathPhase('hold_in');
          setPhaseLabel(BREATH_PHASES.HOLD_IN.label);
        }
      } else if (elapsed < BREATH_PHASES.INHALE.duration + BREATH_PHASES.HOLD_IN.duration + BREATH_PHASES.EXHALE.duration) {
        if (currentPhase !== 'exhale') {
          breathPhaseRef.current = 'exhale';
          setBreathPhase('exhale');
          setPhaseLabel(BREATH_PHASES.EXHALE.label);
        }
      } else {
        if (currentPhase !== 'hold_out') {
          breathPhaseRef.current = 'hold_out';
          setBreathPhase('hold_out');
          setPhaseLabel(BREATH_PHASES.HOLD_OUT.label);
          setBreathCount(prev => prev + 1);
        }
      }
    }, 100);

    return () => {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
      if (breathCycleRef.current) {
        breathCycleRef.current.stop();
        breathCycleRef.current = null;
      }
    };
  }, [hasStartedBreathing, breathProgress]);


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

  // Show calming phrase loop during intro
  useEffect(() => {
    if (hasStartedBreathing) return;

    setShowPhrase(true);
    phraseOpacity.setValue(0);
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(phraseOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.delay(3200),
        Animated.timing(phraseOpacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentPhrase((prev) => (prev + 1) % CALMING_PHRASES.length);
      });
    }, 5200);

    return () => {
      clearInterval(interval);
      setShowPhrase(false);
    };
  }, [hasStartedBreathing, phraseOpacity]);

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

  // Bidirectional progress bar (center outward like Headspace)
  const progressBarLeftWidth = breathProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });
  
  const progressBarRightWidth = breathProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  // Headspace-inspired gradient colors
  const skyColors = ['#2F8FFF', '#4CB6FF', '#73D2FF'];
  const sunsetColors = ['#FF6B6B', '#FFA07A', '#FFB88C']; // Warm sunset

  return (
    <View style={styles.container}>
      {/* Sky/Sunset gradient background */}
      <LinearGradient
        colors={meditationTheme === 'sky' ? skyColors : sunsetColors}
        style={styles.backgroundGradient}
      />

      {/* Realistic clouds with depth */}
      <View style={[styles.cloud, styles.cloud1]} />
      <View style={[styles.cloud, styles.cloud2]} />
      <View style={[styles.cloud, styles.cloud3]} />
      <View style={[styles.cloud, styles.cloud4]} />

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
        {!hasStartedBreathing ? (
          <>
            <Text style={styles.breathText}>Take a slow breath</Text>
            <Text style={styles.breathCountText}>When you're ready, start a breathing exercise.</Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setHasStartedBreathing(true)}
              activeOpacity={0.9}
            >
              <Text style={styles.startButtonText}>Start breathing exercise</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Breath instruction - Premium typography */}
            <Text style={styles.exercisePhaseText}>{phaseLabel}</Text>

            {/* Bidirectional progress bar - center outward */}
            <View style={styles.progressBarContainer}>
              <Animated.View style={[styles.progressBarFillLeft, { width: progressBarLeftWidth }]} />
              <Animated.View style={[styles.progressBarFillRight, { width: progressBarRightWidth }]} />
            </View>

            {/* Breath counter */}
            <Text style={styles.exerciseBreathCountText}>{breathCount} {breathCount === 1 ? 'breath' : 'breaths'}</Text>
          </>
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
    backgroundColor: '#FFFFFF', // Pure white for realistic clouds
    borderRadius: 100,
    shadowColor: 'rgba(0, 0, 0, 0.15)', // Darker shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5, // Android shadow
  },
  cloud1: {
    width: 200,
    height: 90,
    top: 120,
    left: -50,
    opacity: 0.95,
  },
  cloud2: {
    width: 240,
    height: 100,
    top: 220,
    right: -60,
    opacity: 0.9,
  },
  cloud3: {
    width: 180,
    height: 80,
    bottom: 180,
    left: 30,
    opacity: 0.85,
  },
  cloud4: {
    width: 160,
    height: 70,
    bottom: 350,
    right: 40,
    opacity: 0.8,
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
    paddingHorizontal: 24,
  },
  breathText: {
    fontSize: 34,
    fontWeight: '700',
    color: 'rgba(255, 252, 248, 0.98)', // Warm off-white for better readability
    marginBottom: 14,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: width * 0.8,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFillLeft: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 2,
    position: 'absolute',
    right: '50%',
    top: 0,
  },
  progressBarFillRight: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 2,
    position: 'absolute',
    left: '50%',
    top: 0,
  },
  breathCountText: {
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(255, 252, 248, 0.75)',
    marginTop: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  startButton: {
    marginTop: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.2,
  },
  exercisePhaseText: {
    fontSize: 40,
    fontWeight: '700',
    color: 'rgba(255, 252, 248, 0.98)',
    marginBottom: 48,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  exerciseBreathCountText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 252, 248, 0.75)',
    marginTop: 22,
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
