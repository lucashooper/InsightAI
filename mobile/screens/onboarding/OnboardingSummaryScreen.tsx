import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import OnboardingBackButton from '../../components/onboarding/OnboardingBackButton';
import CachedImage from '../../components/shared/CachedImage';
import { INSIGHT_LOGO } from '../../constants/appAssets';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { ONBOARDING_TEXT, ONBOARDING_TYPE } from '../../constants/onboardingTheme';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';

const { width } = Dimensions.get('window');

export default function OnboardingSummaryScreen({ navigation, route }: any) {
    const { answers } = route.params || {};
    const { theme } = useTheme();
    const { userName } = useOnboarding();
    const { t } = useLanguage();
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
                return t('onboarding.summary.mood');
            case 'stress':
                return t('onboarding.summary.stress');
            case 'habits':
                return t('onboarding.summary.habits');
            case 'clarity':
                return t('onboarding.summary.clarity');
            default:
                return t('onboarding.summary.default');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkTheme(theme.name) ? 'light-content' : 'dark-content'} />

            <OnboardingAmbientBackground />
            
            {/* Back Button - Circular style matching other onboarding pages */}
            {navigation.canGoBack() && (
                <OnboardingBackButton onPress={() => navigation.goBack()} />
            )}

            {/* Logo */}
            <CachedImage source={INSIGHT_LOGO} style={styles.logo} contentFit="contain" recyclingKey="summary-logo" />
            
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

                    <Text style={[styles.title, ONBOARDING_TYPE.title, { color: isDarkTheme(theme.name) ? '#ffffff' : ONBOARDING_TEXT.primary }]}>{t('onboarding.summary.title')}</Text>
                    <Text style={[styles.subtitle, ONBOARDING_TYPE.subtitle, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.7)' : ONBOARDING_TEXT.secondary }]}>
                        {getSummaryText()}
                    </Text>
                </Animated.View>

                <View style={styles.footer}>
                    <OnboardingButton label={t('common.continue')} onPress={handleFinish} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
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
        marginBottom: 16,
    },
    subtitle: {
        paddingHorizontal: 8,
    },
    footer: {
        width: '100%',
    },
});
