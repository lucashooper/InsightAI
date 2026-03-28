import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';

const insightLogo = require('../../public/Insight-Logo-nobg.webp');

const { width } = Dimensions.get('window');

export default function OnboardingSummaryScreen({ navigation, route }: any) {
    const { answers } = route.params || {};
    const { theme } = useTheme();
    const { userName } = useOnboarding();
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.9);
    const confettiRef = useRef<any>(null);

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
        
        // Trigger confetti after a short delay
        setTimeout(() => {
            confettiRef.current?.start();
        }, 400);

        analytics.trackOnboardingScreen('onboarding_summary', 'viewed', userName || undefined);
    }, []);

    const handleFinish = async () => {
        try {
            analytics.trackOnboardingScreen('onboarding_summary', 'completed', userName || undefined);
            // Navigate to interactive showcase screen
            navigation.navigate('InteractiveShowcase');
        } catch (e) {
            console.error('Failed to navigate to privacy onboarding', e);
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
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkTheme(theme.name) ? 'light-content' : 'dark-content'} />

            {isDarkTheme(theme.name) ? (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
            ) : (
                <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
            )}
            
            {/* Back Button - Circular style matching other onboarding pages */}
            {navigation.canGoBack() && (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <View style={[styles.backArrowCircle, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        <Ionicons name="arrow-back" size={20} color={isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e'} />
                    </View>
                </TouchableOpacity>
            )}

            {/* Logo */}
            <Image source={insightLogo} style={styles.logo} />
            
            {/* Confetti */}
            <ConfettiCannon
                ref={confettiRef}
                count={150}
                origin={{ x: width / 2, y: -10 }}
                autoStart={false}
                fadeOut={true}
                fallSpeed={2500}
            />

            <View style={styles.content}>
                <Animated.View style={[styles.centerContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="checkmark-circle" size={64} color="#4ade80" />
                    </View>

                    <Text style={[styles.title, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e' }]}>You're All Set!</Text>
                    <Text style={[styles.subtitle, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.7)' : '#6b7280' }]}>
                        {getSummaryText()}
                    </Text>
                </Animated.View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.9}
                        onPress={handleFinish}
                    >
                        <View style={styles.buttonGradient}>
                            <Text style={styles.buttonText}>Continue</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef7f2',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        padding: 4,
    },
    backArrowCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        opacity: 0.9,
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        zIndex: 10,
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
        color: '#1a1a2e',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 26,
    },
    footer: {
        width: '100%',
    },
    button: {
        width: '100%',
        borderRadius: 28,
        backgroundColor: '#1a1a1a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 22,
        borderRadius: 28,
        gap: 8,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.2,
    },
});
