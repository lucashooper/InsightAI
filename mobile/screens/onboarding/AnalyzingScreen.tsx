import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SunoGradient from '../../components/onboarding/SunoGradient';

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

    useEffect(() => {
        // Navigate after 9 seconds
        const navigationTimer = setTimeout(() => {
            navigation.replace('AnalysisComplete');
        }, 9000);

        // Cycle through status messages every 2.25 seconds (9s / 4 messages)
        const interval = setInterval(() => {
            setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
        }, 2250);

        return () => {
            clearTimeout(navigationTimer);
            clearInterval(interval);
        };
    }, []);

    return (
        <View style={styles.container}>
            <SunoGradient />
            
            <View style={styles.content}>
                {/* Status Text */}
                <Text style={styles.statusText}>
                    {STATUS_MESSAGES[statusIndex]}
                </Text>

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
        backgroundColor: '#000',
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
        color: '#e5e7eb',
        textAlign: 'center',
        marginBottom: 60,
        letterSpacing: 0.3,
    },
    loader: {
        marginTop: 20,
    },
});
