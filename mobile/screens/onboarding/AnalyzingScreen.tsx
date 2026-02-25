import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

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
    const { theme } = useTheme();
    const [statusIndex, setStatusIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Navigate after 9 seconds
        const navigationTimer = setTimeout(() => {
            navigation.replace('OnboardingSummary');
        }, 9000);

        // Cycle through status messages with fade transition
        const interval = setInterval(() => {
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                // Change text while invisible
                setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
                // Fade in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }).start();
            });
        }, 2250);

        return () => {
            clearTimeout(navigationTimer);
            clearInterval(interval);
        };
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {isDarkTheme(theme.name) ? (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
            ) : (
                <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
            )}
            
            <View style={styles.content}>
                {/* Status Text with fade transition */}
                <Animated.Text style={[styles.statusText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#374151', opacity: fadeAnim }]}>
                    {STATUS_MESSAGES[statusIndex]}
                </Animated.Text>

                {/* Simple Loading Circle */}
                <ActivityIndicator 
                    size="large" 
                    color="#a855f7" 
                    style={styles.loader}
                />
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    statusText: {
        fontSize: 29,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
        marginBottom: 60,
        letterSpacing: 0.3,
    },
    loader: {
        marginTop: 20,
    },
});
