import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { CheckInFlowProvider, useCheckInFlow } from './CheckInFlowProvider';
import MoodSelectorStep from './MoodSelectorStep';
import FeelingsStep from './FeelingsStep';
import ContextReflectionStep from './ContextReflectionStep';
import { CheckInDraft } from './types';
import { MOOD_TINTS } from './wordBanks';
import { saveCheckIn } from '../../services/checkInService';
import { useAuth } from '../../contexts/AuthContext';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onComplete: (draft: CheckInDraft) => void;
  onLogMoodOnly: () => void;
};

const STEPS = ['mood', 'feelings', 'context'] as const;

function CheckInFlowContent({ visible, onDismiss, onComplete, onLogMoodOnly }: Props) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { step, draft, goToStep, goBack, reset } = useCheckInFlow();
  const tint = MOOD_TINTS[draft.moodTier];
  const stepIndex = STEPS.indexOf(step as typeof STEPS[number]);

  useEffect(() => {
    if (!visible) reset();
  }, [visible, reset]);

  const markCheckedIn = async () => {
    await AsyncStorage.setItem('lastMoodCheckIn', new Date().toISOString());
  };

  const handleLogMoodOnly = async () => {
    if (user?.id) {
      try {
        await saveCheckIn(user.id, draft);
      } catch (e) {
        console.warn('[CheckIn] mood-only save failed (table may not exist yet):', e);
      }
    }
    await markCheckedIn();
    reset();
    onLogMoodOnly();
    onDismiss();
  };

  const handleSkipToJournal = async () => {
    await markCheckedIn();
    onComplete(draft);
    reset();
    onDismiss();
  };

  const handleContinueContext = async () => {
    await markCheckedIn();
    onComplete(draft);
    reset();
    onDismiss();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onDismiss}>
      <GestureHandlerRootView style={styles.fill}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={tint.bg as any} style={styles.fill}>
        <SafeAreaView style={styles.fill}>
          <View style={styles.header}>
            {step !== 'mood' ? (
              <TouchableOpacity onPress={goBack} style={styles.iconBtn} hitSlop={12}>
                <Ionicons name="chevron-back" size={24} color={theme.colors.primaryText} />
              </TouchableOpacity>
            ) : (
              <View style={styles.iconBtn} />
            )}
            <View style={styles.progress}>
              {STEPS.map((s, i) => (
                <View
                  key={s}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i <= stepIndex ? tint.accent : 'rgba(255,255,255,0.15)',
                      width: i === stepIndex ? 22 : 7,
                    },
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.iconBtn} hitSlop={12}>
              <Ionicons name="close" size={22} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {step === 'mood' && (
              <MoodSelectorStep onContinue={() => goToStep('feelings')} />
            )}
            {step === 'feelings' && (
              <FeelingsStep onContinue={() => goToStep('context')} />
            )}
            {step === 'context' && (
              <ContextReflectionStep onContinue={handleContinueContext} />
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
      </GestureHandlerRootView>
    </Modal>
  );
}

export default function CheckInFlowModal(props: Props) {
  return (
    <CheckInFlowProvider>
      <CheckInFlowContent {...props} />
    </CheckInFlowProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  body: {
    flex: 1,
  },
});
