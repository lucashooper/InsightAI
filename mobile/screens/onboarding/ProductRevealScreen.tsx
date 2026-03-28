import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { isTablet, sf, ss, iPadContentStyle } from '../../utils/responsive';
import SunoGradient from '../../components/onboarding/SunoGradient';
import MaskedView from '@react-native-masked-view/masked-view';

const { width, height } = Dimensions.get('window');

const phoneMockup = require('../../public/Modern-Iphone-Insight-LANDING.png');
const insightLogo = require('../../public/Insight-Logo-nobg.webp');

export default function ProductRevealScreen({ navigation }: any) {

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
            <SunoGradient />

            {/* Logo and brand name at top - centered with logo to left */}
            <View style={styles.brandContainer}>
                <Image
                    source={insightLogo}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <LinearGradient
                    colors={['#8b5cf6', '#a855f7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.brandGradient}
                >
                    <Text style={styles.brandName}>Insight</Text>
                </LinearGradient>
            </View>

            {/* Welcome text */}
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome to Insight</Text>
            </View>

            {/* Phone image with fade effect at bottom */}
            <View style={styles.phoneSection}>
                <MaskedView
                    style={styles.maskedContainer}
                    maskElement={
                        <LinearGradient
                            colors={['#000', '#000', '#000', 'transparent']}
                            locations={[0, 0.7, 0.85, 1]}
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
                    <Text style={styles.signInText}>
                        Already have an account?
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef7f2',
        paddingHorizontal: isTablet ? 48 : 24,
        paddingTop: isTablet ? 80 : 60,
        paddingBottom: isTablet ? 70 : 50,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: isTablet ? 20 : 10,
        marginBottom: isTablet ? 60 : 50,
        gap: 10,
    },
    logo: {
        width: isTablet ? 60 : 48,
        height: isTablet ? 60 : 48,
    },
    brandGradient: {
        borderRadius: 8,
        paddingHorizontal: 2,
        paddingVertical: 2,
    },
    brandName: {
        fontSize: sf(22),
        fontWeight: '600',
        color: '#1a1a2e',
        letterSpacing: -0.5,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: isTablet ? 50 : 40,
    },
    welcomeText: {
        fontSize: sf(28),
        fontWeight: '500',
        color: '#1a1a2e',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    phoneSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        overflow: 'hidden',
        marginBottom: -100,
    },
    maskedContainer: {
        width: '85%',
        height: '130%',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    phoneMockup: {
        width: '100%',
        height: '100%',
        marginBottom: -60,
    },
    footer: {
        width: '100%',
        alignItems: 'center',
        ...(iPadContentStyle as any),
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
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 22,
        borderRadius: 28,
        gap: 10,
    },
    buttonText: {
        fontSize: sf(17),
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.2,
    },
    signInLink: {
        marginTop: isTablet ? 28 : 20,
        paddingVertical: 8,
    },
    signInText: {
        fontSize: sf(15),
        color: 'rgba(0, 0, 0, 0.45)',
        textAlign: 'center',
    },
});
