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
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useAppLock } from '../../contexts/AppLockContext';
import { useLanguage } from '../../contexts/LanguageContext';
import CheckInFlowModal from '../checkin/CheckInFlowModal';
import PremiumDialog from '../shared/PremiumDialog';
import { CheckInDraft } from '../checkin/types';
import { navigateToPlaybook } from '../../utils/navigateToPlaybook';
import { hasCheckInToday } from '../../utils/checkInToday';
import { FAB_MENU_BACKGROUNDS } from '../../constants/fabMenuAssets';

type Props = {
  embedded?: boolean;
};

type MenuOption = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  background: number;
  screen?: string;
  action?: 'check-in';
};

const MENU_OPTIONS: MenuOption[] = [
  { id: 'journal', icon: 'create-outline', labelKey: 'fab.journalEntry', background: FAB_MENU_BACKGROUNDS.journal, screen: 'CreateEntry' },
  { id: 'ai', icon: 'sparkles-outline', labelKey: 'fab.aiChat', background: FAB_MENU_BACKGROUNDS.aiChat, screen: 'AIChat' },
  { id: 'playbook', icon: 'book-outline', labelKey: 'fab.playbook', background: FAB_MENU_BACKGROUNDS.playbook, screen: 'Playbook' },
  { id: 'checkin', icon: 'happy-outline', labelKey: 'checkIn.checkIn', background: FAB_MENU_BACKGROUNDS.checkIn, action: 'check-in' },
];

export default function CenterFabButton({ embedded = false }: Props) {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = React.useState(false);
  const [showDailyMoodCheckIn, setShowDailyMoodCheckIn] = React.useState(false);
  const [showAlreadyCheckedIn, setShowAlreadyCheckedIn] = React.useState(false);
  const { isLocked, isLockEnabled } = useAppLock();

  const openCheckInFlow = async () => {
    const alreadyCheckedIn = await hasCheckInToday();
    if (alreadyCheckedIn) {
      setShowAlreadyCheckedIn(true);
      return;
    }
    setShowDailyMoodCheckIn(true);
  };

  const handleOptionPress = (option: MenuOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMenu(false);
    if (option.action === 'check-in') {
      openCheckInFlow();
      return;
    }
    if (option.screen === 'Playbook') {
      navigateToPlaybook(navigation);
      return;
    }
    const rootNav = navigation.getParent?.() ?? navigation;
    rootNav.navigate(option.screen!);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, embedded && styles.buttonEmbedded]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowMenu(!showMenu);
        }}
        activeOpacity={0.85}
        accessibilityLabel={t('accessibility.openQuickActions')}
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
          <View style={styles.menuContainer} pointerEvents="box-none">
            <View style={styles.menuGrid}>
              {MENU_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.menuCard}
                  onPress={() => handleOptionPress(option)}
                  activeOpacity={0.88}
                >
                  <Image
                    source={option.background}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={0}
                    recyclingKey={`fab-menu-${option.id}`}
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.72)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.menuCardContent}>
                    <Ionicons name={option.icon} size={26} color="#ffffff" />
                    <Text style={styles.menuCardLabel}>{t(option.labelKey)}</Text>
                  </View>
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

      <PremiumDialog
        visible={showAlreadyCheckedIn}
        title={t('checkIn.alreadyCheckedInTitle')}
        message={t('checkIn.alreadyCheckedInMessage')}
        icon="happy-outline"
        onDismiss={() => setShowAlreadyCheckedIn(false)}
        actions={[
          { label: t('common.cancel'), variant: 'secondary', onPress: () => setShowAlreadyCheckedIn(false) },
          {
            label: t('checkIn.checkInAgain'),
            variant: 'primary',
            onPress: () => {
              setShowAlreadyCheckedIn(false);
              setShowDailyMoodCheckIn(true);
            },
          },
        ]}
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
    overflow: 'hidden',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    paddingHorizontal: 18,
    paddingBottom: 110,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  menuCard: {
    width: '48%',
    height: 128,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  menuCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    gap: 8,
  },
  menuCardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
});
