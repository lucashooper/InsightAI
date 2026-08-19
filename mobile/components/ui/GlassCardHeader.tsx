import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { PREMIUM } from '../../constants/premiumUI';
import { sf } from '../../utils/responsive';

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  expanded?: boolean;
  showChevron?: boolean;
  style?: ViewStyle;
};

/** In-card section header — matches Emotional landscape typography. */
export default function GlassCardHeader({
  title,
  subtitle,
  onPress,
  expanded,
  showChevron = false,
  style,
}: Props) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);
  const titleColor = dark ? PREMIUM.text.primary : '#1A1C20';
  const subtitleColor = dark ? PREMIUM.text.secondary : theme.colors.secondaryText;

  const body = (
    <>
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
        ) : null}
      </View>
      {showChevron ? (
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={subtitleColor}
          style={styles.chevron}
        />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.header, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {body}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.header, style]}>{body}</View>;
}

export const glassCardInnerPad: ViewStyle = {
  paddingHorizontal: PREMIUM.layout.cardInnerPadH,
  paddingVertical: PREMIUM.layout.cardInnerPadV,
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: PREMIUM.space[1],
  },
  textCol: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: sf(22),
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: sf(17),
    fontWeight: '400',
    lineHeight: sf(24),
  },
  chevron: {
    marginTop: 4,
  },
});
