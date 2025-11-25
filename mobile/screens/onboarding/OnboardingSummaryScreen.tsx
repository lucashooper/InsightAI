import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingBackground from '../../components/OnboardingBackground';

const { width } = Dimensions.get('window');

export default function OnboardingSummaryScreen({ navigation, route }: any) {
    const { answers } = route.params || {};
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.9);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleFinish = async () => {
        try {
            await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
            // Reset navigation to MainTabs
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (e) {
            console.error('Failed to save onboarding status', e);
        }
    };

    const getSummaryText = () => {
        const goal = answers?.goal;
        switch (goal) {
            case 'mood':
                return "We'll help you improve your mood with guided reflections and insights.";
            case 'stress':
                return "We'll help you reduce stress with guided reflections and insights.";
            case 'habits':
                return "We'll help you build habits with guided reflections and insights.";
            case 'clarity':
                return "We'll help you gain clarity with guided reflections and insights.";
            default:
                return "Your personal space for reflection is ready. Let's start your journey.";
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <OnboardingBackground />

            <View style={styles.content}>
                <Animated.View style={[styles.centerContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="checkmark-circle" size={64} color="#4ade80" />
                    </View>

                    <Text style={styles.title}>You're All Set!</Text>
                    <Text style={styles.subtitle}>
                        {getSummaryText()}
                    </Text>
                </Animated.View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.9}
                        onPress={handleFinish}
                    >
                        <LinearGradient
                            colors={['#8b5cf6', '#6d28d9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Go to Journal</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingTop: 120,
        paddingBottom: 60,
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    iconContainer: {
        marginBottom: 32,
        shadowColor: '#4ade80',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 36,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 26,
    },
    footer: {
        width: '100%',
    },
    button: {
        width: '100%',
        borderRadius: 999,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 999,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.5,
    },
});
