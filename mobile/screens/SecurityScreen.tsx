import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import PageHeader from '../components/shared/PageHeader';
import { sf } from '../utils/responsive';

export default function SecurityScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricSetting();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
  };

  const loadBiometricSetting = async () => {
    const enabled = await AsyncStorage.getItem('BIOMETRIC_LOCK_ENABLED');
    setBiometricEnabled(enabled === 'true');
  };

  const handleToggleBiometric = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!biometricAvailable) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
      return;
    }

    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric lock',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        await AsyncStorage.setItem('BIOMETRIC_LOCK_ENABLED', 'true');
        setBiometricEnabled(true);
      }
    } else {
      await AsyncStorage.setItem('BIOMETRIC_LOCK_ENABLED', 'false');
      setBiometricEnabled(false);
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <PageHeader title="Security" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
          App Lock
        </Text>

        <View style={styles.optionsList}>
          <View
            style={[
              styles.optionItem,
              { 
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.border,
              }
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: theme.colors.primaryText }]}>
                  Biometric Lock
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.secondaryText }]}>
                  {biometricAvailable ? 'Require Face ID or Touch ID to open app' : 'No lock set'}
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#fff"
                disabled={!biometricAvailable}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: sf(13),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  optionsList: {
    gap: 0,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTextContainer: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: sf(16),
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: sf(14),
  },
});
