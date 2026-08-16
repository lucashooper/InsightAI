import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type Action = {
  id: string;
  emoji: string;
  label: string;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  bottomOffset: number;
  isDark?: boolean;
  onClose: () => void;
  actions: Action[];
};

export default function EntryQuickActionsMenu({
  visible,
  bottomOffset,
  isDark = true,
  onClose,
  actions,
}: Props) {
  const handleSelect = (action: Action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => action.onPress(), 80);
  };

  const sheetBottom = Math.max(bottomOffset + 72, 100);
  const cardBg = isDark ? 'rgba(18, 16, 28, 0.94)' : 'rgba(255, 255, 255, 0.96)';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const labelColor = isDark ? 'rgba(255, 255, 255, 0.94)' : '#1a1a2e';
  const chevronColor = isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[styles.sheet, { paddingBottom: sheetBottom }]}
          pointerEvents="box-none"
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={[styles.panel, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              {Platform.OS === 'ios' ? (
                <BlurView intensity={28} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              ) : null}
              <View style={styles.list}>
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.row,
                      index < actions.length - 1 && styles.rowDivider,
                      { borderBottomColor: cardBorder },
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handleSelect(action)}
                  >
                    <Text style={styles.emoji}>{action.emoji}</Text>
                    <Text style={[styles.label, { color: labelColor }]}>{action.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color={chevronColor} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  panel: {
    width: 280,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    ...(Platform.OS === 'android' ? { elevation: 12 } : {}),
  },
  list: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  emoji: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
});
