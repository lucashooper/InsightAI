import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { isTablet } from '../../utils/responsive';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';

const { width } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<any>;
    route?: any;
};

const TOTAL_DURATION = 11000;

const CHECKLIST_ITEMS = [
    { label: 'Analyzing emotional patterns', pct: 0 },
    { label: 'Processing your responses', pct: 25 },
    { label: 'Identifying stress markers', pct: 55 },
    { label: 'Building your personal plan', pct: 80 },
];

export default function AnalyzingScreen({ navigation, route }: Props) {
    const { theme } = useTheme();
    const { userName } = useOnboarding();
    const answers = route?.params?.answers ?? {};
    const skipPersonality = route?.params?.skipPersonality ?? false;
    const [percentage, setPercentage] = useState(0);
    const [completedItems, setCompletedItems] = useState<number[]>([]);
    const [activeItem, setActiveItem] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const statusFade = useRef(new Animated.Value(1)).current;
    const ctaFade = useRef(new Animated.Value(0)).current;
    const [statusText, setStatusText] = useState(CHECKLIST_ITEMS[0].label + '...');
    const activeItemRef = useRef(0);

    useEffect(() => {
        analytics.trackOnboardingScreen('analyzing', 'viewed', userName || undefined);
        // Always run animation on mount - simpler and more reliable
        const listenerId = progressAnim.addListener(({ value }) => {
            const pct = Math.round(value);
            setPercentage(pct);

            // Activate / complete checklist items based on percentage thresholds
            CHECKLIST_ITEMS.forEach((item, index) => {
                if (pct >= item.pct && index > activeItemRef.current) {
                    activeItemRef.current = index;
                    setActiveItem(index);
                    // Fade status text
                    Animated.timing(statusFade, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    }).start(() => {
                        setStatusText(item.label + '...');
                        Animated.timing(statusFade, {
                            toValue: 1,
                            duration: 250,
                            useNativeDriver: true,
                        }).start();
                    });
                }
                // Mark previous item as completed when we pass to the next threshold
                if (index > 0 && pct >= item.pct) {
                    setCompletedItems(prev => {
                        if (!prev.includes(index - 1)) return [...prev, index - 1];
                        return prev;
                    });
                }
            });
        });

        // Run animation
        Animated.timing(progressAnim, {
            toValue: 100,
            duration: TOTAL_DURATION,
            easing: Easing.bezier(0.1, 0.3, 0.25, 1),
            useNativeDriver: false,
        }).start(() => {
            // Animation complete — show the continue button
            setIsComplete(true);
            setPercentage(100);
            setCompletedItems([0, 1, 2, 3]);
            Animated.timing(ctaFade, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        });

        return () => {
            progressAnim.removeListener(listenerId);
        };
    }, []);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const textColor = isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e';
    const subColor = isDarkTheme(theme.name) ? 'rgba(255,255,255,0.5)' : '#6b7280';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {isDarkTheme(theme.name) ? (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
            ) : (
                <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
            )}

            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.canGoBack() && navigation.goBack()}
                activeOpacity={0.7}
            >
                <View style={[styles.backArrowCircle, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <Ionicons name="arrow-back" size={20} color={isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e'} />
                </View>
            </TouchableOpacity>
            
            <View style={styles.content}>
                {/* Big Percentage */}
                <Text style={[styles.percentageText, { color: textColor }]}>
                    {percentage}%
                </Text>

                {/* Status subtitle */}
                <Animated.Text style={[styles.statusSubtitle, { color: subColor, opacity: statusFade }]}>
                    {statusText}
                </Animated.Text>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressTrack, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                        <Animated.View style={[styles.progressFillWrap, { width: progressWidth }]}>
                            <LinearGradient
                                colors={['#f87171', '#a855f7', '#6366f1']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.progressFill}
                            />
                        </Animated.View>
                    </View>
                </View>

                {/* Checklist */}
                <View style={styles.checklist}>
                    {CHECKLIST_ITEMS.map((item, index) => {
                        const itemCompleted = completedItems.includes(index) || isComplete;
                        const itemActive = activeItem === index && !itemCompleted;
                        return (
                            <View key={index} style={styles.checklistItem}>
                                <Text style={[styles.checklistDot, { color: subColor }]}>•</Text>
                                <Text style={[
                                    styles.checklistLabel,
                                    { color: itemActive ? textColor : subColor },
                                    itemCompleted && { color: subColor },
                                ]}>
                                    {item.label}
                                </Text>
                                {itemCompleted && (
                                    <Ionicons name="checkmark-circle" size={18} color="#a855f7" style={{ marginLeft: 'auto' }} />
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Continue button — fades in only after reaching 100% */}
            <Animated.View style={[styles.ctaContainer, { opacity: ctaFade }]}>
                <TouchableOpacity
                    style={styles.ctaButton}
                    activeOpacity={0.9}
                    disabled={!isComplete}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        analytics.trackOnboardingScreen('analyzing', 'completed', userName || undefined);
                        const answers = route?.params?.answers || {};
                        const skipPersonality = route?.params?.skipPersonality || false;
                        
                        // If user skipped personality questions, go straight to summary
                        if (skipPersonality) {
                            navigation.replace('OnboardingSummary');
                        } else {
                            navigation.replace('PersonalityResult', { answers });
                        }
                    }}
                >
                    <View style={styles.ctaGradient}>
                        <Text style={styles.ctaText}>Continue</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef7f2',
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    percentageText: {
        fontSize: 72,
        fontWeight: '800',
        letterSpacing: -2,
        marginBottom: 12,
    },
    statusSubtitle: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 40,
    },
    progressBarContainer: {
        width: '100%',
        marginBottom: 48,
    },
    progressTrack: {
        height: 8,
        borderRadius: 999,
        overflow: 'hidden',
    },
    progressFillWrap: {
        height: '100%',
        borderRadius: 999,
        overflow: 'hidden',
    },
    progressFill: {
        flex: 1,
        borderRadius: 999,
    },
    checklist: {
        width: '100%',
        gap: 16,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    checklistDot: {
        fontSize: 16,
        fontWeight: '700',
    },
    checklistLabel: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    ctaContainer: {
        paddingHorizontal: 24,
        paddingBottom: 50,
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
