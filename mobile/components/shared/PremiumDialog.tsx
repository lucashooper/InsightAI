import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { PREMIUM } from '../../constants/premiumUI';
import { sf } from '../../utils/responsive';

export type PremiumDialogAction = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
};

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actions?: PremiumDialogAction[];
  onDismiss?: () => void;
};

export default function PremiumDialog({
  visible,
  title,
  message,
  icon = 'checkmark-circle',
  actions = [{ label: 'OK', variant: 'primary' }],
  onDismiss,
}: Props) {
  const handleAction = (action: PremiumDialogAction) => {
    onDismiss?.();
    action.onPress?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onDismiss}>
          <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.scrimTint} />
        </Pressable>
        <View style={styles.center} pointerEvents="box-none">
          <View style={styles.card}>
            <LinearGradient
              colors={['rgba(139,92,246,0.18)', 'rgba(99,102,241,0.08)', 'rgba(9,9,11,0.95)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.iconWrap}>
              <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.iconGradient}>
                <Ionicons name={icon} size={28} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <View style={styles.actions}>
              {actions.map((action, index) => {
                const isPrimary =
                  action.variant === 'primary' || (!action.variant && index === actions.length - 1);
                const isDestructive = action.variant === 'destructive';

                if (isPrimary) {
                  return (
                    <TouchableOpacity
                      key={action.label}
                      onPress={() => handleAction(action)}
                      activeOpacity={0.85}
                      style={styles.primaryBtnWrap}
                    >
                      <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.primaryBtn}>
                        <Text style={styles.primaryBtnText}>{action.label}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={action.label}
                    onPress={() => handleAction(action)}
                    activeOpacity={0.7}
                    style={[styles.secondaryBtn, isDestructive && styles.destructiveBtn]}
                  >
                    <Text style={[styles.secondaryBtnText, isDestructive && styles.destructiveBtnText]}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  scrimTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: PREMIUM.radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.35)',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    overflow: 'hidden',
    backgroundColor: PREMIUM.bgElevated,
  },
  iconWrap: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: sf(20),
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  message: {
    fontSize: sf(15),
    lineHeight: sf(22),
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  primaryBtnWrap: {
    borderRadius: PREMIUM.radius.button,
    overflow: 'hidden',
  },
  primaryBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: sf(16),
    fontWeight: '600',
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: sf(15),
    fontWeight: '500',
  },
  destructiveBtn: {},
  destructiveBtnText: {
    color: '#f87171',
  },
});
