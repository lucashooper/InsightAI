import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

export default function NotificationPermissionScreen({ navigation }: any) {
    const pointerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Subtle bouncing animation for pointer emoji
        Animated.loop(
            Animated.sequence([
                Animated.timing(pointerAnim, {
                    toValue: -8,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(pointerAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [pointerAnim]);

    const handleAllow = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            console.log('Notification permission status:', status);
        } catch (error) {
            console.warn('Error requesting notification permissions:', error);
        }
        
        // Navigate to analyzing screen regardless of permission result
        navigation.navigate('Analyzing');
    };

    const handleDontAllow = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('Analyzing');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Remember to reflect with notifications</Text>

                <View style={styles.permissionCard}>
                    <Text style={styles.permissionTitle}>Insight AI would like to send you</Text>
                    <Text style={styles.permissionTitle}>Notifications</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.dontAllowButton}
                            onPress={handleDontAllow}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.dontAllowText}>Don't Allow</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.allowButton}
                            onPress={handleAllow}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.allowText}>Allow</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Animated.Text
                    style={[
                        styles.pointer,
                        {
                            transform: [{ translateY: pointerAnim }],
                        },
                    ]}
                >
                    👆
                </Animated.Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 120,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginBottom: 60,
        lineHeight: 36,
        letterSpacing: -0.5,
    },
    permissionCard: {
        backgroundColor: '#d1d5db',
        borderRadius: 20,
        paddingVertical: 32,
        paddingHorizontal: 24,
        width: '100%',
        alignItems: 'center',
        marginBottom: 24,
    },
    permissionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 28,
        width: '100%',
    },
    dontAllowButton: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dontAllowText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6b7280',
    },
    allowButton: {
        flex: 1,
        backgroundColor: '#1f2937',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    allowText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    pointer: {
        fontSize: 40,
        marginTop: 8,
    },
});
