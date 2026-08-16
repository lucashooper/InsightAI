import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sf } from '../../utils/responsive';

export type ProtocolSheetAction = {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'destructive';
  icon?: keyof typeof Ionicons.glyphMap;
  /** @deprecated Icons use brand purple unless destructive. */
  iconColor?: string;
};

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  actions: ProtocolSheetAction[];
  onDismiss: () => void;
};

export default function ProtocolOptionsSheet({
  visible,
  title,
  subtitle,
  actions,
  onDismiss,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onDismiss}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
          )}
        </Pressable>

        <View style={[styles.sheetWrap, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {actions.map((action, index) => {
              const destructive = action.variant === 'destructive';
              const iconColor = destructive ? '#DC2626' : '#7B5EA7';
              const labelColor = destructive ? '#DC2626' : '#1a1a2e';

              return (
                <TouchableOpacity
                  key={action.label}
                  style={[
                    styles.actionRow,
                    index < actions.length - 1 && styles.actionRowBorder,
                  ]}
                  onPress={() => {
                    onDismiss();
                    action.onPress();
                  }}
                  activeOpacity={0.7}
                >
                  {action.icon ? (
                    <Ionicons name={action.icon} size={22} color={iconColor} />
                  ) : (
                    <View style={styles.iconSpacer} />
                  )}
                  <Text style={[styles.actionLabel, { color: labelColor }]}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetWrap: {
    paddingHorizontal: 0,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginBottom: 8,
  },
  titleBlock: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  title: {
    fontSize: sf(17),
    fontWeight: '600',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: sf(13),
    color: '#6b6b8a',
    marginTop: 4,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconSpacer: {
    width: 22,
  },
  actionLabel: {
    fontSize: sf(16),
    fontWeight: '500',
    marginLeft: 14,
    flex: 1,
  },
});
