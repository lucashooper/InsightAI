import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, ScrollView, Easing, Linking, TextInput, Keyboard, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Asset } from 'expo-asset';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import OnboardingBackButton from '../../components/onboarding/OnboardingBackButton';
import PillOption from '../../components/onboarding/PillOption';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { isTablet, sf, iPadContentStyle, iPadWideContentStyle } from '../../utils/responsive';
import { analytics } from '../../services/analytics';
import { useLanguage } from '../../contexts/LanguageContext';
import { ONBOARDING_SURFACE, ONBOARDING_TEXT, ONBOARDING_CTA } from '../../constants/onboardingTheme';
import { useOnboardingBottomInset } from '../../utils/onboardingInsets';
import { loadOnboardingQuizProgress, saveOnboardingQuizProgress, saveOnboardingLastScreen } from '../../utils/onboardingProgress';
import { ONBOARDING_MEDITATION_LOTTIE } from '../../constants/appAssets';
import { safeGoBack } from '../../utils/navigationSafety';
import CloudMascot, { MOOD_TINT_COLORS, MOOD_VALENCE } from '../../components/companion/CloudMascot';
import { ONBOARDING_MOTION } from '../../constants/onboardingMotion';
const cambridgeColorLogo = require('../../public/Cambridge-Logo-No-Background.png');

type StepType = 'question' | 'info' | 'slider' | 'text_input';

