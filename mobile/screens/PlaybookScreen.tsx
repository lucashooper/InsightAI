import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

type TabType = 'protocols' | 'strategies';

interface Strategy {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  emoji: string;
}

export default function PlaybookScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('protocols');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  useEffect(() => {
    loadStrategies();
  }, [user]);

  const loadStrategies = async () => {
    if (!user) return;

    try {
      // Load from AsyncStorage
      const stored = await AsyncStorage.getItem(`actionable_insights_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setStrategies(parsed);
      }
    } catch (error) {
      console.error('Error loading strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStrategy = async () => {
    if (!newStrategy.title.trim() || !user) return;

    const strategy: Strategy = {
      id: Date.now().toString(),
      ...newStrategy
    };

    const updated = [...strategies, strategy];
    setStrategies(updated);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(`actionable_insights_${user.id}`, JSON.stringify(updated));
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
    const updated = strategies.filter(s => s.id !== id);
    setStrategies(updated);
    
    try {
      await AsyncStorage.setItem(`actionable_insights_${user.id}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting strategy:', error);
    }
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Playbook</Text>
          <Text style={styles.headerSubtitle}>Your personal growth guide</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Today's Progress */}
        <LinearGradient
          colors={['rgba(15, 15, 15, 0.95)', 'rgba(26, 26, 26, 0.95)']}
          style={styles.progressCard}
        >
          <Text style={styles.progressTitle}>TODAY'S PROGRESS</Text>
          <View style={styles.progressStats}>
            <Text style={styles.progressFraction}>{protocolProgress.completed}/{protocolProgress.total}</Text>
            <Text style={styles.progressLabel}>protocols completed</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${protocolProgress.percentage}%` }]} />
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
              Strategies
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
        ) : strategies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>No {activeTab} yet</Text>
            <Text style={styles.emptySubtext}>Create your first {activeTab === 'protocols' ? 'protocol' : 'strategy'} to get started</Text>
          </View>
        ) : (
          strategies.map((strategy) => (
            <TouchableOpacity key={strategy.id} style={styles.premiumCard} activeOpacity={0.7}>
              <LinearGradient
                colors={['rgba(15, 15, 15, 0.95)', 'rgba(26, 26, 26, 0.95)']}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.emojiContainer}>
                    <Text style={styles.cardEmoji}>{strategy.emoji}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.cardTitle}>{strategy.title}</Text>
                      <View style={styles.inlineStreaks}>
                        <View style={styles.inlineStreakBadge}>
                          <Text style={styles.streakEmoji}>🔥</Text>
                          <Text style={styles.streakText}>0</Text>
                        </View>
                        <View style={styles.inlineStreakBadge}>
                          <Text style={styles.streakEmoji}>🏆</Text>
                          <Text style={styles.streakText}>0</Text>
                        </View>
                      </View>
                    </View>
                    {strategy.description ? (
                      <Text style={styles.cardDescription} numberOfLines={2}>{strategy.description}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity 
                    onPress={() => deleteStrategy(strategy.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
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
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        )}
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
                style={styles.createButton}
                onPress={createStrategy}
                disabled={!newStrategy.title.trim()}
              >
                <Text style={styles.createButtonText}>Create Strategy</Text>
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
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
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
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
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
    backgroundColor: '#0a0a0a',
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
});
