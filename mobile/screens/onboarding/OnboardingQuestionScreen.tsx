import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Animated, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import SunoGradient from '../../components/onboarding/SunoGradient';
import ProgressBarNeon from '../../components/onboarding/ProgressBarNeon';
import PillOption from '../../components/onboarding/PillOption';

const cambridgeLogo = require('../../assets/Other-Cambridge-Logo.png');
const stressManagementLottie = require('../../public/animations/Stress Management.json');

const { width } = Dimensions.get('window');

type StepType = 'question' | 'info';

interface Option {
    label: string;
    value: string;
    icon?: string;
}

interface Feature {
    icon: string;
    text: string;
}

interface Step {
    id: string;
    type: StepType;
    title: string;
    subtitle?: string; // For info slides or questions
    options?: Option[]; // For questions
    buttonText?: string; // For info slides
    skippable?: boolean; // For optional questions
    // New fields for premium info pages
    badges?: string[]; // Array of badge names (placeholders)
    animationType?: 'journaling' | 'ai'; // Type of animation to show
    features?: Feature[]; // List of features for AI page
    showPrivacyBadge?: boolean; // Whether to show the privacy badge
    learnMoreLink?: boolean; // Whether to show "Learn More" link
    showAPAStudy?: boolean; // Whether to show APA study pill tag
}

const STEPS: Step[] = [
    // 1. Goal
    {
        id: 'goal',
        type: 'question',
        title: "What is your main goal right now?",
        options: [
            { label: 'Improve Mood', value: 'mood', icon: 'sunny' },
            { label: 'Reduce Stress', value: 'stress', icon: 'leaf' },
            { label: 'Build Habits', value: 'habits', icon: 'calendar' },
            { label: 'Gain Clarity', value: 'clarity', icon: 'bulb' },
        ]
    },
    // 2. Info Slide A (Research)
    {
        id: 'research_info',
        type: 'info',
        title: "Journaling improves your emotional & physical health.",
        subtitle: "Just 15–20 minutes of expressive writing can improve wellbeing.",
        badges: ['Cambridge University'],
        animationType: 'journaling',
        learnMoreLink: true,
        buttonText: "Next"
    },
    // 3. Frequency
    {
        id: 'frequency',
        type: 'question',
        title: "How often do you want to reflect?",
        options: [
            { label: 'Daily', value: 'daily', icon: 'repeat' },
            { label: 'Weekly', value: 'weekly', icon: 'calendar-outline' },
            { label: 'As Needed', value: 'as_needed', icon: 'hand-left' },
        ]
    },
    // 4. Journaling Experience
    {
        id: 'journalingExperience',
        type: 'question',
        title: "How long have you been journaling?",
        options: [
            { label: "I'm new to journaling", value: 'new', icon: 'star-outline' },
            { label: "< 6 months", value: '<6m', icon: 'time-outline' },
            { label: "6–24 months", value: '6-24m', icon: 'book-outline' },
            { label: "2+ years", value: '2+y', icon: 'ribbon-outline' },
        ]
    },
    // 5. Info Slide B (Patterns)
    {
        id: 'patterns_info',
        type: 'info',
        title: "AI reveals patterns you'd miss.",
        subtitle: "InsightAI surfaces emotional patterns and triggers you might overlook.",
        animationType: 'ai',
        features: [
            { icon: 'search', text: 'Emotional pattern detection' },
            { icon: 'flash', text: 'Trigger recognition' },
            { icon: 'bulb', text: 'Smart long-entry summaries' },
        ],
        showPrivacyBadge: true,
        showAPAStudy: true,
        buttonText: "Continue"
    },
    // 6. Identity (Optional)
    {
        id: 'genderIdentity',
        type: 'question',
        title: "How do you identify?",
        subtitle: "We only use this to personalize insights.",
        skippable: true,
        options: [
            { label: 'Woman', value: 'woman', icon: 'female' },
            { label: 'Man', value: 'man', icon: 'male' },
            { label: 'Non-binary', value: 'non-binary', icon: 'transgender' },
            { label: 'Prefer not to say', value: 'prefer-not', icon: 'person' },
        ]
    }
];

