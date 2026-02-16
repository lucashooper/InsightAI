import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Image, TouchableWithoutFeedback } from 'react-native';
import { Asset } from 'expo-asset';
import { isTablet, sf, ss } from '../../utils/responsive';
import SunoGradient from '../../components/onboarding/SunoGradient';

const insightLogo = require('../../public/Insight-Logo-nobg.webp');

export default function WelcomeScreen({ navigation }: any) {
    useEffect(() => {
        let isMounted = true;
        let timer: ReturnType<typeof setTimeout> | undefined;

        (async () => {
            try {
                await Asset.fromModule(insightLogo).downloadAsync();
            } catch {
                // no-op
            }

            if (!isMounted) return;

            timer = setTimeout(() => {
                navigation.replace('ProductReveal');
            }, 1700);
        })();

        return () => {
            isMounted = false;
            if (timer) clearTimeout(timer);
        };
    }, [navigation]);

    const handleContinue = () => {
        navigation.replace('ProductReveal');
    };

    return (
        <TouchableWithoutFeedback onPress={handleContinue}>
            <View style={styles.container}>
                <SunoGradient />
                <StatusBar barStyle="dark-content" />

                <View style={styles.content}>
                    {/* Logo + Heading - Text Centered, Logo Hanging Left */}
                    <View style={styles.headerContainer}>
                        <Image
                            source={insightLogo}
                            style={styles.splashLogo}
                            resizeMode="cover"
                        />
                        <Text style={styles.brandNameTop}>Insight</Text>
                    </View>

                    {/* Big Phone Mockup */}
                    {null}

                    {/* Tagline Below */}
                    {null}

                    {/* CTA Button */}
                    {null}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef7f2',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 0,
    },
    headerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginBottom: 28,
        position: 'relative',
    },
    splashLogo: {
        width: isTablet ? 96 : 64,
        height: isTablet ? 96 : 64,
        borderRadius: isTablet ? 24 : 16,
        marginRight: isTablet ? 20 : 14,
        overflow: 'hidden',
    },
    logoHanging: {
        position: 'absolute',
        left: '50%',
        marginLeft: -100,
        top: 0,
        width: 44,
        height: 44,
        borderRadius: 10,
    },
    brandNameTop: {
        fontSize: sf(44),
        fontWeight: '700',
        color: '#1a1a2e',
        letterSpacing: -1.2,
        marginBottom: 0,
    },
    phoneContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    phoneMockup: {
        width: 0,
        height: 0,
    },
    taglineContainer: {
        alignItems: 'center',
        marginBottom: 0,
    },
    taglineMain: {
        fontSize: 44,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 4,
    },
    taglineGradient: {
        fontSize: 34,
        fontWeight: '700',
        textAlign: 'center',
        textShadowColor: 'rgba(6, 182, 212, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    footer: {
        width: '100%',
        alignItems: 'center',
        gap: 20,
        marginTop: 'auto',
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
});
