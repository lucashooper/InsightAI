import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { isDarkTheme, useTheme } from '../../contexts/ThemeContext';
import { sf } from '../../utils/responsive';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  buttonLabel: string;
  onContinue: () => void;
};

export default function PromptSavedOverlay({
  visible,
  title,
  message,
  buttonLabel,
  onContinue,
}: Props) {
  const { theme } = useTheme();
  const isDark = isDarkTheme(theme.name);
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scale.setValue(0.9);
    opacity.setValue(0);
    checkScale.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]),
      Animated.spring(checkScale, { toValue: 1, tension: 70, friction: 6, useNativeDriver: true }),
    ]).start();
  }, [visible, opacity, scale, checkScale]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
      <View style={styles.backdrop}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={48} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5,5,8,0.82)' }]} />
        )}
        <LinearGradient
          colors={['rgba(139,92,246,0.12)', 'transparent']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Animated.View style={[styles.cardWrap, { opacity, transform: [{ scale }] }]}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? 'rgba(18,16,28,0.98)' : 'rgba(255,255,255,0.98)',
                borderColor: isDark ? 'rgba(139,92,246,0.28)' : 'rgba(139,92,246,0.18)',
              },
            ]}
          >
            <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}>
              <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.checkGradient}>
                <Ionicons name="checkmark" size={36} color="#fff" />
              </LinearGradient>
            </Animated.View>
            <Text style={[styles.title, { color: theme.colors.primaryText }]}>{title}</Text>
            <Text style={[styles.message, { color: theme.colors.secondaryText }]}>{message}</Text>
            <TouchableOpacity onPress={onContinue} activeOpacity={0.88} style={styles.buttonWrap}>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardWrap: {
    width: '100%',
  },
  card: {
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 16,
  },
  checkCircle: {
    marginBottom: 20,
  },
  checkGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: sf(24),
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: sf(15),
    lineHeight: sf(23),
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
  buttonWrap: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: sf(17),
    fontWeight: '700',
  },
});
