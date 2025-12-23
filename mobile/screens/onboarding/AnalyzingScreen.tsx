import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SunoGradient from '../../components/onboarding/SunoGradient';

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
        <View style={styles.container}>
            <SunoGradient />
            
            <View style={styles.content}>
                {/* Status Text */}
                {/* ⚡ EDIT HERE: Change fontSize, color, fontWeight */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={{
                        fontSize: 18,           // ⚡ Status text size
                        fontWeight: '600',      // ⚡ Boldness
                        color: '#e5e7eb',       // ⚡ Text color
                        textAlign: 'center',
                        marginBottom: 48,
                        letterSpacing: 0.3,
                    }}>
                        {STATUS_MESSAGES[statusIndex]}
                    </Text>
                </Animated.View>

                {/* Kinetic Progress Bar */}
                {/* ⚡ EDIT HERE: Change progress bar colors, size */}
                <View style={{
                    width: '100%',
                    maxWidth: 300,
                }}>
                    <View style={{
                        width: '100%',
                        height: 6,                              // ⚡ Progress bar height
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 3,
                        overflow: 'hidden',
                    }}>
                        <Animated.View
                            style={[
                                { height: '100%', borderRadius: 3 },
                                { width: progressWidth }
                            ]}
                        >
                            <LinearGradient
                                colors={['#a855f7', '#8b5cf6', '#7c3aed']}  // ⚡ Progress bar gradient
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                        </Animated.View>
                    </View>
                </View>
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
});
