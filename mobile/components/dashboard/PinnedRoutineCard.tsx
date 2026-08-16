import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, InteractionManager, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { sf } from '../../utils/responsive';
import StandardContainer from '../shared/StandardContainer';
import { emojiForProtocol, resolveProtocolTasks } from '../../utils/protocolEmoji';
import { protocolCompletionService } from '../../services/protocolCompletionService';
import ProtocolOptionsSheet from '../playbook/ProtocolOptionsSheet';
import { requestProtocolEdit } from '../../utils/protocolEditRequest';
import ProtocolCompleteButton from '../shared/ProtocolCompleteButton';
import { navigateToPlaybook } from '../../utils/navigateToPlaybook';

interface RoutineTask {
  id: string;
  label: string;
  completed: boolean;
}

interface PinnedProtocol {
  id: string;
  title: string;
  emoji: string;
  description?: string;
  tasks: string[];
}

const STORAGE_KEY = 'PINNED_ROUTINE_TASKS';
const LAST_RESET_KEY = 'PINNED_ROUTINE_LAST_RESET';
const PINNED_LOAD_STALE_MS = 60_000;

export default function PinnedRoutineCard({ userId }: { userId: string }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const dark = isDarkTheme(theme.name);
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [protocol, setProtocol] = useState<PinnedProtocol | null>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const lastLoadAtRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastLoadAtRef.current < PINNED_LOAD_STALE_MS) return;
      lastLoadAtRef.current = now;
      const handle = InteractionManager.runAfterInteractions(() => {
        loadPinnedProtocol();
      });
      return () => handle.cancel();
    }, [userId])
  );

  const loadPinnedProtocol = async () => {
    try {
      const pinnedId = await AsyncStorage.getItem(`PINNED_PROTOCOL_${userId}`);
      if (!pinnedId) {
        setProtocol(null);
        return;
      }

      const { data, error } = await supabase
        .from('actionable_insights')
        .select('*')
        .eq('id', pinnedId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        setProtocol(null);
        if (error) console.error('[PinnedRoutine] Error loading protocol:', error);
        await AsyncStorage.removeItem(`PINNED_PROTOCOL_${userId}`);
        return;
      }

      const resolvedTasks = resolveProtocolTasks(data.tasks, data.description, data.title);

      setProtocol({
        id: data.id,
        title: data.title,
        emoji: emojiForProtocol(data.title, data.category, data.emoji),
        description: data.description,
        tasks: resolvedTasks,
      });

      const todayDone = await protocolCompletionService.getTodayCompletions([data.id]);
      setCompletedToday(todayDone.includes(data.id));
      await loadTasks(data.id, resolvedTasks);
    } catch (error) {
      console.error('[PinnedRoutine] Error loading pinned protocol:', error);
    }
  };

  const loadTasks = async (protocolId: string, protocolTasks: string[]) => {
    try {
      const lastReset = await AsyncStorage.getItem(`${LAST_RESET_KEY}_${userId}`);
      const today = new Date().toDateString();
      const defaultTasks: RoutineTask[] = protocolTasks.map((task, index) => ({
        id: `${protocolId}_${index}`,
        label: task,
        completed: false,
      }));

      if (lastReset !== today) {
        await AsyncStorage.setItem(`${LAST_RESET_KEY}_${userId}`, today);
        await AsyncStorage.setItem(`${STORAGE_KEY}_${protocolId}`, JSON.stringify(defaultTasks));
        setTasks(defaultTasks);
      } else {
        const saved = await AsyncStorage.getItem(`${STORAGE_KEY}_${protocolId}`);
        setTasks(saved ? JSON.parse(saved) : defaultTasks);
      }
    } catch (error) {
      console.error('[PinnedRoutine] Error loading tasks:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!protocol) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
    setTasks(updated);
    try {
      await AsyncStorage.setItem(`${STORAGE_KEY}_${protocol.id}`, JSON.stringify(updated));
    } catch (error) {
      console.error('[PinnedRoutine] Error saving tasks:', error);
    }
  };

  const toggleProtocolComplete = async () => {
    if (!protocol) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isNowCompleted = await protocolCompletionService.toggleCompletion(protocol.id);
    setCompletedToday(isNowCompleted);
  };

  const handleUnpin = async () => {
    await AsyncStorage.removeItem(`PINNED_PROTOCOL_${userId}`);
    setProtocol(null);
  };

  const handleDelete = async () => {
    if (!protocol || !user) return;
    await supabase.from('actionable_insights').delete().eq('id', protocol.id).eq('user_id', user.id);
    await handleUnpin();
    await protocolCompletionService.pruneCompletions([]);
  };

  const handleEdit = async () => {
    if (!protocol) return;
    await requestProtocolEdit(protocol.id);
    navigateToPlaybook(navigation);
  };

  if (!protocol) return null;

  const completedCount = tasks.filter((task) => task.completed).length;
  const summaryText =    tasks.length > 0
      ? t('components.routine.complete', { completed: completedCount, total: tasks.length })
      : protocol.description?.trim() || t('components.routine.noTasks');

  return (
    <>
      <Pressable
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowOptions(true);
        }}
        delayLongPress={400}
      >
        <StandardContainer
          style={[styles.container, {
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.border,
          }]}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerLeft}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsExpanded(!isExpanded);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: dark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]}>
                <Text style={{ fontSize: 18 }}>{protocol.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: theme.colors.primaryText }]}>
                  {protocol.title}
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.tertiaryText }]} numberOfLines={2}>
                  {summaryText}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <ProtocolCompleteButton
                completed={completedToday}
                onPress={toggleProtocolComplete}
                size="sm"
              />
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsExpanded(!isExpanded);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.colors.tertiaryText}
                />
              </TouchableOpacity>
            </View>
          </View>

          {isExpanded && tasks.length > 0 && (
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
                    },
                  ]}>
                    {task.completed ? (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    ) : null}
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
      </Pressable>

      <ProtocolOptionsSheet
        visible={showOptions}
        title={t('auxiliary.playbook.strategyOptions')}
        subtitle={protocol.title}
        onDismiss={() => setShowOptions(false)}
        actions={[
          {
            label: t('auxiliary.common.edit'),
            icon: 'create-outline',
            iconColor: '#A855F7',
            onPress: handleEdit,
          },
          {
            label: t('auxiliary.playbook.unpinFromHome'),
            icon: 'home-outline',
            iconColor: '#818CF8',
            onPress: handleUnpin,
          },
          {
            label: t('auxiliary.playbook.reminderTitle'),
            icon: 'notifications-outline',
            iconColor: '#38BDF8',
            onPress: handleEdit,
          },
          {
            label: t('auxiliary.playbook.deleteStrategy'),
            icon: 'trash-outline',
            iconColor: '#EF4444',
            variant: 'destructive',
            onPress: handleDelete,
          },
        ]}
      />
    </>
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    lineHeight: sf(17),
  },
  taskList: {
    marginTop: 12,
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
