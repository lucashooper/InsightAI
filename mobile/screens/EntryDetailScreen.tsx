import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export default function EntryDetailScreen({ route, navigation }: any) {
  const { entry } = route.params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.entryContainer}>
          <Text style={styles.title}>{entry.title || 'Untitled Entry'}</Text>
          <Text style={styles.date}>{formatDate(entry.created_at)}</Text>
          
          {entry.mood_score && (
            <View style={styles.moodContainer}>
              <Text style={styles.moodLabel}>Mood:</Text>
              <Text style={styles.moodValue}>{entry.mood_score}/10</Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.content}>{entry.content}</Text>

          {entry.ai_insights && (
            <>
              <View style={styles.divider} />
              <View style={styles.insightsContainer}>
                <Text style={styles.insightsTitle}>💡 AI Insights</Text>
                <Text style={styles.insightsText}>
                  {JSON.stringify(entry.ai_insights, null, 2)}
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  entryContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodLabel: {
    fontSize: 14,
    color: '#999',
    marginRight: 8,
  },
  moodValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginVertical: 20,
  },
  content: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
  },
  insightsContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
    marginBottom: 12,
  },
  insightsText: {
    fontSize: 14,
    color: '#c0c0c0',
    lineHeight: 20,
  },
});
