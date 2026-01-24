import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useOnboarding } from '../../contexts/OnboardingContext';

const { width } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<any>;
};

export default function AnalysisCompleteScreen({ navigation }: Props) {
    const { userName } = useOnboarding();
    const checkmarkScale = useRef(new Animated.Value(0)).current;
    const contentFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Simple fade and scale animation
        Animated.sequence([
            Animated.spring(checkmarkScale, {
                toValue: 1,
                tension: 60,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(contentFade, {
                toValue: 1,
                duration: 500,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleContinue = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('Paywall');
    };

    return (
        <View style={styles.container}>
            <SunoGradient />
            
            <View style={styles.content}>
                {/* Check + Headline Unit */}
                <Animated.View style={[styles.centerUnit, { opacity: contentFade }]}>
                    <Animated.View style={[styles.checkIcon, { transform: [{ scale: checkmarkScale }] }]}>
                        <Ionicons name="checkmark-outline" size={90} color="#a855f7" />
                    </Animated.View>
                    <Text style={styles.headline}>{userName ? `${userName}, your personal plan is ready` : "You're all set"}</Text>
                    <Text style={styles.reassurance}>Your space is ready.</Text>
                </Animated.View>

                {/* CTA Button */}
                <Animated.View style={[styles.ctaContainer, { opacity: contentFade }]}>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        activeOpacity={0.9}
                        onPress={handleContinue}
                    >
                        <LinearGradient
                            colors={['#a855f7', '#8b5cf6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.ctaGradient}
                        >
                            <Text style={styles.ctaText}>Continue</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 80,
        paddingBottom: 50,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    centerUnit: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    checkIcon: {
        marginBottom: 40,
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
    },
    headline: {
        fontSize: 44,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: -1.2,
    },
    reassurance: {
        fontSize: 19,
        color: '#9ca3af',
        textAlign: 'center',
        fontWeight: '400',
        letterSpacing: 0,
        lineHeight: 28,
    },
    ctaContainer: {
        width: '100%',
    },
    ctaButton: {
        width: '100%',
        borderRadius: 999,
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    ctaGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 999,
    },
    ctaText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.2,
    },
});
