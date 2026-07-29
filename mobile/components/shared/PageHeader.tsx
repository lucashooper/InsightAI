import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { isTablet, si, sf } from '../../utils/responsive';
import { PREMIUM, TYPE } from '../../constants/premiumUI';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle;
  /** Match Dashboard large heading */
  large?: boolean;
};

export default function PageHeader({ title, onBack, right, style, large = true }: Props) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const isThemeDark = isDarkTheme(theme.name);
  const textColor = isThemeDark ? PREMIUM.text.primary : '#1a1a1a';
  const iconColor = isThemeDark ? 'rgba(255, 255, 255, 0.85)' : '#1a1a1a';

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + PREMIUM.layout.headerTop,
          paddingHorizontal: isTablet ? 32 : PREMIUM.layout.screenPadH,
        },
        style,
      ]}
    >
      <View style={styles.left}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={t('components.common.back')}
          >
            <Ionicons name="arrow-back" size={si(22)} color={iconColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Text style={[large ? styles.titleLarge : styles.title, { color: textColor }]}>
          {title}
        </Text>
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: PREMIUM.space[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  backButton: {
    width: isTablet ? 44 : 36,
    height: isTablet ? 44 : 36,
    borderRadius: isTablet ? 22 : 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 0,
    height: 0,
  },
  titleLarge: {
    fontSize: sf(32),
    fontWeight: '700' as const,
    letterSpacing: -0.7,
    lineHeight: sf(38),
    color: PREMIUM.text.primary,
  },
  title: {
    ...TYPE.section,
    color: PREMIUM.text.primary,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 36,
  },
});
