import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<any>;
};

const STATUS_MESSAGES = [
    "Analyzing emotional patterns…",
    "Processing your responses…",
    "Identifying stress markers…",
    "Mapping behavioral trends…",
];

export default function AnalyzingScreen({ navigation }: Props) {
    const [statusIndex, setStatusIndex] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animate progress bar
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: false,
        }).start(() => {
            // Navigate to Analysis Complete screen
            navigation.replace('AnalysisComplete');
        });

        // Cycle through status messages
        const interval = setInterval(() => {
            setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <LinearGradient
            colors={['#1e1b4b', '#312e81', '#1e3a8a']}
            locations={[0, 0.5, 1]}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Lottie Animation - Flowing Abstract Lines */}
                <View style={styles.animationContainer}>
                    <View style={styles.glowCircle} />
                    <LottieView
                        source={require('../../public/animations/focus-mindfulness.json')}
                        autoPlay
                        loop
                        style={styles.lottieAnimation}
                    />
                </View>

                {/* Status Text */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.statusText}>
                        {STATUS_MESSAGES[statusIndex]}
                    </Text>
                </Animated.View>

                {/* Kinetic Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                        <Animated.View
                            style={[
                                styles.progressBarFill,
                                { width: progressWidth }
                            ]}
                        >
                            <LinearGradient
                                colors={['#a855f7', '#8b5cf6', '#7c3aed']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                        </Animated.View>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    animationContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 64,
    },
    glowCircle: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 50,
    },
    lottieAnimation: {
        width: 200,
        height: 200,
        opacity: 0.85,
    },
    statusText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#e5e7eb',
        textAlign: 'center',
        marginBottom: 48,
        letterSpacing: 0.3,
    },
    progressBarContainer: {
        width: '100%',
        maxWidth: 300,
    },
    progressBarBackground: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
});
