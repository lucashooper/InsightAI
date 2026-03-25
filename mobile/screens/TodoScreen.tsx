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
  { text: 'Write in your journal for 5 minutes', priority: 'medium' as const },
  { text: 'Take a 10-minute walk outside', priority: 'low' as const },
  { text: 'Practice deep breathing for 2 minutes', priority: 'low' as const },
  { text: 'Drink a full glass of water', priority: 'low' as const },
  { text: 'Send a kind message to someone', priority: 'medium' as const },
  { text: 'List 3 things you\'re grateful for', priority: 'medium' as const },
  { text: 'Stretch for 5 minutes', priority: 'low' as const },
  { text: 'Put your phone away for 30 minutes', priority: 'high' as const },
  { text: 'Read for 15 minutes', priority: 'medium' as const },
  { text: 'Clean one small area of your space', priority: 'low' as const },
  { text: 'Cook a healthy meal', priority: 'medium' as const },
  { text: 'Listen to your favorite song mindfully', priority: 'low' as const },
  { text: 'Set an intention for tomorrow', priority: 'medium' as const },
  { text: 'Do one thing that scares you (just a little)', priority: 'high' as const },
  { text: 'Get to bed before 11pm', priority: 'high' as const },
];

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

// ── Calendar Strip ────────────────────────────────────────────
function CalendarStrip({ selectedDate, onSelectDate, dark, theme }: any) {
  const today = new Date();
  const dates: Date[] = [];
  
  // Show 7 days centered on today
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
              {dayNames[date.getDay()]}
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
    const existingTexts = todos.map(t => t.text);
    const available = SUGGESTED_TASKS.filter(s => !existingTexts.includes(s.text));
    if (available.length === 0) {
      Alert.alert('All caught up!', 'You\'ve added all suggested tasks. Try creating your own!');
      return;
    }
    const random = available[Math.floor(Math.random() * available.length)];
    addTask(random.text, random.priority);
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  // Format selected date
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateLabel = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}`;

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
          <Text style={[styles.headerTitle, { color: theme.colors.primaryText }]}>To-do</Text>
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
            To-do
          </Text>
          <Text style={[styles.progressText, { color: theme.colors.secondaryText }]}>
            {completedCount} of {totalCount} completed
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
              No tasks yet
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: theme.colors.secondaryText }]}>
              Add your first task or get a suggestion
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
                Alert.alert('Delete Task', 'Remove this task?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(todo.id) },
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
              placeholder="What do you want to do?"
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
                <Text style={[styles.newTaskCancelText, { color: theme.colors.secondaryText }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => addTask(newTaskText)}
                style={[styles.newTaskAdd, { opacity: newTaskText.trim() ? 1 : 0.4 }]}
              >
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed']}
                  style={styles.newTaskAddGradient}
                >
                  <Text style={styles.newTaskAddText}>Add</Text>
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
            <Text style={[styles.actionButtonText, { color: '#8b5cf6' }]}>Add task</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, {
              backgroundColor: dark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
            }]}
            onPress={addSuggestedTask}
          >
            <Ionicons name="sparkles" size={20} color="#10b981" />
            <Text style={[styles.actionButtonText, { color: '#10b981' }]}>Suggest task</Text>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={[styles.tipCard, {
          backgroundColor: dark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)',
          borderColor: dark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
        }]}>
          <Ionicons name="bulb" size={20} color="#8b5cf6" style={{ marginRight: 12 }} />
          <Text style={[styles.tipText, { color: theme.colors.secondaryText }]}>
            Long press a task to delete it. Tasks are saved per day — check back tomorrow for a fresh start!
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
