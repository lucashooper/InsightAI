import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isDarkTheme, useTheme } from '../../contexts/ThemeContext';
import { sf } from '../../utils/responsive';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  buttonLabel: string;
  onClose: () => void;
};

export default function GratitudeSavedOverlay({ visible, title, message, buttonLabel, onClose }: Props) {
  const { theme } = useTheme();
  const isDark = isDarkTheme(theme.name);
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.92);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [visible, opacity, scale]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
        )}
        <Animated.View style={[styles.cardWrap, { opacity, transform: [{ scale }] }]}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? 'rgba(28,28,36,0.96)' : 'rgba(255,255,255,0.96)',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(139,92,246,0.15)',
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🙏</Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.primaryText }]}>{title}</Text>
            <Text style={[styles.message, { color: theme.colors.secondaryText }]}>{message}</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={styles.buttonWrap}>
              <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.button}>
                <Text style={styles.buttonText}>{buttonLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 340,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(251,191,36,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: sf(22),
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: sf(15),
    lineHeight: sf(22),
    textAlign: 'center',
    marginBottom: 22,
  },
  buttonWrap: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: sf(16),
    fontWeight: '700',
  },
});
