import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { isTablet, sf, ss, iPadContentStyle } from '../../utils/responsive';
import SunoGradient from '../../components/onboarding/SunoGradient';
import MaskedView from '@react-native-masked-view/masked-view';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const phoneMockup = require('../../public/Modern-Iphone-Insight-LANDING.png');
const insightLogo = require('../../public/Insight-Logo-nobg.webp');

export default function ProductRevealScreen({ navigation }: any) {

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
            <SunoGradient />

            {/* Logo and brand name at top - centered */}
            <View style={styles.brandContainer}>
                <Image
                    source={insightLogo}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.brandName}>Insight</Text>
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
                            colors={['#000', '#000', '#000', '#000', 'transparent']}
                            locations={[0, 0.4, 0.65, 0.78, 1]}
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
        paddingTop: isTablet ? 80 : 60,
        paddingBottom: isTablet ? 70 : 50,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: isTablet ? 20 : 0,
        marginBottom: isTablet ? 32 : 24,
        gap: 10,
    },
    logo: {
        width: isTablet ? 60 : 48,
        height: isTablet ? 60 : 48,
    },
    brandName: {
        fontSize: sf(22),
        fontWeight: '600',
        color: '#1a1a2e',
        letterSpacing: -0.3,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: isTablet ? 24 : 16,
        paddingHorizontal: 24,
    },
    welcomeText: {
        fontSize: sf(30),
        fontWeight: '600',
        color: '#1a1a2e',
        textAlign: 'center',
        letterSpacing: -0.8,
    },
    phoneSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        overflow: 'hidden',
    },
    maskedContainer: {
        width: SCREEN_WIDTH * (isTablet ? 0.65 : 0.9),
        height: SCREEN_HEIGHT * (isTablet ? 0.55 : 0.62),
        alignItems: 'center',
        justifyContent: 'center',
    },
    phoneMockup: {
        width: '100%',
        height: '100%',
    },
    footer: {
        width: '100%',
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
