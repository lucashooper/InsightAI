import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import PageHeader from '../components/shared/PageHeader';
import { sf } from '../utils/responsive';
import { useLanguage } from '../contexts/LanguageContext';

export default function AppearanceScreen({ navigation }: any) {
  const { theme, themeName, setTheme } = useTheme();
  const { t } = useLanguage();

  const themes = [
    { id: 'light', name: t('auxiliary.appearance.light'), description: t('auxiliary.appearance.lightDescription') },
    { id: 'dark', name: t('auxiliary.appearance.dark'), description: t('auxiliary.appearance.darkDescription') },
  ];

  const handleThemeSelect = (themeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(themeId as any);
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.colors.backgroundGradient as any}
        style={styles.backgroundGradient}
      />
      <PageHeader title={t('auxiliary.appearance.title')} onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
          {t('auxiliary.appearance.theme')}
        </Text>

        <View style={styles.optionsList}>
          {themes.map((themeOption) => (
            <TouchableOpacity
              key={themeOption.id}
              style={[
                styles.optionItem,
                { 
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => handleThemeSelect(themeOption.id)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: theme.colors.primaryText }]}>
                    {themeOption.name}
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.colors.secondaryText }]}>
                    {themeOption.description}
                  </Text>
                </View>
                {themeName === themeOption.id && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
  },
  optionTitle: {
    fontSize: sf(16),
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: sf(14),
  },
});
