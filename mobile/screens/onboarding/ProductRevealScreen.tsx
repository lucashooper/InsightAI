import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import LanguagePicker from '../../components/LanguagePicker';
import { useLanguage } from '../../contexts/LanguageContext';
import { ONBOARDING_TEXT, ONBOARDING_CTA } from '../../constants/onboardingTheme';
import { useOnboardingBottomInset, useOnboardingTopInset } from '../../utils/onboardingInsets';
import { ZENO_MAIN_PHONE_FULL } from '../../constants/phoneMockups';
import { INSIGHT_LOGO } from '../../constants/appAssets';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHONE_ASPECT_RATIO = 1350 / 2922;
const PHONE_IMAGE_WIDTH = isTablet ? SCREEN_WIDTH * 0.74 : SCREEN_WIDTH * 0.84;
const PHONE_FULL_HEIGHT = PHONE_IMAGE_WIDTH / PHONE_ASPECT_RATIO;
const PHONE_VISIBLE_HEIGHT = PHONE_FULL_HEIGHT * 0.68;

const phoneMockup = ZENO_MAIN_PHONE_FULL;

export default function ProductRevealScreen({ navigation }: any) {
    const { t } = useLanguage();
    const bottomInset = useOnboardingBottomInset();
    const topInset = useOnboardingTopInset();

    return (
        <View style={[styles.container, { paddingTop: topInset + (isTablet ? 24 : 12), paddingBottom: bottomInset }]}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
            <OnboardingAmbientBackground />
            <View style={[styles.languageAnchor, { top: topInset + 12 }]}>
                <LanguagePicker variant="pill" />
            </View>

            <View style={styles.header}>
                <View style={styles.brandRow}>
                    <Image
                        source={INSIGHT_LOGO}
                        style={styles.logo}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                        transition={0}
                    />
                </View>
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeText}>
                        {t('onboarding.welcome')}
                    </Text>
                </View>
            </View>

            {/* Phone + CTA anchored together at the bottom (Oasis-style) */}
            <View style={styles.bottomBlock}>
                <View style={styles.phoneWrapper}>
                    <View style={styles.phoneCrop}>
                        <Image
                            source={phoneMockup}
                            style={styles.phoneMockup}
                            contentFit="contain"
                            cachePolicy="memory-disk"
                            transition={0}
                            priority="high"
                            recyclingKey="product-reveal-phone"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.9}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.navigate('OnboardingQuestion');
                    }}
                >
                    <View style={styles.buttonInner}>
                        <Text style={styles.buttonText}>{t('onboarding.getStarted')}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={styles.signInLink}
                >
                    <Text style={styles.signInText}>
                        {t('onboarding.alreadyHaveAccount')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    languageAnchor: {
        position: 'absolute',
        top: isTablet ? 88 : 68,
        right: 20,
        zIndex: 10,
    },
    header: {
        flexShrink: 0,
    },
    brandRow: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: isTablet ? 10 : 0,
        marginBottom: isTablet ? 10 : 2,
    },
    logo: {
        width: isTablet ? 160 : 130,
        height: isTablet ? 160 : 130,
        shadowColor: 'rgba(100, 80, 180, 0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: isTablet ? 8 : 4,
        paddingHorizontal: 24,
    },
    welcomeText: {
        fontSize: sf(32),
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: -1.28,
        color: ONBOARDING_TEXT.primary,
    },
    bottomBlock: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: isTablet ? 48 : 24,
        ...(iPadContentStyle as any),
    },
    phoneWrapper: {
        alignItems: 'center',
        paddingHorizontal: isTablet ? 8 : 0,
        marginBottom: 0,
    },
    phoneCrop: {
        width: PHONE_IMAGE_WIDTH,
        height: PHONE_VISIBLE_HEIGHT,
        overflow: 'hidden',
        alignItems: 'center',
        position: 'relative',
    },
    phoneMockup: {
        width: PHONE_IMAGE_WIDTH,
        height: PHONE_FULL_HEIGHT,
    },
    button: {
        width: '100%',
        borderRadius: ONBOARDING_CTA.borderRadius,
        backgroundColor: ONBOARDING_CTA.background,
        marginTop: -4,
        shadowColor: ONBOARDING_CTA.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonInner: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: ONBOARDING_CTA.paddingVertical,
        borderRadius: ONBOARDING_CTA.borderRadius,
    },
    buttonText: {
        fontSize: sf(17),
        fontWeight: '600',
        color: ONBOARDING_CTA.text,
        letterSpacing: 0.2,
    },
    signInLink: {
        marginTop: isTablet ? 20 : 14,
        paddingVertical: 6,
    },
    signInText: {
        fontSize: sf(15),
        textAlign: 'center',
        color: ONBOARDING_TEXT.secondary,
        fontWeight: '400',
    },
});
