import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import * as Haptics from 'expo-haptics';

const noisyImage = require('../../public/noisy-image.webp');
const clarityImage = require('../../public/clarity-image.webp');

const { width } = Dimensions.get('window');

export default function ValuePropScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0a0a0a', '#000000']}
        style={styles.background}
      />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Headline with gradient */}
          <MaskedView
            maskElement={
              <Text style={[styles.headline, { backgroundColor: 'transparent' }]}>
                Insight turns thoughts{' '}into clarity
              </Text>
            }
          >
            <LinearGradient
              colors={['#ffffff', '#e0e0e0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.headline, { opacity: 0 }]}>
                Insight turns thoughts{' '}into clarity
              </Text>
            </LinearGradient>
          </MaskedView>

          {/* Visual Contrast */}
          <View style={styles.contrastContainer}>
            {/* Left: Mental noise */}
            <View style={styles.contrastColumn}>
              <View style={styles.imageContainer}>
                <Image 
                  source={noisyImage} 
                  style={styles.contrastImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.contrastLabel}>Mental noise</Text>
            </View>

            {/* Arrow */}
            <Text style={styles.arrow}>→</Text>

            {/* Right: Understanding */}
            <View style={styles.contrastColumn}>
              <View style={styles.imageContainer}>
                <Image 
                  source={clarityImage} 
                  style={styles.contrastImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.contrastLabel}>Understanding</Text>
            </View>
          </View>

          {/* Supporting text */}
          <View style={styles.bulletContainer}>
            <Text style={[styles.bulletText, styles.bulletTextGrey]}>
              Capture how you feel
            </Text>

            <Text style={[styles.bulletText, styles.bulletTextGrey]}>
              Understand patterns over time
            </Text>

            <MaskedView
              maskElement={
                <Text style={[styles.bulletText, { backgroundColor: 'transparent' }]}>
                  Gain clarity — not clutter
                </Text>
              }
            >
              <LinearGradient
                colors={['#A78BFA', '#C084FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.bulletText, { opacity: 0 }]}>
                  Gain clarity — not clutter
                </Text>
              </LinearGradient>
            </MaskedView>
          </View>
        </Animated.View>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Paywall');
          }}
        >
          <LinearGradient
            colors={['#a855f7', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  mainContent: {
    alignItems: 'center',
  },
  headline: {
    fontSize: 38,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -0.8,
    marginBottom: 60,
  },
  contrastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    gap: 30,
  },
  contrastColumn: {
    alignItems: 'center',
    gap: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  contrastImage: {
    width: '100%',
    height: '100%',
  },
  arrow: {
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '300',
  },
  contrastLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  bulletContainer: {
    gap: 16,
    alignItems: 'center',
  },
  bulletText: {
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  bulletTextGrey: {
    color: '#CCCCCC',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  button: {
    width: '100%',
    borderRadius: 16,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
