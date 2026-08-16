import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import StandardContainer from '../components/shared/StandardContainer';
import GlassCard from '../components/ui/GlassCard';
import { useLanguage } from '../contexts/LanguageContext';
import { translateEmotion } from '../i18n/labels';

interface EmotionDetailRouteParams {
  emotion: string;
  percentage: number;
  entries: any[];
  accentGlow?: string;
  gradientColors?: [string, string, string];
}

export default function EmotionDetailScreen() {
  const { theme } = useTheme();
  const { t, formatDate } = useLanguage();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as EmotionDetailRouteParams;
  
  const { emotion, percentage, entries, accentGlow = '#8b5cf6', gradientColors } = params;
  const pageGradient = gradientColors ?? [
    `${accentGlow}66`,
    `${accentGlow}33`,
    '#0D0B18',
  ];
  
  console.log('[EmotionDetail] Opened:', { emotion, percentage, entriesCount: entries?.length || 0 });

  // Generate empathetic summary based on emotion
  const getEmpatheticSummary = (emotion: string, percentage: number): string => {
    const emotionLower = emotion.toLowerCase();
    
    if (percentage > 40) {
      if (emotionLower.includes('neutral')) {
        return t('auxiliary.emotionDetail.summary.neutralDominant');
      } else if (emotionLower.includes('hop') || emotionLower.includes('joy') || emotionLower.includes('excit')) {
        return t('auxiliary.emotionDetail.summary.positiveDominant');
      } else if (emotionLower.includes('anx') || emotionLower.includes('stress') || emotionLower.includes('worry')) {
        return t('auxiliary.emotionDetail.summary.anxiousDominant');
      } else if (emotionLower.includes('sad') || emotionLower.includes('down') || emotionLower.includes('lonely')) {
        return t('auxiliary.emotionDetail.summary.sadDominant');
      } else if (emotionLower.includes('frustrat') || emotionLower.includes('anger')) {
        return t('auxiliary.emotionDetail.summary.frustratedDominant');
      } else if (emotionLower.includes('tired') || emotionLower.includes('exhaust')) {
        return t('auxiliary.emotionDetail.summary.tiredDominant');
      }
    } else if (percentage > 20) {
      return t('auxiliary.emotionDetail.summary.notable', { percentage });
    } else {
      return t('auxiliary.emotionDetail.summary.occasional');
    }
    
    return t('auxiliary.emotionDetail.summary.default');
  };

  // Generate contextual interpretation
  const getContextualInterpretation = (emotion: string, entries: any[]): string => {
    const emotionLower = emotion.toLowerCase();
    
    // Analyze entry content for context
    const allContent = entries.map(e => (e.content || '').toLowerCase()).join(' ');
    
    const contexts: string[] = [];
    
    if (allContent.includes('work') || allContent.includes('job') || allContent.includes('project') || allContent.includes('meeting')) {
      contexts.push(t('auxiliary.emotionDetail.context.work'));
    }
    if (allContent.includes('sleep') || allContent.includes('tired') || allContent.includes('rest') || allContent.includes('wake')) {
      contexts.push(t('auxiliary.emotionDetail.context.sleep'));
    }
    if (allContent.includes('friend') || allContent.includes('family') || allContent.includes('relationship') || allContent.includes('partner')) {
      contexts.push(t('auxiliary.emotionDetail.context.relationships'));
    }
    if (allContent.includes('routine') || allContent.includes('habit') || allContent.includes('schedule')) {
      contexts.push(t('auxiliary.emotionDetail.context.routines'));
    }
    
    if (contexts.length > 0) {
      return t('auxiliary.emotionDetail.context.connected', { contexts: contexts.join(', ') });
    }
    
    return t('auxiliary.emotionDetail.context.default');
  };

  // Generate actionable suggestions
  const getActionableSuggestions = (emotion: string): string[] => {
    const emotionLower = emotion.toLowerCase();
    
    if (emotionLower.includes('anx') || emotionLower.includes('stress') || emotionLower.includes('worry')) {
      return [
        t('auxiliary.emotionDetail.suggestions.anxiety1'),
        t('auxiliary.emotionDetail.suggestions.anxiety2'),
        t('auxiliary.emotionDetail.suggestions.anxiety3'),
      ];
    } else if (emotionLower.includes('sad') || emotionLower.includes('down') || emotionLower.includes('lonely')) {
      return [
        t('auxiliary.emotionDetail.suggestions.sad1'),
        t('auxiliary.emotionDetail.suggestions.sad2'),
        t('auxiliary.emotionDetail.suggestions.sad3'),
      ];
    } else if (emotionLower.includes('frustrat') || emotionLower.includes('anger')) {
      return [
        t('auxiliary.emotionDetail.suggestions.anger1'),
        t('auxiliary.emotionDetail.suggestions.anger2'),
        t('auxiliary.emotionDetail.suggestions.anger3'),
      ];
    } else if (emotionLower.includes('tired') || emotionLower.includes('exhaust')) {
      return [
        t('auxiliary.emotionDetail.suggestions.tired1'),
        t('auxiliary.emotionDetail.suggestions.tired2'),
        t('auxiliary.emotionDetail.suggestions.tired3'),
      ];
    } else if (emotionLower.includes('hop') || emotionLower.includes('joy') || emotionLower.includes('excit')) {
      return [
        t('auxiliary.emotionDetail.suggestions.positive1'),
        t('auxiliary.emotionDetail.suggestions.positive2'),
        t('auxiliary.emotionDetail.suggestions.positive3'),
      ];
    } else if (emotionLower.includes('neutral') || emotionLower.includes('calm')) {
      return [
        t('auxiliary.emotionDetail.suggestions.calm1'),
        t('auxiliary.emotionDetail.suggestions.calm2'),
        t('auxiliary.emotionDetail.suggestions.calm3'),
      ];
    }
    
    return [
      t('auxiliary.emotionDetail.suggestions.default1'),
      t('auxiliary.emotionDetail.suggestions.default2'),
      t('auxiliary.emotionDetail.suggestions.default3'),
    ];
  };

  const empatheticSummary = getEmpatheticSummary(emotion, percentage);
  const contextualInterpretation = getContextualInterpretation(emotion, entries || []);
  const suggestions = getActionableSuggestions(emotion);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={pageGradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('auxiliary.emotionDetail.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Emotion Header */}
        <GlassCard style={styles.emotionHeaderCard} noPad contentStyle={styles.emotionHeaderInner}>
          <View style={[styles.emotionOrb, { borderColor: `${accentGlow}88` }]}>
            <Text style={styles.emotionOrbPct}>{percentage}%</Text>
          </View>
          <Text style={styles.emotionName}>
            {translateEmotion(t, emotion)}
          </Text>
          <Text style={styles.emotionPercentage}>
            {t('auxiliary.emotionDetail.seenIn', { percentage })}
          </Text>
        </GlassCard>

        {/* Empathetic Summary */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart-outline" size={20} color={accentGlow} />
            <Text style={styles.sectionTitle}>{t('auxiliary.emotionDetail.understanding')}</Text>
          </View>
          <Text style={styles.sectionBody}>
            {empatheticSummary}
          </Text>
        </GlassCard>

        {/* Contextual Interpretation */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics-outline" size={20} color={accentGlow} />
            <Text style={styles.sectionTitle}>{t('auxiliary.emotionDetail.contextPatterns')}</Text>
          </View>
          <Text style={styles.sectionBody}>
            {contextualInterpretation}
          </Text>
        </GlassCard>

        {/* Actionable Suggestions */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb-outline" size={20} color={accentGlow} />
            <Text style={styles.sectionTitle}>{t('auxiliary.emotionDetail.whatMightHelp')}</Text>
          </View>
          {suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <View style={styles.suggestionBullet}>
                <View style={[styles.suggestionDot, { backgroundColor: accentGlow }]} />
              </View>
              <Text style={styles.suggestionText}>
                {suggestion}
              </Text>
            </View>
          ))}
        </GlassCard>

        {/* Related Entries */}
        {entries && entries.length > 0 && (
          <GlassCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="journal-outline" size={20} color={accentGlow} />
              <Text style={styles.sectionTitle}>
                {t('auxiliary.emotionDetail.recentEntries', { count: entries.length })}
              </Text>
            </View>
            {entries.slice(0, 5).map((entry, index) => (
              <TouchableOpacity
                key={entry.id || index}
                style={styles.entryItem}
                onPress={() => navigation.navigate('EntryDetail', { entry })}
              >
                <Text style={styles.entryDate}>
                  {formatDate(entry.created_at, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.entryTitle} numberOfLines={1}>
                  {entry.title || t('auxiliary.emotionDetail.untitled')}
                </Text>
                <Text style={styles.entrySnippet} numberOfLines={2}>
                  {entry.content}
                </Text>
              </TouchableOpacity>
            ))}
            
            {entries.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllEntriesBtn}
                onPress={() => navigation.navigate('Journal', { filterEmotion: emotion })}
              >
                <Text style={[styles.viewAllText, { color: accentGlow }]}>
                  {t('auxiliary.emotionDetail.viewAll', { count: entries.length })}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={accentGlow} />
              </TouchableOpacity>
            )}
          </GlassCard>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0B18',
  },
  emotionGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emotionHeaderCard: {
    marginBottom: 16,
  },
  emotionHeaderInner: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  emotionOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 2,
  },
  emotionOrbPct: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  emotionName: {
    fontSize: 28,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: 6,
    letterSpacing: -0.5,
    color: '#fff',
    textAlign: 'center',
  },
  emotionPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 14,
    padding: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.72)',
  },
  suggestionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  suggestionBullet: {
    paddingTop: 8,
    paddingRight: 12,
  },
  suggestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.72)',
  },
  entryItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  entryDate: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    color: 'rgba(255,255,255,0.45)',
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#fff',
  },
  entrySnippet: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.6)',
  },
  viewAllEntriesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
