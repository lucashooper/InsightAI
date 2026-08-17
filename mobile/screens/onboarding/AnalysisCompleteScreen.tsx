import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOnboardingBottomInset } from '../../utils/onboardingInsets';
import { ONBOARDING_TEXT } from '../../constants/onboardingTheme';
import { sf, screenPadding } from '../../utils/responsive';

type Props = {
    navigation: NativeStackNavigationProp<any>;
};

export default function AnalysisCompleteScreen({ navigation }: Props) {
    const { userName } = useOnboarding();
    const { user } = useAuth();
    const { t } = useLanguage();
    const bottomInset = useOnboardingBottomInset();
    const checkmarkScale = useRef(new Animated.Value(0)).current;
    const contentFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        saveUsernameToProfile();

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

    const saveUsernameToProfile = async () => {
        if (!user || !userName) return;

        try {
            const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('id, username')
                .eq('user_id', user.id)
                .single();

            if (existingProfile) {
                const { error: updateError } = await supabase
                    .from('user_profiles')
                    .update({ username: userName })
                    .eq('user_id', user.id);

                if (updateError) {
                    console.error('[AnalysisComplete] Error updating profile:', updateError);
                }
            } else {
                const { error: insertError } = await supabase
                    .from('user_profiles')
                    .insert({
                        user_id: user.id,
                        username: userName,
                        email: user.email,
                    });

                if (insertError) {
                    console.error('[AnalysisComplete] Error creating profile:', insertError);
                }
            }
        } catch (err) {
            console.error('[AnalysisComplete] Exception in saveUsernameToProfile:', err);
        }
    };

    const handleContinue = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('OnboardingSummary');
    };

    return (
        <View style={styles.container}>
            <OnboardingAmbientBackground />

            <View style={styles.content}>
                <Animated.View style={[styles.centerUnit, { opacity: contentFade }]}>
                    <Animated.View style={[styles.checkIcon, { transform: [{ scale: checkmarkScale }] }]}>
                        <Ionicons name="checkmark-outline" size={90} color="#a855f7" />
                    </Animated.View>
                    <Text style={styles.headline}>
                        {userName ? t('onboarding.analysisComplete.namedTitle', { name: userName }) : t('onboarding.analysisComplete.title')}
                    </Text>
                    <Text style={styles.reassurance}>{t('onboarding.analysisComplete.reassurance')}</Text>
                </Animated.View>

                <Animated.View style={[styles.ctaContainer, { opacity: contentFade, paddingBottom: bottomInset }]}>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        activeOpacity={0.9}
                        onPress={handleContinue}
                    >
                        <View style={styles.ctaGradient}>
                            <Text style={styles.ctaText}>{t('common.continue')}</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    content: {
        flex: 1,
        paddingHorizontal: screenPadding,
        paddingTop: 80,
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
        fontSize: sf(32),
        fontWeight: '600',
        color: ONBOARDING_TEXT.primary,
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: -1.28,
        lineHeight: sf(40),
    },
    reassurance: {
        fontSize: sf(19),
        color: ONBOARDING_TEXT.secondary,
        textAlign: 'center',
        fontWeight: '400',
        lineHeight: sf(28),
    },
    ctaContainer: {
        width: '100%',
    },
    ctaButton: {
        width: '100%',
        borderRadius: 28,
        backgroundColor: '#7B5EA7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    ctaGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 22,
        borderRadius: 28,
    },
    ctaText: {
        fontSize: sf(17),
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.2,
    },
});
