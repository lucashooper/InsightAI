import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import * as Haptics from 'expo-haptics';

const noisyImage = require('../../public/noisy-image.webp');
const clarityImage = require('../../public/clarity-image.webp');
const insightLogo = require('../../public/Insight-Logo-nobg.webp');

const { width } = Dimensions.get('window');

export default function ValuePropScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Separate animations for each bullet point
  const bullet1Anim = useRef(new Animated.Value(0)).current;
  const bullet2Anim = useRef(new Animated.Value(0)).current;
  const bullet3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main content animation
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

    // Staggered bullet animations for premium feel
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(bullet1Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(200),
      Animated.timing(bullet2Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(200),
      Animated.timing(bullet3Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={insightLogo} style={styles.logo} />

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

          {/* Supporting text with staggered animations */}
          <View style={styles.bulletContainer}>
            <Animated.View style={{ opacity: bullet1Anim, transform: [{ translateY: bullet1Anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={[styles.bulletText, styles.bulletTextGrey]}>
                  Capture how you feel
                </Text>
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: bullet2Anim, transform: [{ translateY: bullet2Anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={[styles.bulletText, styles.bulletTextGrey]}>
                  Understand patterns over time
                </Text>
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: bullet3Anim, transform: [{ translateY: bullet3Anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
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
  logo: {
    width: 100,
    height: 100,
    opacity: 0.9,
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
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
    gap: 20,
    alignItems: 'center',
    width: '100%',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulletDot: {
    fontSize: 24,
    color: '#8b5cf6',
    fontWeight: '700',
  },
  bulletText: {
    fontSize: 19,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  bulletTextGrey: {
    color: '#E5E5E5',
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
