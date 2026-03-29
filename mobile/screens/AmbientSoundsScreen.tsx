import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Asset } from 'expo-asset';

const { width, height } = Dimensions.get('window');

interface AmbientSound {
  id: string;
  name: string;
  image: any;
  audio: any;
  color: string;
}

const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: 'rain',
    name: 'Rain',
    image: require('../public/ambient-stuff/rain-image.jpg'),
    audio: require('../public/ambient-stuff/rain-sounds.mp3'),
    color: '#4a5568',
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    image: require('../public/ambient-stuff/campfire-image.jpg'),
    audio: require('../public/ambient-stuff/campfire.mp3'),
    color: '#d97706',
  },
];

AMBIENT_SOUNDS.forEach((sound) => {
  Asset.fromModule(sound.image).downloadAsync();
});

export default function AmbientSoundsScreen({ navigation }: any) {
  const [selectedSound, setSelectedSound] = useState<AmbientSound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Configure audio mode
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSelectSound = async (sound: AmbientSound) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Stop current sound if playing
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setSelectedSound(sound);
    setIsPlaying(false);
    setElapsedTime(0);
  };

  const handlePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!selectedSound) return;

    try {
      if (isPlaying) {
        // Pause
        if (soundRef.current) {
          await soundRef.current.pauseAsync();
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsPlaying(false);
      } else {
        // Play
        if (!soundRef.current) {
          const { sound } = await Audio.Sound.createAsync(
            selectedSound.audio,
            { isLooping: true, volume: 0.7 }
          );
          soundRef.current = sound;
        }
        
        await soundRef.current.playAsync();
        setIsPlaying(true);

        // Start timer
        timerRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handleStop = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsPlaying(false);
    setElapsedTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedSound) {
    return (
      <View style={styles.container}>
        <Image source={selectedSound.image} style={styles.backgroundImage} blurRadius={20} />
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        />

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              handleStop();
              setSelectedSound(null);
            }}
          >
            <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>

          <View style={styles.centerContent}>
            <Text style={styles.soundTitle}>{selectedSound.name}</Text>
            <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>

            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlButton, styles.playButton]}
                onPress={handlePlayPause}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={40}
                  color="#fff"
                />
              </TouchableOpacity>

              {(isPlaying || elapsedTime > 0) && (
                <TouchableOpacity
                  style={[styles.controlButton, styles.stopButton]}
                  onPress={handleStop}
                  activeOpacity={0.8}
                >
                  <Ionicons name="stop" size={32} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.subtitle}>
              {isPlaying ? 'Breathe and relax...' : 'Press play to begin'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81']}
        style={styles.gradientBackground}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ambient Sounds</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.soundsGrid}>
        <Text style={styles.sectionTitle}>Choose your ambience</Text>
        {AMBIENT_SOUNDS.map((sound) => (
          <TouchableOpacity
            key={sound.id}
            style={styles.soundCard}
            onPress={() => handleSelectSound(sound)}
            activeOpacity={0.9}
          >
            <Image source={sound.image} style={styles.soundImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.soundOverlay}
            />
            <View style={styles.soundInfo}>
              <Text style={styles.soundName}>{sound.name}</Text>
              <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  soundsGrid: {
    flex: 1,
    paddingTop: 20,
  },
  soundCard: {
    height: 180,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  soundImage: {
    width: '100%',
    height: '100%',
  },
  soundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  soundInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  soundName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: -1,
    marginBottom: 40,
  },
  timer: {
    fontSize: 64,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: -2,
    marginBottom: 60,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 40,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    borderColor: 'rgba(139, 92, 246, 1)',
  },
  stopButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
});
