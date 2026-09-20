import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  VENT_TONE_EMOJI,
  VENT_TONE_LABELS,
  VENT_TONE_MODES,
  type VoiceToneMode,
} from '../../constants/ventVoice';

type Props = {
  tone: VoiceToneMode;
  onChange: (tone: VoiceToneMode) => void;
  t: (key: string) => string;
};

export default function VentTonePicker({ tone, onChange, t }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={styles.pill} onPress={() => setOpen(true)}>
        <Text style={styles.pillEmoji}>{VENT_TONE_EMOJI[tone]}</Text>
        <Text style={styles.pillLabel} numberOfLines={1}>
          {t(`vent.tone.${tone}`) || VENT_TONE_LABELS[tone]}
        </Text>
        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.55)" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t('vent.toneTitle')}</Text>
            <ScrollView bounces={false}>
              {VENT_TONE_MODES.map((mode) => {
                const selected = mode === tone;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.option, selected && styles.optionSelected]}
                    activeOpacity={0.8}
                    onPress={() => {
                      onChange(mode);
                      setOpen(false);
                    }}
                  >
                    <Text style={styles.optionEmoji}>{VENT_TONE_EMOJI[mode]}</Text>
                    <View style={styles.optionTextWrap}>
                      <Text style={styles.optionLabel}>
                        {t(`vent.tone.${mode}`) || VENT_TONE_LABELS[mode]}
                      </Text>
                    </View>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={20} color="#A78BFA" />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    maxWidth: 220,
  },
  pillEmoji: { fontSize: 14 },
  pillLabel: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#16161D',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 18,
    paddingBottom: 28,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
  },
  optionSelected: {
    backgroundColor: 'rgba(139,92,246,0.16)',
  },
  optionEmoji: { fontSize: 20 },
  optionTextWrap: { flex: 1 },
  optionLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
