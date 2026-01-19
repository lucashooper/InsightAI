import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { mobileAiService } from '../services/mobileAiService';
import { useTheme } from '../contexts/ThemeContext';

export default function EntryDetailScreenNew({ route, navigation }: any) {
  const { entry: initialEntry, entryId, shouldAnalyze } = route.params || {};
  const { theme } = useTheme();
  const [analyzing, setAnalyzing] = useState(false);
  const [entry, setEntry] = useState<any>(initialEntry || null);
  const [editableContent, setEditableContent] = useState(initialEntry?.content || '');
  const [editableTitle, setEditableTitle] = useState(initialEntry?.title || '');
  const [isModified, setIsModified] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialEntry) {
      setEntry(initialEntry);
      setEditableContent(initialEntry.content || '');
      setEditableTitle(initialEntry.title || '');
      
      if (shouldAnalyze && !initialEntry.ai_structured_insights) {
        handleAnalyzeEntry(initialEntry);
      }
    } else if (entryId) {
      loadEntry();
    }
  }, [entryId, initialEntry]);

  const loadEntry = async () => {
    if (!entryId) return;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', entryId)
        .single();
      
      if (!error && data) {
        setEntry(data);
        setEditableContent(data.content || '');
        setEditableTitle(data.title || '');
        
        if (shouldAnalyze && !data.ai_structured_insights) {
          handleAnalyzeEntry(data);
        }
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    }
  };

  useEffect(() => {
    if (!entry) return;
    const hasChanged = editableContent !== entry?.content || editableTitle !== entry?.title;
    setIsModified(hasChanged);
  }, [editableContent, editableTitle, entry]);

  useEffect(() => {
    if (!isModified || !entry) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('notes')
          .update({
            title: editableTitle.trim() || 'Untitled Entry',
            content: editableContent.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', entry.id);

        if (!error) {
          entry.title = editableTitle.trim() || 'Untitled Entry';
          entry.content = editableContent.trim();
          setIsModified(false);
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editableContent, editableTitle, isModified]);

  const handleAnalyzeEntry = async (entryData?: any) => {
    const targetEntry = entryData || entry;
    if (!targetEntry?.content || analyzing) return;

    try {
      setAnalyzing(true);
      const analysis = await mobileAiService.analyzeEntry(targetEntry.content);

      const { error } = await supabase
        .from('notes')
        .update({
          ai_insights: analysis,
          ai_structured_insights: analysis,
          ai_last_analyzed: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetEntry.id);

      if (error) {
        Alert.alert('Analysis failed', 'Unable to save AI insights.');
        return;
      }

      targetEntry.ai_structured_insights = analysis;
      targetEntry.ai_last_analyzed = new Date().toISOString();
      setEntry({ ...targetEntry });
    } catch (err) {
      Alert.alert('Analysis failed', 'Something went wrong while analyzing this entry.');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!entry) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
        </View>
        <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 100 }} />
      </View>
    );
  }

  const structuredInsights = entry.ai_structured_insights || null;
  const moodAnalysis = structuredInsights?.mood_analysis || null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          {!structuredInsights && (
            <TouchableOpacity 
              onPress={() => handleAnalyzeEntry()}
              disabled={analyzing}
              style={[
                styles.analyzeHeaderButton,
                (!entry?.content || analyzing) && styles.analyzeHeaderButtonDisabled
              ]}
            >
              {analyzing ? (
                <ActivityIndicator size="small" color="#a78bfa" />
              ) : (
                <Text style={[
                  styles.analyzeHeaderText,
                  !entry?.content && styles.analyzeHeaderTextDisabled
                ]}>
                  Analyze
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.entryContainer}>
          <TextInput
            style={styles.titleInput}
            value={editableTitle}
            onChangeText={setEditableTitle}
            placeholder="Untitled Entry"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            autoFocus={false}
          />
          <Text style={styles.metaLine}>
            {formatDate(entry.created_at)}
          </Text>
          <TextInput
            style={styles.contentInput}
            value={editableContent}
            onChangeText={setEditableContent}
            multiline
            textAlignVertical="top"
            placeholder="What's on your mind?"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            autoFocus={false}
          />
          
          {structuredInsights && (
            <View style={styles.inlineInsightsSection}>
              <View style={styles.insightsDivider} />
              <Text style={styles.inlineInsightsTitle}>Insights</Text>
              
              {structuredInsights?.insights_report?.conversationalSummary && (
                <View style={styles.inlineBriefingCard}>
                  <Text style={styles.inlineBriefingText}>
                    {structuredInsights.insights_report.conversationalSummary
                      .replace(/The user/g, 'You')
                      .replace(/the user/g, 'you')}
                  </Text>
                </View>
              )}
              
              {moodAnalysis && (
                <View style={styles.inlineMoodCard}>
                  <Text style={styles.inlineMoodLabel}>Primary Emotion</Text>
                  <Text style={styles.inlineMoodEmotion}>{moodAnalysis.primary_emotion}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analyzeHeaderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    minWidth: 80,
    alignItems: 'center',
  },
  analyzeHeaderButtonDisabled: {
    opacity: 0.3,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  analyzeHeaderText: {
    color: '#a78bfa',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeHeaderTextDisabled: {
    color: 'rgba(139, 92, 246, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  entryContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 12,
    padding: 0,
  },
  metaLine: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 24,
  },
  contentInput: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 26,
    minHeight: 200,
    padding: 0,
  },
  inlineInsightsSection: {
    marginTop: 16,
    paddingTop: 16,
  },
  insightsDivider: {
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    marginBottom: 20,
  },
  inlineInsightsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(139, 92, 246, 0.95)',
    marginBottom: 16,
  },
  inlineBriefingCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  inlineBriefingText: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 26,
  },
  inlineMoodCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  inlineMoodLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(139, 92, 246, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  inlineMoodEmotion: {
    fontSize: 26,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.98)',
    textTransform: 'capitalize',
  },
});
