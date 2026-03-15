import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Animated, ScrollView, Image, Easing, Linking, TextInput, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Asset } from 'expo-asset';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SunoGradient from '../../components/onboarding/SunoGradient';
import ProgressBarNeon from '../../components/onboarding/ProgressBarNeon';
import PillOption from '../../components/onboarding/PillOption';
import AnimatedSlider from '../../components/onboarding/AnimatedSlider';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { isTablet, sf, ss, iPadContentStyle } from '../../utils/responsive';

const cambridgeLogo = require('../../assets/Cambridge-logo.png');
const stressManagementLottie = require('../../public/animations/Stress Management.json');

// Research institution logos
const cambridgeLogoFrame = require('../../public/research-images/Cambridge-Logo-Frame.png');
const liverpoolLogo = require('../../public/research-images/Liverpool-Logo.jpg');
const kaiserLogo = require('../../public/research-images/Smaller-Kaiser-Logo.png');
const apaLogo = require('../../public/research-images/APA-LOGO.png');

const { width } = Dimensions.get('window');

type StepType = 'question' | 'info' | 'slider' | 'text_input';

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
    min?: number;
    max?: number;
    defaultValue?: number;
    // New fields for premium info pages
    badges?: string[]; // Array of badge names (placeholders)
    animationType?: 'journaling' | 'ai'; // Type of animation to show
    features?: Feature[]; // List of features for AI page
    showPrivacyBadge?: boolean; // Whether to show the privacy badge
    learnMoreLink?: boolean; // Whether to show "Learn More" link
    showAPAStudy?: boolean; // Whether to show APA study pill tag
}

const STEPS: Step[] = [
    // 0. What is your name
    {
        id: 'name',
        type: 'text_input',
        title: "What is your name?",
        subtitle: "We'll use this to personalize your experience.",
    },
    // 1. Where did you hear about us
    {
        id: 'referral',
        type: 'question',
        title: "Where did you hear about us?",
        options: [
            { label: 'Instagram', value: 'instagram', icon: 'logo-instagram' },
            { label: 'Facebook', value: 'facebook', icon: 'logo-facebook' },
            { label: 'TikTok', value: 'tiktok', icon: 'logo-tiktok' },
            { label: 'YouTube', value: 'youtube', icon: 'logo-youtube' },
            { label: 'Google', value: 'google', icon: 'logo-google' },
            { label: 'Friend', value: 'friend', icon: 'people' },
            { label: 'Other', value: 'other', icon: 'ellipsis-horizontal' },
        ]
    },
    // 2. Goal
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
        title: "Grounded in psychology",
        subtitle: "Research shows that reflective journaling improves emotional awareness and long-term wellbeing.",
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
    // 6. Wellbeing Slider
    {
        id: 'wellbeing',
        type: 'slider',
        title: "How would you rate your daily wellbeing?",
        subtitle: "On a scale of 1-10, where do you typically feel?",
        min: 1,
        max: 10,
        defaultValue: 7,
    },
    // 7. Identity
    {
        id: 'genderIdentity',
        type: 'question',
        title: "How do you identify?",
        subtitle: "We only use this to personalize insights.",
        options: [
            { label: 'Woman', value: 'woman', icon: 'female' },
            { label: 'Man', value: 'man', icon: 'male' },
            { label: 'Non-binary', value: 'non-binary', icon: 'transgender' },
            { label: 'Prefer not to say', value: 'prefer-not', icon: 'person' },
        ]
    }
];

