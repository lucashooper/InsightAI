import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { isTablet, sf, ss, iPadContentStyle } from '../../utils/responsive';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import SunoGradient from '../../components/onboarding/SunoGradient';

const testimonials = [
  {
    text: "Insight has completely changed how I understand my emotions. The AI insights are incredibly accurate and helpful.",
    author: "Jessica M.",
  },
  {
    text: "This app helped me identify patterns I never noticed before. It's like having a therapist in my pocket.",
    author: "Michael R.",
  },
  {
    text: "The daily reflections and insights have become an essential part of my self-care routine.",
    author: "Sarah L.",
  },
];

export default function RateUsScreen({ navigation }: any) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Check if StoreReview is available
    const isAvailable = await StoreReview.isAvailableAsync();
    
    if (isAvailable) {
      // Request in-app review
      await StoreReview.requestReview();
    }
    
    // Navigate to next screen regardless
    navigation.navigate('Paywall');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Paywall');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {dark ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
      ) : (
        <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
      )}

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <View style={[styles.backArrowCircle, { backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          <Ionicons name="arrow-back" size={20} color={dark ? '#ffffff' : '#1a1a2e'} />
        </View>
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Row with Star */}
        <View style={styles.titleRow}>
          <Text style={styles.starIconSmall}>⭐</Text>
          <Text style={[styles.title, dark && styles.titleDark]}>Rate us 5 Stars</Text>
        </View>
        <Text style={[styles.subtitle, dark && styles.subtitleDark]}>
          Help us spread the message of mindful living and personal growth
        </Text>

        {/* Testimonials */}
        <View style={styles.testimonialsContainer}>
          {testimonials.map((testimonial, index) => (
            <View 
              key={index}
              style={[
                styles.testimonialCard,
                dark ? styles.testimonialCardDark : styles.testimonialCardLight
              ]}
            >
              {/* Stars */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} style={styles.star}>⭐</Text>
                ))}
              </View>

              {/* Quote */}
              <Text style={[styles.testimonialText, dark && styles.testimonialTextDark]}>
                "{testimonial.text}"
              </Text>

              {/* Author */}
              <Text style={[styles.testimonialAuthor, dark && styles.testimonialAuthorDark]}>
                — {testimonial.author}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
        >
          <Text style={[styles.skipText, dark && styles.skipTextDark]}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: isTablet ? 48 : 24,
    paddingTop: isTablet ? 120 : 100,
    paddingBottom: isTablet ? 40 : 20,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starIconSmall: {
    fontSize: isTablet ? 28 : 24,
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    color: '#1a1a2e',
    letterSpacing: -0.6,
    lineHeight: sf(40),
  },
  titleDark: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: sf(16),
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    marginBottom: isTablet ? 48 : 40,
    paddingHorizontal: isTablet ? 40 : 20,
    lineHeight: sf(22),
  },
  subtitleDark: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  testimonialsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 20,
  },
  testimonialCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  testimonialCardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  testimonialCardLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  star: {
    fontSize: 16,
  },
  testimonialText: {
    fontSize: sf(15),
    color: '#374151',
    lineHeight: sf(22),
    fontWeight: '500',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  testimonialTextDark: {
    color: '#ffffff',
  },
  testimonialAuthor: {
    fontSize: sf(14),
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: '700',
  },
  testimonialAuthorDark: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  footer: {
    width: '100%',
    paddingHorizontal: isTablet ? 48 : 24,
    paddingBottom: isTablet ? 70 : 50,
    alignItems: 'center',
    ...(iPadContentStyle as any),
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 28,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: sf(17),
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.2,
  },
  skipButton: {
    marginTop: isTablet ? 28 : 20,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: sf(15),
    color: 'rgba(0, 0, 0, 0.45)',
    textAlign: 'center',
  },
  skipTextDark: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
