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

interface EmotionDetailRouteParams {
  emotion: string;
  percentage: number;
  entries: any[];
}

export default function EmotionDetailScreen() {
  const { theme } = useTheme();
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
        return 'This emotion has been your dominant state recently. You\'re maintaining emotional equilibrium, which can be both grounding and a sign of stability.';
      } else if (emotionLower.includes('hop') || emotionLower.includes('joy') || emotionLower.includes('excit')) {
        return 'This emotion has appeared often recently. You\'re experiencing a sustained period of positive energy — embrace it and notice what\'s contributing to it.';
      } else if (emotionLower.includes('anx') || emotionLower.includes('stress') || emotionLower.includes('worry')) {
        return 'This emotion has been showing up frequently. You\'re carrying tension that deserves attention and care. It\'s okay to feel this way.';
      } else if (emotionLower.includes('sad') || emotionLower.includes('down') || emotionLower.includes('lonely')) {
        return 'This emotion has been present in many of your entries. You\'re moving through a difficult period, and acknowledging this is an important step.';
      } else if (emotionLower.includes('frustrat') || emotionLower.includes('anger')) {
        return 'This emotion has appeared often recently. You\'re encountering obstacles or unmet needs — this frustration is information worth exploring.';
      } else if (emotionLower.includes('tired') || emotionLower.includes('exhaust')) {
        return 'This emotion has been recurring. Your energy reserves are depleted, and your body is asking for rest and restoration.';
      }
    } else if (percentage > 20) {
      return `This emotion appears in about ${percentage}% of your recent entries. It's a notable part of your emotional landscape, worth paying attention to.`;
    } else {
      return `This emotion shows up occasionally in your reflections. While not dominant, it's part of the fuller picture of how you're feeling.`;
    }
    
    return 'This emotion has appeared in your recent entries, forming part of your emotional experience.';
  };

  // Generate contextual interpretation
  const getContextualInterpretation = (emotion: string, entries: any[]): string => {
    const emotionLower = emotion.toLowerCase();
    
    // Analyze entry content for context
    const allContent = entries.map(e => (e.content || '').toLowerCase()).join(' ');
    
    const contexts: string[] = [];
    
    if (allContent.includes('work') || allContent.includes('job') || allContent.includes('project') || allContent.includes('meeting')) {
      contexts.push('work');
    }
    if (allContent.includes('sleep') || allContent.includes('tired') || allContent.includes('rest') || allContent.includes('wake')) {
      contexts.push('sleep patterns');
    }
    if (allContent.includes('friend') || allContent.includes('family') || allContent.includes('relationship') || allContent.includes('partner')) {
      contexts.push('relationships');
    }
    if (allContent.includes('routine') || allContent.includes('habit') || allContent.includes('schedule')) {
      contexts.push('daily routines');
    }
    
    if (contexts.length > 0) {
      return `This feeling often appears in entries mentioning ${contexts.join(', ')}. These areas of your life may be connected to this emotional pattern.`;
    }
    
    return 'Looking at your entries, this emotion appears across different aspects of your life.';
  };

  // Generate actionable suggestions
  const getActionableSuggestions = (emotion: string): string[] => {
    const emotionLower = emotion.toLowerCase();
    
    if (emotionLower.includes('anx') || emotionLower.includes('stress') || emotionLower.includes('worry')) {
      return [
        'Try a 5-minute breathing exercise when you notice this feeling arising',
        'Write down what you can control vs. what you can\'t',
        'Consider talking to someone you trust about what\'s weighing on you',
      ];
    } else if (emotionLower.includes('sad') || emotionLower.includes('down') || emotionLower.includes('lonely')) {
      return [
        'Reach out to a friend or loved one, even if it feels hard',
        'Allow yourself to feel this without judgment',
        'Do one small thing that usually brings you comfort',
      ];
    } else if (emotionLower.includes('frustrat') || emotionLower.includes('anger')) {
      return [
        'Identify what need isn\'t being met behind this frustration',
        'Take a physical break — walk, stretch, or move your body',
        'Express this feeling through writing or creative outlet',
      ];
    } else if (emotionLower.includes('tired') || emotionLower.includes('exhaust')) {
      return [
        'Prioritize sleep and rest over productivity for the next few days',
        'Say no to one non-essential commitment',
        'Check in with your energy levels throughout the day',
      ];
    } else if (emotionLower.includes('hop') || emotionLower.includes('joy') || emotionLower.includes('excit')) {
      return [
        'Notice what\'s contributing to this positive energy',
        'Share this feeling with someone close to you',
        'Consider how you can sustain this momentum',
      ];
    } else if (emotionLower.includes('neutral') || emotionLower.includes('calm')) {
      return [
        'Use this stable period to build healthy routines',
        'Reflect on what helps you maintain this balance',
        'Check in with yourself about any underlying feelings',
      ];
    }
    
    return [
      'Continue journaling to understand this emotion better',
      'Notice when this feeling tends to arise',
      'Be gentle with yourself as you explore this',
    ];
  };

  const empatheticSummary = getEmpatheticSummary(emotion, percentage);
  const contextualInterpretation = getContextualInterpretation(emotion, entries || []);
  const suggestions = getActionableSuggestions(emotion);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Theme Background Gradient */}
      <LinearGradient
        colors={theme.colors.backgroundGradient}
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
        <Text style={[styles.headerTitle, { color: theme.colors.primaryText }]}>Emotion Detail</Text>
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
            {emotion}
          </Text>
          <Text style={[styles.emotionPercentage, { color: theme.colors.secondaryText }]}>
            Seen in {percentage}% of your analyzed entries
          </Text>
        </View>

        {/* Empathetic Summary */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart-outline" size={20} color="#8b5cf6" />
            <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>Understanding this emotion</Text>
          </View>
          <Text style={[styles.sectionBody, { color: theme.colors.secondaryText }]}>
            {empatheticSummary}
          </Text>
        </View>

        {/* Contextual Interpretation */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics-outline" size={20} color="#8b5cf6" />
            <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>Context & patterns</Text>
          </View>
          <Text style={[styles.sectionBody, { color: theme.colors.secondaryText }]}>
            {contextualInterpretation}
          </Text>
        </View>

        {/* Actionable Suggestions */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb-outline" size={20} color="#8b5cf6" />
            <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>What might help</Text>
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
        </View>

        {/* Related Entries */}
        {entries && entries.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="journal-outline" size={20} color="#8b5cf6" />
              <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
                Recent entries ({entries.length})
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
                  {new Date(entry.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={[styles.entryTitle, { color: theme.colors.primaryText }]} numberOfLines={1}>
                  {entry.title || 'Untitled entry'}
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
                  View all {entries.length} entries
                </Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.accent} />
              </TouchableOpacity>
            )}
          </View>
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
    borderWidth: 1,
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