export default function OnboardingQuestionScreen({ navigation }: any) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [fadeAnim] = useState(new Animated.Value(1));

    // Animation values for placeholders
    const floatAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Floating animation for icons
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 10,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Pulse animation for AI dots
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const currentStep = STEPS[currentIndex];
    const totalQuestionSteps = 6; // Total steps for progress bar

    const handleNext = (value?: string) => {
        if (value && currentStep.type === 'question') {
            setAnswers(prev => ({ ...prev, [currentStep.id]: value }));
        }

        // Animate out
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            if (currentIndex < STEPS.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setSelectedOption(null); // Reset selection for next question
                // Animate in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            } else {
                // Finished - go to analyzing screen
                const finalAnswers = value ? { ...answers, [currentStep.id]: value } : answers;
                navigation.navigate('Analyzing', { answers: finalAnswers });
            }
        });
    };

    const handleSkip = () => {
        handleNext(); // Just proceed without saving an answer for this step
    };

    const renderAnimationPlaceholder = () => {
        if (currentStep.animationType === 'journaling') {
            return (
                <View style={styles.animationContainer}>
                    <LottieView
                        source={stressManagementLottie}
                        autoPlay
                        loop
                        style={styles.lottieAnimation}
                    />
                </View>
            );
        }
        // No animation for AI patterns page
        return null;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <SunoGradient />

            {/* Neon Progress Bar */}
            <View style={styles.progressWrapper}>
                <ProgressBarNeon currentStep={currentIndex + 1} totalSteps={totalQuestionSteps} />
            </View>

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        onPress={() => {
                            if (currentIndex === 0) {
                                navigation.goBack();
                            } else {
                                setCurrentIndex(currentIndex - 1);
                                setSelectedOption(null);
                            }
                        }}
                        style={styles.backButton}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color="#9ca3af"
                        />
                    </TouchableOpacity>

                    <View style={{ width: 40 }} />
                </View>

                <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>

                    {/* Premium Info Page Layout for Journaling */}
                    {currentStep.type === 'info' && currentStep.id === 'research_info' ? (
                        <View style={styles.premiumInfoContainer}>
                            {/* Lottie with Circular Glow */}
                            <View style={styles.lottieGlowContainer}>
                                <View style={styles.circularGlow} />
                                <LottieView
                                    source={stressManagementLottie}
                                    autoPlay
                                    loop
                                    style={styles.premiumLottie}
                                />
                            </View>

                            {/* Main Headline */}
                            <Text style={styles.premiumTitle}>
                                {currentStep.title}
                            </Text>

                            {/* Subtext */}
                            <Text style={styles.premiumSubtitle}>
                                {currentStep.subtitle}
                            </Text>

                            {/* Cambridge Section */}
                            <View style={styles.premiumCambridgeSection}>
                                <Image
                                    source={cambridgeLogo}
                                    style={styles.premiumCambridgeLogo}
                                    resizeMode="contain"
                                />
                                <Text style={styles.premiumCambridgeReference}>
                                    Advances in Psychiatric Treatment, 2005
                                </Text>
                                <TouchableOpacity style={styles.premiumLearnMoreButton}>
                                    <Text style={styles.premiumLearnMoreText}>
                                        Learn more about the science →
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <>
                            {/* Standard Layout for Other Pages */}
                            {renderAnimationPlaceholder()}

                            <Text style={[styles.title, currentStep.type === 'info' && styles.infoTitle]}>
                                {currentStep.title}
                            </Text>

                            {currentStep.subtitle && (
                                <Text style={styles.subtitle}>{currentStep.subtitle}</Text>
                            )}

                            {/* Slim Pill APA Study Tag for Patterns Page */}
                            {currentStep.type === 'info' && currentStep.id === 'patterns_info' && currentStep.showAPAStudy && (
                                <View style={styles.apaStudyPill}>
                                    <Text style={styles.apaStudyText}>
                                        📘 Expressive writing boosts emotional processing — APA Psychology Review
                                    </Text>
                                </View>
                            )}
                        </>
                    )}

                    {/* Feature List with Premium Spacing */}
                    {currentStep.features && (
                        <View style={styles.premiumFeaturesContainer}>
                            {currentStep.features.map((feature, index) => (
                                <View key={index} style={styles.premiumFeatureRow}>
                                    <Text style={styles.featureEmoji}>
                                        {feature.icon === 'search' ? '🔍' : feature.icon === 'flash' ? '⚡' : '🧠'}
                                    </Text>
                                    <Text style={styles.premiumFeatureText}>
                                        <Text style={styles.featureBold}>{feature.text.split(' ')[0]} {feature.text.split(' ')[1]}</Text>
                                        {' '}{feature.text.split(' ').slice(2).join(' ')}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}


                    {/* Question Options with PillOption component */}
                    {currentStep.type === 'question' && currentStep.options && (
                        <View style={styles.questionContent}>
                            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                                <View style={styles.optionsContainer}>
                                    {currentStep.options.map((option) => (
                                        <PillOption
                                            key={option.value}
                                            label={option.label}
                                            icon={option.icon}
                                            selected={selectedOption === option.value}
                                            onPress={() => setSelectedOption(option.value)}
                                        />
                                    ))}
                                </View>

                                {currentStep.skippable && (
                                    <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                                        <Text style={styles.skipText}>Skip for now</Text>
                                    </TouchableOpacity>
                                )}
                            </ScrollView>

                            {/* Continue Button - only enabled when option selected */}
                            <TouchableOpacity
                                style={[styles.continueButton, !selectedOption && styles.continueButtonDisabled]}
                                activeOpacity={0.9}
                                onPress={() => selectedOption && handleNext(selectedOption)}
                                disabled={!selectedOption}
                            >
                                <LinearGradient
                                    colors={selectedOption ? ['#a855f7', '#8b5cf6'] : ['#4b5563', '#374151']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.continueGradient}
                                >
                                    <Text style={[styles.continueText, !selectedOption && styles.continueTextDisabled]}>Continue</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Info Footer */}
                    {currentStep.type === 'info' && (
                        <View style={styles.infoFooter}>
                            {currentStep.showPrivacyBadge && (
                                <View style={styles.privacyBadge}>
                                    <Ionicons name="lock-closed" size={12} color="#9ca3af" />
                                    <Text style={styles.privacyText}>Private & Secure — processed on your device</Text>
                                </View>
                            )}
                            <TouchableOpacity
                                style={styles.primaryButton}
                                activeOpacity={0.9}
                                onPress={() => handleNext()}
                            >
                                <LinearGradient
                                    colors={['#8b5cf6', '#6d28d9']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.primaryButtonGradient}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {currentStep.buttonText || "Continue"}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
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
    progressWrapper: {
        marginTop: 60,
        marginBottom: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    stepIndicator: {
        fontSize: 12,
        color: '#a78bfa',
        fontWeight: '700',
        letterSpacing: 1,
    },
    stepContainer: {
        flex: 1,
    },
    animationContainer: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 8,
    },
    lottieAnimation: {
        width: 160,
        height: 160,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
        lineHeight: 40,
    },
    infoTitle: {
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: -0.8,
        lineHeight: 38,
    },
    subtitle: {
        fontSize: 17,
        color: '#d1d5db',
        lineHeight: 26,
        marginBottom: 24,
        fontWeight: '500',
    },
    statContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        marginBottom: 24,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
    },
    statIcon: {
        fontSize: 20,
        marginTop: 2,
    },
    statText: {
        flex: 1,
        fontSize: 14,
        color: '#d1d5db',
        lineHeight: 22,
        fontWeight: '500',
    },
    cambridgeLogoContainer: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 32,
    },
    cambridgeLogo: {
        width: 180,
        height: 50,
        opacity: 0.85,
    },
    cambridgeReference: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 8,
        fontWeight: '500',
    },
    badgesContainer: {
        marginTop: 8,
        marginBottom: 32,
    },
    badgesLabel: {
        fontSize: 10,
        color: '#6b7280',
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    badgeText: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '500',
    },
    featuresContainer: {
        gap: 16,
        marginBottom: 32,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    featureIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        fontSize: 16,
        color: '#e0e7ff',
        fontWeight: '500',
    },
    learnMoreButton: {
        marginBottom: 20,
    },
    learnMoreText: {
        fontSize: 14,
        color: '#a78bfa',
        fontWeight: '600',
    },
    questionContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    optionsList: {
        flex: 1,
    },
    optionsContainer: {
        gap: 12,
        paddingBottom: 20,
    },
    optionButton: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    optionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionText: {
        fontSize: 16,
        color: '#e0e7ff',
        fontWeight: '500',
    },
    skipButton: {
        alignItems: 'center',
        padding: 16,
        marginTop: 8,
    },
    skipText: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '500',
    },
    continueButton: {
        width: '100%',
        borderRadius: 999,
        marginTop: 16,
        marginBottom: 24,
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 12,
    },
    continueButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
        opacity: 0.5,
    },
    continueGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 999,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    continueText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    continueTextDisabled: {
        color: '#9ca3af',
    },
    infoFooter: {
        marginTop: 'auto',
        marginBottom: 40,
    },
    privacyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 16,
    },
    privacyText: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    primaryButton: {
        width: '100%',
        borderRadius: 999,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 999,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    // Premium Info Page Styles (Calm/Headspace inspired)
    premiumInfoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    lottieGlowContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 48,
    },
    circularGlow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 40,
        elevation: 0,
    },
    premiumLottie: {
        width: 180,
        height: 180,
        zIndex: 1,
    },
    premiumTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        lineHeight: 36,
        letterSpacing: -0.5,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    premiumSubtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#d1d5db',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 56,
        paddingHorizontal: 24,
    },
    premiumCambridgeSection: {
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 32,
    },
    premiumCambridgeLogo: {
        width: 160,
        height: 45,
        opacity: 0.9,
        marginBottom: 12,
    },
    premiumCambridgeReference: {
        fontSize: 11,
        color: '#9ca3af',
        fontWeight: '500',
        marginBottom: 16,
        textAlign: 'center',
    },
    premiumLearnMoreButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    premiumLearnMoreText: {
        fontSize: 13,
        color: '#a78bfa',
        fontWeight: '600',
        opacity: 0.85,
        letterSpacing: 0.2,
    },
    // APA Study Pill Tag (Slim, Subtle)
    apaStudyPill: {
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
        opacity: 0.9,
    },
    apaStudyText: {
        fontSize: 13,
        color: '#d1d5db',
        fontWeight: '500',
        lineHeight: 20,
        textAlign: 'center',
    },
    // Premium Feature List (Generous Spacing)
    premiumFeaturesContainer: {
        gap: 24,
        marginTop: 32,
        marginBottom: 40,
    },
    premiumFeatureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
    },
    featureEmoji: {
        fontSize: 20,
        marginTop: 2,
    },
    premiumFeatureText: {
        flex: 1,
        fontSize: 16,
        color: '#e5e7eb',
        fontWeight: '500',
        lineHeight: 24,
    },
    featureBold: {
        fontWeight: '700',
        color: '#fff',
    },
});
