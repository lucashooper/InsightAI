import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { sf } from '../../utils/responsive';

interface PlaybookEntry {
  id: string;
  title: string;
  category: string;
  icon: string;
  steps?: string[];
}

const STORAGE_KEY = 'PINNED_PLAYBOOK_ENTRY';

export default function PlaybookQuickAccessCard({ 
  userId, 
  onNavigateToPlaybook 
}: { 
  userId: string;
  onNavigateToPlaybook: () => void;
}) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);
  const [pinnedEntry, setPinnedEntry] = useState<PlaybookEntry | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadPinnedEntry();
  }, [userId]);

  const loadPinnedEntry = async () => {
    try {
      const saved = await AsyncStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (saved) {
        setPinnedEntry(JSON.parse(saved));
      }
    } catch (error) {
      console.error('[PlaybookQuickAccess] Error loading pinned entry:', error);
    }
  };

  if (!pinnedEntry) {
    // Show CTA to pin a playbook entry
    return (
      <TouchableOpacity
        style={[styles.container, { 
          backgroundColor: dark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)',
          borderColor: dark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
        }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onNavigateToPlaybook();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.iconCircle}
            >
              <Ionicons name="book" size={16} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.colors.primaryText }]}>
                Quick Access Playbook
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.tertiaryText }]}>
                Pin an entry for easy access
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.tertiaryText} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { 
      backgroundColor: dark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)',
      borderColor: dark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
    }]}>
      {/* Header */}
      <TouchableOpacity 
        style={styles.header}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsExpanded(!isExpanded);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#3b82f6', '#2563eb']}
            style={styles.iconCircle}
          >
            <Ionicons name={pinnedEntry.icon as any || 'book'} size={16} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.primaryText }]}>
              {pinnedEntry.title}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.tertiaryText }]}>
              {pinnedEntry.category}
            </Text>
          </View>
        </View>
        <Ionicons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={theme.colors.tertiaryText} 
        />
      </TouchableOpacity>

      {/* Steps List */}
      {isExpanded && pinnedEntry.steps && (
        <View style={styles.stepsList}>
          {pinnedEntry.steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepNumber, {
                backgroundColor: dark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
              }]}>
                <Text style={[styles.stepNumberText, { color: '#3b82f6' }]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.stepText, { color: theme.colors.primaryText }]}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* View Full Entry Button */}
      {isExpanded && (
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onNavigateToPlaybook();
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewButtonText, { color: '#3b82f6' }]}>
            View full entry
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: sf(16),
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: sf(12),
    fontWeight: '500',
  },
  stepsList: {
    marginTop: 16,
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: sf(12),
    fontWeight: '700',
  },
  stepText: {
    fontSize: sf(14),
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
  },
  viewButtonText: {
    fontSize: sf(14),
    fontWeight: '600',
  },
});
