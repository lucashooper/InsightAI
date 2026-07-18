import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';
import SunoGradient from '../../components/onboarding/SunoGradient';
import LanguagePicker from '../../components/LanguagePicker';
import { useLanguage } from '../../contexts/LanguageContext';
import { PRODUCT_REVEAL_PHONE } from '../../constants/phoneMockups';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PHONE_ASPECT_RATIO = 1350 / 2922;
const PHONE_IMAGE_WIDTH = isTablet ? SCREEN_WIDTH * 0.74 : SCREEN_WIDTH * 0.84;
const PHONE_FULL_HEIGHT = PHONE_IMAGE_WIDTH / PHONE_ASPECT_RATIO;
const PHONE_VISIBLE_HEIGHT = PHONE_FULL_HEIGHT * 0.58;
const PHONE_FADE_HEIGHT = PHONE_VISIBLE_HEIGHT * 0.44;

const phoneMockup = PRODUCT_REVEAL_PHONE;
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

            <View style={styles.spacer} />

            {/* Phone — anchored just above CTA, fades at bottom of device */}
            <View style={styles.phoneWrapper}>
                <View style={styles.phoneCrop}>
                    <Image
                        source={phoneMockup}
                        style={styles.phoneMockup}
                        resizeMode="contain"
                    />
                    <LinearGradient
                        colors={['rgba(254,247,242,0)', 'rgba(254,247,242,0.5)', '#fef7f2']}
                        locations={[0, 0.55, 1]}
                        pointerEvents="none"
                        style={[styles.phoneFadeOverlay, { height: PHONE_FADE_HEIGHT }]}
                    />
                </View>
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
        marginBottom: isTablet ? 8 : 4,
        paddingHorizontal: 24,
    },
    welcomeText: {
        fontSize: sf(32),
        fontWeight: '600',
        color: '#1a1a2e',
        textAlign: 'center',
        letterSpacing: -0.6,
    },

    spacer: {
        flex: 1,
        minHeight: isTablet ? 12 : 4,
    },

    /* ── Phone image ───────────────────────────────────────────── */
    phoneWrapper: {
        alignItems: 'center',
        paddingHorizontal: isTablet ? 32 : 12,
        marginBottom: isTablet ? 20 : 12,
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
    phoneFadeOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },

    /* ── Footer ────────────────────────────────────────────────── */
    footer: {
        alignItems: 'center',
        paddingHorizontal: isTablet ? 48 : 24,
        marginTop: 0,
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
