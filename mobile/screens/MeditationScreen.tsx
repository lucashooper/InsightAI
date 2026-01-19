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

const CALMING_PHRASES = [
  'Let your thoughts drift like clouds',
  'You are exactly where you need to be',
  'This moment is enough',
  'Peace begins within',
  'Release what no longer serves you',
  'Be gentle with yourself',
];

export default function MeditationScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [breathState, setBreathState] = useState<'in' | 'out' | 'hold'>('in');
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [showPhrase, setShowPhrase] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [isActive, setIsActive] = useState(false);
  
  const breathProgress = useRef(new Animated.Value(0)).current;
  const phraseOpacity = useRef(new Animated.Value(0)).current;
  const cloud1Y = useRef(new Animated.Value(0)).current;
  const cloud2Y = useRef(new Animated.Value(0)).current;

  // Breathing animation cycle
  useEffect(() => {
    const breathCycle = Animated.loop(
      Animated.sequence([
        // Breathe in
        Animated.timing(breathProgress, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        // Hold
        Animated.delay(1000),
        // Breathe out
        Animated.timing(breathProgress, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        // Hold
        Animated.delay(1000),
      ])
    );
    breathCycle.start();
    return () => breathCycle.stop();
  }, []);

  // Track breath state for text prompts
  useEffect(() => {
    let cycleCount = 0;
    const interval = setInterval(() => {
      const position = cycleCount % 10;
      if (position < 4) {
        setBreathState('in');
      } else if (position === 4) {
        setBreathState('hold');
      } else if (position < 9) {
        setBreathState('out');
      } else {
        setBreathState('hold');
      }
      cycleCount++;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Slow cloud drift animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(cloud1Y, {
        toValue: 30,
        duration: 20000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
    
    Animated.loop(
      Animated.timing(cloud2Y, {
        toValue: -20,
        duration: 15000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, []);

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

  const progressWidth = breathProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['10%', '90%'],
  });

  return (
    <View style={styles.container}>
      {/* Sky gradient background */}
      <LinearGradient
        colors={['#87CEEB', '#B0E0E6', '#E0F6FF']}
        style={styles.backgroundGradient}
      />

      {/* Animated clouds */}
      <Animated.View style={[styles.cloud, styles.cloud1, { transform: [{ translateY: cloud1Y }] }]} />
      <Animated.View style={[styles.cloud, styles.cloud2, { transform: [{ translateY: cloud2Y }] }]} />
      <Animated.View style={[styles.cloud, styles.cloud3]} />

      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="rgba(255, 255, 255, 0.9)" />
      </TouchableOpacity>

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Breath instruction */}
        <Text style={styles.breathText}>
          {breathState === 'in' ? 'Breathe in' : breathState === 'out' ? 'Breathe out' : ''}
        </Text>

        {/* Horizontal progress bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>

        {/* Last breath indicator */}
        <Text style={styles.lastBreathText}>Last breath</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 100,
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathText: {
    fontSize: 28,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 40,
    letterSpacing: 1,
  },
  progressBarContainer: {
    width: width * 0.8,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 2,
  },
  lastBreathText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    letterSpacing: 0.5,
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
