import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { isTablet, sf } from '../../utils/responsive';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<any>;
};

const SUGGESTED_PROMPTS = [
    'overwhelmed',
    'outside',
    'procrastinating',
    'grateful',
];

// Simple local AI response — no backend needed during onboarding
const getLocalAIResponse = (
    entry: string,
    t: (key: string) => string,
): string => {
    const lower = entry.toLowerCase();
    if (lower.includes('overwhelm') || lower.includes('stress') || lower.includes('anxious') || lower.includes('work') || lower.includes('abrum') || lower.includes('estrés') || lower.includes('ansiedad') || lower.includes('trabajo'))
        return t('onboarding.showcase.responses.overwhelmed');
    if (lower.includes('happy') || lower.includes('grateful') || lower.includes('good') || lower.includes('outside') || lower.includes('walk') || lower.includes('feliz') || lower.includes('grat') || lower.includes('salir') || lower.includes('paseo'))
        return t('onboarding.showcase.responses.positive');
    if (lower.includes('putting off') || lower.includes('procrastinat') || lower.includes('lazy') || lower.includes('motivation') || lower.includes('pospon') || lower.includes('pereza') || lower.includes('motivación'))
        return t('onboarding.showcase.responses.procrastination');
    if (lower.includes('sad') || lower.includes('lonely') || lower.includes('alone') || lower.includes('depress') || lower.includes('triste') || lower.includes('solo') || lower.includes('depres'))
        return t('onboarding.showcase.responses.sadness');
    return t('onboarding.showcase.responses.default');
};

