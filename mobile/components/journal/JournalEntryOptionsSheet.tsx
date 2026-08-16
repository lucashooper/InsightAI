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

  const sheetBg = isDark ? 'rgba(22,22,28,0.98)' : '#FFFFFF';
  const titleColor = isDark ? theme.colors.primaryText : '#1a1a2e';
  const rowLabelColor = isDark ? theme.colors.primaryText : '#1a1a2e';
  const iconDefault = isDark ? '#c4b5fd' : '#7B5EA7';
  const titleBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const rowBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';

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
              backgroundColor: sheetBg,
              shadowOpacity: isDark ? 0.2 : 0.08,
            },
          ]}
        >
          <View style={[styles.titleBlock, { borderBottomColor: titleBorder }]}>
            <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          </View>
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.row,
                index < options.length - 1 && { borderBottomWidth: 1, borderBottomColor: rowBorder },
              ]}
              onPress={() => {
                onSelect(option.key);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={option.icon}
                size={22}
                color={option.destructive ? '#DC2626' : iconDefault}
              />
              <Text
                style={[
                  styles.rowLabel,
                  { color: option.destructive ? '#DC2626' : rowLabelColor },
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
    paddingHorizontal: 0,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 20,
    elevation: 12,
  },
  titleBlock: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: sf(17),
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rowLabel: {
    fontSize: sf(16),
    fontWeight: '500',
    marginLeft: 14,
    flex: 1,
  },
});
