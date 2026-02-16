import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, Pressable, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

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
import SettingsScreen from '../screens/SettingsScreen';
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
import PaywallScreen from '../screens/onboarding/PaywallScreen';
import PostPurchaseWelcomeScreen from '../screens/onboarding/PostPurchaseWelcomeScreen';
import MeditationScreen from '../screens/MeditationScreen';
import GratitudeScreen from '../screens/GratitudeScreen';
import GratitudeHistoryScreen from '../screens/GratitudeHistoryScreen';
import EmotionDetailScreen from '../screens/EmotionDetailScreen';
import AmbientSoundsScreen from '../screens/AmbientSoundsScreen';
import AIChatScreen from '../screens/AIChatScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTablet, sf, si } from '../utils/responsive';
import DailyMoodCheckIn from '../components/DailyMoodCheckIn';
import { useAppLock } from '../contexts/AppLockContext';

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
  ];

  return (
    <>
      <TouchableOpacity
        style={styles.centerFabButton}
        onPress={() => setShowMenu(!showMenu)}
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
                  style={[styles.menuCard, { backgroundColor: theme.name === 'light' ? '#FFFFFF' : '#1a1a1a' }]}
                  onPress={() => {
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
  
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.name === 'light' ? '#FFFFFF' : '#0a0a0a',
          borderTopColor: theme.name === 'light' ? '#E8E5DC' : '#1a1a1a',
          borderTopWidth: 1,
          height: isTablet ? 90 : 70,
          paddingBottom: isTablet ? 14 : 10,
          paddingTop: isTablet ? 14 : 10,
          paddingHorizontal: isTablet ? 40 : 0,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginHorizontal: isTablet ? 8 : 0,
        },
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: theme.name === 'light' ? '#6B6B6B' : '#666',
      }}
    >
      {/* Tab 1: Home (Dashboard) */}
      <Tab.Screen
        name="Home"
        component={DashboardScreenNew}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={si(24)} color={color} />
          ),
          tabBarAccessibilityLabel: "Home",
        }}
        listeners={{
          tabPress: () => {
            console.log('[TabBar] Home tab pressed');
          },
        }}
      />
      {/* Tab 2: Journal (Notes) */}
      <Tab.Screen
        name="Journal"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="journal" size={si(24)} color={color} />
          ),
          tabBarAccessibilityLabel: "Journal",
        }}
        listeners={{
          tabPress: () => {
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
          tabBarIcon: ({ color }) => (
            <Ionicons name="analytics" size={si(24)} color={color} />
          ),
          tabBarAccessibilityLabel: "Dashboard",
        }}
        listeners={{
          tabPress: () => {
            console.log('[TabBar] Dashboard tab pressed');
          },
        }}
      />
      {/* Tab 6: Settings */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={si(24)} color={color} />
          ),
          tabBarAccessibilityLabel: "Settings",
        }}
        listeners={{
          tabPress: () => {
            console.log('[TabBar] Settings tab pressed');
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = React.useState<boolean | null>(null);
  const prevUserIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    // Detect user changes (sign-in, sign-out, or user ID change from OTP)
    // Always reset to null to show loading spinner while async check runs
    // This prevents rendering the wrong stack with stale isOnboardingCompleted
    const currentUserId = user?.id || null;
    if (currentUserId !== prevUserIdRef.current) {
      console.log('[NAV] User changed:', prevUserIdRef.current, '->', currentUserId);
      setIsOnboardingCompleted(null);
      prevUserIdRef.current = currentUserId;
    }
    
    const checkOnboarding = async () => {
      try {
        // CRITICAL FIX: Always check AsyncStorage first - this is the source of truth
        // Apple/Google Sign-In sets this flag immediately in AuthContext
        const value = await AsyncStorage.getItem('HAS_COMPLETED_ONBOARDING');
        console.log('[NAV] HAS_COMPLETED_ONBOARDING from storage:', value);
        
        if (value === 'true') {
          console.log('[NAV] ✅ Onboarding complete flag found - going to MainTabs');
          setIsOnboardingCompleted(true);
          return;
        }

        // If user is logged in but no AsyncStorage flag, check if they have profile data
        // This handles existing users logging in on a new device or after reinstall
        if (user) {
          console.log('[NAV] No onboarding flag, checking user profile...');
          const { supabase } = await import('../lib/supabase');
          
          // Add timeout to prevent hanging on iPad
          const profilePromise = supabase
            .from('user_profiles')
            .select('username, created_at')
            .eq('user_id', user.id)
            .single();
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile check timeout')), 5000)
          );
          
          try {
            const { data: profile, error: profileError } = await Promise.race([
              profilePromise,
              timeoutPromise
            ]) as any;

            console.log('[NAV] Profile check result:', profile);
            console.log('[NAV] Profile error:', profileError);

            // Check if user has completed onboarding by looking for onboarding completion timestamp
            // This is more reliable than checking account age
            if (profile && profile.username) {
              // Check if they have completed onboarding (stored in user_profiles table)
              const { data: onboardingData } = await supabase
                .from('user_profiles')
                .select('onboarding_completed_at')
                .eq('user_id', user.id)
                .single();
              
              if (onboardingData?.onboarding_completed_at) {
                console.log('[NAV] ✅ User has completed onboarding before, skipping');
                await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
                setIsOnboardingCompleted(true);
              } else {
                console.log('[NAV] User has username but has not completed onboarding, showing onboarding');
                setIsOnboardingCompleted(false);
              }
            } else {
              // Final re-check: the flag may have been set during the profile query
              // (e.g., Apple/Google Sign-In sets it in AuthContext while we're checking)
              const recheck = await AsyncStorage.getItem('HAS_COMPLETED_ONBOARDING');
              if (recheck === 'true') {
                console.log('[NAV] ✅ HAS_COMPLETED_ONBOARDING was set during profile check, honoring it');
                setIsOnboardingCompleted(true);
              } else {
                console.log('[NAV] New user detected, will show onboarding');
                console.log('[NAV] Clearing HAS_SEEN_DASHBOARD_INTRO flag');
                await AsyncStorage.removeItem('HAS_SEEN_DASHBOARD_INTRO');
                setIsOnboardingCompleted(false);
              }
            }
          } catch (timeoutError) {
            console.error('[NAV] Profile check timed out or failed:', timeoutError);
            // On timeout/error, re-check AsyncStorage one more time
            // Apple/Google Sign-In may have set it while we were waiting
            const finalCheck = await AsyncStorage.getItem('HAS_COMPLETED_ONBOARDING');
            if (finalCheck === 'true') {
              console.log('[NAV] ✅ Found onboarding flag after timeout, proceeding to MainTabs');
              setIsOnboardingCompleted(true);
            } else {
              console.log('[NAV] ⚠️ Profile check failed and no onboarding flag - showing onboarding');
              setIsOnboardingCompleted(false);
            }
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
      }
    };
    checkOnboarding();
  }, [user]);

  // Check if user has completed onboarding when they log in
  React.useEffect(() => {
    console.log('[NAV] Auth state - user:', !!user, 'onboarding completed:', isOnboardingCompleted);
  }, [user, isOnboardingCompleted]);

  if (loading || (user && isOnboardingCompleted === null)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

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
    <NavigationContainer theme={darkTheme}>
      {user ? (
        // Authenticated screens
        <Stack.Navigator
          initialRouteName={isOnboardingCompleted ? 'MainTabs' : undefined}
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
          
          {/* Onboarding Flow - For new users */}
          <Stack.Screen name="OnboardingQuestion" component={OnboardingQuestionScreen} />
          <Stack.Screen name="EmailVerified" component={EmailVerifiedScreen} />
          <Stack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
          <Stack.Screen name="Analyzing" component={AnalyzingScreen} />
          <Stack.Screen name="AnalysisComplete" component={AnalysisCompleteScreen} />
          <Stack.Screen name="ValueProp" component={ValuePropScreen} />
          <Stack.Screen name="ChooseVibe" component={ChooseVibeScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
          <Stack.Screen name="OnboardingSummary" component={OnboardingSummaryScreen} />
          <Stack.Screen name="PrivacyOnboarding" component={PrivacyOnboardingScreen} />
          <Stack.Screen name="NotificationsOnboarding" component={NotificationsOnboardingScreen} />
          
          {/* Main App Flow */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
          <Stack.Screen name="CreateEntry" component={CreateEntryScreen} />
          <Stack.Screen name="Analytics" component={DashboardScreen} />
          <Stack.Screen name="Meditation" component={MeditationScreen} />
          <Stack.Screen name="Gratitude" component={GratitudeScreen} />
          <Stack.Screen name="GratitudeHistory" component={GratitudeHistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EmotionDetail" component={EmotionDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AmbientSounds" component={AmbientSoundsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AIChat" component={AIChatScreen} options={{ headerShown: false, animation: 'slide_from_bottom', gestureDirection: 'vertical' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      ) : (
        // Unauthenticated - show Welcome first, then Login/Signup
        <Stack.Navigator 
          initialRouteName={isOnboardingCompleted ? 'Login' : 'Welcome'}
          screenOptions={{ headerShown: false }}
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
    backgroundColor: '#000000',
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
