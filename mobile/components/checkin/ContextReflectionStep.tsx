import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { isDarkTheme, useTheme } from '../../contexts/ThemeContext';
import { useCheckInFlow } from './CheckInFlowProvider';
import PremiumButton from '../shared/PremiumButton';
import PremiumGradientText from '../shared/PremiumGradientText';
import { CONTEXT_DOING, CONTEXT_WHERE, CONTEXT_WHO, MOOD_TINTS } from './wordBanks';
import { addCustomTag, fetchCustomTags } from '../../services/checkInService';
import { TagCategory } from './types';

type Props = {
  onContinue: () => void;
};

type GroupConfig = {
  key: 'withWho' | 'whereAt' | 'doing';
  title: string;
  category: TagCategory;
  defaults: string[];
};

const GROUPS: GroupConfig[] = [
  { key: 'withWho', title: 'Who are you with?', category: 'who', defaults: CONTEXT_WHO },
  { key: 'whereAt', title: 'Where are you?', category: 'where', defaults: CONTEXT_WHERE },
  { key: 'doing', title: 'What are you doing?', category: 'doing', defaults: CONTEXT_DOING },
];

export default function ContextReflectionStep({ onContinue }: Props) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { draft, toggleContextTag } = useCheckInFlow();
  const tint = MOOD_TINTS[draft.moodTier];
  const isDark = isDarkTheme(theme.name);
  const unselectedBackground = isDark ? theme.colors.surface : 'rgba(255,255,255,0.62)';

  const [customTags, setCustomTags] = useState<Record<TagCategory, string[]>>({
    who: [],
    where: [],
    doing: [],
  });
  const [addModal, setAddModal] = useState<{ category: TagCategory; group: GroupConfig['key'] } | null>(null);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const [who, where, doing] = await Promise.all([
        fetchCustomTags(user.id, 'who'),
        fetchCustomTags(user.id, 'where'),
        fetchCustomTags(user.id, 'doing'),
      ]);
      setCustomTags({ who, where, doing });
    })();
  }, [user?.id]);

  const handleAddTag = async () => {
    if (!addModal || !user?.id || !newTag.trim()) return;
    await addCustomTag(user.id, addModal.category, newTag.trim());
    setCustomTags((prev) => ({
      ...prev,
      [addModal.category]: [newTag.trim(), ...prev[addModal.category].filter((t) => t !== newTag.trim())],
    }));
    toggleContextTag(addModal.group, newTag.trim());
    setNewTag('');
    setAddModal(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headingRow}>
        <Text style={[styles.heading, { color: theme.colors.primaryText }]}>I'm feeling </Text>
        <PremiumGradientText variant="accent" style={styles.accentWord}>
          {draft.moodLabel.toLowerCase()}
        </PremiumGradientText>
      </View>
      <Text style={[styles.sub, { color: theme.colors.secondaryText }]}>
        Reflect on what influences you
      </Text>

      {GROUPS.map((group) => {
        const tags = [...group.defaults, ...customTags[group.category]];
        const selected = draft[group.key];
        return (
          <View key={group.key} style={styles.group}>
            <Text style={[styles.groupTitle, { color: theme.colors.primaryText }]}>{group.title}</Text>
            <View style={styles.grid}>
              {tags.map((tag) => {
                const isOn = selected.includes(tag);
                return (
                  <TouchableOpacity
                    key={`${group.key}-${tag}`}
                    style={[
                      styles.chip,
                      {
                        borderColor: isOn ? tint.accent : theme.colors.border,
                        backgroundColor: isOn ? tint.chip : unselectedBackground,
                      },
                    ]}
                    onPress={() => toggleContextTag(group.key, tag)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isOn ? (isDark ? '#FFFFFF' : theme.colors.primaryText) : theme.colors.secondaryText },
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[styles.addChip, { borderColor: theme.colors.border, backgroundColor: unselectedBackground }]}
                onPress={() => setAddModal({ category: group.category, group: group.key })}
              >
                <Ionicons name="add" size={18} color={theme.colors.secondaryText} />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <PremiumButton label="Continue" onPress={onContinue} style={styles.cta} />

      <Modal visible={!!addModal} transparent animationType="fade" onRequestClose={() => setAddModal(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAddModal(null)}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.colors.cardBackground }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: theme.colors.primaryText }]}>Add your own</Text>
            <TextInput
              value={newTag}
              onChangeText={setNewTag}
              placeholder="e.g. Gym, Mum's house"
              placeholderTextColor={theme.colors.tertiaryText}
              style={[styles.input, { color: theme.colors.primaryText, borderColor: theme.colors.border }]}
              autoFocus
            />
            <PremiumButton label="Add" onPress={handleAddTag} />
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  headingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 6,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
  },
  accentWord: { fontSize: 22, fontWeight: '700' },
  sub: { fontSize: 14, marginBottom: 22 },
  group: { marginBottom: 22 },
  groupTitle: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  addChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: { marginTop: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
});
