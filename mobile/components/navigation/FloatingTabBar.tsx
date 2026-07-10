import React from 'react';
import { View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { si } from '../../utils/responsive';
import CenterFabButton from './CenterFabButton';

const TAB_CONFIG: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Home: { label: 'Home', icon: 'home' },
  Journal: { label: 'Journal', icon: 'journal' },
  Dashboard: { label: 'Dashboard', icon: 'analytics' },
  Companion: { label: 'Companion', icon: 'chatbubble-ellipses-outline' },
};

export default function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = isDarkTheme(theme.name);

  const visibleRoutes = state.routes.filter((r) => r.name !== 'FabPlaceholder');
  const leftRoutes = visibleRoutes.filter((r) => r.name === 'Home' || r.name === 'Journal');
  const rightRoutes = visibleRoutes.filter((r) => r.name === 'Dashboard' || r.name === 'Companion');

  const renderTab = (route: typeof state.routes[number]) => {
    const config = TAB_CONFIG[route.name];
    if (!config) return null;

    const routeIndex = state.routes.findIndex((r) => r.key === route.key);
    const isFocused = state.index === routeIndex;
    const color = isFocused
      ? theme.colors.primaryText
      : (isDark ? 'rgba(255,255,255,0.45)' : theme.colors.tertiaryText);

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable key={route.key} onPress={onPress} style={styles.tab} accessibilityRole="button">
        {isFocused && (
          <View
            style={[
              styles.activePill,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)' },
            ]}
          />
        )}
        <Ionicons name={config.icon} size={si(22)} color={color} />
        <Text style={[styles.tabLabel, { color }]}>{config.label}</Text>
      </Pressable>
    );
  };

  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : theme.colors.border;
  const barFill = isDark ? 'rgba(18,18,22,0.94)' : 'rgba(255,255,255,0.97)';

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}
      pointerEvents="box-none"
    >
      <View style={[styles.barOuter, isDark ? styles.barOuterDark : styles.barOuterLight]}>
        {Platform.OS === 'ios' && isDark ? (
          <BlurView intensity={48} tint="dark" style={styles.blurFill} />
        ) : (
          <View style={[styles.blurFill, { backgroundColor: barFill }]} />
        )}
        <LinearGradient
          colors={
            isDark
              ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.01)']
              : ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.15)']
          }
          style={styles.topHighlight}
        />
        <View style={[styles.barBorder, { borderColor }]} />
        <View style={styles.barContent}>
          <View style={styles.sideGroup}>{leftRoutes.map(renderTab)}</View>
          <View style={styles.centerSlot}>
            <CenterFabButton embedded />
          </View>
          <View style={styles.sideGroup}>{rightRoutes.map(renderTab)}</View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  barOuter: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    overflow: 'visible',
  },
  barOuterDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 12,
  },
  barOuterLight: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  blurFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    borderRadius: 1,
  },
  barBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1,
  },
  barContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingBottom: 8,
    paddingTop: 10,
    minHeight: 64,
  },
  sideGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 4,
  },
  centerSlot: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 56,
    position: 'relative',
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    marginHorizontal: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.2,
  },
});
