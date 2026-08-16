import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
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
        <Pressable style={styles.scrim} onPress={onDismiss}>
          <BlurView intensity={36} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.scrimTint} />
        </Pressable>
        <View style={[styles.sheetWrap, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            <View style={styles.actionsBlock}>
              {actions.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={styles.actionRow}
                  onPress={() => {
                    onDismiss();
                    action.onPress();
                  }}
                  activeOpacity={0.75}
                >
                  {action.icon ? (
                    <View style={styles.iconWrap}>
                      <Ionicons
                        name={action.icon}
                        size={20}
                        color={
                          action.iconColor
                          ?? (action.variant === 'destructive' ? '#EF4444' : '#A855F7')
                        }
                      />
                    </View>
                  ) : null}
                  <Text
                    style={[
                      styles.actionLabel,
                      action.variant === 'destructive' && styles.actionDestructive,
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.cancelRow} onPress={onDismiss} activeOpacity={0.75}>
              <Text style={styles.cancelLabel}>Cancel</Text>
            </TouchableOpacity>
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
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  scrimTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  sheetWrap: {
    paddingHorizontal: 12,
  },
  sheet: {
    backgroundColor: '#12102A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#231F3D',
    overflow: 'hidden',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginBottom: 14,
  },
  title: {
    fontSize: sf(17),
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: sf(14),
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  actionsBlock: {
    marginTop: 18,
    paddingHorizontal: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
    marginRight: 14,
  },
  actionLabel: {
    fontSize: sf(16),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    flex: 1,
  },
  actionDestructive: {
    color: '#EF4444',
  },
  cancelRow: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  cancelLabel: {
    fontSize: sf(15),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.42)',
  },
});