interface Option {
    label: string;
    value: string;
    icon?: string;
    emoji?: string;
    hint?: string;
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
        title: 'onboarding.questions.name.title',
        subtitle: 'onboarding.questions.name.subtitle',
    },
    // 1. Where did you hear about us
    {
        id: 'referral',
        type: 'question',
        title: 'onboarding.questions.referral.title',
        options: [
            { label: 'onboarding.questions.referral.instagram', value: 'instagram', icon: 'logo-instagram' },
            { label: 'onboarding.questions.referral.facebook', value: 'facebook', icon: 'logo-facebook' },
            { label: 'onboarding.questions.referral.tiktok', value: 'tiktok', icon: 'logo-tiktok' },
            { label: 'onboarding.questions.referral.youtube', value: 'youtube', icon: 'logo-youtube' },
            { label: 'onboarding.questions.referral.google', value: 'google', icon: 'logo-google' },
            { label: 'onboarding.questions.referral.friend', value: 'friend', icon: 'people' },
            { label: 'onboarding.questions.referral.other', value: 'other', icon: 'ellipsis-horizontal' },
        ]
    },
    // 2. Goal
    {
        id: 'goal',
        type: 'question',
        title: 'onboarding.questions.goal.title',
        options: [
            { label: 'onboarding.questions.goal.mood', value: 'mood', icon: 'sunny', emoji: '☀️', hint: 'onboarding.questions.goal.moodHint' },
            { label: 'onboarding.questions.goal.stress', value: 'stress', icon: 'leaf', emoji: '🌿', hint: 'onboarding.questions.goal.stressHint' },
            { label: 'onboarding.questions.goal.habits', value: 'habits', icon: 'calendar', emoji: '📅', hint: 'onboarding.questions.goal.habitsHint' },
            { label: 'onboarding.questions.goal.clarity', value: 'clarity', icon: 'bulb', emoji: '💡', hint: 'onboarding.questions.goal.clarityHint' },
        ]
    },
    // 2. Info Slide A (Research)
    {
        id: 'research_info',
        type: 'info',
        title: 'onboarding.questions.research.title',
        subtitle: 'onboarding.questions.research.subtitle',
        badges: ['onboarding.questions.research.badge'],
        animationType: 'journaling',
        learnMoreLink: true,
        buttonText: 'common.continue'
    },
    // 3. Frequency
    {
        id: 'frequency',
        type: 'question',
        title: 'onboarding.questions.frequency.title',
        options: [
            { label: 'onboarding.questions.frequency.daily', value: 'daily', icon: 'repeat', emoji: '🔁', hint: 'onboarding.questions.frequency.dailyHint' },
            { label: 'onboarding.questions.frequency.weekly', value: 'weekly', icon: 'calendar-outline', emoji: '🗓️', hint: 'onboarding.questions.frequency.weeklyHint' },
            { label: 'onboarding.questions.frequency.asNeeded', value: 'as_needed', icon: 'hand-left', emoji: '✋', hint: 'onboarding.questions.frequency.asNeededHint' },
        ]
    },
    // 4. Journaling Experience
    {
        id: 'journalingExperience',
        type: 'question',
        title: 'onboarding.questions.experience.title',
        options: [
            { label: 'onboarding.questions.experience.new', value: 'new', icon: 'star-outline', emoji: '✨', hint: 'onboarding.questions.experience.newHint' },
            { label: 'onboarding.questions.experience.underSixMonths', value: '<6m', icon: 'time-outline', emoji: '⏳', hint: 'onboarding.questions.experience.underSixMonthsHint' },
            { label: 'onboarding.questions.experience.sixToTwentyFourMonths', value: '6-24m', icon: 'book-outline', emoji: '📖', hint: 'onboarding.questions.experience.sixToTwentyFourMonthsHint' },
            { label: 'onboarding.questions.experience.twoPlusYears', value: '2+y', icon: 'ribbon-outline', emoji: '🏅', hint: 'onboarding.questions.experience.twoPlusYearsHint' },
        ]
    },
    // 6. Wellbeing Slider
    {
        id: 'wellbeing',
        type: 'slider',
        title: 'onboarding.questions.wellbeing.title',
        min: 1,
        max: 10,
        defaultValue: 7,
    },
    {
        id: 'stressResponse',
        type: 'question',
        title: 'onboarding.questions.stressResponse.title',
        options: [
            { label: 'onboarding.questions.stressResponse.ruminate', value: 'ruminate', icon: 'sync-outline', emoji: '🔁' },
            { label: 'onboarding.questions.stressResponse.selfBlame', value: 'self_blame', icon: 'person-outline', emoji: '🪞' },
            { label: 'onboarding.questions.stressResponse.fixate', value: 'fixate', icon: 'create-outline', emoji: '📝' },
            { label: 'onboarding.questions.stressResponse.stepBack', value: 'step_back', icon: 'leaf-outline', emoji: '🌿' },
        ]
    },
    {
        id: 'selfTalk',
        type: 'question',
        title: 'onboarding.questions.selfTalk.title',
        options: [
            { label: 'onboarding.questions.selfTalk.critical', value: 'critical', icon: 'thunderstorm-outline', emoji: '⛈️' },
            { label: 'onboarding.questions.selfTalk.mixed', value: 'mixed', icon: 'cloud-outline', emoji: '⛅' },
            { label: 'onboarding.questions.selfTalk.supportive', value: 'supportive', icon: 'heart-outline', emoji: '💗' },
        ]
    },
    {
        id: 'copingStyle',
        type: 'question',
        title: 'onboarding.questions.coping.title',
        options: [
            { label: 'onboarding.questions.coping.social', value: 'social', icon: 'chatbubbles-outline', emoji: '💬' },
            { label: 'onboarding.questions.coping.physical', value: 'physical', icon: 'fitness-outline', emoji: '🏃' },
            { label: 'onboarding.questions.coping.expressive', value: 'expressive', icon: 'brush-outline', emoji: '🎨' },
            { label: 'onboarding.questions.coping.solitude', value: 'solitude', icon: 'moon-outline', emoji: '🌙' },
        ]
    },
    {
        id: 'changeResponse',
        type: 'question',
        title: 'onboarding.questions.change.title',
        options: [
            { label: 'onboarding.questions.change.resistant', value: 'resistant', icon: 'shield-outline', emoji: '🛡️' },
            { label: 'onboarding.questions.change.anxious', value: 'anxious_persevere', icon: 'trending-up-outline', emoji: '📈' },
            { label: 'onboarding.questions.change.embrace', value: 'embrace', icon: 'rocket-outline', emoji: '🚀' },
            { label: 'onboarding.questions.change.support', value: 'support_seeking', icon: 'people-outline', emoji: '🤝' },
        ]
    },
    {
        id: 'motivationDriver',
        type: 'question',
        title: 'onboarding.questions.motivation.title',
        options: [
            { label: 'onboarding.questions.motivation.fear', value: 'fear_based', icon: 'alert-circle-outline', emoji: '⚠️' },
            { label: 'onboarding.questions.motivation.external', value: 'external', icon: 'trophy-outline', emoji: '🏆' },
            { label: 'onboarding.questions.motivation.values', value: 'values_driven', icon: 'compass-outline', emoji: '🧭' },
            { label: 'onboarding.questions.motivation.passion', value: 'passion', icon: 'flame-outline', emoji: '🔥' },
        ]
    },
    // Optional deeper questions start here
    {
        id: 'relationshipPatterns',
        type: 'question',
        title: 'onboarding.questions.relationships.title',
        options: [
            { label: 'onboarding.questions.relationships.anxious', value: 'anxious_attachment', icon: 'heart-dislike-outline', emoji: '💔' },
            { label: 'onboarding.questions.relationships.avoidant', value: 'avoidant', icon: 'shield-outline', emoji: '🛡️' },
            { label: 'onboarding.questions.relationships.fearful', value: 'fearful_avoidant', icon: 'swap-horizontal-outline', emoji: '↔️' },
            { label: 'onboarding.questions.relationships.secure', value: 'secure', icon: 'heart-circle-outline', emoji: '💞' },
        ],
        skippable: true,
    },
    {
        id: 'conflictStyle',
        type: 'question',
        title: 'onboarding.questions.conflict.title',
        options: [
            { label: 'onboarding.questions.conflict.avoid', value: 'avoid', icon: 'close-circle-outline', emoji: '🙈' },
            { label: 'onboarding.questions.conflict.accommodate', value: 'accommodate', icon: 'happy-outline', emoji: '🙂' },
            { label: 'onboarding.questions.conflict.compete', value: 'compete', icon: 'medal-outline', emoji: '🥇' },
            { label: 'onboarding.questions.conflict.collaborate', value: 'collaborate', icon: 'chatbubbles-outline', emoji: '🗣️' },
        ],
        skippable: true,
    },
    {
        id: 'restStyle',
        type: 'question',
        title: 'onboarding.questions.rest.title',
        options: [
            { label: 'onboarding.questions.rest.guilt', value: 'guilt_rest', icon: 'time-outline', emoji: '⏱️' },
            { label: 'onboarding.questions.rest.solitude', value: 'solitude_rest', icon: 'moon-outline', emoji: '🌙' },
            { label: 'onboarding.questions.rest.social', value: 'social_rest', icon: 'people-outline', emoji: '🫶' },
            { label: 'onboarding.questions.rest.active', value: 'active_rest', icon: 'leaf-outline', emoji: '🚶' },
        ],
        skippable: true,
    },
    {
        id: 'identitySource',
        type: 'question',
        title: 'onboarding.questions.identitySource.title',
        options: [
            { label: 'onboarding.questions.identitySource.achievement', value: 'achievement', icon: 'trophy-outline', emoji: '🏆' },
            { label: 'onboarding.questions.identitySource.relationships', value: 'relationships', icon: 'people-outline', emoji: '👥' },
            { label: 'onboarding.questions.identitySource.values', value: 'values', icon: 'book-outline', emoji: '📘' },
            { label: 'onboarding.questions.identitySource.expression', value: 'expression', icon: 'brush-outline', emoji: '🎨' },
        ],
        skippable: true,
    },
    {
        id: 'failureResponse',
        type: 'question',
        title: 'onboarding.questions.failure.title',
        options: [
            { label: 'onboarding.questions.failure.shame', value: 'shame', icon: 'sad-outline', emoji: '😞' },
            { label: 'onboarding.questions.failure.defensive', value: 'defensive', icon: 'shield-checkmark-outline', emoji: '🛡️' },
            { label: 'onboarding.questions.failure.analytical', value: 'analytical', icon: 'search-outline', emoji: '🔍' },
            { label: 'onboarding.questions.failure.growth', value: 'growth', icon: 'trending-up-outline', emoji: '🌱' },
        ],
        skippable: true,
    },
    {
        id: 'emotionalAwareness',
        type: 'question',
        title: 'onboarding.questions.awareness.title',
        options: [
            { label: 'onboarding.questions.awareness.low', value: 'low_awareness', icon: 'eye-off-outline', emoji: '😶' },
            { label: 'onboarding.questions.awareness.moderate', value: 'moderate_awareness', icon: 'help-circle-outline', emoji: '❔' },
            { label: 'onboarding.questions.awareness.high', value: 'high_awareness', icon: 'eye-outline', emoji: '👀' },
            { label: 'onboarding.questions.awareness.veryHigh', value: 'very_high_awareness', icon: 'glasses-outline', emoji: '👓' },
        ],
        skippable: true,
    },
    {
        id: 'decisionMaking',
        type: 'question',
        title: 'onboarding.questions.decisions.title',
        options: [
            { label: 'onboarding.questions.decisions.overthink', value: 'overthink', icon: 'infinite-outline', emoji: '♾️' },
            { label: 'onboarding.questions.decisions.intuitive', value: 'intuitive', icon: 'flash-outline', emoji: '⚡️' },
            { label: 'onboarding.questions.decisions.external', value: 'external_validation', icon: 'people-circle-outline', emoji: '🙋' },
            { label: 'onboarding.questions.decisions.systematic', value: 'systematic', icon: 'list-outline', emoji: '📋' },
        ],
        skippable: true,
    },
    // 7. Identity
    {
        id: 'genderIdentity',
        type: 'question',
        title: 'onboarding.questions.gender.title',
        subtitle: 'onboarding.questions.gender.subtitle',
        options: [
            { label: 'onboarding.questions.gender.woman', value: 'woman', icon: 'female', emoji: '♀️' },
            { label: 'onboarding.questions.gender.man', value: 'man', icon: 'male', emoji: '♂️' },
            { label: 'onboarding.questions.gender.nonBinary', value: 'non-binary', icon: 'transgender', emoji: '🌈' },
            { label: 'onboarding.questions.gender.preferNot', value: 'prefer-not', icon: 'person', emoji: '🙂' },
        ]
    }
];