export default function OnboardingQuestionScreen({ navigation, route }: any) {
    const { userName, setUserName, setOnboardingAnswers } = useOnboarding();
    const { theme } = useTheme();
    const startIndex = route?.params?.startIndex ?? 0;
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [textInputValue, setTextInputValue] = useState('');
    const [wellbeingValue, setWellbeingValue] = useState(7);
    const [contentFadeAnim] = useState(new Animated.Value(1));
    const isTransitioning = useRef(false);
    const [showLottie, setShowLottie] = useState(false);
    const [featureFadeAnims] = useState([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]);
    // Animation values for pill options (staggered fade-in)
    const [optionFadeAnims] = useState([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]);
    // Animation values for info pages - start at 0 so they're hidden initially
    const [infoLottieAnim] = useState(new Animated.Value(0));
    const [infoCardAnim] = useState(new Animated.Value(0));

    // Animation values for placeholders
    const floatAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const currentStep = STEPS[currentIndex];
    const totalQuestionSteps = STEPS.length;

    // CRITICAL: Skip name step ONLY if user explicitly used Apple/Google Sign-In
    useEffect(() => {
        const prefillNameFromSocialSignIn = async () => {
            if (currentStep.id === 'name') {
                // Read cached username from AsyncStorage (set by Google/Apple sign-in)
                const cachedUsername = await AsyncStorage.getItem('CACHED_USERNAME');
                
                if (cachedUsername && !textInputValue) {
                    console.log('[OnboardingQuestion] Prefilling name from social sign-in:', cachedUsername);
                    // Prefill the name field so user can confirm or edit
                    setUserName(cachedUsername);
                    setTextInputValue(cachedUsername); // Update the actual input field value
                    setAnswers(prev => ({ ...prev, name: cachedUsername }));
                } else if (!cachedUsername) {
                    console.log('[OnboardingQuestion] No cached username to prefill, showing empty name step');
                }
            }
        };
        prefillNameFromSocialSignIn();
    }, [currentStep.id]);

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
    }, [floatAnim, pulseAnim]);

    useEffect(() => {
        // Smooth fade-in for all step transitions
        contentFadeAnim.setValue(0);
        Animated.timing(contentFadeAnim, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            isTransitioning.current = false;
        });

        // Reset wellbeing default when entering slider step
        if (currentStep.type === 'slider') {
            setWellbeingValue(currentStep.defaultValue ?? 7);
        }

        // Reset and staggered fade-in for AI features
        if (currentStep.features) {
            featureFadeAnims.forEach((anim) => anim.setValue(0));
            featureFadeAnims.forEach((anim, index) => {
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 520,
                    delay: 200 + index * 160,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }).start();
            });
        }

        // Instant show for question pill options — no stagger to prevent gap glitch
        if (currentStep.type === 'question' && currentStep.options) {
            optionFadeAnims.forEach((anim) => anim.setValue(1));
        }

        // Simple fade-in for info pages (research) - same as other pages
        if (currentStep.type === 'info') {
            setShowLottie(false);
            infoCardAnim.setValue(1); // Just show immediately, no stagger
        } else {
            setShowLottie(false);
        }
    }, [currentIndex, currentStep.type, currentStep.defaultValue, currentStep.features, currentStep.options, featureFadeAnims, optionFadeAnims, infoLottieAnim, infoCardAnim, contentFadeAnim]);

    const handleNext = (value?: string) => {
        if (isTransitioning.current) return; // Prevent double-taps during transition
        isTransitioning.current = true;
        
        console.log('[OnboardingQuestion] handleNext called with value:', value);
        console.log('[OnboardingQuestion] Current step:', currentStep.type, currentStep.id);
        
        if (value && (currentStep.type === 'question' || currentStep.type === 'slider')) {
            setAnswers(prev => ({ ...prev, [currentStep.id]: value }));
        }
        
        // Save name to context when user enters it in text_input step
        if (value && currentStep.type === 'text_input' && currentStep.id === 'name') {
            console.log('[OnboardingQuestion] ✅ Saving username to context:', value);
            setUserName(value);
            setAnswers(prev => ({ ...prev, [currentStep.id]: value }));
            console.log('[OnboardingQuestion] Username saved to context');
        }

        // Fade out current content, then swap to next step
        Animated.timing(contentFadeAnim, {
            toValue: 0,
            duration: 150,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            if (currentIndex < STEPS.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setSelectedOption(null);
            } else {
                // Finished - go to analyzing screen
                isTransitioning.current = false;
                const finalAnswers = value ? { ...answers, [currentStep.id]: value } : answers;
                console.log('[OnboardingQuestion] Navigating to Analyzing with answers:', finalAnswers);
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
            <StatusBar barStyle={isDarkTheme(theme.name) ? 'light-content' : 'dark-content'} />

            {/* Use solid background for dark themes, gradient for others */}
            {isDarkTheme(theme.name) ? (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
            ) : (
                <SunoGradient themeColors={theme.colors.backgroundGradient as any} />
            )}

            {/* Back Arrow + Progress Bar Row (Left-aligned like CAL AI) */}
            <View style={styles.topRow}>
                <TouchableOpacity
                    onPress={() => {
                        if (isTransitioning.current) return;
                        if (currentIndex === 0) {
                            navigation.goBack();
                        } else {
                            isTransitioning.current = true;
                            Animated.timing(contentFadeAnim, {
                                toValue: 0,
                                duration: 150,
                                easing: Easing.in(Easing.ease),
                                useNativeDriver: true,
                            }).start(() => {
                                setCurrentIndex(currentIndex - 1);
                                setSelectedOption(null);
                            });
                        }
                    }}
                    style={styles.backArrow}
                >
                    <View style={[styles.backArrowCircle, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        <Ionicons
                            name="arrow-back"
                            size={20}
                            color={isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e'}
                        />
                    </View>
                </TouchableOpacity>
                <View style={styles.progressBarContainer}>
                    <ProgressBarNeon currentStep={currentIndex + 1} totalSteps={totalQuestionSteps} />
                </View>
            </View>

            <Animated.View style={[styles.content, { opacity: contentFadeAnim }]}>

                <View style={styles.stepContainer}>

                    {/* Premium Info Page Layout for Journaling */}
                    {currentStep.type === 'info' && currentStep.id === 'research_info' ? (
                        <View style={styles.premiumInfoContainer}>
                            {/* Title - positioned at same height as quiz pages */}
                            <Animated.View style={{ opacity: infoCardAnim, marginTop: 20 }}>
                                <Text style={[styles.researchTitle, isDarkTheme(theme.name) && { color: '#ffffff' }]}>
                                    Insight is grounded in psychology
                                </Text>
                            </Animated.View>

                            {/* Meditation Animation - 15% bigger than before */}
                            <Animated.View style={{ opacity: infoCardAnim, alignItems: 'center', marginTop: 20, marginBottom: 16 }}>
                                <LottieView
                                    source={stressManagementLottie}
                                    autoPlay
                                    loop
                                    style={{ width: 195, height: 195 }}
                                />
                            </Animated.View>

                            {/* Glassmorphic Card with body text */}
                            <Animated.View
                                style={{
                                    opacity: infoCardAnim,
                                    transform: [{
                                        translateY: infoCardAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [20, 0],
                                        })
                                    }],
                                    width: '100%',
                                }}
                            >
                                <View style={[styles.glassCard, isDarkTheme(theme.name) && { borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                                    <LinearGradient
                                        colors={isDarkTheme(theme.name) ? ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)'] : ['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.35)']}
                                        style={styles.glassCardGradient}
                                    >
                                        <Text style={[styles.glassCardBody, isDarkTheme(theme.name) && { color: 'rgba(255, 255, 255, 0.7)' }]}>
                                            Research from leading institutions has shown that journaling improves mental wellbeing.
                                        </Text>
                                    </LinearGradient>
                                </View>
                            </Animated.View>

                            {/* Institution Logos Grid */}
                            <Animated.View
                                style={{
                                    opacity: infoCardAnim,
                                    transform: [{
                                        translateY: infoCardAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [20, 0],
                                        })
                                    }],
                                    width: '100%',
                                    marginTop: 20,
                                }}
                            >
                                <View style={styles.logoGrid}>
                                    <Image 
                                        source={cambridgeLogoFrame} 
                                        style={[styles.logoImage, styles.logoTopLeft, isDarkTheme(theme.name) && styles.logoImageDark]} 
                                        resizeMode="cover" 
                                    />
                                    <Image 
                                        source={liverpoolLogo} 
                                        style={[styles.logoImage, styles.logoTopRight, isDarkTheme(theme.name) && styles.logoImageDark]} 
                                        resizeMode="cover" 
                                    />
                                    <Image 
                                        source={kaiserLogo} 
                                        style={[styles.logoImage, styles.logoBottomLeft, isDarkTheme(theme.name) && styles.logoImageDark]} 
                                        resizeMode="cover" 
                                    />
                                    <Image 
                                        source={apaLogo} 
                                        style={[styles.logoImage, styles.logoBottomRight, isDarkTheme(theme.name) && styles.logoImageDark]} 
                                        resizeMode="cover" 
                                    />
                                </View>
                            </Animated.View>
                        </View>
                    ) : (
                        <>
                            {/* Standard Layout for Other Pages */}
                            {renderAnimationPlaceholder()}

                            {/* Title - softer typography */}
                            <Text style={{
                                fontSize: currentStep.type === 'info' ? 26 : 28,
                                fontWeight: currentStep.type === 'info' ? '500' : '600',
                                color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e',
                                textAlign: 'left',
                                lineHeight: currentStep.type === 'info' ? 34 : 36,
                                letterSpacing: -0.3,
                                marginBottom: 16,
                            }}>
                                {currentStep.title}
                            </Text>

                            {currentStep.subtitle && (
                                <Text style={[styles.subtitle, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.7)' : '#555555' }]}>{currentStep.subtitle}</Text>
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

                    {/* Feature List - Premium Pills for AI Insights */}
                    {currentStep.features && (
                        <View style={{
                            alignItems: 'center',
                            marginTop: 32,
                            marginBottom: 40,
                        }}>
                            {/* Section Heading */}
                            {/* ⚡ EDIT HERE: Change heading text, fontSize, color */}
                            <Text style={{
                                fontSize: 14,              // ⚡ Heading size
                                fontWeight: '600',         // ⚡ Boldness
                                color: 'rgba(0, 0, 0, 0.35)',
                                textTransform: 'uppercase',
                                letterSpacing: 1.5,
                                marginBottom: 20,
                                textAlign: 'center',
                            }}>
                                GET INSIGHTS WITH
                            </Text>

                            {/* Feature Pills with Staggered Animation */}
                            <View style={{
                                gap: 12,
                                width: '100%',
                                alignItems: 'center',
                            }}>
                                {currentStep.features.map((feature, index) => (
                                    <Animated.View 
                                        key={index} 
                                        style={{
                                            opacity: featureFadeAnims[index],
                                            transform: [{
                                                translateY: featureFadeAnims[index].interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [20, 0],
                                                })
                                            }],
                                            backgroundColor: 'rgba(139, 92, 246, 0.08)',
                                            borderRadius: 24,
                                            paddingVertical: 16,
                                            paddingHorizontal: 20,
                                            borderWidth: 1.5,
                                            borderColor: 'rgba(139, 92, 246, 0.15)',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 14,
                                            minWidth: '85%',
                                            justifyContent: 'center',
                                            shadowColor: '#8b5cf6',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 12,
                                        }}
                                    >
                                        <View style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: 17,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(139, 92, 246, 0.12)',
                                            borderWidth: 1,
                                            borderColor: 'rgba(139, 92, 246, 0.15)',
                                        }}>
                                            <Ionicons
                                                name={
                                                    feature.icon === 'search'
                                                        ? 'analytics-outline'
                                                        : feature.icon === 'flash'
                                                            ? 'flash-outline'
                                                            : 'sparkles-outline'
                                                }
                                                size={18}
                                                color="#7c3aed"
                                            />
                                        </View>
                                        <Text style={{
                                            fontSize: 15,
                                            color: '#374151',
                                            fontWeight: '600',
                                            textAlign: 'center',
                                        }}>
                                            {feature.text}
                                        </Text>
                                    </Animated.View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Text Input for Name Question */}
                    {currentStep.type === 'text_input' && (
                        <View style={styles.textInputContent}>
                            <TextInput
                                style={[
                                    styles.nameInput,
                                    isDarkTheme(theme.name) && {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        color: '#ffffff',
                                    }
                                ]}
                                placeholder="Enter your name"
                                placeholderTextColor={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.5)' : '#6b7280'}
                                value={textInputValue}
                                onChangeText={setTextInputValue}
                                autoFocus
                                autoCapitalize="words"
                                returnKeyType="done"
                                onSubmitEditing={() => {
                                    // Just dismiss the keyboard - user should press Continue button to advance
                                    Keyboard.dismiss();
                                }}
                            />
                            
                            <TouchableOpacity
                                style={[styles.continueButton, !textInputValue.trim() && styles.continueButtonDisabled]}
                                activeOpacity={0.9}
                                onPress={() => {
                                    if (textInputValue.trim()) {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        handleNext(textInputValue.trim());
                                    }
                                }}
                                disabled={!textInputValue.trim()}
                            >
                                <LinearGradient
                                    colors={textInputValue.trim() ? ['#a855f7', '#8b5cf6'] : ['#d1d5db', '#c4c8cf']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.continueGradient}
                                >
                                    <Text style={[styles.continueText, !textInputValue.trim() && styles.continueTextDisabled]}>Continue</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Question Options with PillOption component */}
                    {currentStep.type === 'question' && currentStep.options && (
                        <View style={styles.questionContent}>
                            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                                <View style={styles.optionsContainer}>
                                    {currentStep.options.map((option, index) => (
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
                                onPress={() => {
                                    if (selectedOption) {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        handleNext(selectedOption);
                                    }
                                }}
                                disabled={!selectedOption}
                            >
                                <LinearGradient
                                    colors={selectedOption ? ['#a855f7', '#8b5cf6'] : ['#d1d5db', '#c4c8cf']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.continueGradient}
                                >
                                    <Text style={[styles.continueText, !selectedOption && styles.continueTextDisabled]}>Continue</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Wellbeing Slider - distinct from normal questions */}
                    {currentStep.type === 'slider' && (
                        <View style={styles.sliderContent}>
                            <View style={styles.sliderValueRow}>
                                <Text style={[styles.sliderValueText, isDarkTheme(theme.name) && styles.sliderValueTextDark]}>{Math.round(wellbeingValue)}/10</Text>
                                <Text style={[styles.sliderHintText, isDarkTheme(theme.name) && { color: 'rgba(255, 255, 255, 0.3)' }]}>TYPICAL DAY</Text>
                            </View>

                            <View style={styles.sliderTrackContainer}>
                                <View style={styles.sliderTrackBase} />
                                <View
                                    style={[
                                        styles.sliderTrackFillWrap,
                                        {
                                            width: `${((wellbeingValue - (currentStep.min ?? 1)) / ((currentStep.max ?? 10) - (currentStep.min ?? 1))) * 100}%`,
                                        },
                                    ]}
                                >
                                    <LinearGradient
                                        colors={['#06b6d4', '#3b82f6', '#8b5cf6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.sliderTrackFill}
                                    />
                                </View>

                                <AnimatedSlider
                                    style={styles.slider}
                                    minimumValue={currentStep.min ?? 1}
                                    maximumValue={currentStep.max ?? 10}
                                    step={1}
                                    value={wellbeingValue}
                                    minimumTrackTintColor="transparent"
                                    maximumTrackTintColor="transparent"
                                    thumbTintColor="#ffffff"
                                    onValueChange={setWellbeingValue}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.sliderContinueButton}
                                activeOpacity={0.9}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    handleNext(String(Math.round(wellbeingValue)));
                                }}
                            >
                                <LinearGradient
                                    colors={['#a855f7', '#8b5cf6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.sliderContinueGradient}
                                >
                                    <Text style={styles.sliderContinueText}>Continue</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Info Footer */}
                    {currentStep.type === 'info' && (
                        <View style={styles.infoFooter}>
                            {/* Privacy badge removed as requested */}
                            <TouchableOpacity
                                style={styles.primaryButton}
                                activeOpacity={0.9}
                                onPress={() => handleNext()}
                            >
                                <LinearGradient
                                    colors={['#a855f7', '#8b5cf6']}
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
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    // ========================================
    // MAIN CONTAINER & LAYOUT
    // ========================================
    container: {
        flex: 1,
        backgroundColor: '#fef7f2',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        gap: 12,
    },
    backArrow: {
        padding: 4,
    },
    backArrowCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressBarContainer: {
        flex: 1,
    },
    progressWrapper: {
        marginTop: 24,
        marginBottom: 24,
    },
    content: {
        flex: 1,
        paddingHorizontal: isTablet ? 60 : 24,
        paddingTop: isTablet ? 32 : 20,
    },
    stepIndicator: {
        fontSize: 12,
        color: 'rgba(226, 232, 240, 0.6)',
        fontWeight: '700',
        letterSpacing: 1,
    },
    
    // ========================================
    // STEP CONTAINER & ANIMATIONS
    // ========================================
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
    
    // ========================================
    // TEXT STYLES - TITLES & SUBTITLES
    // ========================================
    // Main question/info page title
    title: {
        fontSize: sf(34),
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: isTablet ? 24 : 16,
        lineHeight: sf(42),
        letterSpacing: -1.2,
    },
    // Info page title variant
    infoTitle: {
        fontSize: sf(30),
        fontWeight: '800',
        letterSpacing: -1.2,
        lineHeight: sf(38),
    },
    // Subtitle text below title
    subtitle: {
        fontSize: sf(16),
        color: '#555555',
        lineHeight: sf(26),
        marginBottom: isTablet ? 36 : 28,
        fontWeight: '400',
    },
    
    // ========================================
    // STAT CONTAINER & BADGES
    // ========================================
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
    
    // ========================================
    // CAMBRIDGE LOGO SECTION (OLD LAYOUT)
    // ========================================
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
    
    // ========================================
    // BADGES & FEATURES
    // ========================================
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
    
    // Feature list (old layout)
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
        color: '#374151',
        fontWeight: '500',
    },
    
    // ========================================
    // LEARN MORE LINK
    // ========================================
    learnMoreButton: {
        marginBottom: 20,
    },
    learnMoreText: {
        fontSize: 14,
        color: '#a78bfa',
        fontWeight: '600',
    },
    
    // ========================================
    // QUESTION OPTIONS & PILLS
    // ========================================
    questionContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    optionsList: {
        flex: 1,
    },
    optionsContainer: {
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
        padding: isTablet ? 24 : 20,
        borderRadius: isTablet ? 20 : 16,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionText: {
        fontSize: sf(16),
        color: '#374151',
        fontWeight: '500',
    },
    
    // ========================================
    // SKIP & CONTINUE BUTTONS
    // ========================================
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
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
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
        paddingVertical: isTablet ? 22 : 18,
        borderRadius: 999,
        gap: 10,
    },
    continueText: {
        fontSize: sf(18),
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    continueTextDisabled: {
        color: '#9ca3af',
    },
    
    // ========================================
    // INFO PAGE FOOTER & PRIMARY BUTTON
    // ========================================
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
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },

    // ========================================
    // WELLBEING SLIDER
    // ========================================
    sliderContent: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: 20,
    },
    sliderValueRow: {
        alignItems: 'center',
        marginBottom: 40,
    },
    sliderValueText: {
        fontSize: 72,
        fontWeight: '800',
        color: '#1a1a2e',
        letterSpacing: -2,
        textShadowColor: 'rgba(139, 92, 246, 0.15)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    sliderValueTextDark: {
        color: '#a78bfa',
        textShadowColor: 'rgba(139, 92, 246, 0.4)',
    },
    sliderHintText: {
        marginTop: 10,
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.25)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    sliderTrackContainer: {
        marginTop: 0,
        marginBottom: 60,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    sliderTrackBase: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 8,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    sliderTrackFillWrap: {
        position: 'absolute',
        left: 0,
        height: 8,
        borderRadius: 999,
        overflow: 'hidden',
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    sliderTrackFill: {
        flex: 1,
        borderRadius: 999,
    },
    slider: {
        width: '100%',
        height: 48,
    },
    sliderContinueButton: {
        width: '100%',
        borderRadius: 999,
        marginTop: 24,
        marginBottom: 24,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    sliderContinueGradient: {
        paddingVertical: 18,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderContinueText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    
    // ========================================
    // PREMIUM INFO PAGE STYLES (Journaling Research Page)
    // ========================================
    premiumInfoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    lottieGlowContainer: {
        position: 'relative',
    },
    circularGlow: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        alignSelf: 'center',
        top: -20,
        zIndex: 0,
    },
    premiumLottieContainer: {
        width: 200,
        height: 200,
        borderRadius: 24,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.15)',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 0,
    },
    premiumLottie: {
        width: 220,
        height: 220,
        marginBottom: 48,
        opacity: 1, // Controlled by Animated.View wrapper
    },
    researchTitle: {
        fontSize: 28,
        fontWeight: '600',
        color: '#1a1a2e',
        textAlign: 'left',
        letterSpacing: -0.3,
        lineHeight: 36,
        marginBottom: 20,
    },
    logoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        rowGap: 12,
    },
    logoImage: {
        width: '47%',
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
    },
    logoImageDark: {
        opacity: 0.85,
    },
    logoTopLeft: {
    },
    logoTopRight: {
    },
    logoBottomLeft: {
    },
    logoBottomRight: {
    },
    
    // Glassmorphic card styles
    glassCard: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.08,
        shadowRadius: 30,
        elevation: 10,
    },
    glassCardGradient: {
        padding: 28,
        gap: 16,
    },
    glassCardTitle: {
        fontSize: 26,
        fontWeight: '600',
        color: '#1a1a2e',
        letterSpacing: -0.5,
        lineHeight: 32,
    },
    glassCardBody: {
        fontSize: 15,
        color: 'rgba(0, 0, 0, 0.65)',
        lineHeight: 23,
        fontWeight: '400',
        letterSpacing: 0.1,
    },
    glassCardCitation: {
        fontSize: 11,
        color: 'rgba(0, 0, 0, 0.35)',
        fontWeight: '500',
        letterSpacing: 0.5,
        marginTop: 8,
    },
    glassCardLearnMore: {
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    glassCardLearnMoreText: {
        fontSize: 13,
        color: '#a855f7',
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    
    // ========================================
    // APA STUDY PILL TAG (AI Patterns Page)
    // ========================================
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
        color: '#6b7280',
        fontWeight: '500',
        lineHeight: 20,
        textAlign: 'center',
    },
    
    // ========================================
    // PREMIUM FEATURE LIST (AI Patterns Page)
    // ========================================
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
        color: '#374151',
        fontWeight: '500',
        lineHeight: 24,
    },
    featureBold: {
        fontWeight: '700',
        color: '#1a1a2e',
    },
    
    // ========================================
    // TEXT INPUT (NAME QUESTION)
    // ========================================
    textInputContent: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: 40,
    },
    nameInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: isTablet ? 20 : 16,
        borderWidth: 1.5,
        borderColor: 'rgba(168, 85, 247, 0.3)',
        paddingVertical: isTablet ? 22 : 18,
        paddingHorizontal: isTablet ? 24 : 20,
        fontSize: sf(18),
        color: '#1a1a2e',
        fontWeight: '500',
        marginBottom: 24,
    },
});
