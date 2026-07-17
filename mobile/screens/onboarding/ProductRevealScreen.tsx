import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';
import SunoGradient from '../../components/onboarding/SunoGradient';
import LanguagePicker from '../../components/LanguagePicker';
import { useLanguage } from '../../contexts/LanguageContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PHONE_IMAGE_WIDTH = isTablet ? SCREEN_WIDTH * 0.74 : SCREEN_WIDTH * 0.98;
const PHONE_FULL_HEIGHT = PHONE_IMAGE_WIDTH * 2.08;
const PHONE_VISIBLE_HEIGHT = PHONE_FULL_HEIGHT * 0.70;

const phoneMockup = require('../../public/new-phone-images/Insight-Main-Phone 1.png');
const insightLogo = require('../../public/Insight-Logo-nobg.webp');

export default function ProductRevealScreen({ navigation }: any) {
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
            <SunoGradient />

            <View style={styles.languageAnchor}>
                <LanguagePicker variant="pill" />
            </View>

            {/* Centered logo */}
            <View style={styles.brandRow}>
                <Image
                    source={insightLogo}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {/* Welcome text */}
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>{t('onboarding.welcome')}</Text>
            </View>

            {/* Phone image — large, bottom ~30% cropped for screen content focus */}
            <View style={styles.phoneSection}>
                <View style={styles.phoneCrop}>
                    <Image
                        source={phoneMockup}
                        style={styles.phoneMockup}
                        resizeMode="contain"
                    />
                </View>
                <LinearGradient
                    colors={['rgba(254,247,242,0)', '#fef7f2']}
                    locations={[0, 1]}
                    pointerEvents="none"
                    style={styles.phoneFadeOverlay}
                />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.9}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.navigate('AuthSelection');
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
                    <Text style={styles.signInText}>{t('onboarding.alreadyHaveAccount')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef7f2',
        paddingTop: isTablet ? 80 : 60,
        paddingBottom: isTablet ? 70 : 50,
    },
    languageAnchor: {
        position: 'absolute',
        top: isTablet ? 88 : 68,
        right: 20,
        zIndex: 10,
    },

    /* ── Brand row ─────────────────────────────────────────────── */
    brandRow: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: isTablet ? 10 : 0,
        marginBottom: isTablet ? 10 : 2,
    },
    logo: {
        width: isTablet ? 160 : 130,
        height: isTablet ? 160 : 130,
    },

    /* ── Welcome ───────────────────────────────────────────────── */
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: isTablet ? 4 : 0,
        paddingHorizontal: 24,
    },
    welcomeText: {
        fontSize: sf(32),
        fontWeight: '600',
        color: '#1a1a2e',
        textAlign: 'center',
        letterSpacing: -0.6,
    },

    /* ── Phone image ───────────────────────────────────────────── */
    phoneSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        paddingHorizontal: isTablet ? 32 : 8,
        marginTop: isTablet ? -4 : -8,
    },
    phoneCrop: {
        width: PHONE_IMAGE_WIDTH,
        height: PHONE_VISIBLE_HEIGHT,
        overflow: 'hidden',
        alignItems: 'center',
    },
    phoneMockup: {
        width: PHONE_IMAGE_WIDTH,
        height: PHONE_FULL_HEIGHT,
    },
    phoneFadeOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: isTablet ? 64 : 52,
    },

    /* ── Footer ────────────────────────────────────────────────── */
    footer: {
        alignItems: 'center',
        paddingHorizontal: isTablet ? 48 : 24,
        ...(iPadContentStyle as any),
    },
    button: {
        width: '100%',
        borderRadius: 28,
        backgroundColor: '#1a1a1a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonInner: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 22,
        borderRadius: 28,
    },
    buttonText: {
        fontSize: sf(17),
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.2,
    },
    signInLink: {
        marginTop: isTablet ? 24 : 18,
        paddingVertical: 6,
    },
    signInText: {
        fontSize: sf(15),
        color: 'rgba(0,0,0,0.45)',
        textAlign: 'center',
    },
});