const PRIMARY_STEP_IDS = ['name', 'referral', 'goal', 'research_info', 'frequency', 'journalingExperience', 'wellbeing'];

type WellbeingOrb = {
    label: string;
    score: number;
    tier: 'terrible' | 'struggling' | 'neutral' | 'good' | 'amazing';
    size: number;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    center?: boolean;
};

/** Pentagon cluster — upper-middle, ~35% larger orbs, no isolated bottom orb. */
const WELLBEING_ORBS: WellbeingOrb[] = [
    { label: 'Terrible', score: 1, tier: 'terrible' as const, size: isTablet ? 158 : 132, top: 12, left: 6 },
    { label: 'Great', score: 10, tier: 'amazing' as const, size: isTablet ? 168 : 140, top: 0, right: 6 },
    { label: 'Bad', score: 3, tier: 'struggling' as const, size: isTablet ? 162 : 136, top: isTablet ? 118 : 104, left: 2 },
    { label: 'Good', score: 8, tier: 'good' as const, size: isTablet ? 166 : 138, top: isTablet ? 108 : 96, right: 2 },
    { label: 'Fine', score: 5, tier: 'neutral' as const, size: isTablet ? 170 : 142, top: isTablet ? 208 : 188, center: true },
];

export default function OnboardingQuestionScreen({ navigation, route }: any) {
    const { userName, setUserName, setOnboardingAnswers } = useOnboarding();
    const { theme } = useTheme();
    const { t } = useLanguage();
    const startIndex = route?.params?.startIndex ?? 0;
    const incomingAnswers = route?.params?.answers || {};
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [answers, setAnswers] = useState<Record<string, string>>(incomingAnswers);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [textInputValue, setTextInputValue] = useState('');
    const [nameInputFocused, setNameInputFocused] = useState(false);
    const [selectedWellbeing, setSelectedWellbeing] = useState<string | null>(null);
    const isTransitioning = useRef(false);
    const pageX = useRef(new Animated.Value(0)).current;
    const prevIndexRef = useRef(currentIndex);
    const [showLottie, setShowLottie] = useState(false);
    const [featureFadeAnims] = useState([
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
    const primaryPos = PRIMARY_STEP_IDS.indexOf(currentStep.id);
    const personalityTotal = Math.max(1, STEPS.length - PRIMARY_STEP_IDS.length);
    const progressLabel = primaryPos >= 0
        ? `${primaryPos + 1} / ${PRIMARY_STEP_IDS.length}`
        : `${currentIndex - PRIMARY_STEP_IDS.length + 1} / ${personalityTotal}`;
    const progressRatio = primaryPos >= 0
        ? (primaryPos + 1) / PRIMARY_STEP_IDS.length
        : (currentIndex - PRIMARY_STEP_IDS.length + 1) / personalityTotal;
    const bottomInset = useOnboardingBottomInset();
    const useDarkOnboardingAccent = theme.name === 'dark' || theme.name === 'midnight';
    const primaryButtonColor = ONBOARDING_CTA.background;
    const primaryButtonShadow = ONBOARDING_CTA.shadow;
    const [lottieReady, setLottieReady] = useState(true);

    useEffect(() => {
        // Lottie JSON is bundled synchronously — only image assets need Asset.loadAsync.
        Asset.loadAsync([cambridgeColorLogo]).catch(() => {});
    }, []);

    useEffect(() => {
        saveOnboardingLastScreen('OnboardingQuestion');
    }, []);

    useEffect(() => {
        let mounted = true;
        loadOnboardingQuizProgress().then((saved) => {
            if (!mounted || !saved) return;
            if (Object.keys(incomingAnswers).length === 0 && saved.index > 0) {
                setCurrentIndex(saved.index);
                setAnswers(saved.answers);
            }
        });
        return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        saveOnboardingQuizProgress(currentIndex, answers);
    }, [currentIndex, answers]);

    useEffect(() => {
        const next = route?.params?.startIndex;
        if (typeof next === 'number' && next !== currentIndex) {
            setCurrentIndex(next);
            setSelectedOption(null);
        }
    }, [route?.params?.startIndex]);

    // CRITICAL: Skip name step ONLY if user explicitly used Apple/Google Sign-In
    useEffect(() => {
        const prefillNameFromSocialSignIn = async () => {
            if (currentStep.id === 'name') {
                // Only prefill if user came from social sign-in (SKIP_NAME_STEP flag is set)
                const skipNameStep = await AsyncStorage.getItem('SKIP_NAME_STEP');
                
                if (skipNameStep === 'true' && !textInputValue) {
                    // Read cached username from AsyncStorage (set by Google/Apple sign-in)
                    const cachedUsername = await AsyncStorage.getItem('CACHED_USERNAME');
                    
                    if (cachedUsername) {
                        console.log('[OnboardingQuestion] Prefilling name from social sign-in:', cachedUsername);
                        // Prefill the name field so user can confirm or edit
                        setUserName(cachedUsername);
                        setTextInputValue(cachedUsername); // Update the actual input field value
                        setAnswers(prev => ({ ...prev, name: cachedUsername }));
                    }
                } else {
                    console.log('[OnboardingQuestion] No social sign-in detected, showing empty name step');
                }
            }
        };
        prefillNameFromSocialSignIn();
        
        // Track onboarding step viewed
        analytics.trackOnboardingStep(currentStep.id, currentIndex, userName || undefined);
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
        isTransitioning.current = false;

        if (currentStep.type === 'slider' && prevIndexRef.current !== currentIndex) {
            setSelectedWellbeing(null);
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

        // Simple fade-in for info pages (research) - same as other pages
        if (currentStep.type === 'info') {
            setShowLottie(false);
            infoCardAnim.setValue(1); // Just show immediately, no stagger
        } else {
            setShowLottie(false);
        }

        const prev = prevIndexRef.current;
        prevIndexRef.current = currentIndex;
        if (prev === currentIndex) return;

        const prevStep = STEPS[prev];
        const layoutShiftStep =
            currentStep.type === 'slider' ||
            prevStep?.type === 'slider' ||
            currentStep.type === 'info' ||
            prevStep?.type === 'info';

        // Wellbeing + info slides use a different layout — sliding the whole block causes a shake.
        if (layoutShiftStep) {
            pageX.stopAnimation();
            pageX.setValue(0);
            return;
        }

        const dir = currentIndex >= prev ? 1 : -1;
        pageX.setValue(dir * ONBOARDING_MOTION.pageSlidePx);
        Animated.timing(pageX, {
            toValue: 0,
            duration: ONBOARDING_MOTION.pageDurationMs,
            easing: ONBOARDING_MOTION.pageEasing,
            useNativeDriver: true,
        }).start();
    }, [currentIndex, currentStep.type, currentStep.defaultValue, currentStep.features, currentStep.options, featureFadeAnims, infoLottieAnim, infoCardAnim, pageX]);

    const handleNext = (value?: string) => {
        if (isTransitioning.current) return; // Prevent double-taps during transition
        isTransitioning.current = true;
        
        console.log('[OnboardingQuestion] handleNext called with value:', value);
        console.log('[OnboardingQuestion] Current step:', currentStep.type, currentStep.id);
        
        // Track step completion - use value directly for name step since userName state is async
        const isSkipped = currentStep.skippable && !value;
        const trackName = currentStep.id === 'name' && value ? value : (userName || undefined);
        analytics.trackOnboardingStepCompleted(currentStep.id, currentIndex, trackName, isSkipped);
        
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

        // After the short primary path, pause for the personality intro.
        if (currentStep.id === 'wellbeing') {
            isTransitioning.current = false;
            const currentAnswers = value ? { ...answers, [currentStep.id]: value } : answers;
            navigation.navigate('PersonalityQuizIntro', { answers: currentAnswers, returnIndex: currentIndex + 1 });
        } else if (currentIndex < STEPS.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setTimeout(() => {
                isTransitioning.current = false;
            }, ONBOARDING_MOTION.pageDurationMs);
        } else {
            // Finished all questions - go to analyzing
            isTransitioning.current = false;
            const finalAnswers = value ? { ...answers, [currentStep.id]: value } : answers;
            console.log('[OnboardingQuestion] Navigating to Analyzing with answers:', finalAnswers);
            navigation.navigate('Analyzing', { answers: finalAnswers });
        }
    };

    const handleSkip = () => {
        handleNext(); // Just proceed without saving an answer for this step
    };

    const renderAnimationPlaceholder = () => {
        if (currentStep.animationType === 'journaling') {
            return (
                <View style={styles.animationContainer}>
                    <LottieView
                        source={ONBOARDING_MEDITATION_LOTTIE}
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
        <View style={[styles.container, { paddingBottom: bottomInset }]}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            <OnboardingAmbientBackground />

            {/* Back Arrow + Progress Bar Row (Left-aligned like CAL AI) */}
            <View style={styles.topRow}>
                <OnboardingBackButton
                    inline
                    onPress={() => {
                        if (isTransitioning.current) return;
                        if (currentIndex === 0) {
                            safeGoBack(navigation, 'MascotIntro');
                        } else {
                            isTransitioning.current = true;
                            setCurrentIndex(currentIndex - 1);
                            setSelectedOption(null);
                        }
                    }}
                />
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${Math.max(8, progressRatio * 100)}%` }]} />
                    </View>
                </View>
                <Text style={styles.progressCount}>{progressLabel}</Text>
            </View>

            <Animated.View style={[styles.content, { transform: [{ translateX: pageX }] }]}>

                <View style={styles.stepContainer}>

                    {/* Premium Info Page Layout for Journaling */}
                    {currentStep.type === 'info' && currentStep.id === 'research_info' ? (
                        <View style={styles.premiumInfoContainer}>
                            <Animated.View style={{ opacity: infoCardAnim, width: '100%' }}>
                                <Text style={styles.researchTitle}>
                                    {t('onboarding.questions.research.screenTitle')}
                                </Text>
                            </Animated.View>

                            <Animated.View
                                style={{
                                    opacity: infoCardAnim,
                                    width: '100%',
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingHorizontal: 4,
                                    paddingBottom: 12,
                                }}
                            >
                                {lottieReady ? (
                                <LottieView
                                    source={ONBOARDING_MEDITATION_LOTTIE}
                                    autoPlay
                                    loop
                                    style={styles.researchLottieCompact}
                                />
                                ) : (
                                <View style={styles.researchLottieCompact} />
                                )}
                                <Text style={styles.researchFact}>
                                    {t('onboarding.questions.research.fact')}
                                </Text>
                                <Image
                                    source={cambridgeColorLogo}
                                    style={styles.cambridgeLogo}
                                    contentFit="contain"
                                    cachePolicy="memory-disk"
                                    transition={0}
                                />
                                <Text style={styles.researchCitation}>
                                    {t('onboarding.questions.research.citation')}
                                </Text>
                            </Animated.View>
                        </View>
                    ) : (
                        <>

                            {/* Standard Layout for Other Pages */}
                            {renderAnimationPlaceholder()}

                            {/* Title */}
                            <Text style={[styles.onboardingTitle, currentStep.type === 'slider' && styles.checkInTitle]}>
                                {t(currentStep.title)}
                            </Text>

                            {currentStep.subtitle && currentStep.type !== 'slider' && (
                                <Text style={styles.onboardingSubtitle}>{t(currentStep.subtitle)}</Text>
                            )}

                            {/* Slim Pill APA Study Tag for Patterns Page */}
                            {currentStep.type === 'info' && currentStep.id === 'patterns_info' && currentStep.showAPAStudy && (
                                <View style={styles.apaStudyPill}>
                                    <Text style={styles.apaStudyText}>
                                        {t('onboarding.questions.apaStudy')}
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
                                {t('onboarding.questions.insightsWith')}
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
                                            {t(feature.text)}
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
                                        backgroundColor: nameInputFocused || textInputValue.trim()
                                          ? 'rgba(168, 85, 247, 0.22)'
                                          : Platform.OS === 'android'
                                            ? '#14141A'
                                            : ONBOARDING_SURFACE.fill,
                                        borderColor: nameInputFocused || textInputValue.trim()
                                          ? '#A855F7'
                                          : ONBOARDING_SURFACE.border,
                                        color: '#ffffff',
                                        shadowColor: nameInputFocused || textInputValue.trim() ? '#A855F7' : 'transparent',
                                        shadowOpacity: nameInputFocused || textInputValue.trim() ? 0.35 : 0,
                                        shadowRadius: 10,
                                        shadowOffset: { width: 0, height: 0 },
                                    },
                                ]}
                                underlineColorAndroid="transparent"
                                placeholder={t('onboarding.questions.name.placeholder')}
                                placeholderTextColor={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.5)' : '#6b7280'}
                                value={textInputValue}
                                onChangeText={setTextInputValue}
                                onFocus={() => setNameInputFocused(true)}
                                onBlur={() => setNameInputFocused(false)}
                                autoFocus
                                autoCapitalize="words"
                                returnKeyType="done"
                                multiline={false}
                                onSubmitEditing={() => {
                                    Keyboard.dismiss();
                                }}
                            />
                            
                            <TouchableOpacity
                                style={[
                                    styles.continueButton,
                                    { backgroundColor: primaryButtonColor, shadowColor: primaryButtonShadow },
                                    !textInputValue.trim() && styles.continueButtonDisabled
                                ]}
                                activeOpacity={0.9}
                                onPress={() => {
                                    if (textInputValue.trim()) {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        handleNext(textInputValue.trim());
                                    }
                                }}
                                disabled={!textInputValue.trim()}
                            >
                                <View style={styles.continueGradient}>
                                    <Text style={styles.continueText}>{t('common.continue')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Question Options with PillOption component */}
                    {currentStep.type === 'question' && currentStep.options && (
                        <View style={styles.questionContent}>
                            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                                <View style={styles.optionsContainer}>
                                    {currentStep.options.map((option) => {
                                        const hintKey = option.hint;
                                        const hintValue = hintKey ? t(hintKey) : undefined;
                                        return (
                                        <PillOption
                                            key={option.value}
                                            label={t(option.label)}
                                            hint={hintValue && hintValue !== hintKey ? hintValue : undefined}
                                            icon={option.icon}
                                            emoji={option.emoji}
                                            selected={selectedOption === option.value}
                                            onPress={() => {
                                                if (isTransitioning.current) return;
                                                setSelectedOption(option.value);
                                                setTimeout(() => handleNext(option.value), ONBOARDING_MOTION.autoAdvanceMs);
                                            }}
                                        />
                                        );
                                    })}
                                </View>
                            </ScrollView>

                        </View>
                    )}

                    {/* Wellbeing Slider - distinct from normal questions */}
                    {currentStep.type === 'slider' && (
                        <View style={styles.checkInContent}>
                            <View style={styles.checkInStage}>
                                {WELLBEING_ORBS.map((orb) => {
                                    const selected = selectedWellbeing === orb.label;
                                    return (
                                        <TouchableOpacity
                                            key={orb.label}
                                            style={[
                                                styles.checkInHit,
                                                {
                                                    top: orb.top,
                                                    left: orb.center ? '50%' : orb.left,
                                                    right: orb.right,
                                                    bottom: orb.bottom,
                                                    marginLeft: orb.center ? -(orb.size / 2) : 0,
                                                },
                                            ]}
                                            activeOpacity={0.88}
                                            onPress={() => {
                                                if (isTransitioning.current) return;
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                setSelectedWellbeing(orb.label);
                                                setTimeout(() => handleNext(String(orb.score)), ONBOARDING_MOTION.autoAdvanceMs);
                                            }}
                                        >
                                            <View
                                                style={[
                                                    styles.checkInOrb,
                                                    selected && styles.checkInOrbOn,
                                                    { shadowColor: MOOD_TINT_COLORS[orb.tier] },
                                                ]}
                                            >
                                                <CloudMascot
                                                    size={orb.size}
                                                    tint={MOOD_TINT_COLORS[orb.tier]}
                                                    valence={MOOD_VALENCE[orb.tier]}
                                                    variant="orb"
                                                    shadow={false}
                                                    glow={false}
                                                    animated={false}
                                                />
                                            </View>
                                            <Text style={[styles.checkInLabel, selected && styles.checkInLabelOn]}>
                                                {orb.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Info Footer */}
                    {currentStep.type === 'info' && (
                        <View style={styles.infoFooter}>
                            {/* Privacy badge removed as requested */}
                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    { backgroundColor: primaryButtonColor, shadowColor: primaryButtonShadow }
                                ]}
                                activeOpacity={0.9}
                                onPress={() => handleNext()}
                            >
                                <View style={styles.primaryButtonGradient}>
                                    <Text style={styles.primaryButtonText}>
                                        {currentStep.buttonText ? t(currentStep.buttonText) : t('common.continue')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Animated.View>
            {currentStep.type === 'question' ? (
                <View style={styles.cornerMascot} pointerEvents="none">
                    <CloudMascot size={isTablet ? 132 : 108} valence={0.86} animated shadow={false} glow={false} />
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    // ========================================
    // MAIN CONTAINER & LAYOUT
    // ========================================
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    cornerMascot: {
        position: 'absolute',
        right: -18,
        bottom: 72,
        zIndex: 4,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        gap: 12,
    },
    progressBarContainer: {
        flex: 1,
    },
    progressTrack: {
        height: 3,
        borderRadius: 99,
        backgroundColor: 'rgba(28, 26, 46, 0.08)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 99,
        backgroundColor: '#7B5EA7',
    },
    progressCount: {
        fontSize: 13,
        fontWeight: '700',
        color: '#6b6b8a',
        minWidth: 44,
        textAlign: 'right',
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
        width: 300,
        height: 72,
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 16,
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
        width: '100%',
        ...iPadContentStyle,
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
        borderRadius: ONBOARDING_CTA.borderRadius,
        marginTop: 16,
        marginBottom: 24,
        backgroundColor: ONBOARDING_CTA.background,
        shadowColor: ONBOARDING_CTA.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 8,
    },
    continueButtonDisabled: {
        opacity: 0.4,
    },
    continueGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 22,
        borderRadius: 28,
        gap: 10,
    },
    continueText: {
        fontSize: sf(17),
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.2,
    },
    continueTextDisabled: {
        color: 'rgba(255,255,255,0.5)',
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
        borderRadius: ONBOARDING_CTA.borderRadius,
        backgroundColor: ONBOARDING_CTA.background,
        shadowColor: ONBOARDING_CTA.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 22,
        borderRadius: 28,
        gap: 8,
    },
    primaryButtonText: {
        fontSize: sf(17),
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.2,
    },

    // ========================================
    // WELLBEING CHECK-IN
    // ========================================
    checkInContent: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-start',
        paddingTop: 8,
        ...iPadContentStyle,
    },
    checkInStage: {
        width: '100%',
        height: isTablet ? 340 : 300,
        position: 'relative',
        marginTop: 4,
        alignSelf: 'center',
        maxWidth: 360,
    },
    checkInHit: {
        position: 'absolute',
        alignItems: 'center',
    },
    checkInOrb: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
        elevation: 5,
    },
    checkInOrbOn: {
        shadowOpacity: 0.55,
        transform: [{ scale: 1.08 }],
    },
    checkInLabel: {
        marginTop: 6,
        fontSize: sf(14),
        fontWeight: '600',
        color: '#6b6b8a',
    },
    checkInLabelOn: {
        color: '#1a1a2e',
        fontWeight: '800',
    },
    
    // ========================================
    // PREMIUM INFO PAGE STYLES (Journaling Research Page)
    // ========================================
    premiumInfoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        paddingHorizontal: 0,
        paddingTop: isTablet ? 12 : 4,
        ...iPadWideContentStyle,
    },
    researchLottie: {
        width: isTablet ? 290 : 195,
        height: isTablet ? 290 : 195,
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
        fontSize: isTablet ? 40 : 32,
        fontWeight: '600',
        color: ONBOARDING_TEXT.primary,
        textAlign: 'left',
        width: '100%',
        letterSpacing: -1.28,
        lineHeight: isTablet ? 48 : 40,
        marginBottom: isTablet ? 8 : 4,
    },
    onboardingTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: ONBOARDING_TEXT.primary,
        textAlign: 'left',
        lineHeight: 36,
        letterSpacing: -1.12,
        marginBottom: 20,
    },
    checkInTitle: {
        textAlign: 'center',
        marginBottom: 8,
        paddingHorizontal: 8,
    },
    onboardingSubtitle: {
        fontSize: 16,
        color: ONBOARDING_TEXT.secondary,
        lineHeight: 24,
        marginBottom: 20,
    },
    researchLottieCompact: {
        width: isTablet ? 200 : 160,
        height: isTablet ? 200 : 160,
        marginBottom: isTablet ? 16 : 10,
    },
    researchFact: {
        fontSize: isTablet ? 22 : 19,
        fontWeight: '500',
        color: ONBOARDING_TEXT.primary,
        textAlign: 'center',
        lineHeight: isTablet ? 34 : 30,
        letterSpacing: -0.35,
        maxWidth: 340,
        marginBottom: isTablet ? 28 : 22,
    },
    cambridgeLogoWrap: {
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 22,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    cambridgeLogoImage: {
        height: 56,
        width: 260,
    },
    researchCitation: {
        fontSize: 13,
        color: '#6b6b8a',
        textAlign: 'center',
        lineHeight: 19,
        letterSpacing: 0.1,
        maxWidth: 320,
        fontStyle: 'italic',
    },
    logoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        rowGap: isTablet ? 16 : 12,
        marginBottom: isTablet ? 8 : 18,
    },
    logoImage: {
        width: isTablet ? '48.5%' : '47%',
        height: isTablet ? 68 : 56,
        borderRadius: isTablet ? 16 : 12,
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
        padding: isTablet ? 34 : 28,
        gap: 16,
    },
    glassCardTitle: {
        fontSize: 26,
        fontWeight: '600',
        color: '#1a1a2e',
        letterSpacing: -1.28,
        lineHeight: 32,
    },
    glassCardBody: {
        fontSize: isTablet ? 19 : 15,
        color: 'rgba(0, 0, 0, 0.65)',
        lineHeight: isTablet ? 30 : 23,
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
        paddingTop: isTablet ? 24 : 40,
        width: '100%',
        ...iPadContentStyle,
    },
    nameInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: isTablet ? 20 : 16,
        borderWidth: 1.5,
        borderColor: 'rgba(168, 85, 247, 0.3)',
        height: isTablet ? 78 : undefined,
        paddingVertical: isTablet ? 0 : 18,
        paddingHorizontal: isTablet ? 24 : 20,
        fontSize: sf(18),
        lineHeight: isTablet ? sf(18) : undefined,
        color: '#1a1a2e',
        fontWeight: '500',
        marginBottom: 24,
    },
});
