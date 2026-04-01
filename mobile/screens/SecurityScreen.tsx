import React from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useAppLock } from '../contexts/AppLockContext';
import PageHeader from '../components/shared/PageHeader';
import { sf } from '../utils/responsive';

export default function SecurityScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { isLockEnabled, isBiometricEnabled, isBiometricAvailable, enableLock, disableLock, toggleBiometric } = useAppLock();

  const handleToggleLock = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (value) {
      // Enable lock - prompt for PIN
      Alert.prompt(
        'Set App Lock PIN',
        'Choose a 4-digit PIN to lock your journal.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Next',
            onPress: (pin?: string) => {
              if (!pin || pin.length !== 4) {
                Alert.alert('Invalid PIN', 'Please enter exactly 4 digits.');
                return;
              }
              Alert.prompt(
                'Confirm PIN',
                'Re-enter your 4-digit PIN to confirm.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Enable Lock',
                    onPress: async (confirmPin?: string) => {
                      if (confirmPin === pin) {
                        await enableLock(pin);
                        Alert.alert('App Lock Enabled', 'Your journal is now protected with a PIN.');
                      } else {
                        Alert.alert('PINs Don\'t Match', 'The PINs you entered don\'t match. Please try again.');
                      }
                    },
                  },
                ],
                'secure-text',
                '',
                'number-pad'
              );
            },
          },
        ],
        'secure-text',
        '',
        'number-pad'
      );
    } else {
      // Disable lock - verify PIN first
      Alert.prompt(
        'Disable App Lock',
        'Enter your current PIN to disable the lock.',
        async (text: string) => {
          if (text && text.length === 4) {
            const success = await disableLock(text);
            if (!success) {
              Alert.alert('Incorrect PIN', 'The PIN you entered is incorrect.');
            }
          }
        },
        'secure-text',
        '',
        'number-pad'
      );
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleBiometric(value);
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
                  App Lock
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.secondaryText }]}>
                  {isLockEnabled ? 'Require PIN to open app' : 'No lock set'}
                </Text>
              </View>
              <Switch
                value={isLockEnabled}
                onValueChange={handleToggleLock}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {isLockEnabled && isBiometricAvailable && (
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
                    Face ID / Touch ID
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.colors.secondaryText }]}>
                    Unlock with biometrics instead of PIN
                  </Text>
                </View>
                <Switch
                  value={isBiometricEnabled}
                  onValueChange={handleToggleBiometric}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          )}
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
