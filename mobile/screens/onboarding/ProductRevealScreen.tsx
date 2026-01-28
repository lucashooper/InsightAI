import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const phoneMockup = require('../../public/InsightAI-Onboarding-MAIN.png');

export default function ProductRevealScreen({ navigation }: any) {

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

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
        backgroundColor: '#000',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 50,
    },
    phoneSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    phoneMockup: {
        width: width * 0.85,
        height: height * 0.58,
        maxHeight: 600,
    },
    taglineContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    taglineMain: {
        fontSize: 34,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 4,
    },
    footer: {
        width: '100%',
        alignItems: 'center',
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
    signInLink: {
        marginTop: 20,
        paddingVertical: 8,
    },
    signInText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
    },
    signInTextBold: {
        color: '#fff',
        fontWeight: '600',
    },
    loginLink: {
        marginTop: 20,
        paddingVertical: 8,
    },
    loginLinkText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
    },
    loginLinkBold: {
        fontWeight: '700',
        color: '#fff',
    },
});
