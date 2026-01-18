import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { protocolCompletionService } from '../services/protocolCompletionService';

type TabType = 'protocols' | 'strategies';

interface Strategy {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  emoji: string;
  status: 'suggested' | 'active' | 'completed';
  source?: string;
}

export default function PlaybookScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('protocols');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    title: '',
    description: '',
    category: 'general',
    difficulty: 'moderate',
    emoji: '✨'
  });
  const [protocolProgress, setProtocolProgress] = useState({
    completed: 0,
    total: 1,
    percentage: 0
  });
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [protocolStats, setProtocolStats] = useState<Record<string, { currentStreak: number; longestStreak: number }>>({});

  useEffect(() => {
    loadStrategies();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadStrategies();
    }, [user])
  );

  const loadStrategies = async () => {
    if (!user) return;

    try {
      // Load from Supabase
      const { data, error } = await supabase
        .from('actionable_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Mobile Playbook] Error loading strategies:', error);
        return;
      }

      console.log('[Mobile Playbook] strategies loaded from Supabase', data);
      setStrategies(data || []);
      
      // Load completion data
      await loadCompletionData(data || []);
    } catch (error) {
      console.error('Error loading strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompletionData = async (strategies: Strategy[]) => {
    // Get today's completions
    const todayCompletions = await protocolCompletionService.getTodayCompletions();
    setCompletedToday(todayCompletions);
    
    // Get stats for each active protocol
    const activeProtocols = strategies.filter(s => s.status === 'active');
    const stats: Record<string, { currentStreak: number; longestStreak: number }> = {};
    
    for (const protocol of activeProtocols) {
      const protocolStats = await protocolCompletionService.getStats(protocol.id);
      stats[protocol.id] = {
        currentStreak: protocolStats.currentStreak,
        longestStreak: protocolStats.longestStreak
      };
    }
    
    setProtocolStats(stats);
    
    // Update progress
    const total = activeProtocols.length;
    const completed = todayCompletions.length;
    setProtocolProgress({
      completed,
      total: total || 1,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  };

  const handleToggleCompletion = async (protocolId: string) => {
    const isNowCompleted = await protocolCompletionService.toggleCompletion(protocolId);
    
    // Update local state
    if (isNowCompleted) {
      setCompletedToday([...completedToday, protocolId]);
    } else {
      setCompletedToday(completedToday.filter(id => id !== protocolId));
    }
    
    // Reload stats
    await loadCompletionData(strategies);
  };

  const createStrategy = async () => {
    if (!newStrategy.title.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('actionable_insights')
        .insert({
          user_id: user.id,
          title: newStrategy.title,
          description: newStrategy.description,
          category: newStrategy.category,
          difficulty: newStrategy.difficulty,
          emoji: newStrategy.emoji,
          status: 'active',
          source: 'user_created',
        })
        .select()
        .single();

      if (error) {
        console.error('[Mobile Playbook] Error creating strategy:', error);
        return;
      }

      // Reload strategies to get the new one
      await loadStrategies();
    } catch (error) {
      console.error('Error saving strategy:', error);
    }
    
    // Reset form
    setNewStrategy({
      title: '',
      description: '',
      category: 'general',
      difficulty: 'moderate',
      emoji: '✨'
    });
    setShowCreateModal(false);
  };

  const deleteStrategy = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('actionable_insights')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('[Mobile Playbook] Error deleting strategy:', error);
        return;
      }

      // Reload strategies
      await loadStrategies();
    } catch (error) {
      console.error('Error deleting strategy:', error);
    }
  };

  const handleStrategyLongPress = (strategy: Strategy) => {
    Alert.alert(
      'Strategy options',
      `"${strategy.title}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete strategy',
          style: 'destructive',
          onPress: () => deleteStrategy(strategy.id),
        },
      ],
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      coping: '#10b981',
      exercise: '#f59e0b',
      social: '#ec4899',
      mindfulness: '#8b5cf6',
      sleep: '#6366f1',
      nutrition: '#14b8a6',
      general: '#8b5cf6'
    };
    return colors[category] || '#8b5cf6';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Subtle Background Gradient */}
      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.primaryText }]}>Playbook</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Today's Progress */}
        <LinearGradient
          colors={['rgba(10, 10, 10, 0.95)', 'rgba(5, 5, 5, 0.95)']}
          style={styles.progressCard}
        >
          <Text style={styles.progressTitle}>TODAY'S PROGRESS</Text>
          <View style={styles.progressStats}>
            <Text style={styles.progressFraction}>{protocolProgress.completed}/{protocolProgress.total}</Text>
            <Text style={styles.progressLabel}>protocols completed</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={[styles.progressBar, { width: `${protocolProgress.percentage}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressPercentage}>{protocolProgress.percentage}% Completion</Text>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'protocols' && styles.tabActive]}
            onPress={() => setActiveTab('protocols')}
          >
            <Text style={[styles.tabText, activeTab === 'protocols' && styles.tabTextActive]}>
              Daily Protocols
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'strategies' && styles.tabActive]}
            onPress={() => setActiveTab('strategies')}
          >
            <Text style={[styles.tabText, activeTab === 'strategies' && styles.tabTextActive]}>
              Suggested
            </Text>
          </TouchableOpacity>
        </View>

        {/* Create Button */}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <LinearGradient
            colors={['#8b5cf6', '#7c3aed']}
            style={styles.createButtonGradient}
          >
            <Ionicons name="add-circle" size={20} color="#ffffff" />
            <Text style={styles.createButtonText}>Create New Strategy</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Content */}
        {loading ? (
          <ActivityIndicator size="large" color="#8b5cf6" style={styles.loader} />
        ) : (() => {
          // Filter strategies by status based on active tab
          const filteredStrategies = activeTab === 'protocols'
            ? strategies.filter(s => s.status === 'active')
            : strategies.filter(s => s.status === 'suggested' && s.source === 'ai_suggested');
          
          // For suggestions, show only top 3 unless expanded
          const displayStrategies = activeTab === 'strategies' && !showAllSuggestions
            ? filteredStrategies.slice(0, 3)
            : filteredStrategies;
          
          return displayStrategies.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'strategies'
                  ? 'No suggested strategies yet.'
                  : 'No daily protocols yet.'}
              </Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'strategies'
                  ? 'Analyze a few entries to get personalized recommendations.'
                  : 'Add strategies to your daily protocols to build a routine.'}
              </Text>
            </View>
          ) : (
            <>
            {displayStrategies.map((strategy) => (
            <TouchableOpacity
              key={strategy.id}
              style={styles.premiumCard}
              activeOpacity={0.7}
              onLongPress={() => handleStrategyLongPress(strategy)}
            >
              <LinearGradient
                colors={
                  strategy.status === 'suggested'
                    ? ['rgba(18, 18, 26, 0.98)', 'rgba(6, 6, 12, 0.98)']
                    : ['rgba(10, 10, 10, 0.98)', 'rgba(5, 5, 5, 0.98)']
                }
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.emojiContainer}>
                    <Text style={styles.cardEmoji}>{strategy.emoji}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.cardTitle}>{strategy.title}</Text>
                      {/* Only show streaks for active protocols */}
                      {strategy.status === 'active' && protocolStats[strategy.id] && (
                        <View style={styles.inlineStreaks}>
                          <View style={styles.inlineStreakBadge}>
                            <Text style={styles.streakEmoji}>🔥</Text>
                            <Text style={styles.streakText}>{protocolStats[strategy.id].currentStreak}</Text>
                          </View>
                          <View style={styles.inlineStreakBadge}>
                            <Text style={styles.streakEmoji}>🏆</Text>
                            <Text style={styles.streakText}>{protocolStats[strategy.id].longestStreak}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                    {strategy.description ? (
                      <Text style={styles.cardDescription} numberOfLines={2}>{strategy.description}</Text>
                    ) : null}
                  </View>
                </View>
                
                <View style={styles.cardFooter}>
                  <View style={styles.badges}>
                    <View style={[styles.categoryPill, { backgroundColor: getCategoryColor(strategy.category) + '20', borderColor: getCategoryColor(strategy.category) + '40' }]}>
                      <Text style={[styles.categoryText, { color: getCategoryColor(strategy.category) }]}>
                        {strategy.category}
                      </Text>
                    </View>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>{strategy.difficulty}</Text>
                    </View>
                  </View>
                  
                  {/* Checkbox for active protocols */}
                  {strategy.status === 'active' && (
                    <TouchableOpacity 
                      style={styles.checkboxContainer}
                      onPress={() => handleToggleCompletion(strategy.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.checkbox,
                        completedToday.includes(strategy.id) && styles.checkboxCompleted
                      ]}>
                        {completedToday.includes(strategy.id) && (
                          <Ionicons name="checkmark" size={24} color="#fff" />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  
                  {/* Action buttons for suggested strategies */}
                  {strategy.status === 'suggested' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => console.log('Activate strategy:', strategy.id)}
                      >
                        <Ionicons name="checkmark-circle" size={18} color="#34d399" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => console.log('Skip strategy:', strategy.id)}
                      >
                        <Ionicons name="close-circle" size={18} color="#f97373" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
            ))}
            
            {/* Show More Button for Strategies */}
            {activeTab === 'strategies' && filteredStrategies.length > 3 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllSuggestions(!showAllSuggestions)}
              >
                <Ionicons 
                  name={showAllSuggestions ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#8b5cf6" 
                />
                <Text style={styles.showMoreText}>
                  {showAllSuggestions 
                    ? 'Show Less' 
                    : `💡 More Suggested Strategies (${filteredStrategies.length - 3})`}
                </Text>
              </TouchableOpacity>
            )}
            </>
          );
        })()}
      </ScrollView>

      {/* Create Strategy Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Strategy</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={newStrategy.title}
                onChangeText={(text) => setNewStrategy({ ...newStrategy, title: text })}
                placeholder="e.g., Morning Meditation"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newStrategy.description}
                onChangeText={(text) => setNewStrategy({ ...newStrategy, description: text })}
                placeholder="Describe your strategy..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Emoji</Text>
              <View style={styles.emojiGrid}>
                {['✨', '💪', '🏃', '👥', '🧘', '😴', '🥗', '🎯', '🌟', '💡', '🔥', '🌈', '🎨', '📚', '🎵', '🌱', '☕', '🍃', '💝', '🌸'].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      newStrategy.emoji === emoji && styles.emojiOptionActive
                    ]}
                    onPress={() => setNewStrategy({ ...newStrategy, emoji })}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {['general', 'coping', 'exercise', 'social', 'mindfulness', 'sleep', 'nutrition'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      newStrategy.category === cat && styles.categoryOptionActive
                    ]}
                    onPress={() => setNewStrategy({ ...newStrategy, category: cat })}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      newStrategy.category === cat && styles.categoryOptionTextActive
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={createStrategy}
                disabled={!newStrategy.title.trim()}
              >
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed']}
                  style={styles.modalPrimaryButtonGradient}
                >
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                  <Text style={styles.modalPrimaryButtonText}>Create Strategy</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  // Progress Card Styles
  progressCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e5e5',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  progressFraction: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -1,
  },
  progressLabel: {
    fontSize: 14,
    color: '#999999',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#8b5cf6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  // Create Button Styles
  createButton: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Empty State Styles
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  // Premium Card Styles
  premiumCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
    flex: 1,
  },
  inlineStreaks: {
    flexDirection: 'row',
    gap: 8,
  },
  inlineStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  difficultyText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  streakBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Checkbox styles for daily protocols
  checkboxContainer: {
    marginLeft: 12,
  },
  checkbox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 2,
    borderColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#8b5cf6',
    borderColor: '#a78bfa',
  },
  strategyMetaColumn: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  strategyStatusText: {
    fontSize: 12,
    color: '#e5e7eb',
    fontWeight: '600',
    marginBottom: 4,
  },
  strategyMetaText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  // Old Strategy Card Styles (for modal)
  strategyCard: {
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  strategyEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  strategyInfo: {
    flex: 1,
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  strategyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  strategyDescription: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 12,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptionActive: {
    backgroundColor: '#8b5cf620',
    borderColor: '#8b5cf6',
    borderWidth: 2,
  },
  emojiText: {
    fontSize: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  categoryOptionActive: {
    backgroundColor: '#8b5cf620',
    borderColor: '#8b5cf6',
  },
  categoryOptionText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryOptionTextActive: {
    color: '#8b5cf6',
  },
  modalPrimaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalPrimaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 8,
  },
  modalPrimaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
});
