import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppLock } from '../../contexts/AppLockContext';
import CheckInFlowModal from '../checkin/CheckInFlowModal';
import { CheckInDraft } from '../checkin/types';
import { navigateToPlaybook } from '../../utils/navigateToPlaybook';

type Props = {
  embedded?: boolean;
};

export default function CenterFabButton({ embedded = false }: Props) {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const isDark = isDarkTheme(theme.name);
  const [showMenu, setShowMenu] = React.useState(false);
  const [showDailyMoodCheckIn, setShowDailyMoodCheckIn] = React.useState(false);
  const { user } = useAuth();
  const { isLocked, isLockEnabled, isLockReady } = useAppLock();
  const checkInTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkInPromptedRef = React.useRef(false);

  React.useEffect(() => {
    if (!user || !isLockReady || (isLocked && isLockEnabled) || checkInPromptedRef.current) {
      return;
    }

    let cancelled = false;

    const checkDailyMoodCheckIn = async () => {
      try {
        const todayKey = new Date().toISOString().split('T')[0];
        const promptedKey = `checkInPrompted_${user.id}_${todayKey}`;
        const alreadyPrompted = await AsyncStorage.getItem(promptedKey);
        if (alreadyPrompted === 'true') return;

        const lastCheckIn = await AsyncStorage.getItem('lastMoodCheckIn');
        const dailyMoodEnabled = await AsyncStorage.getItem('dailyMoodCheckInEnabled');
        if (dailyMoodEnabled === 'false') return;

        const needsCheckIn = (() => {
          if (!lastCheckIn) return true;
          const lastCheckInDate = new Date(lastCheckIn);
          const today = new Date();
          return (
            lastCheckInDate.getDate() !== today.getDate() ||
            lastCheckInDate.getMonth() !== today.getMonth() ||
            lastCheckInDate.getFullYear() !== today.getFullYear()
          );
        })();

        if (!needsCheckIn || cancelled) return;

        checkInPromptedRef.current = true;
        await AsyncStorage.setItem(promptedKey, 'true');

        checkInTimeoutRef.current = setTimeout(() => {
          if (!cancelled) setShowDailyMoodCheckIn(true);
        }, 2000);
      } catch (error) {
        console.error('Error checking daily mood check-in:', error);
      }
    };

    checkDailyMoodCheckIn();

    return () => {
      cancelled = true;
      if (checkInTimeoutRef.current) {
        clearTimeout(checkInTimeoutRef.current);
        checkInTimeoutRef.current = null;
      }
    };
  }, [user?.id, isLockReady, isLocked, isLockEnabled]);

  const menuOptions: Array<
    | { icon: string; label: string; screen: string }
    | { icon: string; label: string; action: 'check-in' }
  > = [
    { icon: 'create-outline', label: 'Journal Entry', screen: 'CreateEntry' },
    { icon: 'sparkles-outline', label: 'AI Chat', screen: 'AIChat' },
    { icon: 'heart-outline', label: 'Gratitude', screen: 'Gratitude' },
    { icon: 'musical-notes-outline', label: 'Meditation', screen: 'Meditation' },
    { icon: 'book-outline', label: 'Playbook', screen: 'Playbook' },
    { icon: 'happy-outline', label: 'Check in', action: 'check-in' },
  ];

  return (
    <>
      <TouchableOpacity
        style={[styles.button, embedded && styles.buttonEmbedded]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowMenu(!showMenu);
        }}
        activeOpacity={0.85}
        accessibilityLabel="Open quick actions menu"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
          style={[styles.gradient, styles.fabGlow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={showMenu ? 'close' : 'add'} size={embedded ? 26 : 28} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menuContainer}>
            <View style={styles.menuGrid}>
              {menuOptions.map((option) => (
                <TouchableOpacity
                  key={'screen' in option ? option.screen : option.action}
                  style={[styles.menuCard, { backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF' }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowMenu(false);
                    if ('action' in option) {
                      setShowDailyMoodCheckIn(true);
                      return;
                    }
                    if (option.screen === 'Playbook') {
                      navigateToPlaybook(navigation);
                      return;
                    }
                    navigation.navigate(option.screen);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuCardIconContainer}>
                    <Ionicons name={option.icon as any} size={28} color="#8b5cf6" />
                  </View>
                  <Text style={[styles.menuCardLabel, { color: theme.colors.primaryText }]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      <CheckInFlowModal
        visible={showDailyMoodCheckIn && !(isLocked && isLockEnabled)}
        onDismiss={() => setShowDailyMoodCheckIn(false)}
        onComplete={(draft: CheckInDraft) => {
          setShowDailyMoodCheckIn(false);
          navigation.navigate('CreateEntry', { checkInDraft: draft });
        }}
        onLogMoodOnly={() => setShowDailyMoodCheckIn(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonEmbedded: {
    marginTop: -22,
  },
  fabGlow: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    height: 140,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  menuCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuCardLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
