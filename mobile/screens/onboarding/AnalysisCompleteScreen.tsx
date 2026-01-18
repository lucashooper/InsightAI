import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SunoGradient from '../../components/onboarding/SunoGradient';

const { width } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<any>;
};

export default function AnalysisCompleteScreen({ navigation }: Props) {
    const checkmarkScale = useRef(new Animated.Value(0)).current;
    const barAnim1 = useRef(new Animated.Value(0)).current;
    const barAnim2 = useRef(new Animated.Value(0)).current;
    const contentFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Checkmark animation
        Animated.spring(checkmarkScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Bar chart animation
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(barAnim1, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: false,
                }),
                Animated.timing(barAnim2, {
                    toValue: 1,
                    duration: 800,
                    delay: 200,
                    useNativeDriver: false,
                }),
                Animated.timing(contentFade, {
                    toValue: 1,
                    duration: 600,
                    delay: 400,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 500);
    }, []);

    const bar1Height = barAnim1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 180],
    });

    const bar2Height = barAnim2.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 110],
    });

    const handleContinue = () => {
        navigation.navigate('Paywall');
    };

    return (
        <View style={styles.container}>
            <SunoGradient />
            
            <View style={styles.content}>
                {/* Success Checkmark with Title */}
                <View style={styles.headerSection}>
                    <Animated.View style={[styles.checkmarkContainer, { transform: [{ scale: checkmarkScale }] }]}>
                        <View style={styles.checkmarkCircle}>
                            <Ionicons name="checkmark" size={40} color="#10b981" />
                        </View>
                    </Animated.View>
                    <Text style={styles.title}>Analysis completed</Text>
                </View>

                {/* Bar Graph Section */}
                <View style={styles.graphSection}>
                    <View style={styles.graphContainer}>
                        {/* Baseline */}
                        <View style={styles.baseline} />
                        <Text style={styles.baselineLabel}>mental health safety line</Text>

                        {/* Bars */}
                        <View style={styles.barsContainer}>
                            {/* User Bar */}
                            <View style={styles.barWrapper}>
                                <Animated.View style={[styles.barUser, { height: bar1Height }]}>
                                    <LinearGradient
                                        colors={['#ef4444', '#dc2626']}
                                        style={StyleSheet.absoluteFill}
                                    />
                                    <Text style={styles.barPercentage}>52%</Text>
                                </Animated.View>
                                <Text style={styles.barLabel}>You</Text>
                            </View>

                            {/* Average Bar */}
                            <View style={styles.barWrapper}>
                                <Animated.View style={[styles.barAverage, { height: bar2Height }]}>
                                    <LinearGradient
                                        colors={['#6b7280', '#4b5563']}
                                        style={StyleSheet.absoluteFill}
                                    />
                                    <Text style={styles.barPercentage}>32%</Text>
                                </Animated.View>
                                <Text style={styles.barLabel}>Average</Text>
                            </View>
                        </View>
                    </View>

                    {/* Analysis Summary */}
                    <Animated.View style={[styles.summaryContainer, { opacity: contentFade }]}>
                        <Text style={styles.summaryText}>
                            Based on our data, you showed <Text style={styles.summaryBold}>20% more signs of poor lifestyle and discipline</Text> than the average 18 to 24 years old male.
                        </Text>
                    </Animated.View>

                    {/* Reassurance Badge */}
                    <Animated.View style={[styles.reassuranceBadge, { opacity: contentFade }]}>
                        <Ionicons name="information-circle" size={20} color="#f97316" />
                        <Text style={styles.reassuranceText}>
                            It's normal. People in your age group often face harder challenges in life.
                        </Text>
                    </Animated.View>
                </View>

                {/* CTA Button */}
                <Animated.View style={[styles.ctaContainer, { opacity: contentFade }]}>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        activeOpacity={0.9}
                        onPress={handleContinue}
                    >
                        <LinearGradient
                            colors={['#f97316', '#ea580c']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.ctaGradient}
                        >
                            <Text style={styles.ctaText}>See my emotional profile</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
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
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 64,
    },
    checkmarkContainer: {
        marginBottom: 16,
    },
    checkmarkCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#10b981',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    graphSection: {
        flex: 1,
        justifyContent: 'center',
    },
    graphContainer: {
        height: 280,
        marginBottom: 32,
        position: 'relative',
    },
    baseline: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#6b7280',
        borderStyle: 'dashed',
    },
    baselineLabel: {
        position: 'absolute',
        top: 60,
        right: 0,
        fontSize: 11,
        color: '#9ca3af',
        fontWeight: '500',
    },
    barsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 40,
        height: 240,
        paddingTop: 40,
    },
    barWrapper: {
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    barUser: {
        width: 80,
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center',
        paddingTop: 12,
        marginBottom: 12,
    },
    barAverage: {
        width: 80,
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center',
        paddingTop: 12,
        marginBottom: 12,
    },
    barPercentage: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
    },
    barLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e5e7eb',
    },
    summaryContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    summaryText: {
        fontSize: 15,
        color: '#d1d5db',
        lineHeight: 24,
        textAlign: 'center',
        fontWeight: '500',
    },
    summaryBold: {
        fontWeight: '700',
        color: '#fff',
    },
    reassuranceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        borderRadius: 12,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(249, 115, 22, 0.3)',
    },
    reassuranceText: {
        flex: 1,
        fontSize: 14,
        color: '#fed7aa',
        fontWeight: '600',
        lineHeight: 20,
    },
    ctaContainer: {
        marginTop: 'auto',
    },
    ctaButton: {
        width: '100%',
        borderRadius: 999,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 999,
        gap: 10,
    },
    ctaText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
});
