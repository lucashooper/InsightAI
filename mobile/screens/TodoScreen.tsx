import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { isTablet, sf } from '../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../contexts/LanguageContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Types ─────────────────────────────────────────────────────
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

// ── Suggested Tasks ───────────────────────────────────────────
const SUGGESTED_TASKS = [
  { key: 'journal', priority: 'medium' as const },
  { key: 'walk', priority: 'low' as const },
  { key: 'breathe', priority: 'low' as const },
  { key: 'water', priority: 'low' as const },
  { key: 'kindMessage', priority: 'medium' as const },
  { key: 'gratitude', priority: 'medium' as const },
  { key: 'stretch', priority: 'low' as const },
  { key: 'phoneAway', priority: 'high' as const },
  { key: 'read', priority: 'medium' as const },
  { key: 'clean', priority: 'low' as const },
  { key: 'cook', priority: 'medium' as const },
  { key: 'song', priority: 'low' as const },
  { key: 'intention', priority: 'medium' as const },
  { key: 'courage', priority: 'high' as const },
  { key: 'bed', priority: 'high' as const },
];

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

// ── Calendar Strip ────────────────────────────────────────────
function CalendarStrip({ selectedDate, onSelectDate, dark, theme }: any) {
  const { formatDate } = useLanguage();
  const today = new Date();
  const dates: Date[] = [];
  
  // Show 7 days centered on today
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  return (
    <View style={styles.calendarStrip}>
      {dates.map((date, index) => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, today);

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.calendarDay,
              isSelected && styles.calendarDaySelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectDate(date);
            }}
          >
            <Text
              style={[
                styles.calendarDayName,
                { color: isSelected ? '#fff' : theme.colors.secondaryText },
              ]}
            >
              {formatDate(date, { weekday: 'short' })}
            </Text>
            <View
              style={[
                styles.calendarDayNumber,
                isSelected && { backgroundColor: '#10b981' },
                isToday && !isSelected && {
                  borderWidth: 2,
                  borderColor: '#8b5cf6',
                },
              ]}
            >
              <Text
                style={[
                  styles.calendarDayNumberText,
                  {
                    color: isSelected
                      ? '#fff'
                      : theme.colors.primaryText,
                  },
                ]}
              >
                {date.getDate()}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Main To-Do Screen ─────────────────────────────────────────
export default function TodoScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t, formatDate } = useLanguage();
  const dark = isDarkTheme(theme.name);
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [showInput, setShowInput] = useState(false);

  const STORAGE_KEY = `TODOS_${user?.id || 'guest'}`;

  // Get date key for storage
  const getDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  // Load todos for selected date
  useEffect(() => {
    loadTodos();
  }, [selectedDate]);

  const loadTodos = async () => {
    try {
      const dateKey = getDateKey(selectedDate);
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_${dateKey}`);
      if (stored) {
        setTodos(JSON.parse(stored));
      } else {
        setTodos([]);
      }
    } catch (e) {
      console.error('[Todo] Error loading todos:', e);
    }
  };

  const saveTodos = async (updatedTodos: TodoItem[]) => {
    try {
      const dateKey = getDateKey(selectedDate);
      await AsyncStorage.setItem(`${STORAGE_KEY}_${dateKey}`, JSON.stringify(updatedTodos));
    } catch (e) {
      console.error('[Todo] Error saving todos:', e);
    }
  };

  const addTask = (text: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (!text.trim()) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      priority,
    };

    const updated = [...todos, newTodo];
    setTodos(updated);
    saveTodos(updated);
    setNewTaskText('');
    setShowInput(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleTodo = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updated = todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTodos(updated);
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const updated = todos.filter(t => t.id !== id);
    setTodos(updated);
    saveTodos(updated);
  };

  const addSuggestedTask = () => {
    // Pick a random suggestion not already in the list
    const existingTexts = todos.map(item => item.text);
    const available = SUGGESTED_TASKS.filter(s => !existingTexts.includes(t(`auxiliary.todo.suggestions.${s.key}`)));
    if (available.length === 0) {
      Alert.alert(t('auxiliary.todo.allCaughtUp'), t('auxiliary.todo.allCaughtUpMessage'));
      return;
    }
    const random = available[Math.floor(Math.random() * available.length)];
    addTask(t(`auxiliary.todo.suggestions.${random.key}`), random.priority);
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  // Format selected date
  const dateLabel = formatDate(selectedDate, { month: 'short', day: 'numeric' });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primaryText} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.primaryText }]}>{t('auxiliary.todo.title')}</Text>
        </View>

        {/* Date Label */}
        <Text style={[styles.dateLabel, { color: theme.colors.primaryText }]}>
          {dateLabel}
        </Text>

        {/* Calendar Strip */}
        <CalendarStrip
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          dark={dark}
          theme={theme}
        />

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={[styles.todoSectionTitle, { color: theme.colors.primaryText }]}>
            {t('auxiliary.todo.title')}
          </Text>
          <Text style={[styles.progressText, { color: theme.colors.secondaryText }]}>
            {t('auxiliary.todo.completed', { completed: completedCount, total: totalCount })}
          </Text>
        </View>

        {/* Todo Items */}
        {todos.length === 0 && !showInput ? (
          <View style={[styles.emptyState, {
            backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          }]}>
            <Ionicons name="checkbox-outline" size={40} color={theme.colors.secondaryText} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.primaryText }]}>
              {t('auxiliary.todo.emptyTitle')}
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: theme.colors.secondaryText }]}>
              {t('auxiliary.todo.emptyMessage')}
            </Text>
          </View>
        ) : (
          todos.map(todo => (
            <TouchableOpacity
              key={todo.id}
              style={[
                styles.todoItem,
                {
                  backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                },
              ]}
              onPress={() => toggleTodo(todo.id)}
              onLongPress={() => {
                Alert.alert(t('auxiliary.todo.deleteTask'), t('auxiliary.todo.deleteConfirm'), [
                  { text: t('auxiliary.common.cancel'), style: 'cancel' },
                  { text: t('auxiliary.common.delete'), style: 'destructive', onPress: () => deleteTodo(todo.id) },
                ]);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.todoPriorityBar, { backgroundColor: PRIORITY_COLORS[todo.priority] }]} />
              <View style={styles.todoContent}>
                <Text
                  style={[
                    styles.todoText,
                    { color: theme.colors.primaryText },
                    todo.completed && styles.todoTextCompleted,
                    todo.completed && { color: theme.colors.secondaryText },
                  ]}
                >
                  {todo.text}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleTodo(todo.id)}
                style={[
                  styles.todoCheckbox,
                  todo.completed && styles.todoCheckboxCompleted,
                ]}
              >
                {todo.completed && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

        {/* New Task Input */}
        {showInput && (
          <View style={[styles.newTaskContainer, {
            backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
            borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          }]}>
            <TextInput
              style={[styles.newTaskInput, { color: theme.colors.primaryText }]}
              placeholder={t('auxiliary.todo.placeholder')}
              placeholderTextColor={theme.colors.secondaryText}
              value={newTaskText}
              onChangeText={setNewTaskText}
              autoFocus
              onSubmitEditing={() => addTask(newTaskText)}
              returnKeyType="done"
            />
            <View style={styles.newTaskActions}>
              <TouchableOpacity
                onPress={() => {
                  setShowInput(false);
                  setNewTaskText('');
                }}
                style={styles.newTaskCancel}
              >
                <Text style={[styles.newTaskCancelText, { color: theme.colors.secondaryText }]}>{t('auxiliary.common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => addTask(newTaskText)}
                style={[styles.newTaskAdd, { opacity: newTaskText.trim() ? 1 : 0.4 }]}
              >
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed']}
                  style={styles.newTaskAddGradient}
                >
                  <Text style={styles.newTaskAddText}>{t('auxiliary.common.add')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, {
              backgroundColor: dark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
            }]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setShowInput(true);
            }}
          >
            <Ionicons name="add-circle" size={20} color="#8b5cf6" />
            <Text style={[styles.actionButtonText, { color: '#8b5cf6' }]}>{t('auxiliary.todo.addTask')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, {
              backgroundColor: dark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
            }]}
            onPress={addSuggestedTask}
          >
            <Ionicons name="sparkles" size={20} color="#10b981" />
            <Text style={[styles.actionButtonText, { color: '#10b981' }]}>{t('auxiliary.todo.suggestTask')}</Text>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={[styles.tipCard, {
          backgroundColor: dark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)',
          borderColor: dark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
        }]}>
          <Ionicons name="bulb" size={20} color="#8b5cf6" style={{ marginRight: 12 }} />
          <Text style={[styles.tipText, { color: theme.colors.secondaryText }]}>
            {t('auxiliary.todo.tip')}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isTablet ? 48 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: sf(28),
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  dateLabel: {
    fontSize: sf(16),
    fontWeight: '600',
    marginBottom: 16,
  },

  // Calendar Strip
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  calendarDay: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  calendarDaySelected: {},
  calendarDayName: {
    fontSize: sf(12),
    fontWeight: '500',
  },
  calendarDayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayNumberText: {
    fontSize: sf(15),
    fontWeight: '600',
  },

  // Progress
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todoSectionTitle: {
    fontSize: sf(18),
    fontWeight: '700',
  },
  progressText: {
    fontSize: sf(13),
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: sf(17),
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: sf(14),
    textAlign: 'center',
  },

  // Todo Items
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 56,
  },
  todoPriorityBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  todoContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  todoText: {
    fontSize: sf(15),
    fontWeight: '500',
    lineHeight: sf(20),
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  todoCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(139,92,246,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  todoCheckboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },

  // New Task
  newTaskContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  newTaskInput: {
    fontSize: sf(15),
    fontWeight: '500',
    marginBottom: 12,
    minHeight: 40,
  },
  newTaskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  newTaskCancel: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  newTaskCancelText: {
    fontSize: sf(14),
    fontWeight: '500',
  },
  newTaskAdd: {},
  newTaskAddGradient: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  newTaskAddText: {
    color: '#fff',
    fontSize: sf(14),
    fontWeight: '600',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  actionButtonText: {
    fontSize: sf(14),
    fontWeight: '600',
  },

  // Tip
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    fontSize: sf(13),
    lineHeight: sf(18),
  },
});
