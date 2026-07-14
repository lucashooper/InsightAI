import React from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useAppLock } from '../contexts/AppLockContext';
import PageHeader from '../components/shared/PageHeader';
import { sf } from '../utils/responsive';
import { useLanguage } from '../contexts/LanguageContext';

export default function SecurityScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { isLockEnabled, isBiometricEnabled, isBiometricAvailable, enableLock, disableLock, toggleBiometric } = useAppLock();

  const handleToggleLock = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (value) {
      // Enable lock - prompt for PIN
      Alert.prompt(
        t('auxiliary.security.setPin'),
        t('auxiliary.security.choosePin'),
        [
          { text: t('auxiliary.common.cancel'), style: 'cancel' },
          {
            text: t('auxiliary.common.next'),
            onPress: (pin?: string) => {
              if (!pin || pin.length !== 4) {
                Alert.alert(t('auxiliary.security.invalidPin'), t('auxiliary.security.exactlyFourDigits'));
                return;
              }
              Alert.prompt(
                t('auxiliary.security.confirmPin'),
                t('auxiliary.security.reenterPin'),
                [
                  { text: t('auxiliary.common.cancel'), style: 'cancel' },
                  {
                    text: t('auxiliary.security.enableLock'),
                    onPress: async (confirmPin?: string) => {
                      if (confirmPin === pin) {
                        await enableLock(pin);
                        Alert.alert(t('auxiliary.security.lockEnabled'), t('auxiliary.security.lockEnabledMessage'));
                      } else {
                        Alert.alert(t('auxiliary.security.pinsMismatch'), t('auxiliary.security.pinsMismatchMessage'));
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
        t('auxiliary.security.disableLock'),
        t('auxiliary.security.enterCurrentPin'),
        async (text: string) => {
          if (text && text.length === 4) {
            const success = await disableLock(text);
            if (!success) {
              Alert.alert(t('auxiliary.security.incorrectPin'), t('auxiliary.security.incorrectPinMessage'));
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
      <PageHeader title={t('auxiliary.security.title')} onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
          {t('auxiliary.security.appLock')}
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
                  {t('auxiliary.security.appLock')}
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.secondaryText }]}>
                  {isLockEnabled ? t('auxiliary.security.requirePin') : t('auxiliary.security.noLock')}
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
                    {t('auxiliary.security.biometrics')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.colors.secondaryText }]}>
                    {t('auxiliary.security.biometricsDescription')}
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
