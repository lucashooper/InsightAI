import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import * as Haptics from 'expo-haptics';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';
import SunoGradient from '../../components/onboarding/SunoGradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const phoneMockup = require('../../public/Modern-Iphone-Insight-LANDING.png');
const insightLogo = require('../../public/Insight-Logo-nobg.webp');

export default function ProductRevealScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
            <SunoGradient />

            {/* Brand row — logo left, text centered via spacer mirror trick */}
            <View style={styles.brandRow}>
                <Image
                    source={insightLogo}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <MaskedView
                    maskElement={
                        <Text style={[styles.brandName, { backgroundColor: 'transparent' }]}>Insight</Text>
                    }
                >
                    <LinearGradient
                        colors={['#1a1a3a', '#3b3b8a', '#6d4fc4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={[styles.brandName, { opacity: 0 }]}>Insight</Text>
                    </LinearGradient>
                </MaskedView>
                {/* Mirror spacer so text stays centered */}
                <View style={styles.logoPlaceholder} />
            </View>

            {/* Welcome text — slightly lower */}
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome to Insight</Text>
            </View>

            {/* Phone image — fills remaining space, fades at bottom */}
            <View style={styles.phoneSection}>
                <MaskedView
                    style={styles.maskedContainer}
                    maskElement={
                        <LinearGradient
                            colors={['#000', '#000', '#000', 'transparent']}
                            locations={[0, 0.55, 0.80, 1]}
                            style={{ flex: 1 }}
                        />
                    }
                >
                    <Image
                        source={phoneMockup}
                        style={styles.phoneMockup}
                        resizeMode="contain"
                    />
                </MaskedView>
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
                        <Text style={styles.buttonText}>Get Started</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={styles.signInLink}
                >
                    <Text style={styles.signInText}>Already have an account?</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef7f2',
        paddingTop: isTablet ? 70 : 56,
        paddingBottom: isTablet ? 60 : 44,
    },

    /* ── Brand row ─────────────────────────────────────────────── */
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isTablet ? 20 : 12,
        gap: 8,
    },
    logo: {
        width: isTablet ? 30 : 26,
        height: isTablet ? 30 : 26,
    },
    /* Mirror spacer so text stays optically centered */
    logoPlaceholder: {
        width: isTablet ? 30 : 26,
        height: isTablet ? 30 : 26,
    },
    brandName: {
        fontSize: sf(20),
        fontWeight: '600',
        color: '#1a1a3a',
        letterSpacing: 0.2,
    },

    /* ── Welcome ───────────────────────────────────────────────── */
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: isTablet ? 20 : 14,
        paddingHorizontal: 24,
    },
    welcomeText: {
        fontSize: sf(32),
        fontWeight: '700',
        color: '#1a1a2e',
        textAlign: 'center',
        letterSpacing: -1,
    },

    /* ── Phone image ───────────────────────────────────────────── */
    phoneSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    maskedContainer: {
        width: SCREEN_WIDTH * (isTablet ? 0.70 : 0.88),
        height: SCREEN_HEIGHT * (isTablet ? 0.58 : 0.56),
    },
    phoneMockup: {
        width: '100%',
        height: '100%',
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
