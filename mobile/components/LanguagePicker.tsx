import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { isDarkTheme, useTheme } from '../contexts/ThemeContext';
import { LANGUAGES } from '../i18n/languages';
import { AppLanguage } from '../i18n/types';

type Props = {
  /** Compact pill for onboarding top-right */
  variant?: 'pill' | 'row';
};

export default function LanguagePicker({ variant = 'pill' }: Props) {
  const { language, setLanguage, t } = useLanguage();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const dark = isDarkTheme(theme.name);
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  const handleSelect = async (code: AppLanguage) => {
    await setLanguage(code);
    setOpen(false);
  };

  return (
    <>
      {variant === 'pill' ? (
        <TouchableOpacity
          style={styles.pill}
          onPress={() => setOpen(true)}
          activeOpacity={0.8}
          accessibilityLabel={t('language.selectTitle')}
        >
          <Text style={styles.pillFlag}>{current.flag}</Text>
          <Text style={styles.pillCode}>{current.code.toUpperCase()}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.rowTrigger} onPress={() => setOpen(true)} activeOpacity={0.7}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowFlag}>{current.flag}</Text>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowLabel, { color: theme.colors.primaryText }]}>{t('language.settingLabel')}</Text>
              <Text
                style={[styles.rowValue, { color: theme.colors.secondaryText }]}
                numberOfLines={2}
              >
                {current.nativeLabel} · {t('language.settingDescription')}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.secondaryText} />
        </TouchableOpacity>
      )}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.scrim} onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, 20),
                backgroundColor: dark ? '#111114' : '#FFFFFF',
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.handle, { backgroundColor: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }]} />
            <View style={[styles.sheetHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.sheetTitle, { color: theme.colors.primaryText }]}>{t('language.selectTitle')}</Text>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: theme.colors.surface }]}
                onPress={() => setOpen(false)}
              >
                <Ionicons name="close" size={18} color={theme.colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {LANGUAGES.map((item, index) => {
                const selected = item.code === language;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.languageRow,
                      index < LANGUAGES.length - 1 && styles.languageRowBorder,
                      index < LANGUAGES.length - 1 && { borderBottomColor: theme.colors.border },
                    ]}
                    onPress={() => handleSelect(item.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.languageFlag}>{item.flag}</Text>
                    <Text style={[styles.languageLabel, { color: theme.colors.primaryText }]}>{item.nativeLabel}</Text>
                    {selected && (
                      <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
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
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pillFlag: { fontSize: 16 },
  pillCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: 0.4,
  },
  rowTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 12 },
  rowCopy: { flex: 1 },
  rowFlag: { fontSize: 22 },
  rowLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  rowValue: { fontSize: 13, color: 'rgba(0,0,0,0.45)', marginTop: 2 },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '78%',
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: 0 },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  languageRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  languageFlag: { fontSize: 22, marginRight: 14 },
  languageLabel: {
    flex: 1,
    fontSize: 17,
    color: '#1a1a2e',
    fontWeight: Platform.OS === 'ios' ? '400' : '500',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