export default function InteractiveShowcaseScreen({ navigation }: Props) {
    const { theme } = useTheme();
    const { userName } = useOnboarding();
    const { t } = useLanguage();
    const [entryText, setEntryText] = useState('');
    const [showPromptPicker, setShowPromptPicker] = useState(true);
    const [showAIBubble, setShowAIBubble] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [displayedAI, setDisplayedAI] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showCTA, setShowCTA] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const containerFade = useRef(new Animated.Value(0)).current;
    const promptPickerFade = useRef(new Animated.Value(0)).current;
    const aiBubbleFade = useRef(new Animated.Value(0)).current;
    const ctaFade = useRef(new Animated.Value(0)).current;
    const inputRef = useRef<TextInput>(null);
    const aiTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const dark = isDarkTheme(theme.name);
    const textColor = dark ? '#ffffff' : '#1a1a2e';
    const subColor = dark ? 'rgba(255,255,255,0.6)' : '#6b7280';
    const cardBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)';
    const cardBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    useEffect(() => {
        analytics.trackOnboardingScreen('interactive_showcase', 'viewed', userName || undefined);
        Animated.timing(containerFade, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        // Show prompt picker after a brief delay
        setTimeout(() => {
            Animated.timing(promptPickerFade, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }, 500);

        return () => {
            if (aiTimerRef.current) clearInterval(aiTimerRef.current);
        };
    }, []);

    const handleSubmitEntry = useCallback((text: string) => {
        if (!text.trim() || hasSubmitted) return;
        setHasSubmitted(true);
        setShowPromptPicker(false);
        setIsAnalyzing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Simulate a brief analysis delay, then show AI response
        setTimeout(() => {
            setIsAnalyzing(false);
            const response = getLocalAIResponse(text, t);
            setAiResponse(response);
            setShowAIBubble(true);

            Animated.timing(aiBubbleFade, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

            // Typewriter effect for AI response
            let aiIdx = 0;
            aiTimerRef.current = setInterval(() => {
                if (aiIdx < response.length) {
                    setDisplayedAI(response.substring(0, aiIdx + 1));
                    aiIdx++;
                } else {
                    if (aiTimerRef.current) clearInterval(aiTimerRef.current);
                    // Show continue button
                    setTimeout(() => {
                        setShowCTA(true);
                        Animated.timing(ctaFade, {
                            toValue: 1,
                            duration: 500,
                            useNativeDriver: true,
                        }).start();
                    }, 400);
                }
            }, 16);
        }, 1500);
    }, [hasSubmitted, t]);

    const handlePickPrompt = (prompt: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEntryText(prompt);
        setShowPromptPicker(false);
        // Auto-submit after picking
        setTimeout(() => handleSubmitEntry(prompt), 300);
    };

    return (
        <View style={styles.container}>
            <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />

            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.canGoBack() && navigation.goBack()}
                activeOpacity={0.7}
            >
                <View style={[styles.backArrowCircle, { backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <Ionicons name="arrow-back" size={20} color={dark ? '#ffffff' : '#1a1a2e'} />
                </View>
            </TouchableOpacity>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={10}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={[styles.content, { opacity: containerFade }]}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[styles.headerLabel, { color: subColor }]}>{t('onboarding.showcase.label')}</Text>
                            <Text style={[styles.title, { color: textColor }]}>{t('onboarding.showcase.title')}</Text>
                        </View>

                        {/* Journal Input Card */}
                        <View style={[styles.journalCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                            <View style={styles.journalHeader}>
                                <Text style={[styles.journalHeaderLabel, { color: subColor }]}>{t('onboarding.showcase.entry')}</Text>
                                <View style={styles.cursorDot} />
                            </View>
                            <TextInput
                                ref={inputRef}
                                style={[styles.journalInput, { color: textColor }]}
                                placeholder={t('onboarding.showcase.placeholder')}
                                placeholderTextColor={dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                                multiline
                                value={entryText}
                                onChangeText={setEntryText}
                                editable={!hasSubmitted}
                                returnKeyType="done"
                                blurOnSubmit
                                onSubmitEditing={() => handleSubmitEntry(entryText)}
                            />
                            {!hasSubmitted && entryText.trim().length > 0 && (
                                <TouchableOpacity
                                    style={styles.sendButton}
                                    onPress={() => handleSubmitEntry(entryText)}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.sendButtonGradient}>
                                        <Ionicons name="arrow-up" size={18} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* "Pick a question" prompt overlay */}
                        {showPromptPicker && !hasSubmitted && (
                            <Animated.View style={[styles.promptPickerContainer, { opacity: promptPickerFade }]}>
                                <Text style={[styles.promptPickerTitle, { color: textColor }]}>
                                    {t('onboarding.showcase.pickPrompt')}
                                </Text>
                                {SUGGESTED_PROMPTS.map((promptKey, index) => {
                                    const prompt = t(`onboarding.showcase.prompts.${promptKey}`);
                                    return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.promptChipWrapper}
                                        onPress={() => handlePickPrompt(prompt)}
                                        activeOpacity={0.7}
                                    >
                                        <LinearGradient
                                            colors={dark ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'] : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 0, y: 1 }}
                                            style={[styles.promptChip, { borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }]}
                                        >
                                            <Text style={[styles.promptChipText, { color: dark ? 'rgba(255,255,255,0.85)' : '#374151' }]} numberOfLines={1}>
                                                {prompt}
                                            </Text>
                                            <Ionicons name="chevron-forward" size={16} color={dark ? 'rgba(255,255,255,0.4)' : '#9ca3af'} />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    );
                                })}
                            </Animated.View>
                        )}

                        {/* Analyzing indicator */}
                        {isAnalyzing && (
                            <View style={styles.analyzingContainer}>
                                <ActivityIndicator size="small" color="#a855f7" />
                                <Text style={[styles.analyzingText, { color: subColor }]}>{t('onboarding.showcase.thinking')}</Text>
                            </View>
                        )}

                        {/* AI Response Bubble */}
                        {showAIBubble && (
                            <Animated.View style={[styles.aiResponseContainer, { opacity: aiBubbleFade }]}>
                                <View style={styles.aiAvatarRow}>
                                    <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.aiAvatar}>
                                        <Ionicons name="sparkles" size={14} color="#fff" />
                                    </LinearGradient>
                                    <Text style={[styles.aiLabel, { color: subColor }]}>{t('onboarding.showcase.aiLabel')}</Text>
                                </View>
                                <View style={[styles.aiBubble, { backgroundColor: dark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)', borderColor: dark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)' }]}>
                                    <Text style={[styles.aiText, { color: textColor }]}>
                                        {displayedAI}
                                    </Text>
                                </View>
                            </Animated.View>
                        )}
                    </Animated.View>
                </ScrollView>

                {/* CTA — fades in after AI response completes */}
                {showCTA && (
                    <Animated.View style={[styles.ctaContainer, { opacity: ctaFade }]}>
                        <TouchableOpacity
                            style={styles.ctaButton}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('PrivacyOnboarding')}
                        >
                            <View style={styles.ctaGradient}>
                                <Text style={styles.ctaText}>{t('common.continue')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('PrivacyOnboarding')}
                            style={styles.skipButton}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.skipText, { color: subColor }]}>{t('onboarding.skipForNow')}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Skip button always visible if user hasn't submitted yet */}
                {!hasSubmitted && !showCTA && (
                    <View style={styles.ctaContainer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('PrivacyOnboarding')}
                            style={styles.skipButton}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.skipText, { color: subColor }]}>{t('onboarding.skipForNow')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: isTablet ? 60 : 50,
        left: 20,
        zIndex: 10,
        padding: 4,
    },
    backArrowCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: isTablet ? 48 : 24,
        paddingTop: isTablet ? 110 : 100,
        paddingBottom: 20,
    },
    header: {
        marginBottom: 28,
    },
    headerLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    title: {
        fontSize: sf(30),
        fontWeight: '700',
        letterSpacing: -0.5,
        lineHeight: sf(38),
    },
    journalCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        minHeight: 120,
        marginBottom: 16,
        position: 'relative',
    },
    journalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    journalHeaderLabel: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    cursorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#a855f7',
    },
    journalInput: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
        letterSpacing: 0.1,
        minHeight: 60,
        maxHeight: 120,
        textAlignVertical: 'top',
    },
    sendButton: {
        position: 'absolute',
        bottom: 14,
        right: 14,
    },
    sendButtonGradient: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    promptPickerContainer: {
        marginBottom: 16,
    },
    promptPickerTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
    },
    promptChipWrapper: {
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    promptChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
    },
    promptChipText: {
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
        marginRight: 8,
    },
    analyzingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        paddingVertical: 8,
    },
    analyzingText: {
        fontSize: 15,
        fontWeight: '500',
    },
    aiResponseContainer: {
        marginTop: 4,
    },
    aiAvatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    aiAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    aiBubble: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
    },
    aiText: {
        fontSize: 15,
        lineHeight: 23,
        fontWeight: '400',
    },
    ctaContainer: {
        paddingHorizontal: isTablet ? 48 : 24,
        paddingBottom: 24,
    },
    ctaButton: {
        borderRadius: 28,
        backgroundColor: '#1a1a1a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    ctaGradient: {
        paddingVertical: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 28,
    },
    ctaText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.3,
    },
    skipButton: {
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    skipText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
