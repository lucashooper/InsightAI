import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import CachedImage from '../../components/shared/CachedImage';
import { INSIGHT_LOGO } from '../../constants/appAssets';
import { ONBOARDING_LIGHT, ONBOARDING_TEXT } from '../../constants/onboardingTheme';
import { sf, si, screenPadding, iPadContentStyle } from '../../utils/responsive';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { analytics } from '../../services/analytics';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import { ONBOARDING_LAYOUT } from '../../constants/onboardingLayout';

const { width } = Dimensions.get('window');

export default function OnboardingSummaryScreen({ navigation, route }: any) {
    const { answers } = route.params || {};
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
            <StatusBar barStyle="dark-content" />

            <OnboardingAmbientBackground />
            
            {/* Back Button - Circular style matching other onboarding pages */}
            {navigation.canGoBack() && (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <View style={[styles.backArrowCircle, { backgroundColor: ONBOARDING_LIGHT.backCircleBg, borderColor: ONBOARDING_LIGHT.backCircleBorder, borderWidth: 1 }]}>
                        <Ionicons name="arrow-back" size={si(20)} color={ONBOARDING_LIGHT.backIcon} />
                    </View>
                </TouchableOpacity>
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

                    <Text style={[styles.title, { color: ONBOARDING_TEXT.primary }]}>{t('onboarding.summary.title')}</Text>
                    <Text style={[styles.subtitle, { color: ONBOARDING_TEXT.secondary }]}>
                        {getSummaryText()}
                    </Text>
                </Animated.View>

                <View style={[styles.footer, iPadContentStyle as any]}>
                    <OnboardingButton
                        label={t('common.continue')}
                        onPress={handleFinish}
                    />
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
    backButton: {
        position: 'absolute',
        top: ONBOARDING_LAYOUT.backTop,
        left: ONBOARDING_LAYOUT.backLeft,
        zIndex: 10,
        padding: 4,
    },
    backArrowCircle: {
        width: ONBOARDING_LAYOUT.backSize,
        height: ONBOARDING_LAYOUT.backSize,
        borderRadius: ONBOARDING_LAYOUT.backRadius,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: ONBOARDING_LAYOUT.logoSize,
        height: ONBOARDING_LAYOUT.logoSize,
        opacity: 0.9,
        position: 'absolute',
        top: ONBOARDING_LAYOUT.logoTop,
        alignSelf: 'center',
        zIndex: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: ONBOARDING_LAYOUT.contentHorizontal,
        paddingTop: ONBOARDING_LAYOUT.contentTop + 20,
        paddingBottom: ONBOARDING_LAYOUT.footerBottom,
        ...iPadContentStyle,
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
        fontSize: sf(32),
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: -1.28,
        lineHeight: sf(40),
    },
    subtitle: {
        fontSize: sf(18),
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: sf(26),
    },
    footer: {
        width: '100%',
        paddingTop: ONBOARDING_LAYOUT.footerTop,
    },
});
