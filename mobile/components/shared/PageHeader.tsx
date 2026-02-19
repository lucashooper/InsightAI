import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { isTablet, sf, si } from '../../utils/responsive';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle;
};

export default function PageHeader({ title, onBack, right, style }: Props) {
  const { theme } = useTheme();
  
  // Dark and midnight themes use white text, all other themes use dark text
  const isThemeDark = isDarkTheme(theme.name);
  const textColor = isThemeDark ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a';
  const iconColor = isThemeDark ? 'rgba(255, 255, 255, 0.85)' : '#1a1a1a';
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={si(22)} color={iconColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: isTablet ? 70 : 60,
    paddingBottom: isTablet ? 18 : 14,
    paddingHorizontal: isTablet ? 28 : 16,
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
  title: {
    fontSize: sf(30),
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.6,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 36,
  },
});
