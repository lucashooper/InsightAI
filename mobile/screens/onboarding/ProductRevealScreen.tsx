import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { isTablet, sf, ss, iPadContentStyle } from '../../utils/responsive';
import SunoGradient from '../../components/onboarding/SunoGradient';

const { width, height } = Dimensions.get('window');

const phoneMockup = require('../../public/Onboarding-Main-Phone-Image.png');
const insightLogo = require('../../public/Insight-Logo-nobg.webp');

export default function ProductRevealScreen({ navigation }: any) {

    return (
        <View style={styles.container}>
            <SunoGradient />
            <StatusBar barStyle="dark-content" />

            <View style={styles.phoneSection}>
                <Image
                    source={phoneMockup}
                    style={styles.phoneMockup}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.taglineContainer}>
                <Text style={styles.taglineMain}>Your mind.</Text>
                <Text style={styles.taglineMain}>Made clearer.</Text>
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
                    <LinearGradient
                        colors={['#a855f7', '#8b5cf6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>Begin Journey</Text>
                    </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={styles.signInLink}
                >
                    <Text style={styles.signInText}>
                        Already have an account? <Text style={styles.signInTextBold}>Sign In</Text>
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
    backButton: {
        position: 'absolute',
        top: 60,
        left: 24,
        zIndex: 10,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    phoneSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    phoneMockup: {
        width: isTablet ? width * 0.65 : width * 0.85,
        height: isTablet ? height * 0.62 : height * 0.58,
        maxHeight: isTablet ? 900 : 600,
    },
    taglineContainer: {
        alignItems: 'center',
        marginBottom: isTablet ? 48 : 32,
    },
    taglineMain: {
        fontSize: sf(34),
        fontWeight: '600',
        color: '#1a1a2e',
        textAlign: 'center',
        marginBottom: 4,
    },
    footer: {
        width: '100%',
        alignItems: 'center',
        ...(iPadContentStyle as any),
    },
    button: {
        width: '100%',
        borderRadius: 999,
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 12,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        borderRadius: 999,
        gap: 10,
    },
    buttonText: {
        fontSize: sf(19),
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
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
    signInTextBold: {
        color: '#1a1a2e',
        fontWeight: '600',
    },
    loginLink: {
        marginTop: 20,
        paddingVertical: 8,
    },
    loginLinkText: {
        fontSize: 15,
        color: 'rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
    },
    loginLinkBold: {
        fontWeight: '700',
        color: '#1a1a2e',
    },
});
