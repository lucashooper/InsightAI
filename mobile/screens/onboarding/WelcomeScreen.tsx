import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SunoGradient from '../../components/onboarding/SunoGradient';

const { width } = Dimensions.get('window');

const insightLogo = require('../../assets/192px-Insight-ICON.png');

export default function WelcomeScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <SunoGradient />

            {/* Skip Onboarding Button - For Testing */}
            <TouchableOpacity
                style={styles.skipButton}
                onPress={() => navigation.navigate('MainTabs')}
                activeOpacity={0.7}
            >
                <Text style={styles.skipButtonText}>Skip Onboarding →</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image source={insightLogo} style={styles.logo} />
                    </View>

                    <Text style={styles.title}>InsightAI</Text>
                    <Text style={styles.subtitle}>Your mind.
Made clearer.</Text>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('OnboardingQuestion')}
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

                    <Text style={styles.disclaimer}>
                        PRIVATE • SECURE • AI-POWERED
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.4)',
    },
    skipButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#a78bfa',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingTop: 120,
        paddingBottom: 50,
    },
    header: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    logoContainer: {
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 110,
        height: 110,
        borderRadius: 28,
    },
    title: {
        fontSize: 52,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 24,
        letterSpacing: -1.5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 28,
        color: '#e5e7eb',
        textAlign: 'center',
        fontWeight: '500',
        letterSpacing: -0.5,
        lineHeight: 36,
    },
    footer: {
        width: '100%',
        alignItems: 'center',
        gap: 20,
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
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    buttonText: {
        fontSize: 19,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    disclaimer: {
        fontSize: 11,
        color: '#71717a',
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: '600',
    },
});
