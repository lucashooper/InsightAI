import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { protocolCompletionService } from '../services/protocolCompletionService';
import ProtocolCompleteButton from '../components/shared/ProtocolCompleteButton';
import GlassCard from '../components/ui/GlassCard';
import GenerativeCard from '../components/ui/GenerativeCard';
import AnimatedGradientBackdrop from '../components/ui/AnimatedGradientBackdrop';
import PressableScale from '../components/ui/PressableScale';
import StaggerIn, { staggerDelay } from '../components/shared/StaggerIn';
import { illustrationForCategory } from '../components/ui/CardIllustration';
import { hueForCategory, resolvePalette, type CardHue } from '../utils/cardPalette';
import { PREMIUM } from '../constants/premiumUI';
import { TYPO } from '../constants/typography';
import EmptyState from '../components/shared/EmptyState';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../contexts/LanguageContext';
import { filterByContentLocale } from '../i18n/contentLocale';
import { consumePlaybookPrefill } from '../utils/playbookPrefill';
import { consumeProtocolEditRequest } from '../utils/protocolEditRequest';
import CollapsibleEmojiPicker from '../components/shared/CollapsibleEmojiPicker';
import { loadProtocolReminder, saveProtocolReminder, type ProtocolReminder } from '../utils/protocolReminders';
import ProtocolOptionsSheet from '../components/playbook/ProtocolOptionsSheet';
import { emojiForProtocol, resolveProtocolTasks } from '../utils/protocolEmoji';
import { isTablet, sf, ss, screenPadding } from '../utils/responsive';
import { safeGoBack } from '../utils/navigationSafety';

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
  suggestion_count?: number;
  tasks?: string[];
}

