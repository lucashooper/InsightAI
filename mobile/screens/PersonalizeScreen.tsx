import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import PageHeader from '../components/shared/PageHeader';
import { sf } from '../utils/responsive';

export default function PersonalizeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [promptsEnabled, setPromptsEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const reminders = await AsyncStorage.getItem('REMINDERS_ENABLED');
    const prompts = await AsyncStorage.getItem('PROMPTS_ENABLED');
    setRemindersEnabled(reminders === 'true');
    setPromptsEnabled(prompts !== 'false');
  };

  const handleToggleReminders = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem('REMINDERS_ENABLED', value.toString());
    setRemindersEnabled(value);
  };

  const handleTogglePrompts = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem('PROMPTS_ENABLED', value.toString());
    setPromptsEnabled(value);
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <PageHeader title="Personalize" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
          Preferences
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
                  Daily Reminders
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.secondaryText }]}>
                  Get reminded to journal each day
                </Text>
              </View>
              <Switch
                value={remindersEnabled}
                onValueChange={handleToggleReminders}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

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
                  Journal Prompts
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.secondaryText }]}>
                  Show suggested prompts when journaling
                </Text>
              </View>
              <Switch
                value={promptsEnabled}
                onValueChange={handleTogglePrompts}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#fff"
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
