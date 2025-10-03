// Keyword Highlighting Service
// Detects recurring patterns and themes across diary entries for contextual inline insights

import type { DiaryEntry } from '../types/diary';

export interface DetectedPattern {
  keyword: string;
  category: 'health' | 'emotional' | 'behavioral';
  frequency: number;
  lastMentioned: string; // ISO date
  color: string; // For styling
  contexts: string[]; // Brief snippets where it appears
}

export interface HighlightMatch {
  text: string;
  pattern: DetectedPattern;
  startIndex: number;
  endIndex: number;
}

class KeywordHighlightService {
  // Pattern keywords organized by category
  private readonly patternKeywords = {
    health: [
      'sleep', 'slept', 'sleeping', 'tired', 'fatigue', 'exhausted', 'energy',
      'pain', 'ache', 'headache', 'migraine', 'sore',
      'sick', 'ill', 'unwell', 'dizzy', 'nauseous'
    ],
    emotional: [
      'anxiety', 'anxious', 'worried', 'worry', 'stress', 'stressed', 'overwhelmed',
      'sad', 'sadness', 'depressed', 'depression', 'lonely', 'loneliness',
      'angry', 'anger', 'frustrated', 'frustration', 'irritated',
      'happy', 'joy', 'excited', 'content', 'grateful', 'thankful'
    ],
    behavioral: [
      'caffeine', 'coffee', 'tea', 'energy drink',
      'exercise', 'workout', 'run', 'running', 'gym', 'walk', 'walking',
      'meditation', 'meditate', 'mindfulness', 'breathing',
      'therapy', 'therapist', 'counseling',
      'journal', 'writing', 'talked', 'reached out'
    ]
  };

  // Color scheme for different categories (subtle amber/blue)
  private readonly categoryColors = {
    health: '#F59E0B',      // Amber for health
    emotional: '#3B82F6',   // Blue for emotional
    behavioral: '#10B981'   // Green for positive behaviors
  };

  /**
   * Analyze all entries to detect recurring patterns
   * Returns top 2-4 most significant patterns
   */
  detectPatterns(entries: DiaryEntry[]): DetectedPattern[] {
    const patternMap = new Map<string, {
      category: 'health' | 'emotional' | 'behavioral';
      count: number;
      lastDate: string;
      contexts: string[];
    }>();

    // Analyze each entry
    entries.forEach(entry => {
      const content = entry.content.toLowerCase();
      const entryDate = entry.timestamp || entry.date || entry.created_at;

      // Check each category of keywords
      Object.entries(this.patternKeywords).forEach(([category, keywords]) => {
        keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
          const matches = content.match(regex);

          if (matches && matches.length > 0) {
            const baseKeyword = keyword;
            const existing = patternMap.get(baseKeyword);

            if (existing) {
              existing.count += matches.length;
              // Update last date if this entry is more recent
              if (entryDate && new Date(entryDate) > new Date(existing.lastDate)) {
                existing.lastDate = entryDate;
              }
              // Add context snippet (first 60 chars around match)
              const matchIndex = content.indexOf(matches[0].toLowerCase());
              const contextStart = Math.max(0, matchIndex - 30);
              const contextEnd = Math.min(content.length, matchIndex + 30);
              const context = content.substring(contextStart, contextEnd).trim();
              if (existing.contexts.length < 3) {
                existing.contexts.push(`...${context}...`);
              }
            } else {
              const matchIndex = content.indexOf(matches[0].toLowerCase());
              const contextStart = Math.max(0, matchIndex - 30);
              const contextEnd = Math.min(content.length, matchIndex + 30);
              const context = content.substring(contextStart, contextEnd).trim();

              patternMap.set(baseKeyword, {
                category: category as 'health' | 'emotional' | 'behavioral',
                count: matches.length,
                lastDate: entryDate || new Date().toISOString(),
                contexts: [`...${context}...`]
              });
            }
          }
        });
      });
    });

    // Convert to array and sort by frequency
    const patterns: DetectedPattern[] = Array.from(patternMap.entries())
      .map(([keyword, data]) => ({
        keyword,
        category: data.category,
        frequency: data.count,
        lastMentioned: data.lastDate,
        color: this.categoryColors[data.category],
        contexts: data.contexts
      }))
      .sort((a, b) => b.frequency - a.frequency);

    // Return top 2-4 most significant patterns (with minimum frequency of 2)
    return patterns.filter(p => p.frequency >= 2).slice(0, 4);
  }

  /**
   * Find matches in a specific entry's content
   * Returns array of matches with positions for highlighting
   */
  findMatchesInText(content: string, patterns: DetectedPattern[]): HighlightMatch[] {
    const matches: HighlightMatch[] = [];

    patterns.forEach(pattern => {
      // Create regex for the keyword and its variations
      const regex = new RegExp(`\\b${pattern.keyword}\\w*\\b`, 'gi');
      let match;

      while ((match = regex.exec(content)) !== null) {
        matches.push({
          text: match[0],
          pattern: pattern,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      }
    });

    // Sort by start index
    return matches.sort((a, b) => a.startIndex - b.startIndex);
  }

  /**
   * Format date for display in tooltips
   */
  formatDateForTooltip(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /**
   * Generate tooltip content for a pattern
   */
  generateTooltipContent(pattern: DetectedPattern): {
    title: string;
    subtitle: string;
    link?: string;
  } {
    const timeAgo = this.formatDateForTooltip(pattern.lastMentioned);
    
    return {
      title: `Mentioned ${pattern.frequency} time${pattern.frequency > 1 ? 's' : ''} this month`,
      subtitle: `Last mentioned ${timeAgo}`,
      link: pattern.frequency >= 3 ? 'See full pattern analysis →' : undefined
    };
  }
}

export const keywordHighlightService = new KeywordHighlightService();
