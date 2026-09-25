import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import EffortLevelBadge from '../insights/EffortLevelBadge';
import { MacroPatternGroup } from '../../utils/patternGrouping';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

type Props = {
  group: MacroPatternGroup;
  expanded: boolean;
  onToggle: () => void;
  onOpenEntry: (entryId: string, highlight?: string) => void;
  onArchive: (summary: string) => void;
  patternEmojiForSummary: (summary: string) => string;
  isWorking: (summary: string) => boolean;
  onWorkingToggle: (summary: string) => void;
  showPatternMenu: (pattern: MacroPatternGroup['children'][0]) => void;
};

export default function MacroPatternGroupCard({
  group,
  expanded,
  onToggle,
  onOpenEntry,
  onArchive,
  patternEmojiForSummary,
  isWorking,
  onWorkingToggle,
  showPatternMenu,
}: Props) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const swipeRef = useRef<Swipeable>(null);
  const primaryChild = group.children[0];

  const renderArchiveAction = () => (
    <TouchableOpacity
      style={styles.archiveAction}
      onPress={() => {
        swipeRef.current?.close();
        onArchive(group.summary);
      }}
      activeOpacity={0.85}
    >
      <Ionicons name="archive-outline" size={20} color="#fff" />
      <Text style={styles.archiveText}>{t('dashboard.patternSwipeArchive')}</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderArchiveAction} overshootRight={false}>
      <View style={styles.wrap}>
        <TouchableOpacity onPress={onToggle} activeOpacity={0.75}>
          <GlassCard variant="nested" style={styles.card}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.summary, { color: theme.colors.primaryText }]}
                numberOfLines={expanded ? 2 : 1}
              >
                {patternEmojiForSummary(group.summary)} {group.summary}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {t('dashboard.patternMacroEntries', { count: group.entryCount })}
                </Text>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={theme.colors.secondaryText}
                />
              </View>
            </View>
            <EffortLevelBadge effortLevel={group.effortLevel} compact />
            {group.description ? (
              <Text
                style={[styles.description, { color: theme.colors.secondaryText }]}
                numberOfLines={expanded ? 4 : 2}
              >
                {group.description}
              </Text>
            ) : null}
          </GlassCard>
        </TouchableOpacity>

        {expanded &&
          group.children.map((child) => (
            <TouchableOpacity
              key={child.id}
              onPress={() => onOpenEntry(child.entryId, child.description || child.summary)}
              activeOpacity={0.7}
              style={styles.childWrap}
            >
              <GlassCard variant="nested" style={styles.childCard}>
                {child.description ? (
                  <Text style={[styles.childText, { color: theme.colors.secondaryText }]} numberOfLines={3}>
                    {child.description}
                  </Text>
                ) : null}
                {child.originLabel ? (
                  <Text style={[styles.origin, { color: theme.colors.tertiaryText }]} numberOfLines={1}>
                    {child.originLabel.includes('related entries')
                      ? t('dashboard.patternMentionedAcross', { count: child.count })
                      : t('dashboard.patternFrom', { label: child.originLabel })}
                  </Text>
                ) : null}
              </GlassCard>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.checkRow, isWorking(child.summary) && styles.checkRowActive]}
                  onPress={() => onWorkingToggle(child.summary)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: theme.colors.border },
                      isWorking(child.summary) && styles.checkboxActive,
                    ]}
                  >
                    {isWorking(child.summary) ? (
                      <Ionicons name="checkmark" size={14} color="#ffffff" />
                    ) : null}
                  </View>
                  <Text style={[styles.checkLabel, { color: theme.colors.secondaryText }]}>
                    {t('dashboard.patternWorkingOn')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => showPatternMenu(child)}
                  style={styles.menuBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.secondaryText} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

        {!expanded && primaryChild ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.checkRow, isWorking(primaryChild.summary) && styles.checkRowActive]}
              onPress={() => onWorkingToggle(primaryChild.summary)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: theme.colors.border },
                  isWorking(primaryChild.summary) && styles.checkboxActive,
                ]}
              >
                {isWorking(primaryChild.summary) ? (
                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                ) : null}
              </View>
              <Text style={[styles.checkLabel, { color: theme.colors.secondaryText }]}>
                {t('dashboard.patternWorkingOn')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => showPatternMenu(primaryChild)}
              style={styles.menuBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  card: {
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  summary: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  childWrap: {
    marginTop: 8,
    marginLeft: 8,
  },
  childCard: {
    marginBottom: 4,
  },
  childText: {
    fontSize: 13,
    lineHeight: 18,
  },
  origin: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  checkRowActive: {
    opacity: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  checkLabel: {
    fontSize: 13,
  },
  menuBtn: {
    padding: 6,
  },
  archiveAction: {
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    width: 96,
    borderRadius: 16,
    marginBottom: 12,
    gap: 4,
  },
  archiveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
