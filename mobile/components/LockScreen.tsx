import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppLock } from '../contexts/AppLockContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import AppBackdrop from './ui/AppBackdrop';
import CloudMascot from './companion/CloudMascot';
import { INK, SURFACE } from '../constants/typography';

export default function LockScreen() {
  const { unlock, unlockWithBiometric, isBiometricEnabled, isBiometricAvailable, forgotPin } = useAppLock();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  const PIN_LENGTH = 4;

  const colors = useMemo(
    () => ({
      title: dark ? '#FFFFFF' : INK.primary,
      subtitle: dark ? 'rgba(255,255,255,0.5)' : INK.secondary,
      keyBg: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.92)',
      keyBorder: dark ? 'rgba(255,255,255,0.1)' : SURFACE.lightBorder,
      keyText: dark ? '#FFFFFF' : INK.primary,
      deleteIcon: dark ? 'rgba(255,255,255,0.7)' : INK.secondary,
      dotBorder: dark ? 'rgba(255,255,255,0.3)' : 'rgba(17,17,21,0.2)',
      dotFilled: '#8b5cf6',
      forgot: dark ? 'rgba(255,255,255,0.4)' : INK.tertiary,
    }),
    [dark],
  );

  useEffect(() => {
    Keyboard.dismiss();

    if (isBiometricEnabled && isBiometricAvailable) {
      setTimeout(() => {
        unlockWithBiometric();
      }, 300);
    }
  }, []);

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
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();

        setTimeout(() => {
          setPin('');
          dotAnims.forEach((a) => a.setValue(0));
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
            { borderColor: colors.dotBorder },
            pin.length > i && { backgroundColor: colors.dotFilled, borderColor: colors.dotFilled },
            {
              transform: [
                {
                  scale: dotAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
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
                    style={[styles.key, { backgroundColor: colors.keyBg, borderColor: colors.keyBorder }]}
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
                    style={[styles.key, { backgroundColor: colors.keyBg, borderColor: colors.keyBorder }]}
                    onPress={() => handleKeyPress('delete')}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="backspace-outline" size={28} color={colors.deleteIcon} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={keyIndex}
                  style={[styles.key, { backgroundColor: colors.keyBg, borderColor: colors.keyBorder }]}
                  onPress={() => handleKeyPress(key)}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.keyText, { color: colors.keyText }]}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      {!dark ? <AppBackdrop /> : null}
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <View style={styles.content}>
        <View style={styles.mascotWrap}>
          <CloudMascot size={120} tint="#B8D4FF" valence={0.72} shadow animated />
        </View>

        <Text style={[styles.title, { color: colors.title }]}>{t('components.lock.welcome')}</Text>
        <Text style={[styles.subtitle, { color: colors.subtitle }]}>{t('components.lock.enterPin')}</Text>

        {renderDots()}

        {error ? <Text style={styles.errorText}>{error}</Text> : <View style={styles.errorPlaceholder} />}

        {renderKeypad()}

        {isBiometricEnabled && isBiometricAvailable && (
          <TouchableOpacity style={styles.biometricHint} onPress={() => handleKeyPress('biometric')}>
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
              ],
            );
          }}
        >
          <Text style={[styles.forgotPinText, { color: colors.forgot }]}>{t('components.lock.forgotTitle')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  mascotWrap: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
    backgroundColor: 'transparent',
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  keyEmpty: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
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
    fontWeight: '500',
  },
});
