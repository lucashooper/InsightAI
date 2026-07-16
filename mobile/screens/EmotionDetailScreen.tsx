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
import { useLanguage } from '../contexts/LanguageContext';
import { translateEmotion } from '../i18n/labels';

interface EmotionDetailRouteParams {
  emotion: string;
  percentage: number;
  entries: any[];
}

export default function EmotionDetailScreen() {
  const { theme } = useTheme();
  const { t, formatDate } = useLanguage();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as EmotionDetailRouteParams;
  
  const { emotion, percentage, entries } = params;
  
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Theme Background Gradient */}
      <LinearGradient
        colors={theme.colors.backgroundGradient as any}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            console.log('[EmotionDetail] Back pressed');
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.primaryText }]}>{t('auxiliary.emotionDetail.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Emotion Header */}
        <View style={styles.emotionHeader}>
          <Text style={[styles.emotionName, { color: theme.colors.primaryText }]}>
            {translateEmotion(t, emotion)}
          </Text>
          <Text style={[styles.emotionPercentage, { color: theme.colors.secondaryText }]}>
            {t('auxiliary.emotionDetail.seenIn', { percentage })}
          </Text>
        </View>

        {/* Empathetic Summary */}
        <StandardContainer style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart-outline" size={20} color="#8b5cf6" />
            <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>{t('auxiliary.emotionDetail.understanding')}</Text>
          </View>
          <Text style={[styles.sectionBody, { color: theme.colors.secondaryText }]}>
            {empatheticSummary}
          </Text>
        </StandardContainer>

        {/* Contextual Interpretation */}
        <StandardContainer style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics-outline" size={20} color="#8b5cf6" />
            <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>{t('auxiliary.emotionDetail.contextPatterns')}</Text>
          </View>
          <Text style={[styles.sectionBody, { color: theme.colors.secondaryText }]}>
            {contextualInterpretation}
          </Text>
        </StandardContainer>

        {/* Actionable Suggestions */}
        <StandardContainer style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb-outline" size={20} color="#8b5cf6" />
            <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>{t('auxiliary.emotionDetail.whatMightHelp')}</Text>
          </View>
          {suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <View style={styles.suggestionBullet}>
                <View style={[styles.suggestionDot, { backgroundColor: theme.colors.accent }]} />
              </View>
              <Text style={[styles.suggestionText, { color: theme.colors.secondaryText }]}>
                {suggestion}
              </Text>
            </View>
          ))}
        </StandardContainer>

        {/* Related Entries */}
        {entries && entries.length > 0 && (
          <StandardContainer style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="journal-outline" size={20} color="#8b5cf6" />
              <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
                {t('auxiliary.emotionDetail.recentEntries', { count: entries.length })}
              </Text>
            </View>
            {entries.slice(0, 5).map((entry, index) => (
              <TouchableOpacity
                key={entry.id || index}
                style={[styles.entryItem, { borderBottomColor: theme.colors.border }]}
                onPress={() => {
                  console.log('[EmotionDetail] Entry tapped:', entry.id);
                  navigation.navigate('EntryDetail', { entry });
                }}
              >
                <Text style={[styles.entryDate, { color: theme.colors.secondaryText }]}>
                  {formatDate(entry.created_at, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={[styles.entryTitle, { color: theme.colors.primaryText }]} numberOfLines={1}>
                  {entry.title || t('auxiliary.emotionDetail.untitled')}
                </Text>
                <Text style={[styles.entrySnippet, { color: theme.colors.secondaryText }]} numberOfLines={2}>
                  {entry.content}
                </Text>
              </TouchableOpacity>
            ))}
            
            {entries.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => {
                  console.log('[EmotionDetail] View all entries tapped');
                  navigation.navigate('Journal', { filterEmotion: emotion });
                }}
              >
                <Text style={[styles.viewAllText, { color: theme.colors.accent }]}>
                  {t('auxiliary.emotionDetail.viewAll', { count: entries.length })}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.accent} />
              </TouchableOpacity>
            )}
          </StandardContainer>
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
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
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
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  emotionHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  emotionName: {
    fontSize: 36,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emotionPercentage: {
    fontSize: 15,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
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
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 24,
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
  },
  entryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  entrySnippet: {
    fontSize: 14,
    lineHeight: 20,
  },
  viewAllButton: {
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