export default function PlaybookScreen() {
  console.log('[Playbook] 🔄 UPDATED VERSION LOADED - Suggestion count badges added to strategies');
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('protocols');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [editDraft, setEditDraft] = useState({
    title: '',
    description: '',
    emoji: '✨',
    category: 'general',
    tasks: [] as string[],
    reminderEnabled: false,
    reminderTime: '09:00',
  });
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    title: '',
    description: '',
    category: 'general',
    difficulty: 'moderate',
    emoji: '✨',
    tasks: [] as string[],
  });
  const [newTask, setNewTask] = useState('');
  const [protocolProgress, setProtocolProgress] = useState({
    completed: 0,
    total: 1,
    percentage: 0
  });
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [protocolStats, setProtocolStats] = useState<Record<string, { currentStreak: number; longestStreak: number }>>({});
  const [pinnedProtocolId, setPinnedProtocolId] = useState<string | null>(null);
  const [expandedProtocolIds, setExpandedProtocolIds] = useState<Set<string>>(new Set());
  const [optionsSheet, setOptionsSheet] = useState<Strategy | null>(null);

  useEffect(() => {
    loadStrategies();
    loadPinnedProtocol();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadStrategies();
      consumePlaybookPrefill().then((prefill) => {
        if (!prefill) return;
        setNewStrategy((prev) => ({
          ...prev,
          title: prefill.title,
          description: prefill.description,
        }));
        setActiveTab('strategies');
        setShowCreateModal(true);
      });
      consumeProtocolEditRequest().then((editId) => {
        if (!editId) return;
        const match = strategies.find((s) => s.id === editId);
        if (match) {
          openEditModal(match);
          return;
        }
        supabase
          .from('actionable_insights')
          .select('*')
          .eq('id', editId)
          .maybeSingle()
          .then(({ data }) => {
            if (data) openEditModal(data as Strategy);
          });
      });
    }, [user, language, strategies])
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
      const scoped = filterByContentLocale(data || [], language);
      setStrategies(scoped);

      await protocolCompletionService.pruneCompletions(scoped.map((s) => s.id));
      
      // Load completion data
      await loadCompletionData(scoped);
    } catch (error) {
      console.error('Error loading strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompletionData = async (strategies: Strategy[]) => {
    // Get today's completions
    const activeProtocols = strategies.filter(s => s.status === 'active');
    const activeIds = activeProtocols.map((p) => p.id);
    const todayCompletions = await protocolCompletionService.getTodayCompletions(activeIds);
    setCompletedToday(todayCompletions);
    
    // Get stats for each active protocol
    const stats: Record<string, { currentStreak: number; longestStreak: number }> = {};
    
    for (const protocol of activeProtocols) {
      const protocolStats = await protocolCompletionService.getStats(protocol.id);
      stats[protocol.id] = {
        currentStreak: protocolStats.currentStreak,
        longestStreak: protocolStats.longestStreak
      };
    }
    
    setProtocolStats(stats);
    
    // Update progress — only count completions for protocols that still exist
    const total = activeProtocols.length;
    const completed = todayCompletions.length;
    setProtocolProgress({
      completed,
      total,
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
      console.log('[Playbook] Creating strategy with tasks:', newStrategy.tasks);
      
      const { error } = await supabase
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
          tasks: newStrategy.tasks,
        })
        .select()
        .single();

      if (error) {
        console.error('[Mobile Playbook] Error creating strategy:', error);
        return;
      }
      
      console.log('[Playbook] Strategy created successfully with tasks');

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
      emoji: '✨',
      tasks: [],
    });
    setNewTask('');
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

      // Reload strategies to reflect the change
      await loadStrategies();
      await protocolCompletionService.pruneCompletions(
        strategies.filter((s) => s.id !== id).map((s) => s.id),
      );
    } catch (error) {
      console.error('Error deleting strategy:', error);
    }
  };

  const handleStrategyTap = async (strategy: Strategy) => {
    toggleProtocolExpanded(strategy.id);
  };

  const handleUpdateStrategy = async () => {
    if (!user || !editingStrategy || !editDraft.title.trim()) return;

    try {
      const { error } = await supabase
        .from('actionable_insights')
        .update({
          title: editDraft.title.trim(),
          description: editDraft.description.trim(),
          emoji: editDraft.emoji,
          category: editDraft.category,
          tasks: editDraft.tasks,
        })
        .eq('id', editingStrategy.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('[Playbook] Error updating strategy:', error);
        Alert.alert(t('auxiliary.common.error'), t('auxiliary.playbook.updateFailed'));
        return;
      }

      setShowEditModal(false);
      setEditingStrategy(null);
      await saveProtocolReminder(editingStrategy.id, editDraft.title.trim(), {
        enabled: editDraft.reminderEnabled,
        time: editDraft.reminderTime,
      });
      await loadStrategies();
    } catch (error) {
      console.error('Error updating strategy:', error);
    }
  };

  const loadPinnedProtocol = async () => {
    if (!user) return;
    try {
      const pinned = await AsyncStorage.getItem(`PINNED_PROTOCOL_${user.id}`);
      if (pinned) {
        setPinnedProtocolId(pinned);
      }
    } catch (error) {
      console.error('[Playbook] Error loading pinned protocol:', error);
    }
  };

  const handlePinProtocol = async (strategyId: string) => {
    if (!user) return;
    try {
      await AsyncStorage.setItem(`PINNED_PROTOCOL_${user.id}`, strategyId);
      setPinnedProtocolId(strategyId);
      Alert.alert(t('auxiliary.common.success'), t('auxiliary.playbook.pinned'));
    } catch (error) {
      console.error('[Playbook] Error pinning protocol:', error);
      Alert.alert(t('auxiliary.common.error'), t('auxiliary.playbook.pinFailed'));
    }
  };

  const handleUnpinProtocol = async () => {
    if (!user) return;
    try {
      await AsyncStorage.removeItem(`PINNED_PROTOCOL_${user.id}`);
      setPinnedProtocolId(null);
      Alert.alert(t('auxiliary.common.success'), t('auxiliary.playbook.unpinned'));
    } catch (error) {
      console.error('[Playbook] Error unpinning protocol:', error);
      Alert.alert(t('auxiliary.common.error'), t('auxiliary.playbook.unpinFailed'));
    }
  };

  const toggleProtocolExpanded = (strategyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedProtocolIds((prev) => {
      const next = new Set(prev);
      if (next.has(strategyId)) next.delete(strategyId);
      else next.add(strategyId);
      return next;
    });
  };

  const handleStrategyLongPress = (strategy: Strategy) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOptionsSheet(strategy);
  };

  const openEditModal = async (strategy: Strategy) => {
    setEditingStrategy(strategy);
    const reminder = await loadProtocolReminder(strategy.id);
    setEditDraft({
      title: strategy.title,
      description: strategy.description || '',
      emoji: emojiForProtocol(strategy.title, strategy.category, strategy.emoji),
      category: strategy.category,
      tasks: strategy.tasks || [],
      reminderEnabled: reminder.enabled,
      reminderTime: reminder.time,
    });
    setShowEditModal(true);
  };

  const handleActivateSuggestion = async (strategyId: string) => {
    if (!user) return;

    try {
      // Update strategy status from 'suggested' to 'active'
      const { error } = await supabase
        .from('actionable_insights')
        .update({ status: 'active' })
        .eq('id', strategyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('[Playbook] Error activating suggestion:', error);
        return;
      }

      console.log('[Playbook] Strategy activated:', strategyId);
      // Reload strategies to reflect the change
      await loadStrategies();
    } catch (error) {
      console.error('Error activating suggestion:', error);
    }
  };

  const handleDismissSuggestion = async (strategyId: string) => {
    if (!user) return;

    try {
      // Delete the suggestion completely
      const { error } = await supabase
        .from('actionable_insights')
        .delete()
        .eq('id', strategyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('[Playbook] Error dismissing suggestion:', error);
        return;
      }

      console.log('[Playbook] Strategy dismissed:', strategyId);
      // Reload strategies to reflect the change
      await loadStrategies();
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  };

  const dark = isDarkTheme(theme.name);

  // ── Derived view state ─────────────────────────────────────────────
  const activeProtocols = strategies.filter((s) => s.status === 'active');
  const suggestedProtocols = strategies.filter((s) => s.status === 'suggested' && s.source === 'ai_suggested');
  const filteredStrategies = activeTab === 'protocols' ? activeProtocols : suggestedProtocols;
  const displayStrategies =
    activeTab === 'strategies' && !showAllSuggestions ? filteredStrategies.slice(0, 3) : filteredStrategies;

  const remaining = Math.max(0, protocolProgress.total - protocolProgress.completed);
  const allDone = protocolProgress.total > 0 && remaining === 0;

  // The page's immersive backdrop follows the focused card: an expanded card
  // wins, otherwise the first card in the list, otherwise the tab's own hue.
  const focusedStrategy =
    displayStrategies.find((s) => expandedProtocolIds.has(s.id)) ?? displayStrategies[0];
  const pageHue: CardHue = focusedStrategy
    ? hueForCategory(focusedStrategy.category)
    : activeTab === 'protocols'
      ? 'violet'
      : 'lilac';
  const pagePalette = resolvePalette({ hue: pageHue });
  const heroHue: CardHue = allDone ? 'mint' : activeTab === 'protocols' ? 'violet' : 'lilac';
  const heroPalette = resolvePalette({ hue: heroHue });

  const heroTitle =
    protocolProgress.total === 0
      ? t('auxiliary.playbook.noProtocols')
      : allDone
        ? t('auxiliary.playbook.allDone')
        : t('auxiliary.playbook.keepGoing', { remaining });
  const heroSubtitle =
    protocolProgress.total === 0
      ? t('auxiliary.playbook.noProtocolsMessage')
      : allDone
        ? t('auxiliary.playbook.allDoneSubtitle')
        : t('auxiliary.playbook.journeySubtitle');

  const renderProtocolCard = (strategy: Strategy, index: number) => {
    const isExpanded = expandedProtocolIds.has(strategy.id);
    const displayEmoji = emojiForProtocol(strategy.title, strategy.category, strategy.emoji);
    const displayTasks = resolveProtocolTasks(strategy.tasks, strategy.description, strategy.title)
      .filter((task) => task.trim() !== (strategy.description?.trim() ?? ''));
    const hue = hueForCategory(strategy.category);
    const pal = resolvePalette({ hue });
    const stats = protocolStats[strategy.id];
    const isDone = completedToday.includes(strategy.id);
    const visibleTasks = isExpanded ? displayTasks : displayTasks.slice(0, 2);

    return (
      <GenerativeCard
        key={strategy.id}
        seed={strategy.id}
        hue={hue}
        variant="tile"
        illustration={illustrationForCategory(strategy.category)}
        illustrationOpacity={isExpanded ? 0.55 : 0.8}
        eyebrow={`${t(`auxiliary.playbook.categories.${strategy.category}`)} · ${t(`auxiliary.playbook.difficulties.${strategy.difficulty}`)}`}
        title={strategy.title}
        subtitle={strategy.description || undefined}
        titleLines={isExpanded ? 4 : 2}
        subtitleLines={isExpanded ? undefined : 2}
        avatar={displayEmoji}
        enterDelay={staggerDelay(index + 3)}
        onPress={() => handleStrategyTap(strategy)}
        onLongPress={() => handleStrategyLongPress(strategy)}
        style={styles.unitCard}
        footer={
          <View style={styles.unitFooter}>
            <View style={styles.chipRow}>
              {strategy.status === 'active' && stats ? (
                <>
                  <View style={[styles.chip, { backgroundColor: pal.surface }]}>
                    <Ionicons name="flame" size={13} color="#F97316" />
                    <Text style={[styles.chipText, { color: pal.ink }]}>{stats.currentStreak}</Text>
                  </View>
                  <View style={[styles.chip, { backgroundColor: pal.surface }]}>
                    <Ionicons name="trophy-outline" size={13} color="#F59E0B" />
                    <Text style={[styles.chipText, { color: pal.ink }]}>{stats.longestStreak}</Text>
                  </View>
                </>
              ) : null}
              {strategy.status === 'suggested' && strategy.suggestion_count && strategy.suggestion_count > 1 ? (
                <View style={[styles.chip, { backgroundColor: pal.accent }]}>
                  <Ionicons name="sparkles" size={12} color="#fff" />
                  <Text style={[styles.chipText, { color: '#fff' }]}>{strategy.suggestion_count}</Text>
                </View>
              ) : null}
            </View>

            {strategy.status === 'active' ? (
              <ProtocolCompleteButton completed={isDone} onPress={() => handleToggleCompletion(strategy.id)} />
            ) : (
              <View style={styles.suggestActions}>
                <PressableScale
                  onPress={() => handleActivateSuggestion(strategy.id)}
                  style={[styles.suggestBtn, { backgroundColor: pal.surfaceStrong }]}
                  accessibilityLabel={t('auxiliary.common.accept')}
                >
                  <Ionicons name="checkmark" size={18} color="#16A34A" />
                </PressableScale>
                <PressableScale
                  onPress={() => handleDismissSuggestion(strategy.id)}
                  style={[styles.suggestBtn, { backgroundColor: pal.surface }]}
                  accessibilityLabel={t('auxiliary.common.dismiss')}
                >
                  <Ionicons name="close" size={18} color={pal.muted} />
                </PressableScale>
              </View>
            )}
          </View>
        }
      >
        {visibleTasks.length > 0 ? (
          <View style={styles.taskPreview}>
            {visibleTasks.map((task, i) => (
              <View key={i} style={styles.taskPreviewItem}>
                <View style={[styles.taskDot, { backgroundColor: pal.accent }]} />
                <Text style={[styles.taskPreviewText, { color: pal.muted }]} numberOfLines={isExpanded ? 3 : 1}>
                  {task}
                </Text>
              </View>
            ))}
            {!isExpanded && displayTasks.length > 2 ? (
              <Text style={[styles.taskPreviewMore, { color: pal.muted }]}>
                {t('auxiliary.playbook.moreCount', { count: displayTasks.length - 2 })}
              </Text>
            ) : null}
          </View>
        ) : null}
      </GenerativeCard>
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedGradientBackdrop colors={pagePalette.backdrop} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar — frosted back control + "New" pill */}
        <StaggerIn delay={0}>
          <View style={styles.topBar}>
            <PressableScale
              onPress={() => safeGoBack(navigation)}
              style={styles.circleBtn}
              accessibilityRole="button"
              accessibilityLabel={t('components.common.back')}
            >
              <Ionicons name="arrow-back" size={20} color={pagePalette.ink} />
            </PressableScale>
            <PressableScale
              onPress={() => setShowCreateModal(true)}
              style={[styles.newPill, { backgroundColor: pagePalette.ink }]}
              accessibilityRole="button"
              accessibilityLabel={t('auxiliary.playbook.createNew')}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.newPillText}>{t('auxiliary.playbook.newProtocol')}</Text>
            </PressableScale>
          </View>

          <Text style={[styles.journeyTitle, { color: pagePalette.ink }]}>{t('auxiliary.playbook.journeyTitle')}</Text>
          <Text style={[styles.journeySubtitle, { color: pagePalette.muted }]}>
            {t('auxiliary.playbook.journeySubtitle')}
          </Text>
        </StaggerIn>

        {/* Progress hero */}
        <GenerativeCard
          variant="hero"
          hue={heroHue}
          seed={`journey-progress-${heroHue}`}
          illustration={allDone ? 'sunrise' : 'hills'}
          eyebrow={t('auxiliary.playbook.todayLabel')}
          title={heroTitle}
          subtitle={heroSubtitle}
          enterDelay={70}
          style={styles.heroCard}
          footer={
            protocolProgress.total > 0 ? (
              <View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.max(4, protocolProgress.percentage)}%`, backgroundColor: heroPalette.accent },
                    ]}
                  />
                </View>
                <View style={styles.progressMeta}>
                  <Text style={[styles.progressFraction, { color: heroPalette.ink }]}>
                    {protocolProgress.completed}/{protocolProgress.total}
                  </Text>
                  <Text style={[styles.progressLabel, { color: heroPalette.muted }]}>
                    {t('auxiliary.playbook.completion', { percentage: protocolProgress.percentage })}
                  </Text>
                </View>
              </View>
            ) : (
              <PressableScale
                onPress={() => setShowCreateModal(true)}
                style={[styles.heroCta, { backgroundColor: heroPalette.ink }]}
              >
                <Text style={styles.heroCtaText}>{t('auxiliary.playbook.startHere')}</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </PressableScale>
            )
          }
        />

        {/* Segmented control */}
        <StaggerIn delay={130}>
          <View style={styles.segment}>
            {(['protocols', 'strategies'] as TabType[]).map((tab) => {
              const active = activeTab === tab;
              return (
                <PressableScale
                  key={tab}
                  scaleTo={0.97}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.segmentItem, active && { backgroundColor: pagePalette.ink }]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.segmentText, { color: active ? '#fff' : pagePalette.ink }]}>
                    {tab === 'protocols' ? t('auxiliary.playbook.dailyProtocols') : t('auxiliary.playbook.suggested')}
                  </Text>
                  {tab === 'strategies' && suggestedProtocols.length > 0 ? (
                    <View style={[styles.segmentBadge, { backgroundColor: active ? 'rgba(255,255,255,0.28)' : pagePalette.accentSoft }]}>
                      <Text style={[styles.segmentBadgeText, { color: active ? '#fff' : pagePalette.accent }]}>
                        {suggestedProtocols.length}
                      </Text>
                    </View>
                  ) : null}
                </PressableScale>
              );
            })}
          </View>
        </StaggerIn>

        {/* Units */}
        {loading ? (
          <ActivityIndicator size="large" color={pagePalette.accent} style={styles.loader} />
        ) : displayStrategies.length === 0 ? (
          <StaggerIn delay={200}>
            <EmptyState
              icon={activeTab === 'strategies' ? 'sparkles-outline' : 'repeat-outline'}
              title={activeTab === 'strategies'
                ? t('auxiliary.playbook.noSuggestions')
                : t('auxiliary.playbook.noProtocols')}
              subtitle={activeTab === 'strategies'
                ? t('auxiliary.playbook.noSuggestionsMessage')
                : t('auxiliary.playbook.noProtocolsMessage')}
              compact
            />
          </StaggerIn>
        ) : (
          <>
            {displayStrategies.map(renderProtocolCard)}

            {activeTab === 'strategies' && filteredStrategies.length > 3 ? (
              <PressableScale
                style={[styles.showMorePill, { backgroundColor: pagePalette.surface }]}
                onPress={() => setShowAllSuggestions(!showAllSuggestions)}
              >
                <Ionicons name={showAllSuggestions ? 'chevron-up' : 'chevron-down'} size={18} color={pagePalette.ink} />
                <Text style={[styles.showMoreText, { color: pagePalette.ink }]}>
                  {showAllSuggestions
                    ? t('auxiliary.playbook.showLess')
                    : t('auxiliary.playbook.moreSuggested', { count: filteredStrategies.length - 3 })}
                </Text>
              </PressableScale>
            ) : null}
          </>
        )}
      </ScrollView>

      {/* Create Protocol Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <GlassCard style={styles.modalContent} noPad contentStyle={styles.modalContentInner}>
            <View style={[styles.modalHeader, { borderBottomColor: isDarkTheme(theme.name) ? '#2a2a3e' : '#e5e5e5' }]}>
              <Text style={[styles.modalTitle, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('auxiliary.playbook.newStrategy')}</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={isDarkTheme(theme.name) ? '#999' : '#666'} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBodyScroll}
              contentContainerStyle={styles.modalBodyContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.label, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('auxiliary.playbook.titleRequired')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDarkTheme(theme.name) ? '#1a1a1a' : '#f5f5f5', borderColor: isDarkTheme(theme.name) ? '#2a2a2a' : '#e0e0e0', color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}
                value={newStrategy.title}
                onChangeText={(text) => setNewStrategy({ ...newStrategy, title: text })}
                placeholder={t('auxiliary.playbook.titleExample')}
                placeholderTextColor={isDarkTheme(theme.name) ? '#666' : '#999'}
              />

              <Text style={[styles.label, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('auxiliary.playbook.descriptionOptional')}</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: isDarkTheme(theme.name) ? '#1a1a1a' : '#f5f5f5', borderColor: isDarkTheme(theme.name) ? '#2a2a2a' : '#e0e0e0', color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}
                value={newStrategy.description}
                onChangeText={(text) => setNewStrategy({ ...newStrategy, description: text })}
                placeholder={t('auxiliary.playbook.describe')}
                placeholderTextColor={isDarkTheme(theme.name) ? '#666' : '#999'}
                multiline
                numberOfLines={4}
              />

              <Text style={[styles.label, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('auxiliary.playbook.tasksOptional')}</Text>
              <View style={styles.taskInputContainer}>
                <TextInput
                  style={[styles.taskInput, { backgroundColor: isDarkTheme(theme.name) ? '#1a1a1a' : '#f5f5f5', borderColor: isDarkTheme(theme.name) ? '#2a2a2a' : '#e0e0e0', color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}
                  value={newTask}
                  onChangeText={setNewTask}
                  placeholder={t('auxiliary.playbook.addTaskPlaceholder')}
                  placeholderTextColor={isDarkTheme(theme.name) ? '#666' : '#999'}
                  onSubmitEditing={() => {
                    if (newTask.trim()) {
                      setNewStrategy({ ...newStrategy, tasks: [...newStrategy.tasks, newTask.trim()] });
                      setNewTask('');
                    }
                  }}
                />
                <TouchableOpacity
                  style={[styles.addTaskButton, { opacity: newTask.trim() ? 1 : 0.5 }]}
                  onPress={() => {
                    if (newTask.trim()) {
                      setNewStrategy({ ...newStrategy, tasks: [...newStrategy.tasks, newTask.trim()] });
                      setNewTask('');
                    }
                  }}
                  disabled={!newTask.trim()}
                >
                  <Ionicons name="add-circle" size={24} color="#8b5cf6" />
                </TouchableOpacity>
              </View>

              {newStrategy.tasks.length > 0 && (
                <View style={styles.taskList}>
                  {newStrategy.tasks.map((task, index) => (
                    <View key={index} style={[styles.taskItem, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)', borderColor: isDarkTheme(theme.name) ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)' }]}>
                      <Text style={[styles.taskItemText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{index + 1}. {task}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setNewStrategy({ ...newStrategy, tasks: newStrategy.tasks.filter((_, i) => i !== index) });
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color={isDarkTheme(theme.name) ? '#999' : '#666'} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <Text style={[styles.label, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('auxiliary.playbook.emoji')}</Text>
              <View style={styles.emojiGrid}>
                {['✨', '💪', '🏃', '👥', '🧘', '😴', '🥗', '🎯', '🌟', '💡', '🔥', '🌈', '🎨', '📚', '🎵', '🌱', '☕', '🍃', '💝', '🌸'].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      { backgroundColor: isDarkTheme(theme.name) ? '#1a1a1a' : '#f5f5f5', borderColor: isDarkTheme(theme.name) ? '#2a2a2a' : '#e0e0e0' },
                      newStrategy.emoji === emoji && styles.emojiOptionActive
                    ]}
                    onPress={() => setNewStrategy({ ...newStrategy, emoji })}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('auxiliary.playbook.category')}</Text>
              <View style={styles.categoryGrid}>
                {['general', 'coping', 'exercise', 'social', 'mindfulness', 'sleep', 'nutrition'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: isDarkTheme(theme.name) ? '#1a1a1a' : '#f5f5f5', borderColor: isDarkTheme(theme.name) ? '#2a2a2a' : '#e0e0e0' },
                      newStrategy.category === cat && { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }
                    ]}
                    onPress={() => setNewStrategy({ ...newStrategy, category: cat })}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      { color: isDarkTheme(theme.name) ? '#999' : '#666' },
                      newStrategy.category === cat && { color: '#ffffff' }
                    ]}>
                      {t(`auxiliary.playbook.categories.${cat}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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
                  <Text style={styles.modalPrimaryButtonText}>{t('auxiliary.playbook.createStrategy')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Protocol Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => { setShowEditModal(false); setEditingStrategy(null); }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalOverlay, styles.modalOverlaySolid]}
        >
          <GlassCard style={styles.modalContent} variant="elevated" noPad contentStyle={styles.modalContentInner}>
            <View style={[styles.modalHeader, { borderBottomColor: isDarkTheme(theme.name) ? '#2a2a3e' : '#e5e5e5' }]}>
              <Text style={[styles.modalTitle, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('auxiliary.playbook.editStrategy')}</Text>
              <TouchableOpacity onPress={() => { setShowEditModal(false); setEditingStrategy(null); }}>
                <Ionicons name="close" size={24} color={isDarkTheme(theme.name) ? '#999' : '#666'} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBodyScroll} 
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.label, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('auxiliary.playbook.titleRequired')}</Text>
              <TextInput
                style={[styles.input, styles.inputSubtle, { backgroundColor: isDarkTheme(theme.name) ? '#1a1a1a' : '#f5f5f5', color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}
                value={editDraft.title}
                onChangeText={(text) => setEditDraft({ ...editDraft, title: text })}
                placeholder={t('auxiliary.playbook.strategyTitle')}
                placeholderTextColor={isDarkTheme(theme.name) ? '#666' : '#999'}
              />

              <Text style={[styles.label, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('auxiliary.playbook.description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea, styles.inputSubtle, { backgroundColor: isDarkTheme(theme.name) ? '#1a1a1a' : '#f5f5f5', color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}
                value={editDraft.description}
                onChangeText={(text) => setEditDraft({ ...editDraft, description: text })}
                placeholder={t('auxiliary.playbook.describe')}
                placeholderTextColor={isDarkTheme(theme.name) ? '#666' : '#999'}
                multiline
              />

              <Text style={[styles.label, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('auxiliary.playbook.category')}</Text>
              <View style={styles.categoryGrid}>
                {['general', 'coping', 'exercise', 'social', 'mindfulness', 'sleep', 'nutrition'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: isDarkTheme(theme.name) ? '#1a1a1a' : '#f5f5f5', borderColor: isDarkTheme(theme.name) ? '#2a2a2a' : '#e0e0e0' },
                      editDraft.category === cat && { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }
                    ]}
                    onPress={() => setEditDraft({ ...editDraft, category: cat })}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      { color: isDarkTheme(theme.name) ? '#999' : '#666' },
                      editDraft.category === cat && { color: '#ffffff' }
                    ]}>
                      {t(`auxiliary.playbook.categories.${cat}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tasks Section */}
              <Text style={[styles.label, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('auxiliary.playbook.tasksOptional')}</Text>
              <View style={styles.taskInputContainer}>
                <TextInput
                  style={[styles.taskInput, { backgroundColor: isDarkTheme(theme.name) ? '#1a1a1a' : '#f5f5f5', borderColor: isDarkTheme(theme.name) ? '#2a2a2a' : '#e0e0e0', color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}
                  value={newTask}
                  onChangeText={setNewTask}
                  placeholder={t('auxiliary.playbook.addTaskPlaceholder')}
                  placeholderTextColor={isDarkTheme(theme.name) ? '#666' : '#999'}
                  onSubmitEditing={() => {
                    if (newTask.trim()) {
                      setEditDraft({ ...editDraft, tasks: [...editDraft.tasks, newTask.trim()] });
                      setNewTask('');
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.addTaskButton}
                  onPress={() => {
                    if (newTask.trim()) {
                      setEditDraft({ ...editDraft, tasks: [...editDraft.tasks, newTask.trim()] });
                      setNewTask('');
                    }
                  }}
                >
                  <Ionicons name="add-circle" size={24} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
              {editDraft.tasks.length > 0 && (
                <View style={styles.taskList}>
                  {editDraft.tasks.map((task, index) => (
                    <View key={index} style={[styles.taskItem, { backgroundColor: isDarkTheme(theme.name) ? '#1a1a1a' : '#f5f5f5' }]}>
                      <Text style={[styles.taskItemText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{task}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setEditDraft({ ...editDraft, tasks: editDraft.tasks.filter((_, i) => i !== index) });
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color={isDarkTheme(theme.name) ? '#999' : '#666'} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.reminderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { marginTop: 0, color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>
                    {t('auxiliary.playbook.reminderTitle')}
                  </Text>
                  <Text style={[styles.reminderDesc, { color: isDarkTheme(theme.name) ? '#999' : '#666' }]}>
                    {t('auxiliary.playbook.reminderDesc')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.reminderToggle, editDraft.reminderEnabled && styles.reminderToggleOn]}
                  onPress={() => setEditDraft({ ...editDraft, reminderEnabled: !editDraft.reminderEnabled })}
                >
                  <View style={[styles.reminderKnob, editDraft.reminderEnabled && styles.reminderKnobOn]} />
                </TouchableOpacity>
              </View>

              {editDraft.reminderEnabled ? (
                <>
                  <Text style={[styles.label, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>
                    {t('auxiliary.playbook.reminderTime')}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.inputSubtle, { backgroundColor: isDarkTheme(theme.name) ? '#1a1a1a' : '#f5f5f5', color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}
                    value={editDraft.reminderTime}
                    onChangeText={(text) => setEditDraft({ ...editDraft, reminderTime: text })}
                    placeholder="09:00"
                    placeholderTextColor={isDarkTheme(theme.name) ? '#666' : '#999'}
                    keyboardType="numbers-and-punctuation"
                  />
                </>
              ) : null}

              <Text style={[styles.label, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{t('auxiliary.playbook.emoji')}</Text>
              <CollapsibleEmojiPicker
                value={editDraft.emoji}
                onChange={(emoji) => setEditDraft({ ...editDraft, emoji })}
              />

            </ScrollView>

            <View style={[styles.modalFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleUpdateStrategy}
                disabled={!editDraft.title.trim()}
              >
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed']}
                  style={styles.modalPrimaryButtonGradient}
                >
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                  <Text style={styles.modalPrimaryButtonText}>{t('auxiliary.playbook.saveChanges')}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {editingStrategy && (
                <TouchableOpacity
                  style={styles.editDeleteButton}
                  onPress={() => {
                    setShowEditModal(false);
                    deleteStrategy(editingStrategy.id);
                    setEditingStrategy(null);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <Text style={styles.editDeleteText}>{t('auxiliary.playbook.deleteStrategy')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </GlassCard>
        </KeyboardAvoidingView>
      </Modal>

      <ProtocolOptionsSheet
        visible={!!optionsSheet}
        title={t('auxiliary.playbook.strategyOptions')}
        subtitle={optionsSheet?.title}
        onDismiss={() => setOptionsSheet(null)}
        actions={
          optionsSheet
            ? [
                {
                  label: t('auxiliary.common.edit'),
                  icon: 'create-outline',
                  iconColor: '#A855F7',
                  onPress: () => openEditModal(optionsSheet),
                },
                ...(optionsSheet.status === 'active'
                  ? [
                      {
                        label:
                          pinnedProtocolId === optionsSheet.id
                            ? t('auxiliary.playbook.unpinFromHome')
                            : t('auxiliary.playbook.pinToHome'),
                        icon: 'home-outline' as const,
                        iconColor: '#818CF8',
                        onPress: () =>
                          pinnedProtocolId === optionsSheet.id
                            ? handleUnpinProtocol()
                            : handlePinProtocol(optionsSheet.id),
                      },
                      {
                        label: t('auxiliary.playbook.reminderTitle'),
                        icon: 'notifications-outline' as const,
                        iconColor: '#38BDF8',
                        onPress: () => openEditModal(optionsSheet),
                      },
                    ]
                  : []),
                {
                  label: t('auxiliary.playbook.deleteStrategy'),
                  icon: 'trash-outline',
                  iconColor: '#EF4444',
                  variant: 'destructive' as const,
                  onPress: () => deleteStrategy(optionsSheet.id),
                },
              ]
            : []
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 20,
    fontWeight: '500',
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
    paddingHorizontal: screenPadding,
    paddingBottom: 140,
    gap: PREMIUM.layout.cardGap,
  },

  // ── Journey (immersive) layout ────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  newPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 12,
    paddingRight: 16,
    height: 40,
    borderRadius: 20,
  },
  newPillText: {
    color: '#fff',
    fontSize: sf(14),
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  journeyTitle: {
    ...TYPO.h1,
  },
  journeySubtitle: {
    ...TYPO.body,
    marginTop: 6,
    marginBottom: 8,
    maxWidth: '88%',
  },
  heroCard: {
    marginBottom: 4,
  },
  progressTrack: {
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.55)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressMeta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  progressLabel: {
    fontSize: sf(13),
    fontWeight: '600',
  },
  heroCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 22,
  },
  heroCtaText: {
    color: '#fff',
    fontSize: sf(15),
    fontWeight: '700',
  },
  segment: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderRadius: PREMIUM.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: PREMIUM.radius.pill,
  },
  segmentText: {
    fontSize: sf(14),
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  segmentBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBadgeText: {
    fontSize: sf(11),
    fontWeight: '800',
  },
  unitCard: {
    marginBottom: 0,
  },
  unitFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
  },
  chipText: {
    fontSize: sf(12),
    fontWeight: '700',
  },
  suggestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  showMorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: PREMIUM.radius.pill,
    marginTop: 4,
  },
  sectionCard: {
    marginBottom: 0,
  },
  progressStats: {
    marginBottom: PREMIUM.space[1],
  },
  progressFraction: {
    fontSize: sf(isTablet ? 44 : 40),
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  // Tab Styles
  tabContainer: {
    borderRadius: PREMIUM.radius.card,
  },
  tabContainerInner: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: isTablet ? 14 : 12,
    borderRadius: PREMIUM.radius.pill,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#8b5cf6',
  },
  tabText: {
    fontSize: sf(14),
    fontWeight: '600',
    color: '#666666',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  // Create Button Styles
  createButton: {
    borderRadius: PREMIUM.radius.pill,
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
    fontSize: sf(16),
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
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // Premium Card Styles
  premiumCardPressable: {
    marginBottom: 0,
  },
  premiumCard: {
  },
  cardGradient: {
    paddingHorizontal: PREMIUM.layout.cardInnerPadH,
    paddingVertical: PREMIUM.layout.cardInnerPadV,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  emojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardEmoji: {
    fontSize: sf(isTablet ? 36 : 32),
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
    fontSize: sf(isTablet ? 22 : 20),
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.4,
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
    fontSize: sf(isTablet ? 16 : 14),
    color: '#999999',
    lineHeight: sf(isTablet ? 24 : 20),
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
    borderRadius: 20,
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
  },
  // Suggestion count badge (like desktop "2" indicator)
  suggestionCountBadge: {
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  suggestionCountText: {
    fontSize: 12,
    fontWeight: '700',
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalOverlaySolid: {
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
  },
  modalContent: {
    maxHeight: '90%',
  },
  modalContentInner: {
    flexShrink: 1,
    maxHeight: '100%',
  },
  modalBodyScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  modalBodyContent: {
    padding: 20,
    paddingBottom: 8,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 10,
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
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputSubtle: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 4,
  },
  reminderDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  reminderToggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 3,
    justifyContent: 'center',
  },
  reminderToggleOn: {
    backgroundColor: 'rgba(139,92,246,0.45)',
  },
  reminderKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  reminderKnobOn: {
    alignSelf: 'flex-end',
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
  taskInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  taskInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
  },
  addTaskButton: {
    padding: 4,
  },
  taskList: {
    gap: 8,
    marginBottom: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  taskItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
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
  taskPreview: {
    marginTop: 8,
    gap: 6,
  },
  taskPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskPreviewText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  taskPreviewMore: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  editDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  editDeleteText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
  },
});
