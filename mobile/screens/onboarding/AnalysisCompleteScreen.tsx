import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<any>;
};

export default function AnalysisCompleteScreen({ navigation }: Props) {
    const { userName } = useOnboarding();
    const { user } = useAuth();
    const { theme } = useTheme();
    const checkmarkScale = useRef(new Animated.Value(0)).current;
    const contentFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        console.log('[AnalysisComplete] Screen loaded');
        console.log('[AnalysisComplete] userName from context:', userName);
        console.log('[AnalysisComplete] user from auth:', user?.id);
        
        // Save username to profile when screen loads
        saveUsernameToProfile();
        
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

    const saveUsernameToProfile = async () => {
        if (!user) {
            console.log('[AnalysisComplete] No user found, skipping profile save');
            return;
        }
        
        if (!userName) {
            console.log('[AnalysisComplete] No username found in context, skipping profile save');
            return;
        }
        
        try {
            console.log('[AnalysisComplete] Saving username to profile...');
            console.log('[AnalysisComplete] User ID:', user.id);
            console.log('[AnalysisComplete] Username:', userName);
            console.log('[AnalysisComplete] User email:', user.email);
            
            // First, try to check if profile exists
            const { data: existingProfile, error: checkError } = await supabase
                .from('user_profiles')
                .select('id, username')
                .eq('user_id', user.id)
                .single();
            
            console.log('[AnalysisComplete] Existing profile check:', existingProfile);
            console.log('[AnalysisComplete] Check error:', checkError);
            
            if (existingProfile) {
                // Profile exists, update it
                console.log('[AnalysisComplete] Profile exists, updating username...');
                const { error: updateError } = await supabase
                    .from('user_profiles')
                    .update({ username: userName })
                    .eq('user_id', user.id);
                
                if (updateError) {
                    console.error('[AnalysisComplete] ❌ Error updating profile:', updateError);
                } else {
                    console.log('[AnalysisComplete] ✅ Username updated successfully');
                }
            } else {
                // Profile doesn't exist, create it
                console.log('[AnalysisComplete] Profile does not exist, creating new profile...');
                const { error: insertError } = await supabase
                    .from('user_profiles')
                    .insert({
                        user_id: user.id,
                        username: userName,
                        email: user.email,
                    });
                
                if (insertError) {
                    console.error('[AnalysisComplete] ❌ Error creating profile:', insertError);
                } else {
                    console.log('[AnalysisComplete] ✅ Profile created successfully');
                }
            }
            
        } catch (err) {
            console.error('[AnalysisComplete] ❌ Exception in saveUsernameToProfile:', err);
        }
    };

    const handleContinue = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('OnboardingSummary');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {isDarkTheme(theme.name) ? (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
            ) : (
                <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
            )}
            
            <View style={styles.content}>
                {/* Check + Headline Unit */}
                <Animated.View style={[styles.centerUnit, { opacity: contentFade }]}>
                    <Animated.View style={[styles.checkIcon, { transform: [{ scale: checkmarkScale }] }]}>
                        <Ionicons name="checkmark-outline" size={90} color="#a855f7" />
                    </Animated.View>
                    <Text style={[styles.headline, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e' }]}>{userName ? `${userName}, your personal plan is ready` : "You're all set"}</Text>
                    <Text style={[styles.reassurance, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.6)' : '#6b7280' }]}>Your space is ready.</Text>
                </Animated.View>

                {/* CTA Button */}
                <Animated.View style={[styles.ctaContainer, { opacity: contentFade }]}>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        activeOpacity={0.9}
                        onPress={handleContinue}
                    >
                        <View style={styles.ctaGradient}>
                            <Text style={styles.ctaText}>Continue</Text>
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
        backgroundColor: '#fef7f2',
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
        fontSize: 36,
        fontWeight: '700',
        color: '#1a1a2e',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: -0.5,
        lineHeight: 44,
    },
    reassurance: {
        fontSize: 19,
        color: '#6b7280',
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
        borderRadius: 28,
        backgroundColor: '#1a1a1a',
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
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.2,
    },
});
