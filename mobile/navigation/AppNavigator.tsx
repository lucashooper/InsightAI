import React from 'react';
import { NavigationContainer, createNavigationContainerRef, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const navigationRef = createNavigationContainerRef();
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Image, ActivityIndicator, Platform, InteractionManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingTabBar from '../components/navigation/FloatingTabBar';

function EmptyTabScreen() {
  return null;
}

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SignupUsernameScreen from '../screens/signup/SignupUsernameScreen';
import SignupEmailScreen from '../screens/signup/SignupEmailScreen';
import SignupPasswordScreen from '../screens/signup/SignupPasswordScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import EmailVerifiedScreen from '../screens/EmailVerifiedScreen';
import HomeScreen from '../screens/HomeScreen';
import EntryDetailScreen from '../screens/EntryDetailScreen';
import CreateEntryScreen from '../screens/CreateEntryScreen';
import DashboardScreenNew from '../screens/DashboardScreenNew';
import DashboardScreen from '../screens/DashboardScreen';
import PlaybookScreen from '../screens/PlaybookScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import AppearanceScreen from '../screens/AppearanceScreen';
import SecurityScreen from '../screens/SecurityScreen';
import PersonalizeScreen from '../screens/PersonalizeScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import ProductRevealScreen from '../screens/onboarding/ProductRevealScreen';
import ValuePropScreen from '../screens/onboarding/ValuePropScreen';
import ChooseVibeScreen from '../screens/onboarding/ChooseVibeScreen';
import AuthSelectionScreen from '../screens/onboarding/AuthSelectionScreen';
import OnboardingQuestionScreen from '../screens/onboarding/OnboardingQuestionScreen';
import NotificationPermissionScreen from '../screens/onboarding/NotificationPermissionScreen';
import OnboardingSummaryScreen from '../screens/onboarding/OnboardingSummaryScreen';
import PrivacyOnboardingScreen from '../screens/onboarding/PrivacyOnboardingScreen';
import NotificationsOnboardingScreen from '../screens/onboarding/NotificationsOnboardingScreen';
import AnalyzingScreen from '../screens/onboarding/AnalyzingScreen';
import AnalysisCompleteScreen from '../screens/onboarding/AnalysisCompleteScreen';
import InteractiveShowcaseScreen from '../screens/onboarding/InteractiveShowcaseScreen';
import PaywallScreen from '../screens/onboarding/PaywallScreen';
import RateUsScreen from '../screens/onboarding/RateUsScreen';
import ValuePropPatternsScreen from '../screens/onboarding/ValuePropPatternsScreen';
import ValuePropWinsScreen from '../screens/onboarding/ValuePropWinsScreen';
import PostPurchaseWelcomeScreen from '../screens/onboarding/PostPurchaseWelcomeScreen';
import PersonalityResultScreen from '../screens/onboarding/PersonalityResultScreen';
import PersonalityQuizIntroScreen from '../screens/onboarding/PersonalityQuizIntroScreen';
import MeditationScreen from '../screens/MeditationScreen';
import GratitudeScreen from '../screens/GratitudeScreen';
import GratitudeHistoryScreen from '../screens/GratitudeHistoryScreen';
import EmotionDetailScreen from '../screens/EmotionDetailScreen';
import AmbientSoundsScreen from '../screens/AmbientSoundsScreen';
import AIChatScreen from '../screens/AIChatScreen';
import PromptEntryScreen from '../screens/PromptEntryScreen';
import ExploreScreen from '../screens/ExploreScreen';
import TodoScreen from '../screens/TodoScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTablet, sf, si } from '../utils/responsive';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for main app screens
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      detachInactiveScreens
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
        // Screens already reserve scroll space for the floating bar. Keeping the
        // scene full-height lets each screen gradient continue behind the navbar.
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 0,
        },
      }}
    >
      {/* Tab 1: Home (Dashboard) */}
      <Tab.Screen
        name="Home"
        component={DashboardScreenNew}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={si(24)} color={color} />
          ),
          tabBarAccessibilityLabel: "Home",
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      {/* Tab 2: Journal (Notes) */}
      <Tab.Screen
        name="Journal"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color }) => (
            <Ionicons name="journal" size={si(24)} color={color} />
          ),
          tabBarAccessibilityLabel: "Journal",
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      {/* Tab 3: Center FAB placeholder */}
      <Tab.Screen
        name="FabPlaceholder"
        component={EmptyTabScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      {/* Tab 5: Dashboard (Analytics) */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Ionicons name="analytics" size={si(24)} color={color} />
          ),
          tabBarAccessibilityLabel: "Dashboard",
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      {/* Tab 6: Companion (AI Chat) */}
      <Tab.Screen
        name="Companion"
        component={EmptyTabScreen}
        options={{
          tabBarLabel: 'Companion',
          tabBarAccessibilityLabel: 'Companion',
        }}
        listeners={({ navigation: tabNav }) => ({
          tabPress: (e) => {
            e.preventDefault();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            tabNav.getParent()?.navigate('AIChat');
          },
        })}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = React.useState<boolean | null>(null);
  const [onboardingResumeScreen, setOnboardingResumeScreen] = React.useState<string | null>(null);
  const [needsPostPurchaseSignup, setNeedsPostPurchaseSignup] = React.useState(false);
  const [passwordRecoveryActive, setPasswordRecoveryActive] = React.useState(false);
  const prevUserIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    // Detect user changes (sign-in, sign-out, or user ID change from OTP)
    // Always reset to null to show loading spinner while async check runs
    // This prevents rendering the wrong stack with stale isOnboardingCompleted
    const currentUserId = user?.id || null;
    if (currentUserId !== prevUserIdRef.current) {
      console.log('[NAV] User changed:', prevUserIdRef.current, '->', currentUserId);
      setIsOnboardingCompleted(null);
      setOnboardingResumeScreen(null);
      setNeedsPostPurchaseSignup(false);
      setPasswordRecoveryActive(false);
      
      // Clear cached username to prevent wrong names appearing for different accounts
      AsyncStorage.removeItem('CACHED_USERNAME').catch(err => 
        console.error('[NAV] Failed to clear cached username:', err)
      );
      
      prevUserIdRef.current = currentUserId;
    }
    
    const checkOnboarding = async () => {
      // Add timeout to prevent infinite loading (must be longer than profile check timeout of 3s)
      let timeoutId: NodeJS.Timeout | null = setTimeout(() => {
        console.warn('[NAV] ⚠️ Onboarding check timed out after 4s, defaulting to show onboarding');
        setIsOnboardingCompleted(false);
        timeoutId = null;
      }, 4000);

      try {
        setNeedsPostPurchaseSignup(false);
        const recoveryMode = await AsyncStorage.getItem('PASSWORD_RECOVERY_ACTIVE');
        setPasswordRecoveryActive(recoveryMode === 'true');

        // Check if we need to resume onboarding at a specific screen
        // (set by AuthSelectionScreen before Google/Apple sign-in)
        const resumeScreen = await AsyncStorage.getItem('ONBOARDING_RESUME_SCREEN');
        if (resumeScreen) {
          console.log('[NAV] Found onboarding resume screen:', resumeScreen);
          setOnboardingResumeScreen(resumeScreen);
          await AsyncStorage.removeItem('ONBOARDING_RESUME_SCREEN');
        }

        // CRITICAL FIX: Always check AsyncStorage first - this is the source of truth
        // Apple/Google Sign-In sets this flag immediately in AuthContext
        const value = await AsyncStorage.getItem('HAS_COMPLETED_ONBOARDING');
        console.log('[NAV] HAS_COMPLETED_ONBOARDING from storage:', value);
        
        if (value === 'true') {
          console.log('[NAV] ✅ Onboarding complete flag found - going to MainTabs');
          setIsOnboardingCompleted(true);
          return;
        }

        // Check if user purchased anonymously and still needs to create an account
        // This handles the case where user closes app after purchase but before signup
        const needsEmailSignup = await AsyncStorage.getItem('NEEDS_EMAIL_SIGNUP');
        if (needsEmailSignup === 'true' && !user) {
          console.log('[NAV] ✅ Anonymous post-purchase detected - resuming at PostPurchaseWelcome');
          setNeedsPostPurchaseSignup(true);
          setIsOnboardingCompleted(false);
          return;
        }

        // CRITICAL: Check if user is in post-purchase signup flow with an account
        // The NEEDS_EMAIL_SIGNUP flag means user purchased first, then created account
        // In this case, onboarding IS complete even if HAS_COMPLETED_ONBOARDING wasn't persisted yet
        if (needsEmailSignup === 'true' && user) {
          console.log('[NAV] ✅ Post-purchase signup flow detected - marking onboarding complete');
          await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
          setNeedsPostPurchaseSignup(false);
          setIsOnboardingCompleted(true);
          return;
        }

        // If user is logged in but no AsyncStorage flag
        if (user) {
          // CRITICAL: Re-read resume screen from AsyncStorage (not just state)
          // EmailVerifiedScreen sets this AFTER auth state changes, so state may be stale
          const freshResumeScreen = await AsyncStorage.getItem('ONBOARDING_RESUME_SCREEN');
          if (freshResumeScreen) {
            console.log('[NAV] Resume screen found in AsyncStorage:', freshResumeScreen);
            setOnboardingResumeScreen(freshResumeScreen);
            setIsOnboardingCompleted(false);
            await AsyncStorage.removeItem('ONBOARDING_RESUME_SCREEN');
            return;
          }
          
          // If we have a resume screen in state, the user is mid-onboarding
          if (onboardingResumeScreen) {
            console.log('[NAV] Resume screen set - showing onboarding at:', onboardingResumeScreen);
            setIsOnboardingCompleted(false);
            return;
          }
          
          // Quick profile check to determine if user has completed onboarding
          // This is needed for Google/Apple sign-in users on new devices
          console.log('[NAV] No onboarding flag, checking profile...');
          console.log('[NAV] Querying for user_id:', user.id);
          try {
            const { supabase: supabaseClient } = require('../lib/supabase');
            const { data: profile, error: profileError } = await supabaseClient
              .from('user_profiles')
              .select('username')
              .eq('user_id', user.id)
              .maybeSingle();
            
            console.log('[NAV] Profile check result:', profile);
            console.log('[NAV] Profile check error:', profileError);
            
            if (profile?.username) {
              // User has a profile with username - they've completed onboarding
              console.log('[NAV] ✅ User has profile, marking onboarding complete');
              await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
              setIsOnboardingCompleted(true);
              return;
            }
            
            // No profile or no username - new user, show onboarding
            console.log('[NAV] New user or incomplete profile, showing onboarding');
            setIsOnboardingCompleted(false);
          } catch (err: any) {
            console.log('[NAV] ⚠️ Profile check failed:', err.message || err);
            // On failure, show onboarding as safe default
            setIsOnboardingCompleted(false);
          }
        } else {
          setNeedsPostPurchaseSignup(false);
          setIsOnboardingCompleted(false);
        }
      } catch (e) {
        console.error('[NAV] Error checking onboarding:', e);
        // Even on error, check if onboarding was completed
        const errorCheck = await AsyncStorage.getItem('HAS_COMPLETED_ONBOARDING');
        if (errorCheck === 'true') {
          console.log('[NAV] ✅ Found onboarding flag despite error');
          setIsOnboardingCompleted(true);
        } else {
          setNeedsPostPurchaseSignup(false);
          setIsOnboardingCompleted(false);
        }
      } finally {
        // Clear timeout to prevent it from firing after completion
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    };
    checkOnboarding();
  }, [user]);

  // Check if user has completed onboarding when they log in
  React.useEffect(() => {
    console.log('[NAV] Auth state - user:', !!user, 'onboarding completed:', isOnboardingCompleted);
  }, [user, isOnboardingCompleted]);

  // Force navigate to MainTabs when onboarding completes after navigator is already mounted
  // This handles the case where user signs in from LoginScreen and isOnboardingCompleted
  // changes from false/null to true after the authenticated stack has already rendered
  React.useEffect(() => {
    if (user && isOnboardingCompleted === true && navigationRef.isReady() && !passwordRecoveryActive) {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute && currentRoute.name !== 'MainTabs' && currentRoute.name !== 'Profile' && currentRoute.name !== 'EntryDetail' && currentRoute.name !== 'CreateEntry' && currentRoute.name !== 'AIChat') {
        console.log('[NAV] Force navigating to MainTabs from:', currentRoute.name);
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'MainTabs' as never }],
        });
      }
    }
  }, [user, isOnboardingCompleted, passwordRecoveryActive]);

  const darkTheme = {
    dark: true,
    colors: {
      primary: '#8b5cf6',
      background: '#000000',
      card: '#0a0a0a',
      text: '#ffffff',
      border: '#1a1a1a',
      notification: '#8b5cf6',
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '900' as const,
      },
    },
  };

  // Don't render navigator until onboarding check completes
  // This prevents initialRouteName from being stale
  if (loading || isOnboardingCompleted === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} theme={darkTheme}>
      {user ? (
        // Authenticated screens - user is already signed in
        <Stack.Navigator
          initialRouteName={passwordRecoveryActive ? 'ForgotPassword' : isOnboardingCompleted ? 'MainTabs' : (onboardingResumeScreen || 'Welcome')}
          screenOptions={{
            headerShown: false,
            animation: 'none',
            gestureEnabled: true,
            animationDuration: 650,
          }}
        >
          {/* CRITICAL FIX: Always include ALL screens in authenticated stack
              The issue was that conditional rendering would cause React Navigation
              to default to the first screen (MainTabs) when the stack re-rendered
              after email verification. By including all screens and using initialRouteName,
              we let navigation.reset() calls control the flow properly. */}
          
          {/* Onboarding Flow - Include all onboarding screens so users can navigate back through full flow */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="ProductReveal" component={ProductRevealScreen} />
          <Stack.Screen name="AuthSelection" component={AuthSelectionScreen} />
          <Stack.Screen name="ChooseVibe" component={ChooseVibeScreen} />
          <Stack.Screen name="OnboardingQuestion" component={OnboardingQuestionScreen} />
          <Stack.Screen name="EmailVerified" component={EmailVerifiedScreen} />
          <Stack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
          <Stack.Screen name="PersonalityQuizIntro" component={PersonalityQuizIntroScreen} />
          <Stack.Screen name="Analyzing" component={AnalyzingScreen} />
          <Stack.Screen name="PersonalityResult" component={PersonalityResultScreen} />
          <Stack.Screen name="AnalysisComplete" component={AnalysisCompleteScreen} />
          <Stack.Screen name="ValueProp" component={ValuePropScreen} />
          <Stack.Screen name="ValuePropPatterns" component={ValuePropPatternsScreen} />
          <Stack.Screen name="ValuePropWins" component={ValuePropWinsScreen} />
          <Stack.Screen name="RateUs" component={RateUsScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
          <Stack.Screen name="PostPurchaseWelcome" component={PostPurchaseWelcomeScreen} />
          <Stack.Screen name="OnboardingSummary" component={OnboardingSummaryScreen} />
          <Stack.Screen name="InteractiveShowcase" component={InteractiveShowcaseScreen} />
          <Stack.Screen name="PrivacyOnboarding" component={PrivacyOnboardingScreen} />
          <Stack.Screen name="NotificationsOnboarding" component={NotificationsOnboardingScreen} />
          
          {/* Auth screens - needed for "Sign In" links on onboarding pages */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="SignupUsername" component={SignupUsernameScreen} />
          <Stack.Screen name="SignupEmail" component={SignupEmailScreen} />
          <Stack.Screen name="SignupPassword" component={SignupPasswordScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen as any} />
          
          {/* Main App Flow */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
          <Stack.Screen name="CreateEntry" component={CreateEntryScreen} />
          <Stack.Screen name="PromptEntry" component={PromptEntryScreen} options={{ headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Analytics" component={DashboardScreen} />
          <Stack.Screen name="Meditation" component={MeditationScreen} />
          <Stack.Screen name="Gratitude" component={GratitudeScreen} />
          <Stack.Screen name="GratitudeHistory" component={GratitudeHistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EmotionDetail" component={EmotionDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AmbientSounds" component={AmbientSoundsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AIChat" component={AIChatScreen} options={{ headerShown: false, animation: 'slide_from_bottom', gestureDirection: 'vertical' }} />
          <Stack.Screen name="Playbook" component={PlaybookScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="Explore" component={ExploreScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="Todo" component={TodoScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="Appearance" component={AppearanceScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="Security" component={SecurityScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="Personalize" component={PersonalizeScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
        </Stack.Navigator>
      ) : (
        // Unauthenticated - show Welcome first, then Login/Signup
        <Stack.Navigator 
          initialRouteName={passwordRecoveryActive ? 'ForgotPassword' : isOnboardingCompleted ? 'Login' : needsPostPurchaseSignup ? 'PostPurchaseWelcome' : 'Welcome'}
          screenOptions={{
            headerShown: false,
            animation: 'none',
            gestureEnabled: true,
            animationDuration: 650,
          }}
        >
          {/* Onboarding Flow for new users */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="ProductReveal" component={ProductRevealScreen} />
          <Stack.Screen name="AuthSelection" component={AuthSelectionScreen} />
          <Stack.Screen name="ChooseVibe" component={ChooseVibeScreen} />
          <Stack.Screen name="EmailVerified" component={EmailVerifiedScreen} />
          <Stack.Screen name="OnboardingQuestion" component={OnboardingQuestionScreen} />
          <Stack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
          <Stack.Screen name="PersonalityQuizIntro" component={PersonalityQuizIntroScreen} />
          <Stack.Screen name="Analyzing" component={AnalyzingScreen} />
          <Stack.Screen name="PersonalityResult" component={PersonalityResultScreen} />
          <Stack.Screen name="AnalysisComplete" component={AnalysisCompleteScreen} />
          <Stack.Screen name="OnboardingSummary" component={OnboardingSummaryScreen} />
          <Stack.Screen name="InteractiveShowcase" component={InteractiveShowcaseScreen} />
          <Stack.Screen name="PrivacyOnboarding" component={PrivacyOnboardingScreen} />
          <Stack.Screen name="NotificationsOnboarding" component={NotificationsOnboardingScreen} />
          <Stack.Screen name="ValueProp" component={ValuePropScreen} />
          <Stack.Screen name="ValuePropPatterns" component={ValuePropPatternsScreen} />
          <Stack.Screen name="ValuePropWins" component={ValuePropWinsScreen} />
          <Stack.Screen name="RateUs" component={RateUsScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
          <Stack.Screen name="PostPurchaseWelcome" component={PostPurchaseWelcomeScreen} />
          
          {/* Auth screens */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="SignupUsername" component={SignupUsernameScreen} />
          <Stack.Screen name="SignupEmail" component={SignupEmailScreen} />
          <Stack.Screen name="SignupPassword" component={SignupPasswordScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen as any} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef7f2',
  },
});
