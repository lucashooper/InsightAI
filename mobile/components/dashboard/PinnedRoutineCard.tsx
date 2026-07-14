import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { sf } from '../../utils/responsive';
import StandardContainer from '../shared/StandardContainer';

interface RoutineTask {
  id: string;
  label: string;
  completed: boolean;
}

interface PinnedProtocol {
  id: string;
  title: string;
  emoji: string;
  tasks?: string[];
}

const STORAGE_KEY = 'PINNED_ROUTINE_TASKS';
const LAST_RESET_KEY = 'PINNED_ROUTINE_LAST_RESET';

export default function PinnedRoutineCard({ userId }: { userId: string }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const dark = isDarkTheme(theme.name);
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [protocol, setProtocol] = useState<PinnedProtocol | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadPinnedProtocol();
    }, [userId])
  );

  const loadPinnedProtocol = async () => {
    try {
      console.log('[PinnedRoutine] Loading pinned protocol for user:', userId);
      // Get pinned protocol ID
      const pinnedId = await AsyncStorage.getItem(`PINNED_PROTOCOL_${userId}`);
      console.log('[PinnedRoutine] Pinned protocol ID:', pinnedId);
      
      if (!pinnedId) {
        console.log('[PinnedRoutine] No pinned protocol found');
        setProtocol(null);
        return;
      }

      // Load protocol from Supabase
      const { data, error } = await supabase
        .from('actionable_insights')
        .select('*')
        .eq('id', pinnedId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[PinnedRoutine] Error loading protocol:', error);
        setProtocol(null);
        // Clear invalid pinned ID
        await AsyncStorage.removeItem(`PINNED_PROTOCOL_${userId}`);
        return;
      }

      if (!data) {
        console.log('[PinnedRoutine] Protocol not found, clearing pinned ID');
        setProtocol(null);
        await AsyncStorage.removeItem(`PINNED_PROTOCOL_${userId}`);
        return;
      }

      console.log('[PinnedRoutine] Protocol loaded:', data.title, 'Tasks:', data.tasks);

      setProtocol({
        id: data.id,
        title: data.title,
        emoji: data.emoji || '✨',
        tasks: data.tasks || [],
      });

      // Load task completion state
      await loadTasks(data.id, data.tasks || []);
    } catch (error) {
      console.error('[PinnedRoutine] Error loading pinned protocol:', error);
    }
  };

  const loadTasks = async (protocolId: string, protocolTasks: string[]) => {
    try {
      // Check if we need to reset (new day)
      const lastReset = await AsyncStorage.getItem(`${LAST_RESET_KEY}_${userId}`);
      const today = new Date().toDateString();
      
      // Convert protocol tasks to RoutineTask format
      const defaultTasks: RoutineTask[] = protocolTasks.map((task, index) => ({
        id: `${protocolId}_${index}`,
        label: task,
        completed: false,
      }));
      
      if (lastReset !== today) {
        // New day - reset all tasks
        await AsyncStorage.setItem(`${LAST_RESET_KEY}_${userId}`, today);
        await AsyncStorage.setItem(`${STORAGE_KEY}_${protocolId}`, JSON.stringify(defaultTasks));
        setTasks(defaultTasks);
      } else {
        // Load saved state
        const saved = await AsyncStorage.getItem(`${STORAGE_KEY}_${protocolId}`);
        if (saved) {
          setTasks(JSON.parse(saved));
        } else {
          setTasks(defaultTasks);
        }
      }
    } catch (error) {
      console.error('[PinnedRoutine] Error loading tasks:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!protocol) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    
    try {
      await AsyncStorage.setItem(`${STORAGE_KEY}_${protocol.id}`, JSON.stringify(updated));
    } catch (error) {
      console.error('[PinnedRoutine] Error saving tasks:', error);
    }
  };

  // Don't show card if no protocol is pinned
  if (!protocol) {
    return null;
  }
  
  // If protocol has no tasks, show a message
  if (tasks.length === 0) {
    return (
      <StandardContainer style={[styles.container, { 
        backgroundColor: theme.colors.cardBackground,
        borderColor: theme.colors.border,
      }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconCircle, { backgroundColor: dark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]}>
              <Text style={{ fontSize: 18 }}>{protocol.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.colors.primaryText }]}>
                {protocol.title}
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.tertiaryText }]}>
                {t('components.routine.noTasks')}
              </Text>
            </View>
          </View>
        </View>
      </StandardContainer>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <StandardContainer style={[styles.container, { 
      backgroundColor: theme.colors.cardBackground,
      borderColor: theme.colors.border,
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
          <View style={[styles.iconCircle, { backgroundColor: dark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]}>
            <Text style={{ fontSize: 18 }}>{protocol.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.primaryText }]}>
              {protocol.title}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.tertiaryText }]}>
              {t('components.routine.complete', { completed: completedCount, total: tasks.length })}
            </Text>
          </View>
        </View>
        <Ionicons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={theme.colors.tertiaryText} 
        />
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={[styles.progressTrack, { 
        backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' 
      }]}>
        <LinearGradient
          colors={['#10b981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress}%` }]}
        />
      </View>

      {/* Task List */}
      {isExpanded && (
        <View style={styles.taskList}>
          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskRow}
              onPress={() => toggleTask(task.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                {
                  backgroundColor: task.completed 
                    ? '#10b981' 
                    : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
                  borderColor: task.completed 
                    ? '#10b981' 
                    : (dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'),
                }
              ]}>
                {task.completed && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text style={[
                styles.taskLabel,
                { color: theme.colors.primaryText },
                task.completed && styles.taskCompleted,
              ]}>
                {task.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </StandardContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  taskList: {
    gap: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskLabel: {
    fontSize: sf(14),
    fontWeight: '500',
    flex: 1,
  },
  taskCompleted: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
});
