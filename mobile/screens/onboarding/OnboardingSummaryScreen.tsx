import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

const insightLogo = require('../../public/Insight-Logo-nobg.webp');

const { width } = Dimensions.get('window');

export default function OnboardingSummaryScreen({ navigation, route }: any) {
    const { answers } = route.params || {};
    const { theme } = useTheme();
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
                        <LinearGradient
                            colors={['#8b5cf6', '#6d28d9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Continue</Text>
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
