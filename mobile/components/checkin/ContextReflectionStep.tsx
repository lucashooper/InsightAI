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
import { CONTEXT_DOING, CONTEXT_WHERE, CONTEXT_WHO, MOOD_TINTS } from './wordBanks';
import { addCustomTag, fetchCustomTags } from '../../services/checkInService';
import { TagCategory } from './types';
import { useLanguage } from '../../contexts/LanguageContext';

type Props = {
  onContinue: () => void;
};

type GroupConfig = {
  key: 'withWho' | 'whereAt' | 'doing';
  title: string;
  category: TagCategory;
  defaults: string[];
};
const wordKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_');

export default function ContextReflectionStep({ onContinue }: Props) {
  const { theme } = useTheme();
  const { t } = useLanguage();
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
  const groups: GroupConfig[] = [
    { key: 'withWho', title: t('checkIn.who'), category: 'who', defaults: CONTEXT_WHO },
    { key: 'whereAt', title: t('checkIn.where'), category: 'where', defaults: CONTEXT_WHERE },
    { key: 'doing', title: t('checkIn.doing'), category: 'doing', defaults: CONTEXT_DOING },
  ];

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
        <Text style={[styles.heading, { color: theme.colors.primaryText }]}>
          {t('checkIn.feelingPrefix', { mood: t(`checkIn.${draft.moodTier}`).toLowerCase() })}
        </Text>
      </View>
      <Text style={[styles.sub, { color: theme.colors.secondaryText }]}>
        {t('checkIn.reflectInfluences')}
      </Text>

      {groups.map((group) => {
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
                      {group.defaults.includes(tag) ? t(`checkIn.words.${wordKey(tag)}`) : tag}
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

      <PremiumButton label={t('checkIn.continue')} onPress={onContinue} style={styles.cta} />

      <Modal visible={!!addModal} transparent animationType="fade" onRequestClose={() => setAddModal(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAddModal(null)}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.colors.cardBackground }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: theme.colors.primaryText }]}>{t('checkIn.addOwn')}</Text>
            <TextInput
              value={newTag}
              onChangeText={setNewTag}
              placeholder={t('checkIn.customContextPlaceholder')}
              placeholderTextColor={theme.colors.tertiaryText}
              style={[styles.input, { color: theme.colors.primaryText, borderColor: theme.colors.border }]}
              autoFocus
            />
            <PremiumButton label={t('common.add')} onPress={handleAddTag} />
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
