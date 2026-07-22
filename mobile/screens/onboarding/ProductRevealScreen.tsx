import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';
import SunoGradient from '../../components/onboarding/SunoGradient';
import LanguagePicker from '../../components/LanguagePicker';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ZENO_MAIN_PHONE_FULL } from '../../constants/phoneMockups';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHONE_ASPECT_RATIO = 1350 / 2922;
const PHONE_IMAGE_WIDTH = isTablet ? SCREEN_WIDTH * 0.74 : SCREEN_WIDTH * 0.84;
const PHONE_FULL_HEIGHT = PHONE_IMAGE_WIDTH / PHONE_ASPECT_RATIO;
const PHONE_VISIBLE_HEIGHT = PHONE_FULL_HEIGHT * 0.68;

const phoneMockup = ZENO_MAIN_PHONE_FULL;
const insightLogo = require('../../public/Insight-Logo-nobg.webp');

export default function ProductRevealScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={false} />
            <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />

            <View style={styles.languageAnchor}>
                <LanguagePicker variant="pill" />
            </View>

            <View style={styles.header}>
                <View style={styles.brandRow}>
                    <Image
                        source={insightLogo}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.welcomeContainer}>
                    <Text style={[styles.welcomeText, { color: theme.colors.primaryText }]}>
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
                            resizeMode="contain"
                        />
                    </View>
                </View>

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
                    <Text style={[styles.signInText, { color: theme.colors.secondaryText }]}>
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
        paddingTop: isTablet ? 80 : 60,
        paddingBottom: isTablet ? 48 : 36,
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
    },
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: isTablet ? 8 : 4,
        paddingHorizontal: 24,
    },
    welcomeText: {
        fontSize: sf(32),
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: -0.6,
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
        borderRadius: 28,
        backgroundColor: '#1a1a1a',
        marginTop: -4,
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
        marginTop: isTablet ? 20 : 14,
        paddingVertical: 6,
    },
    signInText: {
        fontSize: sf(15),
        textAlign: 'center',
    },
});
