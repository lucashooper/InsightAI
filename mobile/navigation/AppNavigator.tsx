import React from 'react';
import { NavigationContainer, createNavigationContainerRef, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const navigationRef = createNavigationContainerRef();
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { View, StyleSheet, TouchableOpacity, Pressable, Text, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import PostPurchaseWelcomeScreen from '../screens/onboarding/PostPurchaseWelcomeScreen';
import MeditationScreen from '../screens/MeditationScreen';
import GratitudeScreen from '../screens/GratitudeScreen';
import GratitudeHistoryScreen from '../screens/GratitudeHistoryScreen';
import EmotionDetailScreen from '../screens/EmotionDetailScreen';
import AmbientSoundsScreen from '../screens/AmbientSoundsScreen';
import AIChatScreen from '../screens/AIChatScreen';
import PromptEntryScreen from '../screens/PromptEntryScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTablet, sf, si } from '../utils/responsive';
import DailyMoodCheckIn from '../components/DailyMoodCheckIn';
import { useAppLock } from '../contexts/AppLockContext';
import SunoGradient from '../components/onboarding/SunoGradient';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Center FAB Button Component with Overlay Menu
function CenterFabButton() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = React.useState(false);
  const [showDailyMoodCheckIn, setShowDailyMoodCheckIn] = React.useState(false);
  const { user } = useAuth();
  const { isLocked, isLockEnabled } = useAppLock();

  // Check if daily mood check-in should be shown
  React.useEffect(() => {
    const checkDailyMoodCheckIn = async () => {
      try {
        const lastCheckIn = await AsyncStorage.getItem('lastMoodCheckIn');
        const dailyMoodEnabled = await AsyncStorage.getItem('dailyMoodCheckInEnabled');
        
        // Default to enabled if not set
        if (dailyMoodEnabled === 'false') return;
        
        if (!lastCheckIn) {
          // First time - show after 2 seconds
          setTimeout(() => setShowDailyMoodCheckIn(true), 2000);
          return;
        }
        
        const lastCheckInDate = new Date(lastCheckIn);
        const today = new Date();
        
        // Check if it's a new day
        if (
          lastCheckInDate.getDate() !== today.getDate() ||
          lastCheckInDate.getMonth() !== today.getMonth() ||
          lastCheckInDate.getFullYear() !== today.getFullYear()
        ) {
          setTimeout(() => setShowDailyMoodCheckIn(true), 2000);
        }
      } catch (error) {
        console.error('Error checking daily mood check-in:', error);
      }
    };
    
    if (user && !(isLocked && isLockEnabled)) {
      checkDailyMoodCheckIn();
    }
  }, [user, isLocked, isLockEnabled]);

  const menuOptions = [
    { icon: 'create-outline', label: 'Journal Entry', screen: 'CreateEntry' },
    { icon: 'sparkles-outline', label: 'AI Chat', screen: 'AIChat' },
    { icon: 'heart-outline', label: 'Gratitude', screen: 'Gratitude' },
    { icon: 'musical-notes-outline', label: 'Meditation', screen: 'Meditation' },
    { icon: 'book-outline', label: 'Playbook', screen: 'Playbook' },
  ];

  return (
    <>
      <TouchableOpacity
        style={styles.centerFabButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowMenu(!showMenu);
        }}
        activeOpacity={0.85}
        accessibilityLabel="Open quick actions menu"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
          style={styles.centerFabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={showMenu ? "close" : "add"} size={28} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Overlay Menu - Cal AI Style */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable 
          style={styles.menuOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuGrid}>
              {menuOptions.map((option) => (
                <TouchableOpacity
                  key={option.screen}
                  style={[styles.menuCard, { backgroundColor: theme.name === 'dark' || theme.name === 'midnight' ? '#1a1a1a' : '#FFFFFF' }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowMenu(false);
                    navigation.navigate(option.screen);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuCardIconContainer}>
                    <Ionicons name={option.icon as any} size={28} color="#8b5cf6" />
                  </View>
                  <Text style={[styles.menuCardLabel, { color: theme.colors.primaryText }]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Daily Mood Check-In */}
      <DailyMoodCheckIn
        visible={showDailyMoodCheckIn && !(isLocked && isLockEnabled)}
        onDismiss={() => setShowDailyMoodCheckIn(false)}
        onJournal={() => {
          setShowDailyMoodCheckIn(false);
          navigation.navigate('CreateEntry');
        }}
        userName={user?.user_metadata?.name || 'there'}
      />
    </>
  );
}

// Bottom Tab Navigator for main app screens
function MainTabs() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [cachedPfp, setCachedPfp] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadPfp = async () => {
      if (!user) return;
      // Use user-specific cache key to prevent cross-user contamination
      const pfp = await AsyncStorage.getItem(`CACHED_PROFILE_PICTURE_${user.id}`);
      if (pfp) setCachedPfp(pfp);
    };
    loadPfp();
  }, [user]);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: isDarkTheme(theme.name) ? '#0a0a0a' : '#FFFFFF',
          borderTopColor: isDarkTheme(theme.name) ? '#1a1a1a' : '#E8E5DC',
          borderTopWidth: 1,
          height: isTablet ? 90 : 75,
          paddingBottom: isTablet ? 14 : 12,
          paddingTop: isTablet ? 14 : 8,
          paddingHorizontal: isTablet ? 40 : 0,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginHorizontal: isTablet ? 8 : 0,
        },
        tabBarActiveTintColor: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a',
        tabBarInactiveTintColor: isDarkTheme(theme.name) ? '#888888' : '#8a8a8a',
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
            console.log('[TabBar] Home tab pressed');
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
            console.log('[TabBar] Journal tab pressed');
          },
        }}
      />
      {/* Tab 3: Center FAB (+) */}
      <Tab.Screen
        name="Playbook"
        component={PlaybookScreen}
        options={{
          tabBarButton: () => <CenterFabButton />,
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
            console.log('[TabBar] Dashboard tab pressed');
          },
        }}
      />
      {/* Tab 6: Profile */}
      <Tab.Screen
        name="Settings"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            cachedPfp ? (
              <View style={{ width: si(26), height: si(26), borderRadius: si(13), overflow: 'hidden', opacity: focused ? 1 : 0.6 }}>
                <Image source={{ uri: cachedPfp }} style={{ width: '100%', height: '100%' }} />
              </View>
            ) : (
              <Ionicons name="person-circle-outline" size={si(26)} color={color} />
            )
          ),
          tabBarAccessibilityLabel: "Profile",
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            console.log('[TabBar] Profile tab pressed');
          },
          focus: async () => {
            // Reload profile picture when Settings tab is focused
            if (user?.id) {
              const pfp = await AsyncStorage.getItem(`CACHED_PROFILE_PICTURE_${user.id}`);
              console.log('[TabBar] Reloading profile picture on focus:', pfp);
              if (pfp !== cachedPfp) {
                setCachedPfp(pfp);
              }
            }
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

        // CRITICAL: Check if user is in post-purchase signup flow
        // The NEEDS_EMAIL_SIGNUP flag means user purchased first, then created account
        // In this case, onboarding IS complete even if HAS_COMPLETED_ONBOARDING wasn't persisted yet
        const needsEmailSignup = await AsyncStorage.getItem('NEEDS_EMAIL_SIGNUP');
        if (needsEmailSignup === 'true' && user) {
          console.log('[NAV] ✅ Post-purchase signup flow detected - marking onboarding complete');
          await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
          setIsOnboardingCompleted(true);
          return;
        }

        // If user is logged in but no AsyncStorage flag
        if (user) {
          // If we have a resume screen, the user is mid-onboarding
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
    if (user && isOnboardingCompleted === true && navigationRef.isReady()) {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute && currentRoute.name !== 'MainTabs' && currentRoute.name !== 'Settings' && currentRoute.name !== 'EntryDetail' && currentRoute.name !== 'CreateEntry' && currentRoute.name !== 'AIChat') {
        console.log('[NAV] Force navigating to MainTabs from:', currentRoute.name);
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'MainTabs' as never }],
        });
      }
    }
  }, [user, isOnboardingCompleted]);

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

  return (
    <NavigationContainer ref={navigationRef} theme={darkTheme}>
      {user ? (
        // Authenticated screens - user is already signed in
        <Stack.Navigator
          initialRouteName={isOnboardingCompleted ? 'MainTabs' : (onboardingResumeScreen || 'Welcome')}
          screenOptions={{
            headerShown: false,
            animation: 'fade',
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
          <Stack.Screen name="Analyzing" component={AnalyzingScreen} />
          <Stack.Screen name="AnalysisComplete" component={AnalysisCompleteScreen} />
          <Stack.Screen name="ValueProp" component={ValuePropScreen} />
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
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="Appearance" component={AppearanceScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="Security" component={SecurityScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="Personalize" component={PersonalizeScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
        </Stack.Navigator>
      ) : (
        // Unauthenticated - show Welcome first, then Login/Signup
        <Stack.Navigator 
          initialRouteName={isOnboardingCompleted ? 'Login' : 'Welcome'}
          screenOptions={{
            headerShown: false,
            animation: 'fade',
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
          <Stack.Screen name="Analyzing" component={AnalyzingScreen} />
          <Stack.Screen name="AnalysisComplete" component={AnalysisCompleteScreen} />
          <Stack.Screen name="OnboardingSummary" component={OnboardingSummaryScreen} />
          <Stack.Screen name="InteractiveShowcase" component={InteractiveShowcaseScreen} />
          <Stack.Screen name="PrivacyOnboarding" component={PrivacyOnboardingScreen} />
          <Stack.Screen name="NotificationsOnboarding" component={NotificationsOnboardingScreen} />
          <Stack.Screen name="ValueProp" component={ValuePropScreen} />
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
  centerFabButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    marginLeft: 0,
  },
  centerFabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9999,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 10000,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    height: 140,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  menuCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuCardLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
