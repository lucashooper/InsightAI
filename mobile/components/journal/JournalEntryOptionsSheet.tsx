import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isDarkTheme, useTheme } from '../../contexts/ThemeContext';
import { sf } from '../../utils/responsive';

export type JournalEntryOption = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  title: string;
  options: JournalEntryOption[];
  onSelect: (key: string) => void;
  onClose: () => void;
};

export default function JournalEntryOptionsSheet({ visible, title, options, onSelect, onClose }: Props) {
  const { theme } = useTheme();
  const isDark = isDarkTheme(theme.name);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
        )}
      </Pressable>

      <View style={[styles.sheetWrap, { paddingBottom: Math.max(insets.bottom, 16) }]} pointerEvents="box-none">
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: isDark ? 'rgba(22,22,28,0.98)' : 'rgba(255,255,255,0.98)',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(139,92,246,0.15)',
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.primaryText }]}>{title}</Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.row,
                { borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
              ]}
              onPress={() => {
                onSelect(option.key);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={option.destructive ? '#ef4444' : isDark ? '#c4b5fd' : '#7c3aed'}
              />
              <Text
                style={[
                  styles.rowLabel,
                  { color: option.destructive ? '#ef4444' : theme.colors.primaryText },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  sheet: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: sf(17),
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: sf(16),
    fontWeight: '500',
  },
});
