import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppLock } from '../contexts/AppLockContext';
import { useLanguage } from '../contexts/LanguageContext';

const insightLogo = require('../public/Insight-Logo-nobg.webp');
const { width } = Dimensions.get('window');

export default function LockScreen() {
  const { unlock, unlockWithBiometric, isBiometricEnabled, isBiometricAvailable, forgotPin } = useAppLock();
  const { t } = useLanguage();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  const PIN_LENGTH = 4;

  // Dismiss keyboard and try biometric on mount
  useEffect(() => {
    // CRITICAL: Dismiss any open keyboard when PIN screen appears
    Keyboard.dismiss();
    
    if (isBiometricEnabled && isBiometricAvailable) {
      setTimeout(() => {
        unlockWithBiometric();
      }, 300);
    }
  }, []);

  // Animate dots when pin changes
  useEffect(() => {
    if (pin.length > 0 && pin.length <= PIN_LENGTH) {
      Animated.spring(dotAnims[pin.length - 1], {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [pin]);

  const handleKeyPress = async (key: string) => {
    if (key === 'delete') {
      if (pin.length > 0) {
        const removedIndex = pin.length - 1;
        dotAnims[removedIndex].setValue(0);
        setPin(pin.slice(0, -1));
        setError('');
      }
      return;
    }

    if (key === 'biometric') {
      const success = await unlockWithBiometric();
      if (!success) {
        setError(t('components.lock.biometricFailed'));
      }
      return;
    }

    if (pin.length >= PIN_LENGTH) return;

    const newPin = pin + key;
    setPin(newPin);

    if (newPin.length === PIN_LENGTH) {
      const success = await unlock(newPin);
      if (!success) {
        setError(t('components.lock.incorrectPin'));
        // Shake animation
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();

        // Reset after shake
        setTimeout(() => {
          setPin('');
          dotAnims.forEach(a => a.setValue(0));
        }, 300);
      }
    }
  };

  const renderDots = () => (
    <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
      {[0, 1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            pin.length > i && styles.dotFilled,
            {
              transform: [{
                scale: dotAnims[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                }),
              }],
            },
          ]}
        />
      ))}
    </Animated.View>
  );

  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      [isBiometricEnabled && isBiometricAvailable ? 'biometric' : '', '0', 'delete'],
    ];

    return (
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, keyIndex) => {
              if (key === '') {
                return <View key={keyIndex} style={styles.keyEmpty} />;
              }

              if (key === 'biometric') {
                return (
                  <TouchableOpacity
                    key={keyIndex}
                    style={styles.key}
                    onPress={() => handleKeyPress('biometric')}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="finger-print" size={28} color="#8b5cf6" />
                  </TouchableOpacity>
                );
              }

              if (key === 'delete') {
                return (
                  <TouchableOpacity
                    key={keyIndex}
                    style={styles.key}
                    onPress={() => handleKeyPress('delete')}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="backspace-outline" size={28} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={keyIndex}
                  style={styles.key}
                  onPress={() => handleKeyPress(key)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        <Image source={insightLogo} style={styles.logo} resizeMode="contain" />
        
        <Text style={styles.title}>{t('components.lock.welcome')}</Text>
        <Text style={styles.subtitle}>{t('components.lock.enterPin')}</Text>

        {renderDots()}

        {error ? <Text style={styles.errorText}>{error}</Text> : <View style={styles.errorPlaceholder} />}

        {renderKeypad()}

        {isBiometricEnabled && isBiometricAvailable && (
          <TouchableOpacity
            style={styles.biometricHint}
            onPress={() => handleKeyPress('biometric')}
          >
            <Text style={styles.biometricHintText}>{t('components.lock.useFaceId')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.forgotPin}
          onPress={() => {
            Alert.alert(
              t('components.lock.forgotTitle'),
              t('components.lock.forgotMessage'),
              [
                { text: t('components.lock.cancel'), style: 'cancel' },
                {
                  text: t('components.lock.sendEmail'),
                  onPress: async () => {
                    const success = await forgotPin();
                    if (success) {
                      Alert.alert(t('components.lock.resetTitle'), t('components.lock.resetMessage'));
                    } else {
                      Alert.alert(t('components.lock.errorTitle'), t('components.lock.errorMessage'));
                    }
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.forgotPinText}>{t('components.lock.forgotTitle')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    height: 20,
    marginBottom: 16,
  },
  errorPlaceholder: {
    height: 20,
    marginBottom: 16,
  },
  keypad: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  keyEmpty: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#fff',
  },
  biometricHint: {
    marginTop: 24,
    paddingVertical: 8,
  },
  biometricHintText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  forgotPin: {
    marginTop: 20,
    paddingVertical: 8,
  },
  forgotPinText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
});
