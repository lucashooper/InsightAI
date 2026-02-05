import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface DailyMoodCheckInProps {
  visible: boolean;
  onDismiss: () => void;
  onJournal: () => void;
  userName?: string;
}

const MOOD_FACES = {
  1: '😢',
  2: '😟',
  3: '😐',
  4: '🙂',
  5: '😊',
  6: '😄',
  7: '😁',
  8: '🤩',
  9: '🥳',
  10: '🌟',
};

const MOOD_LABELS = {
  1: 'Struggling',
  2: 'Not great',
  3: 'Meh',
  4: 'Alright',
  5: 'Okay',
  6: 'Good',
  7: 'Great',
  8: 'Really good',
  9: 'Amazing',
  10: 'Incredible',
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export default function DailyMoodCheckIn({
  visible,
  onDismiss,
  onJournal,
  userName = 'there',
}: DailyMoodCheckInProps) {
  const { user } = useAuth();
  const [moodValue, setMoodValue] = useState(5);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-300));
  const [displayName, setDisplayName] = useState(userName);

  useEffect(() => {
    const fetchUserName = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        if (data?.username) {
          setDisplayName(data.username);
        }
      }
    };
    
    if (visible) {
      fetchUserName();
    }
  }, [visible, user]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(-300);
    }
  }, [visible]);

  const handleDismiss = async () => {
    await AsyncStorage.setItem('lastMoodCheckIn', new Date().toISOString());
    onDismiss();
  };

  const handleJournal = async () => {
    await AsyncStorage.setItem('lastMoodCheckIn', new Date().toISOString());
    await AsyncStorage.setItem('lastMoodValue', moodValue.toString());
    onJournal();
  };

  const getMoodFace = () => {
    const roundedMood = Math.round(moodValue) as keyof typeof MOOD_FACES;
    return MOOD_FACES[roundedMood] || '😊';
  };

  const getMoodLabel = () => {
    const roundedMood = Math.round(moodValue) as keyof typeof MOOD_LABELS;
    return MOOD_LABELS[roundedMood] || 'Okay';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleDismiss}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>

            <View style={styles.content}>
              <Text style={styles.greeting}>
                Hey, {displayName}. How are you this {getTimeOfDay()}?
              </Text>

              <Text style={styles.moodFace}>{getMoodFace()}</Text>

              <Text style={styles.moodLabel}>{getMoodLabel()}</Text>

              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  value={moodValue}
                  onValueChange={setMoodValue}
                  minimumTrackTintColor="#ffffff"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor="#ffffff"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>Struggling</Text>
                  <Text style={styles.sliderLabel}>Amazing</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.journalButton}
                onPress={handleJournal}
                activeOpacity={0.8}
              >
                <Text style={styles.journalButtonText}>Want to write about it?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleDismiss}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    overflow: 'hidden',
  },
  gradient: {
    padding: 32,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 30,
  },
  moodFace: {
    fontSize: 80,
    marginBottom: 16,
  },
  moodLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 32,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sliderContainer: {
    width: '100%',
    marginBottom: 32,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  journalButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    marginBottom: 12,
  },
  journalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7c3aed',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
});
