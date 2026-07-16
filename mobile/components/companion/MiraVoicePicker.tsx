import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { sf } from '../../utils/responsive';
import {
  DeviceVoiceOption,
  MiraVoiceSelection,
  getDeviceVoiceOptions,
  getElevenLabsDebugInfo,
  getElevenLabsVoiceOptions,
  isElevenLabsAvailable,
  loadMiraVoiceSelection,
  saveMiraVoiceSelection,
} from '../../services/miraVoiceService';
import { ELEVENLABS_FEATURED_VOICES, verifyElevenLabsConnection } from '../../services/elevenLabsVoiceService';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelected?: (selection: MiraVoiceSelection) => void;
};

export default function MiraVoicePicker({ visible, onClose, onSelected }: Props) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deviceVoices, setDeviceVoices] = useState<DeviceVoiceOption[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const elevenAvailable = useMemo(() => (visible ? isElevenLabsAvailable() : false), [visible]);
  const debugInfo = useMemo(() => (visible ? getElevenLabsDebugInfo() : null), [visible]);
  const elevenVoices = getElevenLabsVoiceOptions();

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setConnectionStatus(null);

    Promise.all([
      getDeviceVoiceOptions(),
      loadMiraVoiceSelection(),
      elevenAvailable ? verifyElevenLabsConnection() : Promise.resolve({ ok: false, message: 'No API key' }),
    ])
      .then(([devices, saved, connection]) => {
        setDeviceVoices(devices);
        if (saved) setSelectedId(`${saved.source}:${saved.id}`);
        setConnectionStatus(connection.ok ? 'Connected' : connection.message);
        console.log('[MiraVoicePicker] Opened', { debugInfo, connection });
      })
      .finally(() => setLoading(false));
  }, [visible, elevenAvailable]);

  const handleSelect = async (source: 'device' | 'elevenlabs', id: string, label: string) => {
    if (source === 'elevenlabs' && !elevenAvailable) return;
    const selection: MiraVoiceSelection = { source, id, label };
    setSelectedId(`${source}:${id}`);
    await saveMiraVoiceSelection(selection);
    console.log('[MiraVoicePicker] Selected voice', selection);
    onSelected?.(selection);
    onClose();
  };

  const renderTierBadge = (tier?: 'free' | 'paid') => {
    if (!tier) return null;
    const isFree = tier === 'free';
    return (
      <View style={[styles.tierBadge, isFree ? styles.tierFree : styles.tierPaid]}>
        <Text style={styles.tierBadgeText}>
          {isFree ? t('companion.voiceFreeBadge') : t('companion.voicePaidBadge')}
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('companion.voicePickerTitle')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#a78bfa" style={{ marginVertical: 24 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {elevenAvailable && connectionStatus && debugInfo && (
                <Text style={styles.connectionText}>
                  ElevenLabs: {connectionStatus} · key {debugInfo.keyPreview}
                </Text>
              )}

              <Text style={styles.sectionLabel}>{t('companion.voiceCharacter')}</Text>
              {!elevenAvailable && (
                <View style={styles.hintBox}>
                  <Text style={styles.hintTitle}>{t('companion.voiceElevenHintTitle')}</Text>
                  <Text style={styles.hintText}>{t('companion.voiceElevenRestart')}</Text>
                </View>
              )}
              {ELEVENLABS_FEATURED_VOICES.map((v) => {
                const key = `elevenlabs:${v.id}`;
                const active = selectedId === key;
                const disabled = !elevenAvailable;
                return (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.option,
                      styles.optionFeatured,
                      active && styles.optionActive,
                      disabled && styles.optionDisabled,
                    ]}
                    onPress={() => handleSelect('elevenlabs', v.id, v.label)}
                    disabled={disabled}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={styles.labelRow}>
                        <Text style={[styles.optionLabel, disabled && styles.optionLabelDisabled]}>{v.label}</Text>
                        {renderTierBadge(v.tier)}
                      </View>
                      <Text style={styles.optionDesc}>{v.style}</Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={20} color="#ef4444" />}
                  </TouchableOpacity>
                );
              })}

              {elevenAvailable && (
                <>
                  <Text style={styles.sectionLabel}>{t('companion.voicePremium')}</Text>
                  {elevenVoices
                    .filter((v) => !ELEVENLABS_FEATURED_VOICES.some((f) => f.id === v.id))
                    .map((v) => {
                      const key = `elevenlabs:${v.id}`;
                      const active = selectedId === key;
                      return (
                        <TouchableOpacity
                          key={v.id}
                          style={[styles.option, active && styles.optionActive]}
                          onPress={() => handleSelect('elevenlabs', v.id, v.label)}
                        >
                          <View style={{ flex: 1 }}>
                            <View style={styles.labelRow}>
                              <Text style={styles.optionLabel}>{v.label}</Text>
                              {renderTierBadge(v.tier)}
                            </View>
                            <Text style={styles.optionDesc}>{v.style}</Text>
                          </View>
                          {active && <Ionicons name="checkmark-circle" size={20} color="#a78bfa" />}
                        </TouchableOpacity>
                      );
                    })}
                </>
              )}

              <Text style={styles.sectionLabel}>{t('companion.voiceDevice')}</Text>
              {deviceVoices.map((v) => {
                const key = `device:${v.id}`;
                const active = selectedId === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => handleSelect('device', v.id, v.label)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionLabel}>{v.label}</Text>
                      <Text style={styles.optionDesc}>{v.gender} · {v.language}</Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={20} color="#a78bfa" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '78%',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  title: { color: '#fff', fontSize: sf(18), fontWeight: '700' },
  connectionText: {
    color: 'rgba(167,139,250,0.85)',
    fontSize: sf(11),
    marginBottom: 8,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: sf(11),
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  optionActive: { borderColor: 'rgba(167,139,250,0.5)', backgroundColor: 'rgba(139,92,246,0.12)' },
  optionFeatured: { borderColor: 'rgba(239,68,68,0.25)', backgroundColor: 'rgba(239,68,68,0.06)' },
  optionDisabled: { opacity: 0.45 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  optionLabel: { color: '#fff', fontSize: sf(15), fontWeight: '600' },
  optionLabelDisabled: { color: 'rgba(255,255,255,0.55)' },
  optionDesc: { color: 'rgba(255,255,255,0.4)', fontSize: sf(12), marginTop: 2 },
  tierBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tierFree: { backgroundColor: 'rgba(34,197,94,0.2)' },
  tierPaid: { backgroundColor: 'rgba(239,68,68,0.2)' },
  tierBadgeText: { color: '#fff', fontSize: sf(9), fontWeight: '700', letterSpacing: 0.5 },
  hintBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
    marginBottom: 12,
  },
  hintTitle: { color: '#e9d5ff', fontSize: sf(14), fontWeight: '600', marginBottom: 4 },
  hintText: { color: 'rgba(255,255,255,0.55)', fontSize: sf(12), lineHeight: 18 },
});
