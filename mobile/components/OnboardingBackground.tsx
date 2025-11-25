import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function OnboardingBackground() {
    // Animation values for blobs
    const blob1Anim = useRef(new Animated.Value(0)).current;
    const blob2Anim = useRef(new Animated.Value(0)).current;
    const blob3Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createAnimation = (anim: Animated.Value, duration: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        Animated.parallel([
            createAnimation(blob1Anim, 8000),
            createAnimation(blob2Anim, 10000),
            createAnimation(blob3Anim, 12000),
        ]).start();
    }, []);

    // Interpolations for movement/scale
    const blob1TranslateY = blob1Anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -50],
    });
    const blob1Scale = blob1Anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.2],
    });

    const blob2TranslateX = blob2Anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 40],
    });
    const blob2Rotate = blob2Anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '20deg'],
    });

    const blob3Scale = blob3Anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.3],
    });

    return (
        <View style={styles.container}>
            {/* Base Gradient: Dark Purple (#0E0A1A -> #1A1030) */}
            <LinearGradient
                colors={['#0E0A1A', '#1A1030', '#000000']}
                locations={[0, 0.6, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Blob 1: Deep Blue/Purple - Top Left */}
            <Animated.View
                style={[
                    styles.blob,
                    styles.blob1,
                    {
                        transform: [
                            { translateY: blob1TranslateY },
                            { scale: blob1Scale },
                            { rotate: '15deg' }
                        ],
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(76, 29, 149, 0.6)', 'rgba(30, 58, 138, 0.3)', 'transparent']}
                    style={styles.gradientFill}
                />
            </Animated.View>

            {/* Blob 2: Magenta/Pink - Center Right */}
            <Animated.View
                style={[
                    styles.blob,
                    styles.blob2,
                    {
                        transform: [
                            { translateX: blob2TranslateX },
                            { rotate: blob2Rotate },
                            { scale: 1.1 }
                        ],
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(192, 38, 211, 0.4)', 'rgba(236, 72, 153, 0.2)', 'transparent']}
                    style={styles.gradientFill}
                />
            </Animated.View>

            {/* Blob 3: Violet/Indigo - Bottom Left */}
            <Animated.View
                style={[
                    styles.blob,
                    styles.blob3,
                    {
                        transform: [
                            { scale: blob3Scale },
                            { rotate: '-10deg' }
                        ],
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(139, 92, 246, 0.5)', 'rgba(124, 58, 237, 0.2)', 'transparent']}
                    style={styles.gradientFill}
                />
            </Animated.View>

            {/* Heavy Blur Layer to blend everything */}
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

            {/* Noise Overlay (Simulated with grain pattern if available, otherwise subtle opacity layer) */}
            {/* Since we don't have a noise asset, we'll skip the image but add a very subtle overlay to texture it slightly */}
            <View style={styles.noiseOverlay} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0E0A1A',
        overflow: 'hidden',
    },
    blob: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.6,
    },
    gradientFill: {
        flex: 1,
        borderRadius: 999,
    },
    blob1: {
        width: width * 1.5,
        height: width * 1.5,
        top: -width * 0.5,
        left: -width * 0.5,
    },
    blob2: {
        width: width * 1.4,
        height: width * 1.4,
        top: height * 0.2,
        right: -width * 0.6,
    },
    blob3: {
        width: width * 1.6,
        height: width * 1.6,
        bottom: -width * 0.6,
        left: -width * 0.4,
    },
    noiseOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        // In a real implementation with assets, we would put a repeating noise image here
        // For now, we rely on the heavy blur and gradient mixing
    },
});
